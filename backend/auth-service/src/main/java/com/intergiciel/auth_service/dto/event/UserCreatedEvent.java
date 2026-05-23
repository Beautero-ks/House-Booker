package com.intergiciel.auth_service.dto.event;

import java.time.Instant;
import java.util.UUID;

/**
 * Event publié sur le topic Kafka "user.created"
 * Consommé par :
 *   - User-Service    → stocke les infos utilisateur
 *   - Notification-Service → envoie le mail OTP
 */
public class UserCreatedEvent {

    // Identifiant de l'événement pour la traçabilité
    private String eventId;

    // Type de l'event → permet au consumer de router vers le bon handler
    private String eventType;  // "USER_CREATED"

    // Timestamp ISO 8601
    private String timestamp;

    // Payload principal
    private UserData data;

    public UserCreatedEvent() {
    }

    public UserCreatedEvent(String eventId, String eventType, String timestamp, UserData data) {
        this.eventId = eventId;
        this.eventType = eventType;
        this.timestamp = timestamp;
        this.data = data;
    }

    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public UserData getData() {
        return data;
    }

    public void setData(UserData data) {
        this.data = data;
    }

    public static class UserData {

        // Infos utilisateur → consommé par User-Service
        private String userId;
        private String name;
        private String email;
        private String phoneNumber;

        // Infos OTP → consommé par Notification-Service pour envoyer le mail
        private String otpCode;
        private int otpExpiresInMinutes;

        public UserData() {
        }

        public UserData(String userId, String name, String email, String phoneNumber,
                        String otpCode, int otpExpiresInMinutes) {
            this.userId = userId;
            this.name = name;
            this.email = email;
            this.phoneNumber = phoneNumber;
            this.otpCode = otpCode;
            this.otpExpiresInMinutes = otpExpiresInMinutes;
        }

        public String getUserId() {
            return userId;
        }

        public void setUserId(String userId) {
            this.userId = userId;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPhoneNumber() {
            return phoneNumber;
        }

        public void setPhoneNumber(String phoneNumber) {
            this.phoneNumber = phoneNumber;
        }

        public String getOtpCode() {
            return otpCode;
        }

        public void setOtpCode(String otpCode) {
            this.otpCode = otpCode;
        }

        public int getOtpExpiresInMinutes() {
            return otpExpiresInMinutes;
        }

        public void setOtpExpiresInMinutes(int otpExpiresInMinutes) {
            this.otpExpiresInMinutes = otpExpiresInMinutes;
        }
    }

    // Factory method pour construire l'event facilement
    public static UserCreatedEvent of(String userId, String name, String email,
                                       String phoneNumber, String otpCode, int expiresInMinutes) {
        UserData data = new UserData(
                userId,
                name,
                email,
                phoneNumber,
                otpCode,
                expiresInMinutes
        );

        return new UserCreatedEvent(
                UUID.randomUUID().toString(),
                "USER_CREATED",
                Instant.now().toString(),
                data
        );
    }
}
