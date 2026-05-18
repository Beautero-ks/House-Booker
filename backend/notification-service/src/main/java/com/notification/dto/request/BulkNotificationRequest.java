package com.notification.dto.request;


import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.notification.model.enums.ChannelType;
import com.notification.model.enums.Priority;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkNotificationRequest {

    @NotEmpty(message = "La liste des utilisateurs ne peut être vide")
    private List<UUID> userIds;

    @NotNull(message = "Le canal est requis")
    private ChannelType channel;

    @Builder.Default
    private Priority priority = Priority.MEDIUM;

    private String templateName;
    private Map<String, String> templateVariables;

    private String subject;
    private String content;

    public boolean isTemplateRequest() {
        return templateName != null && !templateName.isBlank();
    }
}