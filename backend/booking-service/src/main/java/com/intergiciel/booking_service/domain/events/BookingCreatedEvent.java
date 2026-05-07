package com.intergiciel.booking_service.domain.events;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Builder
public record BookingCreatedEvent(
        UUID bookingId,
        UUID userId,
        UUID houseId,
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal totalPrice
) {}
