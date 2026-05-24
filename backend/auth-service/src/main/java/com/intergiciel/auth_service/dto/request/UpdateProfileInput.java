package com.intergiciel.auth_service.dto.request;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class UpdateProfileInput {
    private String name;
    private String username;

    @Email
    private String email;

    private String photoUrl;
}
