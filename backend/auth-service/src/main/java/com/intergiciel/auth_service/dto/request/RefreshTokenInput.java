package com.intergiciel.auth_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RefreshTokenInput {
    @NotBlank
    private String refreshToken;
}
