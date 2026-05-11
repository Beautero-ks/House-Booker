package com.intergiciel.house_service.dto;

import com.intergiciel.house_service.entity.StatutValidation;
import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LogementValidationDto {
    private UUID id;
    private StatutValidation statutValidation; // "VALIDE" ou "REJETE"
}