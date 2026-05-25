package com.notification.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.notification.dto.events.UserCreatedEvent;
import com.notification.dto.events.UserVerifiedEvent;
import com.notification.model.entity.NotificationUser;
import com.notification.repository.UserRepository;
import com.notification.service.NotificationService;
import com.notification.service.TemplateService;
import com.notification.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuthEventConsumer {

    private final UserService userService;
    private final ObjectMapper objectMapper;
    private final NotificationService notificationService;
    private final UserRepository notificationUserRepository;
    private final TemplateService templateService;

    @Value("${app.frontend-url}")
    private String loginPageUrl;

    /**
     * Consomme les événements USER_CREATED publiés
     * par auth-service.
     */
    @KafkaListener(
            topics = "${kafka.topics.user-created}",
            groupId = "notification-service"
    )
    public void consumeUserCreatedEvent(String messagePayload) {

        // Log de réception brute pour le débogage
        log.debug("[AuthEventConsumer] Payload brut reçu de Kafka: {}", messagePayload);
//        log.info("[AuthEventConsumer] USER_CREATED reçu pour {}",
//                event.getData().getEmail());

        try {
            // ===========================================
            // 0. Désérialisation manuelle et sécurisée
            // ===========================================
            String cleanJson = messagePayload;
            if (messagePayload.startsWith("\"") && messagePayload.endsWith("\"")) {
                // Cette ligne magique extrait le vrai JSON de la chaîne échappée
                cleanJson = objectMapper.readValue(messagePayload, String.class);
            }
            UserCreatedEvent event = objectMapper.readValue(cleanJson, UserCreatedEvent.class);

            log.info("[AuthEventConsumer] USER_CREATED converti avec succès pour {}",
                    event.getData().getEmail());

            // =========================
            // 1. Synchroniser le user
            // =========================

            NotificationUser user =
                    userService.syncUser(
                            UUID.fromString(event.getData().getUserId()),
                            event.getData().getEmail(),
                            event.getData().getPhoneNumber()
                    );

            log.info("[AuthEventConsumer] User synchronisé : {}",
                    user.getId());

            if (user.getId().equals("")){
                // 1. Convertir l'événement et sauvegarder l'utilisateur dans la table locale 'users'
                NotificationUser localUser = new NotificationUser();
                localUser.setId(UUID.fromString(event.getData().getUserId()));
                localUser.setEmail(event.getData().getEmail());

                // On persiste l'utilisateur d'abord !
                notificationUserRepository.save(localUser);
            }

            // 2. Préparer les données pour le template HTML
            Map<String, Object> templateModel = Map.of(
                    "name", event.getData().getName(),
                    "otpCode", event.getData().getOtpCode(),
                    "expiresIn", event.getData().getOtpExpiresInMinutes()
            );

            // 3. Générer le HTML sans texte en dur ici
            String htmlContent = templateService.generateHtml("otp-template", templateModel);

            // =========================
            // 4. Envoyer notification OTP
            // =========================

            notificationService.sendNotification(
                    com.notification.dto.request.SendNotificationRequest.builder()
                            .userId(user.getId())
                            .channel(com.notification.model.enums.ChannelType.EMAIL)
                            .subject("Your OTP Verification Code")
                            .content(htmlContent) // Contenu HTML généré de manière isolée
                            .build()
            );

            log.info("[AuthEventConsumer] Notification OTP envoyée à {}",
                    event.getData().getEmail());

        } catch (Exception e) {

            log.error(
                    "[AuthEventConsumer] Erreur traitement USER_CREATED : {}",
                    e.getMessage(),
                    e
            );

            // Plus tard :
            // - Retry
            // - DLQ
            // - Idempotence avancée
        }
    }

    /**
     * 2. Consomme les événements USER_VERIFIED publiés par auth-service.
     * Déclenche l'envoi de l'e-mail de bienvenue après validation de l'OTP.
     */
    @KafkaListener(
            topics = "${kafka.topics.user-verified}",
            groupId = "notification-service"
    )
    public void consumeUserVerifiedEvent(String messagePayload) {
        log.debug("[AuthEventConsumer] Payload brut reçu (USER_VERIFIED): {}", messagePayload);

        try {
            String cleanJson = messagePayload;
            if (messagePayload.startsWith("\"") && messagePayload.endsWith("\"")) {
                cleanJson = objectMapper.readValue(messagePayload, String.class);
            }
            UserVerifiedEvent event = objectMapper.readValue(cleanJson, UserVerifiedEvent.class);
            log.info("[AuthEventConsumer] USER_VERIFIED reçu pour le user ID : {}", event.getData().getUserId());

            // Préparer les données pour le template HTML de bienvenue
            Map<String, Object> templateModel = Map.of(
                    "name", event.getData().getName(),
                    "loginUrl", loginPageUrl
            );

            // Générer le HTML depuis le fichier resources/templates/welcome-template.html
            String htmlContent = templateService.generateHtml("welcome-template", templateModel);

            // Envoyer l'e-mail de bienvenue
            notificationService.sendNotification(
                    com.notification.dto.request.SendNotificationRequest.builder()
                            .userId(UUID.fromString(event.getData().getUserId()))
                            .channel(com.notification.model.enums.ChannelType.EMAIL)
                            .subject("Bienvenue chez House-Booker ! 🎉")
                            .content(htmlContent)
                            .build()
            );

            log.info("[AuthEventConsumer] E-mail de bienvenue envoyé avec succès à l'utilisateur.");

        } catch (Exception e) {
            log.error("[AuthEventConsumer] Erreur traitement USER_VERIFIED : {}", e.getMessage(), e);
        }
    }
}
