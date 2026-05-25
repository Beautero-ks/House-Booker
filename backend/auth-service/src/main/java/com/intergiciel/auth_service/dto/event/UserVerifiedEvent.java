package com.intergiciel.auth_service.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserVerifiedEvent {
    private String eventName; // "USER_VERIFIED"
    private DataPayload data;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DataPayload {
        private String userId;
        private String name;
        private String email;
    }
}
