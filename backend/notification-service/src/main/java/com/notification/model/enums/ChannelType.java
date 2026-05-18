package com.notification.model.enums;

// =========================================================================
// ChannelType.java - Canaux de livraison des notifications
// =========================================================================
//
// Définit les différents moyens d'envoyer une notification.
// Chaque canal a ses propres limites de débit, mécanismes de livraison,
// et formats de contenu.
//

public enum ChannelType {

    /**
     * EMAIL - Courrier électronique
     * Utilisé pour les notifications détaillées, reçus, contrats.
     * Fournisseurs : SendGrid, Amazon SES, Mailgun.
     * Limite : 20 par heure par utilisateur.
     */
    EMAIL("email", "Notifications par email"),

    /**
     * SMS - Message texte
     * Utilisé pour les alertes urgentes, codes OTP.
     * Fournisseurs : Twilio, AWS SNS.
     * Limite : 5 par heure par utilisateur (coût élevé).
     */
    SMS("sms", "Messages texte via SMS"),

    /**
     * PUSH - Notification push mobile
     * Utilisé pour les alertes temps réel, promotions.
     * Fournisseurs : Firebase Cloud Messaging (FCM), APNs.
     * Limite : 20 par heure par utilisateur.
     */
    PUSH("push", "Notifications push mobiles"),

    /**
     * IN_APP - Notification dans l'application
     * Utilisé pour le centre de messages, activité.
     * Limite : 100 par heure par utilisateur.
     */
    IN_APP("in_app", "Notifications dans la messagerie interne");

    private final String value;
    private final String description;

    ChannelType(String value, String description) {
        this.value = value;
        this.description = description;
    }

    public String getValue() {
        return value;
    }

    public String getDescription() {
        return description;
    }

    /**
     * Convertit une chaîne en ChannelType (insensible à la casse).
     * @param value la chaîne (ex: "email", "EMAIL")
     * @return le ChannelType correspondant
     * @throws IllegalArgumentException si non reconnu
     */
    public static ChannelType fromValue(String value) {
        for (ChannelType type : ChannelType.values()) {
            if (type.value.equalsIgnoreCase(value) || type.name().equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Canal inconnu : " + value);
    }
}