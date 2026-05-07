package com.intergiciel.notification_service.dto;

import com.intergiciel.notification_service.domain.enums.NotificationChannel;
import com.intergiciel.notification_service.domain.enums.NotificationStatus;
import com.intergiciel.notification_service.domain.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {

    private UUID id;
    private String userId;
    private String title;
    private String message;
    private NotificationType type;
    private NotificationChannel channel;
    private NotificationStatus status;
    private String referenceId;
    private String emailTo;
    private LocalDateTime createdAt;
    private LocalDateTime sentAt;
    private Integer retryCount;
}