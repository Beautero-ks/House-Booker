package com.intergiciel.notification_service.domain.enums;

public enum NotificationType {

    BOOKING_CREATED("Réservation créée"),
    BOOKING_CONFIRMED("Réservation confirmée"),
    BOOKING_CANCELLED("Réservation annulée"),
    BOOKING_REMINDER("Rappel de réservation"),

    PAYMENT_SUCCESS("Paiement réussi"),
    PAYMENT_FAILED("Paiement échoué"),
    PAYMENT_REFUNDED("Remboursement effectué"),

    USER_REGISTERED("Bienvenue sur HouseBooker"),
    PASSWORD_RESET("Réinitialisation de mot de passe"),

    REVIEW_REQUEST("Laissez un avis"),
    CONTRACT_READY("Contrat disponible"),

    SYSTEM_ALERT("Alerte système");

    private final String description;

    NotificationType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}