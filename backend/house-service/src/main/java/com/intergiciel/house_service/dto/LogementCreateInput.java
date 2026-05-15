package com.intergiciel.house_service.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LogementCreateInput {
    private String titre;
    private String description;
    private String adresse;
    private String type;
    private Double prix;
    private Double latitude;
    private Double longitude;
    private Boolean disponible;
    private String proprietaireId; // UUID en String pour GraphQL
}
