package com.intergiciel.notification_service.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserEvent {
    private String userId;
    private String email;
    private String firstName;
    private String eventType; // REGISTERED, PASSWORD_RESET
}