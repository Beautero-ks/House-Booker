package com.intergiciel.house_service.mapper;

import com.intergiciel.house_service.dto.*;
import com.intergiciel.house_service.entity.Logement;
import com.intergiciel.house_service.entity.StatutValidation;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class LogementMapper {

    // Entité → DTO
    public LogementDto toDto(Logement logement) {
        if (logement == null) return null;
        return LogementDto.builder()
                .titre(logement.getTitre())
                .description(logement.getDescription())
                .adresse(logement.getAdresse())
                .type(logement.getType())
                .prix(logement.getPrix())
                .latitude(logement.getLatitude())
                .longitude(logement.getLongitude())
                .disponible(logement.getDisponible())
                .proprietaireId(logement.getProprietaireId())
                .statutValidation(StatutValidation.valueOf(logement.getStatutValidation().name()))
                .dateCreation(logement.getDateCreation())
                .build();
    }

    // DTO → Entité (pour la création)
    public Logement toEntity(LogementCreateDto dto) {
        if (dto == null) return null;
        Logement logement = new Logement();
        logement.setTitre(dto.getTitre());
        logement.setDescription(dto.getDescription());
        logement.setAdresse(dto.getAdresse());
        logement.setType(dto.getType());
        logement.setPrix(dto.getPrix());
        logement.setLatitude(dto.getLatitude());
        logement.setLongitude(dto.getLongitude());
        logement.setDisponible(dto.getDisponible());
        logement.setProprietaireId(dto.getProprietaireId());
        logement.setStatutValidation(StatutValidation.EN_ATTENTE);
        logement.setDateCreation(LocalDateTime.now());
        return logement;
    }

    // Mise à jour de l'entité avec un DTO
    public void updateEntity(Logement logement, LogementUpdateDto dto) {
        if (dto == null || logement == null) return;
        if (dto.getTitre() != null) logement.setTitre(dto.getTitre());
        if (dto.getDescription() != null) logement.setDescription(dto.getDescription());
        if (dto.getAdresse() != null) logement.setAdresse(dto.getAdresse());
        if (dto.getType() != null) logement.setType(dto.getType());
        if (dto.getPrix() != null) logement.setPrix(dto.getPrix());
        if (dto.getLatitude() != null) logement.setLatitude(dto.getLatitude());
        if (dto.getLongitude() != null) logement.setLongitude(dto.getLongitude());
        if (dto.getDisponible() != null) logement.setDisponible(dto.getDisponible());
    }
}