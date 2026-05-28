package com.intergiciel.house_service.controller;


import com.intergiciel.house_service.dto.LogementCreateDto;
import com.intergiciel.house_service.dto.LogementDto;
import com.intergiciel.house_service.dto.LogementPhotoDto;
import com.intergiciel.house_service.dto.LogementResponseDto;
import com.intergiciel.house_service.dto.LogementUpdateDto;
import com.intergiciel.house_service.service.LogementPhotoService;
import com.intergiciel.house_service.service.LogementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
@Slf4j
public class LogementController {

    private final LogementService service;
    private final LogementPhotoService photoService;

    @MutationMapping("create")
    public LogementDto create(@Argument("input") LogementCreateDto input) {
        return service.save(input);
    }

    @QueryMapping("getAll")
    public List<LogementDto> getAll() {
        return service.findAll();
    }

    @QueryMapping("getById")
    public LogementDto getById(@Argument UUID id) {
        return service.getById(id);
    }

    @MutationMapping("mettreAJourLogement")
    public LogementDto mettreAJourLogement(@Argument UUID id, @Argument("input") LogementUpdateDto input) {
        return service.update(id, input);
    }

    @MutationMapping("supprimerLogement")
    public Boolean supprimerLogement(@Argument UUID id) {
        service.delete(id);
        return Boolean.TRUE;
    }


    @QueryMapping("searchByVille")
    public List<LogementDto> searchByVille(@Argument String ville) {
        return service.searchByVille(ville);
    }

    @QueryMapping("searchByType")
    public List<LogementDto> searchByType(@Argument String type) {
        return service.searchByType(type);
    }

    @QueryMapping("searchByPrix")
    public List<LogementDto> searchByPrix(@Argument Double min, @Argument Double max) {
        return service.searchByPrix(min, max);
    }

    @QueryMapping("searchDisponible")
    public List<LogementDto> searchDisponible(@Argument Boolean disponible) {
        return service.searchDisponible(disponible);
    }

    @MutationMapping("validerLogement")
    public LogementDto validerLogement(@Argument UUID id) {
        return service.valider(id);
    }

    @MutationMapping("rejeterLogement")
    public LogementDto rejeterLogement(@Argument UUID id) {
        return service.rejeter(id);
    }

    @QueryMapping("getEnAttente")
    public List<LogementDto> getEnAttente() {
        return service.getEnAttente();
    }

    @QueryMapping("getByProprietaireId")
    public List<LogementDto> getByProprietaireId(@Argument UUID proprietaireId) {
        return service.getByProprietaireId(proprietaireId);
    }

    @QueryMapping("getLogementsByUtilisateurId")
    public List<LogementDto> getLogementsByUtilisateurId(@Argument UUID utilisateurId) {
        return service.getLogementsByUtilisateurId(utilisateurId);
    }

    @QueryMapping("mesLogements")
    public List<LogementDto> mesLogements(@Argument UUID utilisateurId) {
        return service.getLogementsByUtilisateurId(utilisateurId);
    }

    // ========== PHOTO MUTATIONS & QUERIES ==========

    /**
     * Upload de photos pour un logement
     * Limite: maximum 4 photos par logement
     */
    @MutationMapping("uploadLogementPhotos")
    public List<LogementPhotoDto> uploadLogementPhotos(
            @Argument("logementId") UUID logementId,
            @Argument("files") List<MultipartFile> files) {
        int filesCount = files != null ? files.size() : 0;
        log.info("GraphQL Mutation uploadLogementPhotos: logementId={}, filesCount={}", logementId, filesCount);
        try {
            return photoService.uploadPhotos(logementId, files);
        } catch (IllegalArgumentException e) {
            log.error("Validation error: {}", e.getMessage());
            throw new RuntimeException(e.getMessage());
        } catch (Exception e) {
            log.error("Error uploading photos", e);
            throw new RuntimeException("Erreur lors de l'upload des photos: " + e.getMessage());
        }
    }

