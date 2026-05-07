package com.intergiciel.booking_service.domain.events.consumer;

import org.springframework.stereotype.Service;

@Service
public class PaymentEventConsumer {
    @KafkaListener(topics = "payment-events")
    public void handlePaymentCompleted(PaymentCompletedEvent event) {
        // Mettre à jour le statut de la réservation en "CONFIRMED"
        bookingRepository.updateStatus(event.getBookingId(), "CONFIRMED");
    }
}
