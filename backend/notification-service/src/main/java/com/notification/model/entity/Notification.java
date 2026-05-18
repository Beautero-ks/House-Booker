package com.notification.model.entity;

// =========================================================================
// Notification.java - Entité centrale de notification
// =========================================================================
//
// Cette classe représente une notification individuelle envoyée à un utilisateur.
// Chaque enregistrement correspond à une tentative d'envoi via un canal unique.
//
// Cycle de vie :
// 1. Création → status PENDING
// 2. Prise en charge par un worker → PROCESSING
// 3. Envoi réussi au fournisseur → SENT
// 4. Confirmation de réception → DELIVERED
// 5. Lecture par l'utilisateur (in-app) → READ
// 6. Échec définitif → FAILED
//

import com.github.f4b6a3.uuid.UuidCreator;
import com.notification.model.enums.ChannelType;
import com.notification.model.enums.NotificationStatus;
import com.notification.model.enums.Priority;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications",
       indexes = {
           @Index(name = "idx_notifications_user_id", columnList = "user_id"),
           @Index(name = "idx_notifications_status", columnList = "status"),
           @Index(name = "idx_notifications_channel", columnList = "channel"),
           @Index(name = "idx_notifications_user_created", columnList = "user_id, created_at DESC")
       })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    // ==================== Destinataire ====================

    /**
     * Identifiant technique de l'utilisateur destinataire.
     * Il s'agit d'une clé étrangère logique vers le UserService.
     * Aucune contrainte JPA n'est définie pour éviter le couplage entre microservices.
     */
    @NotNull
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    /**
     * Identifiant facultatif du modèle de notification utilisé.
     * Permet de tracer quelle source de contenu a été employée.
     */
    @Column(name = "template_id")
    private UUID templateId;

    // ==================== Canal et priorité ====================

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "channel", nullable = false, length = 20)
    private ChannelType channel;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 10)
    @Builder.Default
    private Priority priority = Priority.MEDIUM;

    // ==================== Contenu ====================

    /**
     * Sujet (pour email ou notification push).
     */
    @Size(max = 500)
    @Column(name = "subject", length = 500)
    private String subject;

    /**
     * Corps du message (déjà traité, avec les variables remplacées).
     */
    @NotBlank
    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    // ==================== Statut et tentatives ====================

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private NotificationStatus status = NotificationStatus.PENDING;

    @Column(name = "retry_count")
    @Builder.Default
    private int retryCount = 0;

    @Column(name = "max_retries")
    @Builder.Default
    private int maxRetries = 3;

    /**
     * Date à laquelle une nouvelle tentative d'envoi doit être effectuée.
     * Utilisé pour la stratégie de backoff exponentiel.
     */
    @Column(name = "next_retry_at")
    private OffsetDateTime nextRetryAt;

    /**
     * Dernier message d'erreur (utile pour le diagnostic).
     */
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    // ==================== Horodatages ====================

    @Column(name = "sent_at")
    private OffsetDateTime sentAt;

    @Column(name = "delivered_at")
    private OffsetDateTime deliveredAt;

    @Column(name = "read_at")
    private OffsetDateTime readAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    // ==================== Méthodes de cycle de vie ====================

    @PrePersist
    protected void onCreate() {
        if (this.id == null) {
            // Génération d'un UUID v7 (triable chronologiquement)
            this.id = UuidCreator.getTimeOrderedEpoch();
        }
    }

    // ==================== Méthodes utilitaires ====================

    /**
     * Passe la notification en état "en cours de traitement".
     */
    public void markAsProcessing() {
        this.status = NotificationStatus.PROCESSING;
    }

    /**
     * Marque la notification comme envoyée au fournisseur.
     */
    public void markAsSent() {
        this.status = NotificationStatus.SENT;
        this.sentAt = OffsetDateTime.now();
        this.errorMessage = null;
    }

    /**
     * Marque la notification comme délivrée (accusé de réception).
     */
    public void markAsDelivered() {
        this.status = NotificationStatus.DELIVERED;
        this.deliveredAt = OffsetDateTime.now();
    }

    /**
     * Marque la notification comme lue (uniquement pour le canal IN_APP).
     */
    public void markAsRead() {
        this.status = NotificationStatus.READ;
        this.readAt = OffsetDateTime.now();
    }

    /**
     * Marque la notification comme définitivement échouée.
     * @param errorMessage description de l'erreur
     */
    public void markAsFailed(String errorMessage) {
        this.status = NotificationStatus.FAILED;
        this.errorMessage = errorMessage;
    }

    /**
     * Programme une nouvelle tentative d'envoi selon une stratégie de backoff exponentiel.
     * @param errorMessage raison de la nouvelle tentative
     */
    public void scheduleRetry(String errorMessage) {
        this.retryCount++;
        this.errorMessage = errorMessage;

        if (this.retryCount >= this.maxRetries) {
            markAsFailed("Nombre maximal de tentatives atteint. Dernière erreur : " + errorMessage);
        } else {
            long delayMinutes = (long) Math.pow(5, this.retryCount);
            this.nextRetryAt = OffsetDateTime.now().plusMinutes(delayMinutes);
            this.status = NotificationStatus.PENDING;
        }
    }

    /**
     * Indique si la notification est prête à être retentée.
     */
    public boolean isReadyForRetry() {
        if (this.status != NotificationStatus.PENDING) {
            return false;
        }
        if (this.nextRetryAt == null) {
            return true;
        }
        return OffsetDateTime.now().isAfter(this.nextRetryAt);
    }

    /**
     * Indique s'il s'agit d'une nouvelle notification jamais tentée.
     */
    public boolean isNew() {
        return this.status == NotificationStatus.PENDING && this.retryCount == 0;
    }
}