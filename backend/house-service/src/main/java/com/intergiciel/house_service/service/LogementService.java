package com.intergiciel.house_service.service;
import com.intergiciel.house_service.dto.LogementCreateDto;
import com.intergiciel.house_service.dto.LogementDto;
import com.intergiciel.house_service.dto.LogementPhotoDto;
import com.intergiciel.house_service.dto.LogementUpdateDto;
import com.intergiciel.house_service.entity.StatutValidation;
import com.intergiciel.house_service.exception.LogementNotFoundException;
import com.intergiciel.house_service.entity.Logement;
import com.intergiciel.house_service.mapper.LogementMapper;
import com.intergiciel.house_service.repository.LogementPhotoRepository;
import com.intergiciel.house_service.repository.LogementRepository;
import com.intergiciel.house_service.service.LogementPhotoService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class LogementService {

    private final LogementRepository repository;
    private final LogementPhotoRepository photoRepository;
    private final LogementPhotoService photoService;
    private final LogementMapper mapper;

    // sauvegarder un logement
    public LogementDto save(LogementCreateDto dto) {
        Logement logement = mapper.toEntity(dto);
        Logement saved = repository.save(logement);
        return mapper.toDto(saved);
    }

    public List<LogementDto> findAll() {
        List<LogementDto> logements = repository.findAll().stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
        attachPhotosToLogements(logements);
        return logements;
    }

    public LogementDto getById(UUID id) {
        Logement logement = findByIdOrThrow(id);
        LogementDto dto = mapper.toDto(logement);
        attachPhotosToLogements(List.of(dto));
        return dto;
    }

    public LogementDto update(UUID id, LogementUpdateDto dto) {
        Logement logement = findByIdOrThrow(id);
        mapper.updateEntity(logement, dto);
        Logement updated = repository.save(logement);
        LogementDto dtoUpdated = mapper.toDto(updated);
        attachPhotosToLogements(List.of(dtoUpdated));
        return dtoUpdated;
    }

    public void delete(UUID id) {
        Logement logement = findByIdOrThrow(id);
        photoRepository.deleteByLogementId(id);
        repository.delete(logement);
    }

    // ========== Recherche ==========
    public List<LogementDto> searchByVille(String ville) {
        List<LogementDto> logements = repository.findByAdresseContaining(ville).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
        attachPhotosToLogements(logements);
        return logements;
    }

    public List<LogementDto> searchByType(String type) {
        List<LogementDto> logements = repository.findByType(type).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
        attachPhotosToLogements(logements);
        return logements;
    }

    public List<LogementDto> searchByPrix(Double min, Double max) {
        Double effectiveMin = min != null ? min : 0D;
        Double effectiveMax = max != null ? max : Double.MAX_VALUE;
        List<LogementDto> logements = repository.findByPrixBetween(effectiveMin, effectiveMax).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
        attachPhotosToLogements(logements);
        return logements;
    }

    public List<LogementDto> searchDisponible(Boolean disponible) {
        List<LogementDto> logements = repository.findByDisponible(disponible).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
        attachPhotosToLogements(logements);
        return logements;
    }

    // ========== Validation ==========
    public LogementDto valider(UUID id) {
        Logement logement = findByIdOrThrow(id);
        logement.setStatutValidation(StatutValidation.VALIDE);
        Logement updated = repository.save(logement);
        LogementDto dto = mapper.toDto(updated);
        attachPhotosToLogements(List.of(dto));
        return dto;
    }

    public LogementDto rejeter(UUID id) {
        Logement logement = findByIdOrThrow(id);
        logement.setStatutValidation(StatutValidation.REJETE);
        Logement updated = repository.save(logement);
        LogementDto dto = mapper.toDto(updated);
        attachPhotosToLogements(List.of(dto));
        return dto;
    }

    public List<LogementDto> getEnAttente() {
        List<LogementDto> logements = repository.findByStatutValidation(StatutValidation.EN_ATTENTE).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
        attachPhotosToLogements(logements);
        return logements;
    }

    public List<LogementDto> getByProprietaireId(UUID proprietaireId) {
        if (proprietaireId == null) {
            throw new IllegalArgumentException("L'identifiant du propriétaire est obligatoire.");
        }

        List<LogementDto> logements = repository.findByProprietaireIdOrderByDateCreationDesc(proprietaireId).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
        attachPhotosToLogements(logements);
        return logements;
    }

    public List<LogementDto> getLogementsByUtilisateurId(UUID utilisateurId) {
        return getByProprietaireId(utilisateurId);
    }

    // ========== Méthodes utilitaires ==========
    private void attachPhotosToLogements(List<LogementDto> logements) {
        if (logements == null || logements.isEmpty()) {
            return;
        }

        List<UUID> logementIds = logements.stream()
                .map(LogementDto::getId)
                .collect(Collectors.toList());

        Map<UUID, List<LogementPhotoDto>> photosByLogement = photoService.getPhotosForLogementIds(logementIds);
        logements.forEach(logement -> {
            List<LogementPhotoDto> photos = photosByLogement.getOrDefault(logement.getId(), List.of());
            logement.setPhotos(photos);
            logement.setPhotoCount(photos.size());
        });
    }

    private Logement findByIdOrThrow(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new LogementNotFoundException("Logement introuvable avec l'ID: " + id));
    }
}
