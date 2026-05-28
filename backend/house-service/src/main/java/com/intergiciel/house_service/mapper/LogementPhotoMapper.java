package com.intergiciel.house_service.mapper;

import com.intergiciel.house_service.dto.LogementPhotoDto;
import com.intergiciel.house_service.entity.LogementPhoto;
import org.springframework.stereotype.Component;

import java.util.Base64;

@Component
public class LogementPhotoMapper {

    public LogementPhotoDto toDto(LogementPhoto entity) {
        if (entity == null) {
            return null;
        }

        String base64Data = entity.getPhotoData() != null
            ? Base64.getEncoder().encodeToString(entity.getPhotoData())
            : null;

        return LogementPhotoDto.builder()
            .id(entity.getId())
            .logementId(entity.getLogementId())
            .fileName(entity.getFileName())
            .contentType(entity.getContentType())
            .photoDataUrl(base64Data != null ? "data:" + entity.getContentType() + ";base64," + base64Data : null)
            .createdAt(entity.getCreatedAt())
            .build();
    }

    public LogementPhotoDto toDtoWithoutData(LogementPhoto entity) {
        if (entity == null) {
            return null;
        }

        return LogementPhotoDto.builder()
            .id(entity.getId())
            .logementId(entity.getLogementId())
            .fileName(entity.getFileName())
            .contentType(entity.getContentType())
            .createdAt(entity.getCreatedAt())
            .build();
    }
}
