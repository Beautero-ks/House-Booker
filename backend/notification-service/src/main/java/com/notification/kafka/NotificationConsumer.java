package com.notification.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.notification.model.entity.Notification;
import com.notification.model.enums.NotificationStatus;
import com.notification.repository.NotificationRepository;
import com.notification.service.channel.ChannelDispatcher;

import java.util.Optional;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationConsumer {

    private final NotificationRepository notificationRepository;
    private final ChannelDispatcher channelDispatcher;

    // Utilisation directe des propriétés (pas d'expression Spring EL sur le bean lui-même)
    @KafkaListener(topics = "${notification.kafka.topics.email:notifications.email}", 
                   groupId = "${spring.kafka.consumer.group-id:notification-group}")
    public void processEmailNotification(ConsumerRecord<String, String> record, Acknowledgment ack) {
        processNotification(record, ack, "EMAIL");
    }

    @KafkaListener(topics = "${notification.kafka.topics.sms:notifications.sms}", 
                   groupId = "${spring.kafka.consumer.group-id:notification-group}")
    public void processSmsNotification(ConsumerRecord<String, String> record, Acknowledgment ack) {
        processNotification(record, ack, "SMS");
    }

    @KafkaListener(topics = "${notification.kafka.topics.push:notifications.push}", 
                   groupId = "${spring.kafka.consumer.group-id:notification-group}")
    public void processPushNotification(ConsumerRecord<String, String> record, Acknowledgment ack) {
        processNotification(record, ack, "PUSH");
    }

    @KafkaListener(topics = "${notification.kafka.topics.in-app:notifications.in-app}", 
                   groupId = "${spring.kafka.consumer.group-id:notification-group}")
    public void processInAppNotification(ConsumerRecord<String, String> record, Acknowledgment ack) {
        processNotification(record, ack, "IN_APP");
    }

    @Transactional
    protected void processNotification(ConsumerRecord<String, String> record,
                                       Acknowledgment acknowledgment,
                                       String channelName) {
        String notificationIdStr = record.value().trim().replaceAll("^\"|\"$", "");
        log.info("Réception notification {} depuis Kafka (topic={}, partition={}, offset={})",
                notificationIdStr, record.topic(), record.partition(), record.offset());

        try {
            UUID notificationId = UUID.fromString(notificationIdStr);
            Optional<Notification> optNotification = notificationRepository.findById(notificationId);

            if (optNotification.isEmpty()) {
                log.warn("Notification {} non trouvée en base, elle a peut-être été supprimée.", notificationId);
                acknowledgment.acknowledge();
                return;
            }

            Notification notification = optNotification.get();

            if (notification.getStatus() != NotificationStatus.PENDING) {
                log.info("Notification {} déjà traitée (statut={}). Ignorée.", notificationId, notification.getStatus());
                acknowledgment.acknowledge();
                return;
            }

            notification.markAsProcessing();
            notificationRepository.save(notification);

            boolean success = channelDispatcher.dispatch(notification);

            if (success) {
                notification.markAsSent();
                notificationRepository.save(notification);
                log.info("Notification {} envoyée avec succès.", notificationId);
            } else {
                notification.scheduleRetry("Échec de livraison (dispatcher)");
                notificationRepository.save(notification);
                log.warn("Notification {} échouée. Nouvelle tentative planifiée n°{}",
                        notificationId, notification.getRetryCount());
            }

            acknowledgment.acknowledge();

        } catch (Exception e) {
            log.error("Erreur lors du traitement de la notification {} : {}",
                    notificationIdStr, e.getMessage(), e);

            try {
                UUID notificationId = UUID.fromString(notificationIdStr);
                notificationRepository.findById(notificationId).ifPresent(notif -> {
                    notif.scheduleRetry("Erreur technique: " + e.getMessage());
                    notificationRepository.save(notif);
                });
            } catch (Exception ex) {
                log.error("Impossible de mettre à jour la notification {} : {}", notificationIdStr, ex.getMessage());
            }

            acknowledgment.acknowledge();
        }
    }
}