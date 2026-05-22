package com.intergiciel.booking_service.domain.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingCreatedEvent {
    private UUID bookingId;
    private UUID userId;
    private UUID houseId;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalPrice;
}

