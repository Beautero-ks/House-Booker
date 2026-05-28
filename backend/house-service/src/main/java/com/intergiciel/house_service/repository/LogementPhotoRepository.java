package com.intergiciel.house_service.repository;

import com.intergiciel.house_service.entity.LogementPhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LogementPhotoRepository extends JpaRepository<LogementPhoto, UUID> {

    /**
     * Récupère toutes les photos d'un logement
     */
    List<LogementPhoto> findByLogementIdOrderByCreatedAtAsc(UUID logementId);

    List<LogementPhoto> findByLogementIdInOrderByCreatedAtAsc(List<UUID> logementIds);

    /**
     * Compte le nombre de photos pour un logement
     */
    long countByLogementId(UUID logementId);

    /**
     * Supprime toutes les photos d'un logement
     */
    void deleteByLogementId(UUID logementId);

    /**
     * Récupère une photo spécifique d'un logement
     */
    Optional<LogementPhoto> findByIdAndLogementId(UUID id, UUID logementId);

    /**
     * Vérifie si une photo existe pour un logement
     */
    boolean existsByIdAndLogementId(UUID id, UUID logementId);

    /**
     * Récupère les photos paginées d'un logement
     */
    @Query(value = "SELECT * FROM logement_photo WHERE logement_id = :logementId ORDER BY created_at DESC LIMIT :limit OFFSET :offset", nativeQuery = true)
    List<LogementPhoto> findByLogementIdWithPagination(@Param("logementId") UUID logementId, @Param("limit") int limit, @Param("offset") int offset);
}
