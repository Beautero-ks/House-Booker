package com.intergiciel.house_service.service;
import com.intergiciel.house_service.dto.LogementCreateDto;
import com.intergiciel.house_service.dto.LogementDto;
import com.intergiciel.house_service.dto.LogementUpdateDto;
import com.intergiciel.house_service.entity.StatutValidation;
import com.intergiciel.house_service.exception.LogementNotFoundException;
import com.intergiciel.house_service.entity.Logement;
import com.intergiciel.house_service.mapper.LogementMapper;
import com.intergiciel.house_service.repository.LogementRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Optional;


import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class LogementService {

    private final LogementRepository repository;
    private final LogementMapper mapper;

    // sauvegarder un logement
    public LogementDto save(LogementCreateDto dto) {
        Logement logement = mapper.toEntity(dto);
        Logement saved = repository.save(logement);
        return mapper.toDto(saved);
    }

    public List<LogementDto> findAll() {
        return repository.findAll().stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    public LogementDto getById(UUID id) {
        Logement logement = findByIdOrThrow(id);
        return mapper.toDto(logement);
    }

    public LogementDto update(UUID id, LogementUpdateDto dto) {
        Logement logement = findByIdOrThrow(id);
        mapper.updateEntity(logement, dto);
        Logement updated = repository.save(logement);
        return mapper.toDto(updated);
    }

    public void delete(UUID id) {
        Logement logement = findByIdOrThrow(id);
        repository.delete(logement);
    }

    // ========== Recherche ==========
    public List<LogementDto> searchByVille(String ville) {
        return repository.findByAdresseContaining(ville).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    public List<LogementDto> searchByType(String type) {
        return repository.findByType(type).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    public List<LogementDto> searchByPrix(Double min, Double max) {
        return repository.findByPrixBetween(min, max).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    public List<LogementDto> searchDisponible(Boolean disponible) {
        return repository.findByDisponible(disponible).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    // ========== Validation ==========
    public LogementDto valider(UUID id) {
        Logement logement = findByIdOrThrow(id);
        logement.setStatutValidation(StatutValidation.VALIDE);
        Logement updated = repository.save(logement);
        return mapper.toDto(updated);
    }

    public LogementDto rejeter(UUID id) {
        Logement logement = findByIdOrThrow(id);
        logement.setStatutValidation(StatutValidation.REJETE);
        Logement updated = repository.save(logement);
        return mapper.toDto(updated);
    }

    public List<LogementDto> getEnAttente() {
        return repository.findByStatutValidation(StatutValidation.EN_ATTENTE).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    // ========== Méthodes utilitaires ==========
    private Logement findByIdOrThrow(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new LogementNotFoundException("Logement introuvable avec l'ID: " + id));
    }
}


