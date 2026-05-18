package com.notification.service.channel;


import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import com.notification.model.entity.Notification;
import com.notification.model.enums.ChannelType;

@Slf4j
@Component
public class SmsChannelHandler implements ChannelHandler {

    @Override
    public ChannelType getChannelType() {
        return ChannelType.SMS;
    }

    @Override
    public boolean send(Notification notification) {
        log.info("Envoi d'un SMS à l'utilisateur {} : {}",
                notification.getUserId(),
                notification.getContent());
        // Appel à Twilio ou autre
        return true;
    }
}