    /**
     * Récupère toutes les photos d'un logement
     */
    @QueryMapping("getLogementPhotos")
    public List<LogementPhotoDto> getLogementPhotos(@Argument UUID logementId) {
        log.debug("GraphQL Query getLogementPhotos: logementId={}", logementId);
        return photoService.getPhotosForLogement(logementId);
    }

    /**
     * Récupère une photo spécifique
     */
    @QueryMapping("getPhotoById")
    public LogementPhotoDto getPhotoById(@Argument UUID photoId, @Argument UUID logementId) {
        log.debug("GraphQL Query getPhotoById: photoId={}, logementId={}", photoId, logementId);
        return photoService.getPhotoById(photoId, logementId);
    }

    /**
     * Compte les photos d'un logement
     */
    @QueryMapping("countLogementPhotos")
    public Long countLogementPhotos(@Argument UUID logementId) {
        log.debug("GraphQL Query countLogementPhotos: logementId={}", logementId);
        return photoService.countPhotos(logementId);
    }

    /**
     * Supprime une photo spécifique
     */
    @MutationMapping("deleteLogementPhoto")
    public Boolean deleteLogementPhoto(@Argument UUID photoId, @Argument UUID logementId) {
        log.info("GraphQL Mutation deleteLogementPhoto: photoId={}, logementId={}", photoId, logementId);
        try {
            photoService.deletePhoto(photoId, logementId);
            return true;
        } catch (Exception e) {
            log.error("Error deleting photo", e);
            throw new RuntimeException("Erreur lors de la suppression de la photo: " + e.getMessage());
        }
    }

    /**
     * Supprime toutes les photos d'un logement
     */
    @MutationMapping("deleteAllLogementPhotos")
    public Boolean deleteAllLogementPhotos(@Argument UUID logementId) {
        log.info("GraphQL Mutation deleteAllLogementPhotos: logementId={}", logementId);
        try {
            photoService.deleteAllPhotosForLogement(logementId);
            return true;
        } catch (Exception e) {
            log.error("Error deleting all photos", e);
            throw new RuntimeException("Erreur lors de la suppression des photos: " + e.getMessage());
        }
    }

    /**
     * Upload de photos pour un logement (version demandée avec HouseResponse)
     */
    @MutationMapping("uploadHousePhotos")
    public LogementResponseDto uploadHousePhotos(
            @Argument("houseId") UUID houseId,
            @Argument("files") List<MultipartFile> files) {
        int filesCount = files != null ? files.size() : 0;
        log.info("GraphQL Mutation uploadHousePhotos: houseId={}, filesCount={}", houseId, filesCount);
        try {
            // Upload the photos
            photoService.uploadPhotos(houseId, files);

            // Fetch the updated photos
            List<LogementPhotoDto> photos = photoService.getPhotosForLogement(houseId);

            // Fetch the house
            LogementDto house = service.getById(houseId);

            // Build and return the response
            return LogementResponseDto.builder()
                    .id(house.getId())
                    .titre(house.getTitre())
                    .description(house.getDescription())
                    .adresse(house.getAdresse())
                    .type(house.getType())
                    .prix(house.getPrix())
                    .latitude(house.getLatitude())
                    .longitude(house.getLongitude())
                    .nombreChambres(house.getNombreChambres())
                    .nombreCuisines(house.getNombreCuisines())
                    .nombreSallesBain(house.getNombreSallesBain())
                    .nombreToilettes(house.getNombreToilettes())
                    .disponible(house.getDisponible())
                    .proprietaireId(house.getProprietaireId())
                    .dateCreation(house.getDateCreation())
                    .statutValidation(house.getStatutValidation() != null ? house.getStatutValidation().name() : null)
                    .photos(photos)
                    .photoCount(photos.size())
                    .build();
        } catch (IllegalArgumentException e) {
            log.error("Validation error: {}", e.getMessage());
            throw new RuntimeException(e.getMessage());
        } catch (Exception e) {
            log.error("Error uploading photos", e);
            throw new RuntimeException("Erreur lors de l'upload des photos: " + e.getMessage());
        }
    }
}
