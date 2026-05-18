package com.notification.model.enums;

// =========================================================================
// NotificationStatus.java - États du cycle de vie d'une notification
// =========================================================================
//
// Machine à états :
// PENDING → PROCESSING → SENT → DELIVERED
//              ↓
//         PENDING (réessai) ou FAILED
//
// READ est un état terminal pour IN_APP.
//

public enum NotificationStatus {

    PENDING("pending", "En attente dans la file", true),
    PROCESSING("processing", "En cours d'envoi", true),
    SENT("sent", "Envoyé au fournisseur", false),
    DELIVERED("delivered", "Délivré au destinataire", false),
    FAILED("failed", "Échec définitif", false),
    READ("read", "Lu par l'utilisateur", false);

    private final String value;
    private final String description;
    private final boolean processing;

    NotificationStatus(String value, String description, boolean processing) {
        this.value = value;
        this.description = description;
        this.processing = processing;
    }

    public String getValue() {
        return value;
    }

    public String getDescription() {
        return description;
    }

    public boolean isProcessing() {
        return processing;
    }

    public boolean isTerminal() {
        return this == DELIVERED || this == FAILED || this == READ;
    }

    public boolean isSuccess() {
        return this == SENT || this == DELIVERED || this == READ;
    }

    public boolean canRetry() {
        return this == PENDING;
    }

    public static NotificationStatus fromValue(String value) {
        for (NotificationStatus status : NotificationStatus.values()) {
            if (status.value.equalsIgnoreCase(value) || status.name().equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Statut inconnu : " + value);
    }
}