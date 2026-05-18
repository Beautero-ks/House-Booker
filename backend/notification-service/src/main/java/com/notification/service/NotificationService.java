package com.notification.service;

// =========================================================================
// NotificationService.java - Logique métier principale
// =========================================================================
//
// Ce service orchestre l'envoi des notifications :
// 1. Validation des paramètres
// 2. Vérification des doublons (eventId)
// 3. Vérification des limites de débit (rate limiting)
// 4. Création de l'enregistrement en base de données
// 5. Envoi d'un message Kafka pour traitement asynchrone
//


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.notification.dto.request.BulkNotificationRequest;
import com.notification.dto.request.SendNotificationRequest;
import com.notification.dto.response.BulkNotificationResponse;
import com.notification.dto.response.NotificationResponse;
import com.notification.dto.response.PagedResponse;
import com.notification.model.entity.Notification;
import com.notification.model.enums.ChannelType;
import com.notification.model.enums.NotificationStatus;
import com.notification.model.enums.Priority;
import com.notification.repository.NotificationRepository;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Service principal de gestion des notifications.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final RateLimiterService rateLimiterService;
    private final DeduplicationService deduplicationService;
    private final KafkaTemplate<String, String> kafkaTemplate;

    // Topics Kafka pour chaque canal (configuration externe)
    @Value("${notification.kafka.topics.email:notifications.email}")
    private String emailTopic;

    @Value("${notification.kafka.topics.sms:notifications.sms}")
    private String smsTopic;

    @Value("${notification.kafka.topics.push:notifications.push}")
    private String pushTopic;

    @Value("${notification.kafka.topics.in-app:notifications.in-app}")
    private String inAppTopic;

    /**
     * Envoie une notification unique.
     *
     * @param request contient le destinataire, le canal, le contenu, etc.
     * @return la notification créée (avec son ID et son statut)
     */
    @Transactional
    public NotificationResponse sendNotification(SendNotificationRequest request) {
        log.debug("Envoi d'une notification à l'utilisateur {}", request.getUserId());

        // 1. Vérification des doublons (si un eventId est fourni)
        if (request.getEventId() != null && !request.getEventId().isBlank()) {
            if (deduplicationService.isDuplicate(request.getEventId())) {
                log.debug("Événement dupliqué détecté : {}. Notification ignorée.", request.getEventId());
                return NotificationResponse.builder()
                        .id(null)
                        .userId(request.getUserId())
                        .channel(request.getChannel())
                        .priority(request.getPriority())
                        .status(NotificationStatus.FAILED)
                        .errorMessage("Événement en double : notification déjà traitée")
                        .build();
            }
        }

        // 2. Vérification du rate limiting (lève une exception si la limite est dépassée)
        rateLimiterService.checkAndIncrement(request.getUserId(), request.getChannel());

        // 3. Construction de l'entité Notification
        Notification notification = Notification.builder()
                .userId(request.getUserId())
                .channel(request.getChannel())
                .priority(request.getPriority() != null ? request.getPriority() : Priority.MEDIUM)
                .subject(request.getSubject())
                .content(request.getContent())
                .status(NotificationStatus.PENDING)
                .build();

        notification = notificationRepository.save(notification);
        log.debug("Notification créée avec l'id {}", notification.getId());

        // 4. Envoi vers Kafka pour traitement asynchrone
        sendToKafka(notification);

        return NotificationResponse.fromEntity(notification);
    }

    /**
     * Récupère une notification par son identifiant.
     */
    @Transactional(readOnly = true)
    public NotificationResponse getNotificationById(UUID id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification non trouvée avec l'id : " + id));
        return NotificationResponse.fromEntity(notification);
    }

    /**
     * Récupère les notifications d'un utilisateur (boîte de réception) avec pagination.
     */
    @Transactional(readOnly = true)
    public PagedResponse<NotificationResponse> getUserNotifications(UUID userId, Pageable pageable) {
        Page<Notification> page = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return PagedResponse.of(page.map(NotificationResponse::fromEntity));
    }

    /**
     * Récupère les notifications d'un utilisateur filtrées par canal.
     */
    @Transactional(readOnly = true)
    public PagedResponse<NotificationResponse> getUserNotificationsByChannel(UUID userId, ChannelType channel, Pageable pageable) {
        Page<Notification> page = notificationRepository.findByUserIdAndChannelOrderByCreatedAtDesc(userId, channel, pageable);
        return PagedResponse.of(page.map(NotificationResponse::fromEntity));
    }

    /**
     * Marque une notification IN_APP comme lue.
     */
    @Transactional
    public NotificationResponse markAsRead(UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification non trouvée : " + notificationId));

        if (notification.getChannel() != ChannelType.IN_APP) {
            throw new IllegalArgumentException("Seules les notifications IN_APP peuvent être marquées comme lues.");
        }

        notification.markAsRead();
        notification = notificationRepository.save(notification);
        return NotificationResponse.fromEntity(notification);
    }

    /**
     * Marque toutes les notifications IN_APP d'un utilisateur comme lues.
     */
    @Transactional
    public int markAllAsRead(UUID userId) {
        return notificationRepository.markAllAsReadForUser(userId, OffsetDateTime.now());
    }

    /**
     * Compte les notifications non lues pour un utilisateur (IN_APP uniquement).
     */
    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countUnreadForUser(userId);
    }

    @Transactional
public BulkNotificationResponse sendBulkNotification(BulkNotificationRequest request) {
    log.info("Traitement d'une notification groupée pour {} utilisateurs", request.getUserIds().size());

    BulkNotificationResponse response = BulkNotificationResponse.builder()
            .totalRequested(request.getUserIds().size())
            .build();

    // Contenu commun (si template, à dérouler plus tard)
    String subject = request.getSubject();
    String content = request.getContent();

    for (UUID userId : request.getUserIds()) {
        try {
            SendNotificationRequest singleRequest = SendNotificationRequest.builder()
                    .userId(userId)
                    .channel(request.getChannel())
                    .priority(request.getPriority())
                    .subject(subject)
                    .content(content)
                    .build();
            NotificationResponse notifResponse = sendNotification(singleRequest);
            response.addSuccess(notifResponse.getId());
        } catch (Exception e) {
            log.error("Échec pour l'utilisateur {} : {}", userId, e.getMessage());
            response.addFailure(userId, e.getMessage());
        }
    }

    log.info("Notifications groupées terminées : {} succès, {} échecs",
            response.getSuccessCount(), response.getFailedCount());
    return response;
}

    // ==================== Méthodes privées ====================

    /**
     * Envoie l'ID de la notification vers le topic Kafka correspondant à son canal.
     * Le consumer se chargera de récupérer les détails et d'effectuer l'envoi effectif.
     *
     * @param notification la notification à traiter
     */
    private void sendToKafka(Notification notification) {
        String topic = getTopicForChannel(notification.getChannel());
        String key = notification.getId().toString();
        String value = notification.getId().toString();

        try {
            kafkaTemplate.send(topic, key, value);
            log.debug("Notification {} envoyée au topic {}", notification.getId(), topic);
        } catch (Exception e) {
            log.error("Échec d'envoi de la notification {} vers Kafka : {}", notification.getId(), e.getMessage());
            // La notification est déjà en base avec le statut PENDING.
            // Un job de nettoyage pourra la reprendre ultérieurement.
        }
    }

    private String getTopicForChannel(ChannelType channel) {
        return switch (channel) {
            case EMAIL -> emailTopic;
            case SMS -> smsTopic;
            case PUSH -> pushTopic;
            case IN_APP -> inAppTopic;
        };
    }
}