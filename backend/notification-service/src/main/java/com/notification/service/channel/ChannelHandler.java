package com.notification.service.channel;

import com.notification.model.entity.Notification;
import com.notification.model.enums.ChannelType;

/**
 * Interface que doivent implémenter tous les gestionnaires de canaux.
 */
public interface ChannelHandler {

    /**
     * @return le type de canal géré (EMAIL, SMS, PUSH, IN_APP)
     */
    ChannelType getChannelType();

    /**
     * Vérifie si ce gestionnaire peut traiter la notification (ex: présence d'une adresse email, etc.)
     * @param notification la notification à vérifier
     * @return true si le traitement est possible
     */
    default boolean canHandle(Notification notification) {
        return true; // par défaut, toujours possible ; à surcharger si besoin
    }

    /**
     * Effectue l'envoi effectif de la notification via le canal.
     * @param notification la notification à envoyer
     * @return true si l'envoi a réussi, false sinon
     */
    boolean send(Notification notification);
}