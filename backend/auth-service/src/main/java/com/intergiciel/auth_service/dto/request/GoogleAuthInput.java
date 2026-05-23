package com.intergiciel.auth_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Input GraphQL pour la mutation loginWithGoogle.
 * Le frontend envoie le Google ID Token obtenu via Google Identity Services.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoogleAuthInput {

    /**
     * ID Token JWT émis par Google après consentement de l'utilisateur.
     * À obtenir côté frontend via : google.accounts.id.initialize / prompt()
     * ou via le bouton "Sign in with Google" (One Tap).
     */
    @NotBlank(message = "Le Google ID Token est requis")
    private String idToken;
}
