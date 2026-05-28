package com.intergiciel.booking_service.application.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class House {
    private UUID id;
    private String title;
    private String description;
    private BigDecimal pricePerNight;
    private String address;
}
