-- =====================================================
-- V1__init_schema.sql - Schéma initial du service Notification
-- =====================================================
-- Migration Flyway pour le microservice Notification.
-- 
-- Ce schéma contient uniquement la table `notifications`.
-- Les références à `user_id` et `template_id` sont logiques
-- (pas de clés étrangères vers d'autres microservices).
--
-- L'identifiant `id` est généré par l'application (UUID v7)
-- et non par la base de données, afin de permettre une
-- génération distribuée sans aller-retour base.
--
-- =====================================================

-- Table principale des notifications
CREATE TABLE IF NOT EXISTS notifications (
    -- Identifiant technique (UUID v7 généré par l'application)
    id UUID PRIMARY KEY,

    -- Référence logique vers l'utilisateur (UserService)
    user_id UUID NOT NULL,

    -- Référence optionnelle vers un template (TemplateService, optionnel)
    template_id UUID,

    -- Canal de livraison : EMAIL, SMS, PUSH, IN_APP
    channel VARCHAR(20) NOT NULL,

    -- Priorité : CRITICAL, HIGH, MEDIUM, LOW
    priority VARCHAR(10) NOT NULL DEFAULT 'MEDIUM',

    -- Sujet (principalement pour EMAIL et PUSH)
    subject VARCHAR(500),

    -- Corps du message (après remplacement des variables)
    content TEXT NOT NULL,

    -- Statut : PENDING, PROCESSING, SENT, DELIVERED, FAILED, READ
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',

    -- Gestion des tentatives d'envoi
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,

    -- Horodatages de suivi
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_channel ON notifications(channel);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);

-- Index partiel pour les notifications prêtes à être rejouées
CREATE INDEX IF NOT EXISTS idx_notifications_retry ON notifications(next_retry_at)
    WHERE status = 'PENDING' AND next_retry_at IS NOT NULL;