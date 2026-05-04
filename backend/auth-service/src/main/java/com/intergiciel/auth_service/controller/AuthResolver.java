package com.intergiciel.auth_service.controller;

import com.intergiciel.auth_service.dto.request.*;
import com.intergiciel.auth_service.dto.response.AuthResponse;
import com.intergiciel.auth_service.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

/**
 * AuthResolver — équivalent GraphQL de AuthController (REST)
 *
 * Annotations clés :
 *   @Controller          → Spring for GraphQL détecte ce resolver
 *   @MutationMapping     → lie la méthode à une mutation du schéma .graphqls
 *   @QueryMapping        → lie la méthode à une query du schéma .graphqls
 *   @Argument            → injecte l'input GraphQL dans le paramètre Java
 *
 * Toutes les mutations sont accessibles sur POST /graphql
 */
@Controller
@RequiredArgsConstructor
@Slf4j
public class AuthResolver {

    private final AuthService authService;

    // ─────────────────────────────────────────────────
    // QUERY
    // ─────────────────────────────────────────────────

    /**
     * query { healthCheck }
     */
    @QueryMapping
    public String healthCheck() {
        return "Auth Service is running — GraphQL ready";
    }

    // ─────────────────────────────────────────────────
    // MUTATIONS
    // ─────────────────────────────────────────────────

    /**
     * mutation {
     *   register(input: { name, email, password, phoneNumber }) {
     *     success message accessToken refreshToken
     *     user { id name email isVerified }
     *   }
     * }
     */
    @MutationMapping
    public AuthResponse register(@Argument @Valid RegisterInput input) {
        log.info("[AuthResolver] mutation register → {}", input.getEmail());
        return authService.register(input);
    }

    /**
     * mutation {
     *   verifyOtp(input: { userId, code }) {
     *     success message
     *   }
     * }
     */
    @MutationMapping
    public AuthResponse verifyOtp(@Argument @Valid VerifyOtpInput input) {
        log.info("[AuthResolver] mutation verifyOtp → userId={}", input.getUserId());
        return authService.verifyOtp(input.getUserId(), input.getCode());
    }

    /**
     * mutation {
     *   login(input: { email, password }) {
     *     success message accessToken refreshToken
     *     user { id name email isVerified }
     *   }
     * }
     */
    @MutationMapping
    public AuthResponse login(@Argument @Valid LoginInput input) {
        log.info("[AuthResolver] mutation login → {}", input.getEmail());
        return authService.login(input);
    }

    /**
     * mutation {
     *   refreshToken(input: { refreshToken }) {
     *     success accessToken refreshToken
     *   }
     * }
     */
    @MutationMapping
    public AuthResponse refreshToken(@Argument @Valid RefreshTokenInput input) {
        log.info("[AuthResolver] mutation refreshToken");
        return authService.refreshToken(input.getRefreshToken());
    }

    /**
     * mutation {
     *   resendOtp(userId: "...") {
     *     success message
     *   }
     * }
     */
    @MutationMapping
    public AuthResponse resendOtp(@Argument String userId) {
        log.info("[AuthResolver] mutation resendOtp → userId={}", userId);
        return authService.resendOtp(userId);
    }
}