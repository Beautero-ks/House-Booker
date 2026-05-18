package com.notification.service.channel;


import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import com.notification.model.entity.Notification;
import com.notification.model.enums.ChannelType;

/**
 * Gestionnaire d'envoi d'emails.
 * Dans une vraie implémentation, on appellerait un service comme SendGrid, AWS SES, etc.
 */
@Slf4j
@Component
public class EmailChannelHandler implements ChannelHandler {

    @Override
    public ChannelType getChannelType() {
        return ChannelType.EMAIL;
    }

    @Override
    public boolean send(Notification notification) {
        log.info("Envoi d'un email à l'utilisateur {} : [{}] {}",
                notification.getUserId(),
                notification.getSubject(),
                notification.getContent());
        // Ici, appel à un fournisseur d'emails
        // Simuler un succès
        return true;
    }
}