package com.notification.dto.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserCreatedEvent {

    private String eventId;

    private String eventType;

    private String timestamp;

    private UserData data;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserData {

        private String userId;

        private String name;

        private String email;

        private String phoneNumber;

        private String otpCode;

        private int otpExpiresInMinutes;
    }
}