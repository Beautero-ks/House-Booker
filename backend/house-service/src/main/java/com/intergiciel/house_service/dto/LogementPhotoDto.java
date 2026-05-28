package com.intergiciel.house_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LogementPhotoDto {
    private UUID id;
    private UUID logementId;
    private String fileName;
    private String contentType;
    private String photoDataUrl; // Base64 encoded pour GraphQL
    private OffsetDateTime createdAt;
}
