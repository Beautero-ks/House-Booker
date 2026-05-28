package com.intergiciel.auth_service.dto.request;

import lombok.Data;

@Data
public class DeleteAccountInput {
    private String currentPassword;
    private String otpCode;
}
