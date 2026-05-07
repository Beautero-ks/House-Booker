package com.intergiciel.notification_service.service;


import java.util.List;
import java.util.UUID;

import com.intergiciel.notification_service.dto.NotificationRequest;
import com.intergiciel.notification_service.dto.NotificationResponse;

public interface NotificationService {

    NotificationResponse createAndSendNotification(NotificationRequest request);

    void processEvent(Object event); // Pour gérer les événements Kafka

    List<NotificationResponse> getUserNotifications(String userId);

    void markAsRead(UUID notificationId);

    void retryFailedNotifications();
}