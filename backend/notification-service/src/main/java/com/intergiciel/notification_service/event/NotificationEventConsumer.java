package com.intergiciel.notification_service.event;


import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import com.intergiciel.notification_service.domain.enums.NotificationChannel;
import com.intergiciel.notification_service.domain.enums.NotificationType;
import com.intergiciel.notification_service.dto.NotificationRequest;
import com.intergiciel.notification_service.service.NotificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationEventConsumer {

    private final NotificationService notificationService;

    @KafkaListener(topics = "${kafka.topics.booking-events}", groupId = "notification-service-group")
    public void handleBookingEvent(BookingEvent event) {
        log.info("Received BookingEvent: {}", event);

        NotificationRequest request = createBookingNotification(event);
        notificationService.createAndSendNotification(request);
    }

    @KafkaListener(topics = "${kafka.topics.payment-events}", groupId = "notification-service-group")
    public void handlePaymentEvent(PaymentEvent event) {
        log.info("Received PaymentEvent: {}", event);

        NotificationRequest request = createPaymentNotification(event);
        notificationService.createAndSendNotification(request);
    }

    @KafkaListener(topics = "${kafka.topics.user-events}", groupId = "notification-service-group")
    public void handleUserEvent(UserEvent event) {
        log.info("Received UserEvent: {}", event);

        NotificationRequest request = createUserNotification(event);
        notificationService.createAndSendNotification(request);
    }

    // === Méthodes de transformation Event → NotificationRequest ===

    private NotificationRequest createBookingNotification(BookingEvent event) {
        String message = switch (event.getStatus()) {
            case "CONFIRMED" -> "Votre réservation pour " + event.getHouseTitle() +
                               " du " + event.getCheckInDate() + " a été confirmée.";
            case "CANCELLED" -> "Votre réservation pour " + event.getHouseTitle() + " a été annulée.";
            default -> "Mise à jour de votre réservation.";
        };

        return NotificationRequest.builder()
                .userId(event.getUserId())
                .title(getBookingTitle(event.getStatus()))
                .message(message)
                .type(getBookingNotificationType(event.getStatus()))
                .channel(NotificationChannel.EMAIL)
                .referenceId(event.getBookingId())
                .emailTo(null) // Sera rempli plus tard via User-Service si nécessaire
                .build();
    }

    private NotificationRequest createPaymentNotification(PaymentEvent event) {
        String title = "SUCCESS".equals(event.getStatus()) ? 
                "Paiement réussi" : "Échec du paiement";

        String message = "SUCCESS".equals(event.getStatus()) ?
                "Votre paiement de " + event.getAmount() + " FCFA a été effectué avec succès." :
                "Le paiement a échoué. Veuillez réessayer.";

        return NotificationRequest.builder()
                .userId(event.getUserId())
                .title(title)
                .message(message)
                .type("SUCCESS".equals(event.getStatus()) ? 
                        NotificationType.PAYMENT_SUCCESS : NotificationType.PAYMENT_FAILED)
                .channel(NotificationChannel.EMAIL)
                .referenceId(event.getPaymentId())
                .build();
    }

    private NotificationRequest createUserNotification(UserEvent event) {
        return NotificationRequest.builder()
                .userId(event.getUserId())
                .title("Bienvenue sur HouseBooker !")
                .message("Merci de votre inscription. Nous sommes ravis de vous compter parmi nous.")
                .type(NotificationType.USER_REGISTERED)
                .channel(NotificationChannel.EMAIL)
                .emailTo(event.getEmail())
                .build();
    }

    private String getBookingTitle(String status) {
        return switch (status) {
            case "CONFIRMED" -> "Réservation Confirmée";
            case "CANCELLED" -> "Réservation Annulée";
            default -> "Mise à jour Réservation";
        };
    }

    private NotificationType getBookingNotificationType(String status) {
        return switch (status) {
            case "CONFIRMED" -> NotificationType.BOOKING_CONFIRMED;
            case "CANCELLED" -> NotificationType.BOOKING_CANCELLED;
            default -> NotificationType.BOOKING_CREATED;
        };
    }
}
