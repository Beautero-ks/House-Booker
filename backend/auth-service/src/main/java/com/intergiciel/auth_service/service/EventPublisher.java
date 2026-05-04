package com.intergiciel.auth_service.service;

import com.intergiciel.auth_service.dto.event.UserCreatedEvent;
import com.intergiciel.auth_service.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventPublisher {

    private final KafkaTemplate<String, UserCreatedEvent> kafkaTemplate;

    @Value("${kafka.topics.user-created}")
    private String userCreatedTopic;

    /**
     * Publie l'event "user.created" sur Kafka.
     * Sera consommé par :
     *   - User-Service         → crée le profil utilisateur
     *   - Notification-Service → envoie le mail avec l'OTP
     *
     * @param user            l'utilisateur nouvellement créé
     * @param otpCode         le code OTP généré
     * @param expiresInMinutes durée de validité de l'OTP
     */
    public void publishUserCreated(User user, String otpCode, int expiresInMinutes) {

        UserCreatedEvent event = UserCreatedEvent.of(
                user.getId().toString(),
                user.getName(),
                user.getEmail(),
                user.getPhoneNumber(),
                otpCode,
                expiresInMinutes
        );

        // La clé = userId → garantit que tous les events d'un même user
        // vont dans la même partition (ordre garanti)
        CompletableFuture<SendResult<String, UserCreatedEvent>> future =
                kafkaTemplate.send(userCreatedTopic, user.getId().toString(), event);

        future.whenComplete((result, ex) -> {
            if (ex == null) {
                log.info("[EventPublisher] Event 'user.created' publié → topic={}, partition={}, offset={}",
                        userCreatedTopic,
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset());
            } else {
                log.error("[EventPublisher] Échec de publication de l'event 'user.created' pour {} : {}",
                        user.getEmail(), ex.getMessage());
                // En production : implémenter un mécanisme de retry ou dead-letter topic
            }
        });
    }
}