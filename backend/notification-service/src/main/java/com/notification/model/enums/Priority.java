package com.notification.model.enums;

// =========================================================================
// Priority.java - Niveaux d'urgence des notifications
// =========================================================================
//
// Détermine l'ordre de traitement, les limites de débit et la stratégie de réessai.
//

public enum Priority {

    CRITICAL(0, "Critique : ignorer les limites de débit, réessai rapide"),
    HIGH(1, "Haute priorité : traitement immédiat"),
    MEDIUM(2, "Priorité normale : traitement standard"),
    LOW(3, "Basse priorité : peut attendre");

    private final int weight;
    private final String description;

    Priority(int weight, String description) {
        this.weight = weight;
        this.description = description;
    }

    public int getWeight() {
        return weight;
    }

    public String getDescription() {
        return description;
    }

    public boolean isHigherThan(Priority other) {
        return this.weight < other.weight;
    }

    public static Priority fromValue(String value) {
        for (Priority priority : Priority.values()) {
            if (priority.name().equalsIgnoreCase(value)) {
                return priority;
            }
        }
        throw new IllegalArgumentException("Priorité inconnue : " + value);
    }

    public static Priority getDefault() {
        return MEDIUM;
    }
}