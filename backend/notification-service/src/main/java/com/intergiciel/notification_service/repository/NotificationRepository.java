package com.intergiciel.notification_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

import com.intergiciel.notification_service.domain.enums.NotificationStatus;
import com.intergiciel.notification_service.domain.model.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);

    List<Notification> findByStatus(NotificationStatus status);

    List<Notification> findByStatusAndRetryCountLessThan(NotificationStatus status, int maxRetries);
}