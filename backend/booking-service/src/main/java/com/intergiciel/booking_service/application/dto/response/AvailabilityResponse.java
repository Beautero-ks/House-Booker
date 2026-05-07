package com.intergiciel.booking_service.application.dto.response;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvailabilityResponse {
    private boolean available;
    private LocalDate startDate;
    private LocalDate endDate;
}
