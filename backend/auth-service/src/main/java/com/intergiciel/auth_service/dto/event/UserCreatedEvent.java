package com.intergiciel.auth_service.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Event publié sur le topic Kafka "user.created"
 * Consommé par :
 *   - User-Service    → stocke les infos utilisateur
 *   - Notification-Service → envoie le mail OTP
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserCreatedEvent {

    // Identifiant de l'événement pour la traçabilité
    private String eventId;

    // Type de l'event → permet au consumer de router vers le bon handler
    private String eventType;  // "USER_CREATED"

    // Timestamp ISO 8601
    private String timestamp;

    // Payload principal
    private UserData data;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserData {

        // Infos utilisateur → consommé par User-Service
        private String userId;
        private String name;
        private String email;
        private String phoneNumber;

        // Infos OTP → consommé par Notification-Service pour envoyer le mail
        private String otpCode;
        private int otpExpiresInMinutes;
    }

    // Factory method pour construire l'event facilement
    public static UserCreatedEvent of(String userId, String name, String email,
                                       String phoneNumber, String otpCode, int expiresInMinutes) {
        return UserCreatedEvent.builder()
                .eventId(java.util.UUID.randomUUID().toString())
                .eventType("USER_CREATED")
                .timestamp(Instant.now().toString())
                .data(UserData.builder()
                        .userId(userId)
                        .name(name)
                        .email(email)
                        .phoneNumber(phoneNumber)
                        .otpCode(otpCode)
                        .otpExpiresInMinutes(expiresInMinutes)
                        .build())
                .build();
    }
}