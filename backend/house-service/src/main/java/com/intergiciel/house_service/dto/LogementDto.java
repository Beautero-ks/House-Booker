package com.intergiciel.house_service.dto;

import com.intergiciel.house_service.entity.StatutValidation;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LogementDto {
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

    @Enumerated(EnumType.STRING)
    private StatutValidation statutValidation;

}
