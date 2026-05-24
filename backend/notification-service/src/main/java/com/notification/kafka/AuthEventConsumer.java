package com.notification.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.notification.dto.events.UserCreatedEvent;
import com.notification.model.entity.NotificationUser;
import com.notification.repository.UserRepository;
import com.notification.service.NotificationService;
import com.notification.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
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
            UserCreatedEvent event = objectMapper.readValue(messagePayload, UserCreatedEvent.class);

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
            // 1. Convertir l'événement et sauvegarder l'utilisateur dans la table locale 'users'
            NotificationUser localUser = new NotificationUser();
            localUser.setId(UUID.fromString(event.getData().getUserId()));
            localUser.setEmail(event.getData().getEmail());

            // On persiste l'utilisateur d'abord !
            notificationUserRepository.save(localUser);

            // =========================
            // 2. Envoyer notification OTP
            // =========================

            notificationService.sendNotification(
                    com.notification.dto.request.SendNotificationRequest.builder()
                            .userId(user.getId())
                            .channel(com.notification.model.enums.ChannelType.EMAIL)
                            .subject("Your OTP Verification Code")
                            .content(
                                    "Hello " + event.getData().getName() +
                                            ", your OTP code is: " +
                                            event.getData().getOtpCode() +
                                            ". It expires in " +
                                            event.getData().getOtpExpiresInMinutes() +
                                            " minutes."
                            )
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
}