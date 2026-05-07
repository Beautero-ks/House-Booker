package com.intergiciel.notification_service.service.impl;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.intergiciel.notification_service.domain.enums.NotificationChannel;
import com.intergiciel.notification_service.domain.enums.NotificationStatus;
import com.intergiciel.notification_service.domain.model.Notification;
import com.intergiciel.notification_service.dto.NotificationRequest;
import com.intergiciel.notification_service.dto.NotificationResponse;
import com.intergiciel.notification_service.mapper.NotificationMapper;
import com.intergiciel.notification_service.repository.NotificationRepository;
import com.intergiciel.notification_service.service.EmailService;
import com.intergiciel.notification_service.service.NotificationService;

import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements  NotificationService {

    private final NotificationRepository repository;
    private final NotificationMapper mapper;
    private final EmailService emailService;

    @Override
    public NotificationResponse createAndSendNotification(NotificationRequest request) {
        Notification notification = mapper.toEntity(request);
        
        // Sauvegarde d'abord en base
        notification = repository.save(notification);

        // Envoi selon le canal
       try {
    if (notification.getChannel() == NotificationChannel.EMAIL) {
        emailService.sendEmail(notification);   // Async + Retry
        notification.setStatus(NotificationStatus.SENT);
        notification.setSentAt(LocalDateTime.now());
    } else if (notification.getChannel() == NotificationChannel.IN_APP) {
        notification.setStatus(NotificationStatus.SENT);
        notification.setSentAt(LocalDateTime.now());
    }
} catch (Exception e) {
    log.error("Failed to process notification", e);
    notification.setStatus(NotificationStatus.FAILED);
    notification.setFailureReason(e.getMessage());
    notification.setRetryCount(notification.getRetryCount() + 1);
}
        notification = repository.save(notification);
        return mapper.toResponse(notification);
    }

    @Override
    public void processEvent(Object event) {
        // Cette méthode sera implémentée plus tard avec les consumers Kafka
        log.info("Processing event: {}", event);
        // Exemple : transformer l'event en NotificationRequest puis appeler createAndSendNotification
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(String userId) {
        List<Notification> notifications = repository.findByUserIdOrderByCreatedAtDesc(userId);
        return mapper.toResponseList(notifications);
    }

    @Override
    public void markAsRead(UUID notificationId) {
        Notification notification = repository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        // Vous pouvez ajouter un champ "read" si vous voulez distinguer SENT et READ
        repository.save(notification);
    }

    @Override
    public void retryFailedNotifications() {
        List<Notification> failed = repository.findByStatusAndRetryCountLessThan(
                NotificationStatus.FAILED, 5);
        
        for (Notification notif : failed) {
            try {
                if (notif.getChannel() == NotificationChannel.EMAIL) {
                    emailService.sendEmail(notif);
                    notif.setStatus(NotificationStatus.SENT);
                    notif.setSentAt(java.time.LocalDateTime.now());
                }
            } catch (MessagingException e) {
                notif.setRetryCount(notif.getRetryCount() + 1);
                notif.setFailureReason(e.getMessage());
            }
            repository.save(notif);
        }
    }
}