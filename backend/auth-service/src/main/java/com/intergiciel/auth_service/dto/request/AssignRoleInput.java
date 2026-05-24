package com.intergiciel.auth_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AssignRoleInput {
    @NotBlank(message = "L'identifiant de l'utilisateur est requis")
    private String userId;

    @NotBlank(message = "Le rôle est requis")
    private String role;
}
