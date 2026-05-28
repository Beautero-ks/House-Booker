package com.intergiciel.auth_service.dto.request;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.Locale;

/**
 * Composant responsable de la vérification d'un Google ID Token.
 *
 * Flux :
 *   1. Le frontend obtient un idToken via Google Identity Services (bouton "Sign in with Google")
 *   2. Il envoie ce token dans la mutation GraphQL loginWithGoogle
 *   3. Ce composant vérifie la signature et l'audience du token auprès de Google
 *   4. Extrait et retourne les infos utilisateur (email, name, googleId/sub)
 */
@Component
@Slf4j

public class GoogleTokenVerifier {

    @Value("${google.client-id}")
    private String googleClientId;

    /**
     * Vérifie un Google ID Token et retourne les infos extraites.
     *
     * @param idToken le token JWT signé par Google
     * @return GoogleUserInfo contenant email, name, googleId (sub), et picture
     * @throws RuntimeException si le token est invalide, expiré ou mal formé
     */
    public GoogleUserInfo verify(String idToken) {
        try {
            if (!StringUtils.hasText(idToken)) {
                throw new RuntimeException("Le Google ID Token est requis");
            }

            if (!StringUtils.hasText(googleClientId)) {
                throw new RuntimeException("GOOGLE_CLIENT_ID n'est pas configuré");
            }

            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance()
            )
                    // ✅ Vérifie que le token a bien été émis pour cette application
                    .setAudience(Arrays.stream(googleClientId.split(","))
                            .map(String::trim)
                            .filter(StringUtils::hasText)
                            .toList())
                    .build();

            GoogleIdToken googleIdToken = verifier.verify(idToken.trim());

            if (googleIdToken == null) {
                log.warn("[GoogleTokenVerifier] Token Google invalide ou signature non vérifiée");
                throw new RuntimeException("Token Google invalide");
            }

            Payload payload = googleIdToken.getPayload();

            String googleId  = payload.getSubject();                   // Identifiant unique Google (stable)
            String email     = payload.getEmail();
            String name      = (String) payload.get("name");
            String picture   = (String) payload.get("picture");
            boolean verified = Boolean.TRUE.equals(payload.getEmailVerified());

            if (!StringUtils.hasText(googleId) || !StringUtils.hasText(email)) {
                throw new RuntimeException("Token Google incomplet");
            }

            if (!verified) {
                log.warn("[GoogleTokenVerifier] Email non vérifié pour le compte Google : {}", email);
                throw new RuntimeException("L'adresse email Google n'est pas vérifiée");
            }

            log.info("[GoogleTokenVerifier] Token Google valide → email={}, googleId={}", email, googleId);

            String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
            return new GoogleUserInfo(googleId, normalizedEmail, StringUtils.hasText(name) ? name : normalizedEmail, picture);

        } catch (RuntimeException e) {
            // Propage les RuntimeException métier déjà loguées
            throw e;
        } catch (Exception e) {
            log.error("[GoogleTokenVerifier] Erreur lors de la vérification du token Google : {}", e.getMessage());
            throw new RuntimeException("Erreur lors de la vérification du token Google : " + e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────
    // DTO interne — résultat de la vérification
    // ─────────────────────────────────────────────────────────────

    /**
     * Données extraites d'un Google ID Token vérifié.
     */
    public record GoogleUserInfo(
            String googleId,    // Identifiant unique Google (sub)
            String email,       // Adresse email de l'utilisateur
            String name,        // Nom complet (peut être null si absent du profil)
            String picture      // URL de la photo de profil (peut être null)
    ) {}
}
