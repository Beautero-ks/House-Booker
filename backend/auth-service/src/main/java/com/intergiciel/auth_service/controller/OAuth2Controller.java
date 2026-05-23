package com.intergiciel.auth_service.controller;

import com.intergiciel.auth_service.dto.request.GoogleAuthInput;
import com.intergiciel.auth_service.dto.response.AuthResponse;
import com.intergiciel.auth_service.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * OAuth2Controller — endpoint REST complémentaire au resolver GraphQL.
 *
 * ⚠️ L'approche principale est via GraphQL (mutation loginWithGoogle).
 * Ce controller REST est fourni comme alternative pour :
 *   - Des clients qui ne supportent pas GraphQL
 *   - Des tests via curl / Postman
 *   - Une intégration mobile directe
 *
 * POST /oauth2/google
 *   Body : { "idToken": "eyJhbGci..." }
 *   Retourne : AuthResponse avec accessToken + refreshToken
 */
@RestController
@RequestMapping("/oauth2")
@RequiredArgsConstructor
@Slf4j
public class OAuth2Controller {

    private final AuthService authService;

    /**
     * Authentification via Google ID Token (endpoint REST alternatif).
     *
     * Exemple curl :
     * curl -X POST http://localhost:8081/oauth2/google \
     *      -H "Content-Type: application/json" \
     *      -d '{"idToken":"VOTRE_GOOGLE_ID_TOKEN"}'
     */
    @PostMapping("/google")
    public ResponseEntity<AuthResponse> loginWithGoogle(@RequestBody @Valid GoogleAuthInput input) {
        log.info("[OAuth2Controller] POST /oauth2/google — vérification du Google ID Token");
        AuthResponse response = authService.loginWithGoogle(input.getIdToken());
        return ResponseEntity.ok(response);
    }
}
