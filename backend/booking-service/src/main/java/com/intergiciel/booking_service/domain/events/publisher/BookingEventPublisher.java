package com.intergiciel.booking_service.domain.events.publisher;

import com.intergiciel.booking_service.domain.events.BookingCancelledEvent;
import com.intergiciel.booking_service.domain.events.BookingCreatedEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BookingEventPublisher {
    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    public void publishBookingCreated(BookingCreatedEvent event) {
        kafkaTemplate.send("booking-events", event);
    }

    public void publishBookingCancelled(BookingCancelledEvent event) {
        kafkaTemplate.send("booking-events", event);
    }
}
