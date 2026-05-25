package com.intergiciel.booking_service.domain.events.consumer;

import com.intergiciel.booking_service.domain.events.PaymentCompletedEvent;
import com.intergiciel.booking_service.domain.model.enums.BookingStatus;
import com.intergiciel.booking_service.domain.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PaymentEventConsumer {
    private final BookingRepository bookingRepository;

    @KafkaListener(topics = "payment-events")
    public void handlePaymentCompleted(PaymentCompletedEvent event) {
        bookingRepository.findById(event.bookingId()).ifPresent(booking -> {
            booking.setStatus(BookingStatus.CONFIRMED);
            bookingRepository.save(booking);
        });
    }
}
