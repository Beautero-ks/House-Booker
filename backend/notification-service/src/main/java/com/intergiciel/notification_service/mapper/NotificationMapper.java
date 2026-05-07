package com.intergiciel.notification_service.mapper;

import com.intergiciel.notification_service.domain.enums.NotificationChannel;
import com.intergiciel.notification_service.domain.enums.NotificationStatus;
import com.intergiciel.notification_service.domain.enums.NotificationType;
import com.intergiciel.notification_service.domain.model.Notification;
import com.intergiciel.notification_service.dto.NotificationRequest;
import com.intergiciel.notification_service.dto.NotificationResponse;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class NotificationMapper {

    public Notification toEntity(NotificationRequest request) {
        if (request == null) {
            return null;
        }

        return Notification.builder()
                .userId(request.getUserId())
                .title(request.getTitle())
                .message(request.getMessage())
                .type(request.getType())
                .channel(request.getChannel())
                .referenceId(request.getReferenceId())
                .emailTo(request.getEmailTo())
                .metadata(request.getMetadata())
                .status(com.intergiciel.notification_service.domain.enums.NotificationStatus.PENDING)
                .retryCount(0)
                .build();
    }

    public NotificationResponse toResponse(Notification notification) {
        if (notification == null) {
            return null;
        }

        return NotificationResponse.builder()
                .id(notification.getId())
                .userId(notification.getUserId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .channel(notification.getChannel())
                .status(notification.getStatus())
                .referenceId(notification.getReferenceId())
                .emailTo(notification.getEmailTo())
                .createdAt(notification.getCreatedAt())
                .sentAt(notification.getSentAt())
                .retryCount(notification.getRetryCount())
                .build();
    }

    public List<NotificationResponse> toResponseList(List<Notification> notifications) {
        return notifications.stream()
                .map(this::toResponse)
                .toList();
    }
}