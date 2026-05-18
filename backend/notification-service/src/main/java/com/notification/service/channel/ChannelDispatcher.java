package com.notification.service.channel;


import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import com.notification.model.entity.Notification;
import com.notification.model.enums.ChannelType;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Dispatcher qui achemine une notification vers le gestionnaire de canal approprié.
 */
@Slf4j
@Service
public class ChannelDispatcher {

    private final Map<ChannelType, ChannelHandler> handlers;

    /**
     * Spring injecte automatiquement toutes les implémentations de {@link ChannelHandler}.
     * On les convertit en une Map pour un accès en O(1).
     */
    public ChannelDispatcher(List<ChannelHandler> handlerList) {
        this.handlers = handlerList.stream()
                .collect(Collectors.toMap(
                        ChannelHandler::getChannelType,
                        Function.identity()
                ));
        log.info("Gestionnaires de canaux enregistrés : {}", handlers.keySet());
    }

    /**
     * Achemine la notification vers le handler approprié.
     * @param notification la notification à envoyer
     * @return true si l'envoi a réussi (ou planifié), false en cas d'échec
     */
    public boolean dispatch(Notification notification) {
        ChannelType channel = notification.getChannel();
        ChannelHandler handler = handlers.get(channel);

        if (handler == null) {
            log.error("Aucun gestionnaire trouvé pour le canal {}", channel);
            return false;
        }

        if (!handler.canHandle(notification)) {
            log.error("Le gestionnaire {} ne peut pas traiter la notification {}",
                    channel, notification.getId());
            return false;
        }

        log.debug("Dispatch de la notification {} vers le gestionnaire {}",
                notification.getId(), channel);
        return handler.send(notification);
    }
}