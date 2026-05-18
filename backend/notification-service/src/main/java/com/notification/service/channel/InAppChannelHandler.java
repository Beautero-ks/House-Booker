package com.notification.service.channel;


import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import com.notification.model.entity.Notification;
import com.notification.model.enums.ChannelType;

/**
 * Pour les notifications in-app, il n'y a rien à faire si la notification est déjà stockée
 * en base de données. L'utilisateur la consultera via l'API.
 */
@Slf4j
@Component
public class InAppChannelHandler implements ChannelHandler {

    @Override
    public ChannelType getChannelType() {
        return ChannelType.IN_APP;
    }

    @Override
    public boolean send(Notification notification) {
        log.debug("Notification in-app {} stockée et accessible via l'API.", notification.getId());
        // Rien à faire car la notification est déjà en base.
        return true;
    }
}