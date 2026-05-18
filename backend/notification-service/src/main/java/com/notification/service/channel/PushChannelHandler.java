package com.notification.service.channel;


import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import com.notification.model.entity.Notification;
import com.notification.model.enums.ChannelType;

@Slf4j
@Component
public class PushChannelHandler implements ChannelHandler {

    @Override
    public ChannelType getChannelType() {
        return ChannelType.PUSH;
    }

    @Override
    public boolean send(Notification notification) {
        log.info("Envoi d'une notification push à l'utilisateur {} : {}",
                notification.getUserId(),
                notification.getContent());
        // Appel à FCM / APNs
        return true;
    }
}