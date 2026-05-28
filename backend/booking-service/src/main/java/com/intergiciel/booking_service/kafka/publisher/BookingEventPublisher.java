package com.intergiciel.booking_service.kafka.publisher;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.intergiciel.booking_service.domain.events.BookingCancelledEvent;
import com.intergiciel.booking_service.domain.events.BookingCreatedEvent;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingEventPublisher {
    private static final Logger log = LoggerFactory.getLogger(BookingEventPublisher.class);

    @Value("${kafka.topic.bookings-created}")
    private String BOOKING_CREATED_TOPIC;

    @Value("${kafka.topic.bookings-cancelled}")
    private String BOOKING_CANCELLED_TOPIC;

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public void publishBookingCreated(BookingCreatedEvent event) {
        try {
            String key = event.getBookingId() != null ? event.getBookingId().toString() : UUID.randomUUID().toString();
            String value = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(BOOKING_CREATED_TOPIC, key, value);
            log.debug("Published BookingCreated event to topic {}: {}", BOOKING_CREATED_TOPIC, value);
            log.info(
                    "Booking created event published successfully for bookingId={}",
                    event.getBookingId()
            );
        } catch (JsonProcessingException e){
            log.error("Failed to serialize BookingCreatedEvent: {}", e.getMessage(), e);
        } catch (Exception ex) {
            log.error("Failed to publish booking created event for bookingId={}", event.getBookingId(), ex);
        }
    }

    public void publishBookingCancelled(BookingCancelledEvent event) {
        try {
            String key = event.getBookingId() != null ? event.getBookingId().toString() : UUID.randomUUID().toString();
            String value = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(BOOKING_CANCELLED_TOPIC, key, value);
        } catch (JsonProcessingException e){
            log.error("Failed to serialize BookingCreatedEvent: {}", e.getMessage(), e);
        } catch (Exception ex) {
            log.error("Failed to publish booking cancelled event for bookingId={}", event.getBookingId(), ex);
        }
    }
}
