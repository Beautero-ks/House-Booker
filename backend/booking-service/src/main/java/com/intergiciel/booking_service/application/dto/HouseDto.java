package com.intergiciel.booking_service.application.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HouseDto {
    private UUID id;
    private String titre;
    private String description;
    private String adresse;
    private String type;
    private Double prix;
    private Double latitude;
    private Double longitude;
    private Boolean disponible;
    private UUID proprietaireId;
    private OffsetDateTime dateCreation;
    private String statutValidation;

}
