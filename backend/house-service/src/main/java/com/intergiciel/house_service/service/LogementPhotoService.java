package com.intergiciel.house_service.service;

import com.intergiciel.house_service.dto.LogementPhotoDto;
import com.intergiciel.house_service.entity.LogementPhoto;
import com.intergiciel.house_service.exception.LogementNotFoundException;
import com.intergiciel.house_service.repository.LogementPhotoRepository;
import com.intergiciel.house_service.repository.LogementRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class LogementPhotoService {

    private final LogementPhotoRepository photoRepository;
    private final LogementRepository logementRepository;

    private static final int MAX_PHOTOS_PER_LOGEMENT = 4;
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

    /**
     * Upload des photos pour un logement
     *
     * @param logementId ID du logement
     * @param files Liste des fichiers à uploader
     * @return Liste des photos uploadées
     * @throws IllegalArgumentException si validation échoue
     */
    public List<LogementPhotoDto> uploadPhotos(UUID logementId, List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException("Aucun fichier fourni");
        }

        log.info("Debut upload de {} photos pour logement {}", files.size(), logementId);

        // 1. Vérifier que le logement existe
        if (!logementRepository.existsById(logementId)) {
            log.error("Logement non trouvé: {}", logementId);
            throw new LogementNotFoundException("Logement avec l'ID " + logementId + " non trouvé");
        }

        // 2. Vérifier le nombre de photos existantes
        long existingPhotosCount = photoRepository.countByLogementId(logementId);
        long totalPhotos = existingPhotosCount + files.size();

        if (totalPhotos > MAX_PHOTOS_PER_LOGEMENT) {
            String error = String.format(
                "Limite de photos dépassée: %d existantes + %d nouvelles > %d autorisées",
                existingPhotosCount, files.size(), MAX_PHOTOS_PER_LOGEMENT
            );
            log.error(error);
            throw new IllegalArgumentException(error);
        }

        // 3. Valider et sauvegarder chaque fichier
        List<LogementPhotoDto> uploadedPhotos = files.stream()
            .map(file -> uploadSinglePhoto(logementId, file))
            .collect(Collectors.toList());

        log.info("Upload réussi: {} photos sauvegardées pour logement {}", uploadedPhotos.size(), logementId);
        return uploadedPhotos;
    }

    /**
     * Upload d'une seule photo avec validation
     */
    private LogementPhotoDto uploadSinglePhoto(UUID logementId, MultipartFile file) {
        log.debug("Validation du fichier: {}", file.getOriginalFilename());

        // Validation du fichier
        validateFile(file);

        try {
            byte[] fileBytes = file.getBytes();

            // Créer et sauvegarder l'entité
            LogementPhoto photo = LogementPhoto.builder()
                .logementId(logementId)
                .fileName(file.getOriginalFilename())
                .contentType(file.getContentType())
                .photoData(fileBytes)
                .build();

            LogementPhoto saved = photoRepository.save(photo);
            log.debug("Photo sauvegardée: {} (ID: {})", file.getOriginalFilename(), saved.getId());

            return convertToDto(saved);

        } catch (IOException e) {
            log.error("Erreur lecture du fichier: {}", file.getOriginalFilename(), e);
            throw new RuntimeException("Erreur lors de la lecture du fichier: " + file.getOriginalFilename(), e);
        }
    }

    /**
     * Valide un fichier uploadé
     */
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Le fichier est vide");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("Le fichier est trop volumineux (max 5 MB)");
        }

        String contentType = file.getContentType();
        if (contentType == null || !isValidImageType(contentType)) {
            throw new IllegalArgumentException("Type de fichier non autorisé. Utilisez JPG, PNG ou GIF.");
        }

        String fileName = file.getOriginalFilename();
        if (fileName == null || fileName.isEmpty()) {
            throw new IllegalArgumentException("Nom de fichier invalide");
        }
    }

    /**
     * Vérifie si le type MIME est une image supportée
     */
    private boolean isValidImageType(String contentType) {
        return contentType.equals("image/jpeg") ||
               contentType.equals("image/jpg") ||
               contentType.equals("image/png") ||
               contentType.equals("image/gif") ||
               contentType.equals("image/webp");
    }

    /**
     * Récupère toutes les photos d'un logement
     */
    public List<LogementPhotoDto> getPhotosForLogement(UUID logementId) {
        return photoRepository.findByLogementIdOrderByCreatedAtAsc(logementId).stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    public Map<UUID, List<LogementPhotoDto>> getPhotosForLogementIds(List<UUID> logementIds) {
        if (logementIds == null || logementIds.isEmpty()) {
            return Collections.emptyMap();
        }
        return photoRepository.findByLogementIdInOrderByCreatedAtAsc(logementIds).stream()
            .map(this::convertToDto)
            .collect(Collectors.groupingBy(LogementPhotoDto::getLogementId));
    }

    /**
     * Récupère une photo spécifique
     */
    public LogementPhotoDto getPhotoById(UUID photoId, UUID logementId) {
        LogementPhoto photo = photoRepository.findByIdAndLogementId(photoId, logementId)
            .orElseThrow(() -> new RuntimeException("Photo non trouvée"));
        return convertToDto(photo);
    }

    /**
     * Supprime une photo spécifique
     */
    public void deletePhoto(UUID photoId, UUID logementId) {
        LogementPhoto photo = photoRepository.findByIdAndLogementId(photoId, logementId)
            .orElseThrow(() -> new RuntimeException("Photo non trouvée"));
        photoRepository.delete(photo);
        log.info("Photo supprimée: {} du logement {}", photoId, logementId);
    }

    /**
     * Supprime toutes les photos d'un logement
     */
    public void deleteAllPhotosForLogement(UUID logementId) {
        photoRepository.deleteByLogementId(logementId);
        log.info("Toutes les photos supprimées pour logement {}", logementId);
    }

    /**
     * Compte les photos d'un logement
     */
    public long countPhotos(UUID logementId) {
        return photoRepository.countByLogementId(logementId);
    }

    /**
     * Convertit une entité en DTO avec encodage Base64
     */
    private LogementPhotoDto convertToDto(LogementPhoto photo) {
        String base64Data = photo.getPhotoData() != null
            ? Base64.getEncoder().encodeToString(photo.getPhotoData())
            : null;

        return LogementPhotoDto.builder()
            .id(photo.getId())
            .logementId(photo.getLogementId())
            .fileName(photo.getFileName())
            .contentType(photo.getContentType())
            .photoDataUrl(base64Data != null ? "data:" + photo.getContentType() + ";base64," + base64Data : null)
            .createdAt(photo.getCreatedAt())
            .build();
    }
}
