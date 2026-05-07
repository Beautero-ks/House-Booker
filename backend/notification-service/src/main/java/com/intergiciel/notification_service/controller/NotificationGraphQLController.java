package com.intergiciel.notification_service.controller;


import java.util.List;
import java.util.UUID;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import com.intergiciel.notification_service.dto.NotificationRequest;
import com.intergiciel.notification_service.dto.NotificationResponse;
import com.intergiciel.notification_service.service.NotificationService;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class NotificationGraphQLController {

    private final NotificationService notificationService;

    @QueryMapping
    public List<NotificationResponse> userNotifications(@Argument String userId) {
        return notificationService.getUserNotifications(userId);
    }

    @MutationMapping
    public NotificationResponse createNotification(@Argument NotificationRequest input) {
        return notificationService.createAndSendNotification(input);
    }

    @MutationMapping
    public boolean markNotificationAsRead(@Argument UUID id) {
        notificationService.markAsRead(id);
        return true;
    }
}