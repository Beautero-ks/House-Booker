package com.notification.controller;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.notification.dto.request.BulkNotificationRequest;
import com.notification.dto.request.SendNotificationRequest;
import com.notification.dto.response.ApiResponse;
import com.notification.dto.response.BulkNotificationResponse;
import com.notification.dto.response.NotificationResponse;
import com.notification.dto.response.PagedResponse;
import com.notification.model.enums.ChannelType;
import com.notification.service.NotificationService;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "API de gestion des notifications")
public class NotificationController {

    private final NotificationService notificationService;

    // ==================== Envoi ====================

    @PostMapping
    @Operation(summary = "Envoyer une notification unique")
    public ResponseEntity<ApiResponse<NotificationResponse>> sendNotification(
            @Valid @RequestBody SendNotificationRequest request) {
        NotificationResponse response = notificationService.sendNotification(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Notification mise en file d'attente", response));
    }

    @PostMapping("/bulk")
    @Operation(summary = "Envoyer une notification en masse à plusieurs utilisateurs")
    public ResponseEntity<ApiResponse<BulkNotificationResponse>> sendBulkNotification(
            @Valid @RequestBody BulkNotificationRequest request) {
        BulkNotificationResponse response = notificationService.sendBulkNotification(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Notifications de masse traitées", response));
    }

    // ==================== Consultation ====================

    @GetMapping("/{id}")
    @Operation(summary = "Récupérer une notification par son identifiant")
    public ResponseEntity<ApiResponse<NotificationResponse>> getNotification(@PathVariable UUID id) {
        NotificationResponse response = notificationService.getNotificationById(id);
        return ResponseEntity.ok(ApiResponse.success("Notification trouvée", response));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Boîte de réception d'un utilisateur")
    public ResponseEntity<ApiResponse<PagedResponse<NotificationResponse>>> getUserNotifications(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) ChannelType channel) {

        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<NotificationResponse> response;
        if (channel != null) {
            response = notificationService.getUserNotificationsByChannel(userId, channel, pageable);
        } else {
            response = notificationService.getUserNotifications(userId, pageable);
        }
        return ResponseEntity.ok(ApiResponse.success("Notifications récupérées", response));
    }

    @GetMapping("/user/{userId}/unread-count")
    @Operation(summary = "Nombre de notifications in-app non lues")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(@PathVariable UUID userId) {
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(ApiResponse.success("Compteur non lues", count));
    }

    // ==================== Mise à jour ====================

    @PatchMapping("/{id}/read")
    @Operation(summary = "Marquer une notification in-app comme lue")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(@PathVariable UUID id) {
        NotificationResponse response = notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success("Notification marquée comme lue", response));
    }

    @PatchMapping("/user/{userId}/read-all")
    @Operation(summary = "Tout marquer comme lu pour un utilisateur")
    public ResponseEntity<ApiResponse<Integer>> markAllAsRead(@PathVariable UUID userId) {
        int count = notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(ApiResponse.success(count + " notification(s) marquée(s) comme lue(s)", count));
    }
}