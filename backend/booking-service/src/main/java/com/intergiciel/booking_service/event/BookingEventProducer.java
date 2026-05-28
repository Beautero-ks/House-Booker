package com.intergiciel.booking_service.event;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.intergiciel.booking_service.domain.events.BookingCreatedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class BookingEventProducer {

    private static final Logger log = LoggerFactory.getLogger(BookingEventProducer.class);

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Value("${booking.kafka.topic.bookings-created:bookings.created}")
    private String bookingsCreatedTopic;

    public BookingEventProducer(KafkaTemplate<String, String> kafkaTemplate, ObjectMapper objectMapper) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
    }

    public void sendBookingCreated(BookingCreatedEvent event) {
        try {
            String key = event.getBookingId() != null ? event.getBookingId().toString() : UUID.randomUUID().toString();
            String value = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(bookingsCreatedTopic, key, value);
            log.debug("Published BookingCreated event to topic {}: {}", bookingsCreatedTopic, value);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize BookingCreatedEvent: {}", e.getMessage(), e);
        } catch (Exception e) {
            log.error("Failed to send BookingCreatedEvent to Kafka: {}", e.getMessage(), e);
        }
    }
}

