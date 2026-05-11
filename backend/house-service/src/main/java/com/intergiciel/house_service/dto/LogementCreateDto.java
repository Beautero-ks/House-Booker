package com.intergiciel.house_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LogementCreateDto {
    private String titre;
    private String description;
    private String adresse;
    private String type;
    private Double prix;
    private Double latitude;
    private Double longitude;
    private Boolean disponible;
    private UUID proprietaireId;
}
