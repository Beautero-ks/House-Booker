package com.intergiciel.booking_service.domain.events;

import java.util.UUID;

public record PaymentCompletedEvent(UUID bookingId) {
}
