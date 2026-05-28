package com.intergiciel.auth_service.config;

import com.intergiciel.auth_service.entity.User;
import com.intergiciel.auth_service.enums.UserRole;
import com.intergiciel.auth_service.repository.UserRepository;
import com.intergiciel.auth_service.service.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Optional;

/**
 * Handler déclenché après un flux OAuth2 redirect réussi (si activé dans SecurityConfig).
 *
 * Dans l'approche principale (ID Token via GraphQL), ce handler n'est pas utilisé.
 * Il est fourni ici pour être prêt si tu actives le flux redirect OAuth2 côté web.
 *
 * Flux redirect (optionnel) :
 *   GET /oauth2/authorization/google → Spring redirige vers Google
 *   Google redirige vers /login/oauth2/code/google → Spring appelle ce handler
 *   Ce handler génère les tokens JWT et redirige vers le frontend
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final TokenService tokenService;
    private final UserRepository userRepository;

    /**
     * URL de redirection frontend après succès (à adapter selon ton frontend).
     * Le access token sera passé en query param pour que le frontend le récupère.
     */
    private static final String FRONTEND_REDIRECT_URL = "http://localhost:3000/oauth2/callback";

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException {

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();

        String email   = oauthUser.getAttribute("email");
        String name    = oauthUser.getAttribute("name");

        log.info("[OAuth2SuccessHandler] Authentification Google réussie via redirect pour : {}", email);

        // Chercher l'utilisateur en base
        Optional<User> userOpt = userRepository.findByEmailAndDeletedAtIsNull(email);

        if (userOpt.isEmpty()) {
            // L'utilisateur n'existe pas encore — créer le compte
            User newUser = User.builder()
                    .name(name != null ? name : email)
                    .email(email)
                    .password(null)
                    .googleId(oauthUser.getAttribute("sub"))
                    .provider("GOOGLE")
                    .isVerified(true)
                    .role(UserRole.USER)
                    .build();
            userRepository.save(newUser);
            log.info("[OAuth2SuccessHandler] Nouveau compte Google créé via redirect : {}", email);
            userOpt = Optional.of(newUser);
        }

        User user = userOpt.get();

        // Générer les tokens JWT
        String accessToken  = tokenService.generateAccessToken(user);
        String refreshToken = tokenService.generateRefreshToken(user);

        // Rediriger vers le frontend avec les tokens en query params
        // ⚠️ En production, préférer les cookies HttpOnly sécurisés
        String redirectUrl = FRONTEND_REDIRECT_URL
                + "?accessToken=" + accessToken
                + "&refreshToken=" + refreshToken;

        log.info("[OAuth2SuccessHandler] Redirection vers : {}", FRONTEND_REDIRECT_URL);
        response.sendRedirect(redirectUrl);
    }
}
