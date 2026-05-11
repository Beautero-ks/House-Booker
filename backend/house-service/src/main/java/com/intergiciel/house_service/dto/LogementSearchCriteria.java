package com.intergiciel.house_service.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LogementSearchCriteria {
    private String ville;
    private String type;
    private Double minPrix;
    private Double maxPrix;
    private Boolean disponible;
}
