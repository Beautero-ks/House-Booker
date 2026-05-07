package com.intergiciel.notification_service.dto;

import com.intergiciel.notification_service.domain.enums.NotificationChannel;
import com.intergiciel.notification_service.domain.enums.NotificationType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequest {

    @NotBlank(message = "L'ID utilisateur est obligatoire")
    private String userId;

    @NotBlank(message = "Le titre est obligatoire")
    private String title;

    @NotBlank(message = "Le message est obligatoire")
    private String message;

    @NotNull(message = "Le type de notification est obligatoire")
    private NotificationType type;

    @NotNull(message = "Le canal est obligatoire")
    private NotificationChannel channel;

    private String referenceId;
    private String emailTo;
    private String metadata;
}