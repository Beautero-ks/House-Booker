package com.notification.kafka;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.notification.dto.request.SendNotificationRequest;
import com.notification.model.enums.ChannelType;
import com.notification.service.NotificationService;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class BookingEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(BookingEventConsumer.class);

    private final ObjectMapper objectMapper;
    private final NotificationService notificationService;

    public BookingEventConsumer(ObjectMapper objectMapper, NotificationService notificationService) {
        this.objectMapper = objectMapper;
        this.notificationService = notificationService;
    }

    @KafkaListener(topics = "bookings.created", groupId = "notification-consumer-booking", containerFactory = "kafkaListenerContainerFactory")
    public void handleBookingCreated(ConsumerRecord<String, String> record, Acknowledgment acknowledgment) {
        String value = record.value();
        try {
            JsonNode node = objectMapper.readTree(value);
            UUID bookingId = UUID.fromString(node.get("bookingId").asText());
            UUID userId = UUID.fromString(node.get("userId").asText());
            String startDate = node.has("startDate") ? node.get("startDate").asText() : "";
            String endDate = node.has("endDate") ? node.get("endDate").asText() : "";

            String subject = "Booking confirmed";
            String content = String.format("Your booking %s from %s to %s has been created.", bookingId, startDate, endDate);

            SendNotificationRequest request = SendNotificationRequest.builder()
                    .userId(userId)
                    .channel(ChannelType.EMAIL)
                    .subject(subject)
                    .content(content)
                    .eventId(bookingId.toString())
                    .build();

            notificationService.sendNotification(request);

            log.info("Processed booking.created event for booking {} -> created notification for user {}", bookingId, userId);
        } catch (Exception e) {
            log.error("Failed to process booking.created record: {}", e.getMessage(), e);
        } finally {
            // acknowledge message to avoid re-processing loop; NotificationService handles retries/dedup
            try {
                acknowledgment.acknowledge();
            } catch (Exception ex) {
                log.warn("Failed to ack booking.created record: {}", ex.getMessage());
            }
        }
    }
}

