package com.notification.dto.request;


// =====================================================
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import com.notification.model.enums.ChannelType;
import com.notification.model.enums.Priority;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendNotificationRequest {

    @NotNull(message = "L'identifiant utilisateur est requis")
    private UUID userId;

    @NotNull(message = "Le canal est requis")
    private ChannelType channel;

    @Builder.Default
    private Priority priority = Priority.MEDIUM;

    // Pour l’utilisation d’un template (optionnel – pourra être étendu plus tard)
    private String templateName;
    @Builder.Default
    private Map<String, String> templateVariables = new HashMap<>();

    // Contenu direct
    private String subject;
    @NotBlank(message = "Le contenu est requis si aucun template n'est fourni")
    private String content;

    // Déduplication
    private String eventId;

    public boolean isTemplateRequest() {
        return templateName != null && !templateName.isBlank();
    }

    public boolean hasValidContent() {
        return isTemplateRequest() || (content != null && !content.isBlank());
    }
}