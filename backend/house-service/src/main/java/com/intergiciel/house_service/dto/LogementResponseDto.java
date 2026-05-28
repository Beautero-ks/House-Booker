package com.intergiciel.house_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LogementResponseDto {
    private UUID id;
    private String titre;
    private String description;
    private String adresse;
    private String type;
    private Double prix;
    private Double latitude;
    private Double longitude;
    private Integer nombreChambres;
    private Integer nombreCuisines;
    private Integer nombreSallesBain;
    private Integer nombreToilettes;
    private Boolean disponible;
    private UUID proprietaireId;
    private OffsetDateTime dateCreation;
    private String statutValidation;
    private List<LogementPhotoDto> photos;
    private Integer photoCount;
}
