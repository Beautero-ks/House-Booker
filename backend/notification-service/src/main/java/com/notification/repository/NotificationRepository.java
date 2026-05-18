package com.notification.repository;

// =========================================================================
// NotificationRepository.java - Accès aux données des notifications
// =========================================================================
//
// Ce repository gère toutes les requêtes liées aux notifications.
// Il étend JpaRepository pour bénéficier des opérations CRUD de base.
//

import com.notification.model.entity.Notification;
import com.notification.model.enums.ChannelType;
import com.notification.model.enums.NotificationStatus;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Repository pour l'entité Notification.
 * Contient des méthodes d'accès aux données adaptées aux besoins du service.
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    // ==================== Boîte de réception utilisateur ====================
    
    /**
     * Récupère les notifications d'un utilisateur, triées de la plus récente à la plus ancienne.
     * @param userId identifiant de l'utilisateur
     * @param pageable informations de pagination
     * @return page de notifications
     */
    Page<Notification> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
    
    /**
     * Récupère les notifications d'un utilisateur filtrées par canal.
     * @param userId identifiant utilisateur
     * @param channel canal (EMAIL, SMS, PUSH, IN_APP)
     * @param pageable pagination
     * @return page de notifications
     */
    Page<Notification> findByUserIdAndChannelOrderByCreatedAtDesc(
        UUID userId, 
        ChannelType channel, 
        Pageable pageable
    );
    
    /**
     * Récupère les notifications d'un utilisateur filtrées par statut.
     * @param userId identifiant utilisateur
     * @param status statut (PENDING, SENT, DELIVERED, etc.)
     * @param pageable pagination
     * @return page de notifications
     */
    Page<Notification> findByUserIdAndStatusOrderByCreatedAtDesc(
        UUID userId, 
        NotificationStatus status, 
        Pageable pageable
    );
    
    /**
     * Récupère les notifications par statut et canal (pour l'administration / monitoring).
     */
    Page<Notification> findByStatusAndChannelOrderByCreatedAtDesc(
        NotificationStatus status, 
        ChannelType channel, 
        Pageable pageable
    );
    
    /**
     * Récupère les notifications par statut (pour l'administration).
     */
    Page<Notification> findByStatusOrderByCreatedAtDesc(
        NotificationStatus status, 
        Pageable pageable
    );
    
    /**
     * Compte les notifications non lues pour un utilisateur (uniquement canal IN_APP).
     * Une notification est considérée comme non lue si :
     * - le canal est IN_APP
     * - le statut est DELIVERED (envoyée mais pas encore lue)
     * @param userId identifiant utilisateur
     * @return nombre de notifications non lues
     */
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.userId = :userId " +
           "AND n.channel = 'IN_APP' AND n.status = 'DELIVERED'")
    long countUnreadForUser(@Param("userId") UUID userId);
    
    // ==================== Traitement des notifications ====================
    
    /**
     * Trouve les notifications prêtes à être traitées.
     * Une notification est prête si :
     * - statut = PENDING
     * - pas de date de nouvelle tentative OU la date est passée
     * Le tri s'effectue par priorité (la plus haute d'abord), puis par date de création.
     * @param now date/heure courante
     * @param pageable pagination (pour limiter le nombre de notifications à traiter en une fois)
     * @return liste des notifications prêtes
     */
    @Query("SELECT n FROM Notification n WHERE n.status = 'PENDING' " +
           "AND (n.nextRetryAt IS NULL OR n.nextRetryAt <= :now) " +
           "ORDER BY n.priority ASC, n.createdAt ASC")
    List<Notification> findReadyForProcessing(
        @Param("now") OffsetDateTime now, 
        Pageable pageable
    );
    
    /**
     * Trouve les notifications bloquées (statuées PROCESSING depuis trop longtemps).
     * Ces notifications seront réinitialisées à PENDING pour être retraitées.
     * @param cutoffTime date limite : toute notification PROCESSING créée avant cette date est considérée bloquée
     * @return liste des notifications bloquées
     */
    @Query("SELECT n FROM Notification n WHERE n.status = 'PROCESSING' " +
           "AND n.createdAt < :cutoffTime")
    List<Notification> findStuckNotifications(@Param("cutoffTime") OffsetDateTime cutoffTime);
    
    /**
     * Trouve les notifications qui doivent être réessayées (leur date de nouvelle tentative est arrivée).
     * @param now date/heure courante
     * @return liste des notifications à réessayer
     */
    @Query("SELECT n FROM Notification n WHERE n.status = 'PENDING' " +
           "AND n.nextRetryAt IS NOT NULL AND n.nextRetryAt <= :now")
    List<Notification> findDueForRetry(@Param("now") OffsetDateTime now);
    
    // ==================== Mises à jour par lots ====================
    
    /**
     * Réinitialise les notifications bloquées (PROCESSING) à l'état PENDING.
     * @param cutoffTime date limite (notifications créées avant cette date)
     * @return nombre de notifications réinitialisées
     */
    @Modifying
    @Query("UPDATE Notification n SET n.status = 'PENDING' " +
           "WHERE n.status = 'PROCESSING' AND n.createdAt < :cutoffTime")
    int resetStuckNotifications(@Param("cutoffTime") OffsetDateTime cutoffTime);
    
    /**
     * Marque toutes les notifications IN_APP d'un utilisateur comme lues.
     * @param userId identifiant utilisateur
     * @param now date/heure de marquage
     * @return nombre de notifications mises à jour
     */
    @Modifying
    @Query("UPDATE Notification n SET n.status = 'READ', n.readAt = :now " +
           "WHERE n.userId = :userId AND n.channel = 'IN_APP' " +
           "AND n.status = 'DELIVERED'")
    int markAllAsReadForUser(
        @Param("userId") UUID userId, 
        @Param("now") OffsetDateTime now
    );
    
    // ==================== Requêtes analytiques ====================
    
    /**
     * Compte les notifications par statut.
     */
    long countByStatus(NotificationStatus status);
    
    /**
     * Compte les notifications par canal.
     */
    long countByChannel(ChannelType channel);
    
    /**
     * Compte les notifications créées après une certaine date.
     * @param time date de début
     * @return nombre de notifications
     */
    long countByCreatedAtAfter(OffsetDateTime time);
    
    /**
     * Compte le nombre de notifications envoyées à un utilisateur sur un canal donné depuis une certaine date.
     * Utile pour la limitation de débit (rate limiting).
     * @param userId identifiant utilisateur
     * @param channel canal
     * @param since date de début
     * @return nombre de notifications
     */
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.userId = :userId " +
           "AND n.channel = :channel AND n.createdAt >= :since " +
           "AND n.status NOT IN ('FAILED')")
    long countByUserIdAndChannelSince(
        @Param("userId") UUID userId,
        @Param("channel") ChannelType channel,
        @Param("since") OffsetDateTime since
    );
}