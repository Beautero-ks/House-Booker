package com.intergiciel.booking_service.domain.events;

import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingCancelledEvent {
    private UUID bookingId;
    private UUID userId;
    private UUID houseId;
    private String reason;
}
