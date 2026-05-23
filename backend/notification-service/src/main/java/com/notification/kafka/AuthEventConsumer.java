package com.notification.kafka;

import com.notification.dto.events.UserCreatedEvent;
import com.notification.model.entity.NotificationUser;
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

    private final NotificationService notificationService;

    /**
     * Consomme les événements USER_CREATED publiés
     * par auth-service.
     */
    @KafkaListener(
            topics = "${kafka.topics.user-created}",
            groupId = "notification-service"
    )
    public void consumeUserCreatedEvent(UserCreatedEvent event) {

        log.info("[AuthEventConsumer] USER_CREATED reçu pour {}",
                event.getData().getEmail());

        try {

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