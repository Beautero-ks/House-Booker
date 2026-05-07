package com.intergiciel.booking_service.application.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HouseDto {
    private Long id;
    private String title;
    private String description;
    private BigDecimal pricePerNight;
    private Long ownerId;
    // Autres champs si nécessaire
}
