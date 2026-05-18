package com.notification.dto.response;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.notification.model.entity.Notification;
import com.notification.model.enums.ChannelType;
import com.notification.model.enums.NotificationStatus;
import com.notification.model.enums.Priority;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {

    private UUID id;
    private UUID userId;
    private ChannelType channel;
    private Priority priority;
    private String subject;
    private String content;
    private NotificationStatus status;
    private int retryCount;
    private String errorMessage;
    private OffsetDateTime createdAt;
    private OffsetDateTime sentAt;
    private OffsetDateTime deliveredAt;
    private OffsetDateTime readAt;

    public static NotificationResponse fromEntity(Notification notification) {
        if (notification == null) return null;
        return NotificationResponse.builder()
                .id(notification.getId())
                .userId(notification.getUserId())
                .channel(notification.getChannel())
                .priority(notification.getPriority())
                .subject(notification.getSubject())
                .content(notification.getContent())
                .status(notification.getStatus())
                .retryCount(notification.getRetryCount())
                .errorMessage(notification.getErrorMessage())
                .createdAt(notification.getCreatedAt())
                .sentAt(notification.getSentAt())
                .deliveredAt(notification.getDeliveredAt())
                .readAt(notification.getReadAt())
                .build();
    }
}