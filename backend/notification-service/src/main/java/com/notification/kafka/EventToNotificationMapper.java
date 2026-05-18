package com.notification.kafka;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.notification.config.RoutingProperties;
import com.notification.dto.request.SendNotificationRequest;
import com.notification.kafka.event.BookingCreatedEvent;
import com.notification.kafka.event.ContractGeneratedEvent;
import com.notification.kafka.event.PaymentCompletedEvent;
import com.notification.model.enums.ChannelType;
import com.notification.model.enums.Priority;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class EventToNotificationMapper {

    private final RoutingProperties routingProperties;
    private final ObjectMapper objectMapper;

    public SendNotificationRequest mapBookingCreated(BookingCreatedEvent event) {
        return SendNotificationRequest.builder()
                .userId(event.getUserId())
                .channel(getFirstChannel("booking-created"))
                .priority(Priority.MEDIUM)
                .subject("Réservation confirmée")
                .content(String.format("Votre réservation du %s au %s pour le logement '%s' a bien été enregistrée.",
                        event.getCheckInDate(), event.getCheckOutDate(), event.getPropertyName()))
                .build();
    }

    public SendNotificationRequest mapPaymentCompleted(PaymentCompletedEvent event) {
        return SendNotificationRequest.builder()
                .userId(event.getUserId())
                .channel(getFirstChannel("payment-completed"))
                .priority(Priority.HIGH)
                .subject("Paiement accepté")
                .content(String.format("Votre paiement de %.2f € pour la réservation #%s a été accepté.",
                        event.getAmount(), event.getBookingId()))
                .build();
    }

    public SendNotificationRequest mapContractGenerated(ContractGeneratedEvent event) {
        return SendNotificationRequest.builder()
                .userId(event.getUserId())
                .channel(getFirstChannel("contract-generated"))
                .priority(Priority.HIGH)
                .subject("Votre contrat est disponible")
                .content(String.format("Le contrat #%s est prêt. Téléchargez-le ici : %s",
                        event.getContractId(), event.getContractUrl()))
                .build();
    }

    private ChannelType getFirstChannel(String ruleKey) {
        List<String> channels = routingProperties.getRules().get(ruleKey);
        if (channels == null || channels.isEmpty()) {
            log.warn("Aucune règle de routage trouvée pour {}, utilisation de IN_APP par défaut", ruleKey);
            return ChannelType.IN_APP;
        }
        return ChannelType.valueOf(channels.get(0));
    }
}