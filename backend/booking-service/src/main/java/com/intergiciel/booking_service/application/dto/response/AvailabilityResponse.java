package com.intergiciel.booking_service.application.dto.response;

import lombok.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvailabilityResponse {
    private boolean available;
    private OffsetDateTime startDate;
    private OffsetDateTime endDate;
}
