package com.intergiciel.booking_service.domain.events.publisher;

import com.intergiciel.booking_service.domain.events.BookingCancelledEvent;
import com.intergiciel.booking_service.domain.events.BookingCreatedEvent;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BookingEventPublisher {
    private static final Logger log = LoggerFactory.getLogger(BookingEventPublisher.class);
    private static final String BOOKING_CREATED_TOPIC = "booking-created";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishBookingCreated(BookingCreatedEvent event) {
        try {
            kafkaTemplate.send(BOOKING_CREATED_TOPIC, event);
            log.info(
                    "Booking created event published successfully for bookingId={}",
                    event.bookingId()
            );
        } catch (Exception ex) {
            log.error("Failed to publish booking created event for bookingId={}", event.bookingId(), ex);
        }
    }

    public void publishBookingCancelled(BookingCancelledEvent event) {
        try {
            kafkaTemplate.send("booking-events", event);
        } catch (Exception ex) {
            log.error("Failed to publish booking cancelled event for bookingId={}", event.getBookingId(), ex);
        }
    }
}
