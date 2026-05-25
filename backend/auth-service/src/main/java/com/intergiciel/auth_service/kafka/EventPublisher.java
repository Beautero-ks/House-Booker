package com.intergiciel.auth_service.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.intergiciel.auth_service.dto.event.UserCreatedEvent;
import com.intergiciel.auth_service.dto.event.UserVerifiedEvent;
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

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Value("${kafka.topics.user-created}")
    private String userCreatedTopic;
    @Value("${kafka.topics.user-verified}")
    private String userVerifiedTopic;

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
    public void publishUserCreated(User user, String otpCode, int expiresInMinutes) throws JsonProcessingException {

        UserCreatedEvent event = UserCreatedEvent.of(
                user.getId().toString(),
                user.getName(),
                user.getEmail(),
                user.getPhoneNumber(),
                otpCode,
                expiresInMinutes
        );

        String payload = objectMapper.writeValueAsString(event);
        // La clé = userId → garantit que tous les events d'un même user
        // vont dans la même partition (ordre garanti)
        CompletableFuture<SendResult<String, String>> future =
                kafkaTemplate.send(userCreatedTopic, user.getId().toString(), payload);

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

    /**
     * Publie l'event "user.verified" sur Kafka en format JSON String.
     */
    public void publishUserVerified(UserVerifiedEvent event) {
        try {
            // 1. Conversion de l'objet en String JSON
            String payload = objectMapper.writeValueAsString(event);
            String userId = event.getData().getUserId();

            log.info("[EventPublisher] Publication de l'événement USER_VERIFIED pour l'ID: {}", userId);

            // 2. Envoi asynchrone standardisé
            CompletableFuture<SendResult<String, String>> future =
                    kafkaTemplate.send(userVerifiedTopic, userId, payload);

            future.whenComplete((result, ex) -> {
                if (ex == null) {
                    log.info("[EventPublisher] Event 'user.verified' publié avec succès ! offset={}",
                            result.getRecordMetadata().offset());
                } else {
                    log.error("[EventPublisher] Échec d'envoi de USER_VERIFIED pour l'ID {}: {}",
                            userId, ex.getMessage());
                }
            });

        } catch (Exception e) {
            log.error("[EventPublisher] Erreur globale lors de la publication de USER_VERIFIED", e);
        }
    }
}