package com.intergiciel.auth_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerifyOtpInput {
    @NotBlank
    private String userId;

    @NotBlank
    private String code;
}
