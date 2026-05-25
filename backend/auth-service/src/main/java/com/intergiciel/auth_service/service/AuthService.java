package com.intergiciel.auth_service.service;

import com.intergiciel.auth_service.dto.LoginInput;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.intergiciel.auth_service.dto.event.UserVerifiedEvent;
import com.intergiciel.auth_service.dto.request.LoginInput;
import com.intergiciel.auth_service.dto.request.RegisterInput;
import com.intergiciel.auth_service.dto.request.GoogleTokenVerifier;
import com.intergiciel.auth_service.dto.request.GoogleTokenVerifier.GoogleUserInfo;
import com.intergiciel.auth_service.dto.response.AuthResponse;
import com.intergiciel.auth_service.entity.User;
import com.intergiciel.auth_service.kafka.EventPublisher;
import com.intergiciel.auth_service.enums.UserRole;
import com.intergiciel.auth_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository    userRepository;
    private final OtpService        otpService;
    private final TokenService      tokenService;
    private final EventPublisher eventPublisher;
    private final PasswordEncoder   passwordEncoder;
    private final GoogleTokenVerifier googleTokenVerifier;

    // ─────────────────────────────────────────────────
    // mutation register
    // ─────────────────────────────────────────────────
    @Transactional
    public AuthResponse register(RegisterInput input) throws JsonProcessingException {

        if (userRepository.existsByEmail(input.getEmail()))
            throw new RuntimeException("Un compte avec cet email existe déjà");

        User user = User.builder()
                .name(input.getName())
                .email(input.getEmail())
                .password(passwordEncoder.encode(input.getPassword()))
                .phoneNumber(input.getPhoneNumber())
                .isVerified(false)
                .role(UserRole.USER)
                .build();

        userRepository.save(user);
        log.info("[AuthService] Utilisateur créé : {}", user.getEmail());

        String accessToken  = tokenService.generateAccessToken(user);
        String refreshToken = tokenService.generateRefreshToken(user);
        String otpCode      = otpService.generateAndSave(user);

        // ✅ Publie "user.created" sur Kafka
        // → User-Service stocke le profil
        // → Notification-Service envoie le mail OTP
        eventPublisher.publishUserCreated(user, otpCode, otpService.getExpirationMinutes());

        return AuthResponse.builder()
                .success(true)
                .message("Compte créé. Un code OTP a été envoyé à " + user.getEmail())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(AuthResponse.UserInfo.builder()
                        .id(user.getId().toString())
                        .name(user.getName())
                        .email(user.getEmail())
                        .isVerified(false)
                        .role(user.getRole().name())
                        .build())
                .build();
    }

    // ─────────────────────────────────────────────────
    // mutation verifyOtp
    // ─────────────────────────────────────────────────
    @Transactional
    public AuthResponse verifyOtp(String userId, String code) {

        UUID userUUID = UUID.fromString(userId);
        User user = userRepository.findById(userUUID)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        if (user.isVerified())
            throw new RuntimeException("Ce compte est déjà vérifié");

        otpService.verify(userUUID, code);

        user.setVerified(true);
        User savedUser = userRepository.save(user);

        log.info("[AuthService] Compte vérifié : {}", user.getEmail());

        // =================================────────────────================
        // PUBLICATION KAFKA : On prévient le service de notification !
        // =================================================================
        UserVerifiedEvent event = UserVerifiedEvent.builder()
                .eventName("USER_VERIFIED")
                .data(UserVerifiedEvent.DataPayload.builder()
                        .userId(savedUser.getId().toString())
                        .name(savedUser.getName()) // ou savedUser.getName() selon ton entité
                        .email(savedUser.getEmail())
                        .build())
                .build();

        eventPublisher.publishUserVerified(event);

        return AuthResponse.builder()
                .success(true)
                .message("Compte vérifié. Vous pouvez maintenant vous connecter.")
                .build();
    }

    // ─────────────────────────────────────────────────
    // mutation login
    // ─────────────────────────────────────────────────
    @Transactional
    public AuthResponse login(LoginInput input) {

        User user = userRepository.findByEmail(input.email())
                .orElseThrow(() -> new RuntimeException("Email ou mot de passe incorrect"));

        if (!user.isVerified())
            throw new RuntimeException("Compte non vérifié. Vérifiez votre boîte mail.");

        if (!passwordEncoder.matches(input.password(), user.getPassword()))
            throw new RuntimeException("Email ou mot de passe incorrect");

        log.info("[AuthService] Connexion réussie : {}", user.getEmail());

        return AuthResponse.builder()
                .success(true)
                .message("Connexion réussie")
                .accessToken(tokenService.generateAccessToken(user))
                .refreshToken(tokenService.generateRefreshToken(user))
                .user(AuthResponse.UserInfo.builder()
                        .id(user.getId().toString())
                        .name(user.getName())
                        .email(user.getEmail())
                        .isVerified(true)
                        .role(user.getRole().name())
                        .build())
                .build();
    }

    // ─────────────────────────────────────────────────
    // mutation refreshToken
    // ─────────────────────────────────────────────────
    public AuthResponse refreshToken(String refreshToken) {

        String userId = tokenService.validateRefreshTokenAndGetUserId(refreshToken);

        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        return AuthResponse.builder()
                .success(true)
                .message("Token renouvelé")
                .accessToken(tokenService.generateAccessToken(user))
                .refreshToken(refreshToken)
                .build();
    }

    // ─────────────────────────────────────────────────
    // mutation resendOtp
    // ─────────────────────────────────────────────────
    @Transactional
    public AuthResponse resendOtp(String userId) throws JsonProcessingException {

        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        if (user.isVerified())
            throw new RuntimeException("Ce compte est déjà vérifié");

        String otpCode = otpService.generateAndSave(user);
        eventPublisher.publishUserCreated(user, otpCode, otpService.getExpirationMinutes());

        return AuthResponse.builder()
                .success(true)
                .message("Nouveau code OTP envoyé à " + user.getEmail())
                .build();
    }

    // ─────────────────────────────────────────────────
    // mutation loginWithGoogle
    // ─────────────────────────────────────────────────
    @Transactional
    public AuthResponse loginWithGoogle(String idToken) {

        // 1. Vérifier le Google ID Token et extraire les infos utilisateur
        GoogleUserInfo googleUser = googleTokenVerifier.verify(idToken);

        // 2. Chercher l'utilisateur en base par email
        User user = userRepository.findByEmail(googleUser.email()).orElse(null);

        boolean isNewUser = (user == null);

        if (isNewUser) {
            // 3a. Nouvel utilisateur — créer le compte Google directement vérifié
            user = User.builder()
                    .name(googleUser.name())
                    .email(googleUser.email())
                    .password(null)                   // Pas de mot de passe pour les comptes Google
                    .googleId(googleUser.googleId())
                    .provider("GOOGLE")
                    .isVerified(true)                 // Compte Google = déjà vérifié par Google
                    .role(UserRole.USER)
                    .build();

            userRepository.save(user);
            log.info("[AuthService] Nouveau compte Google créé : {}", user.getEmail());

            // ✅ Publie "user.created" pour que le User-Service crée le profil
            // otpCode = null, expiresInMinutes = 0 → Notification-Service n'envoie pas d'OTP
            eventPublisher.publishUserCreated(user, null, 0);

        } else {
            // 3b. Utilisateur existant — lier le compte Google si pas encore fait
            if (user.getGoogleId() == null) {
                user.setGoogleId(googleUser.googleId());
                user.setProvider("GOOGLE");
                user.setVerified(true);               // Vérifier le compte si pas encore fait
                userRepository.save(user);
                log.info("[AuthService] Compte Google lié à l'utilisateur existant : {}", user.getEmail());
            } else {
                log.info("[AuthService] Connexion Google réussie : {}", user.getEmail());
            }
        }

        // 4. Générer les tokens JWT internes
        String accessToken  = tokenService.generateAccessToken(user);
        String refreshToken = tokenService.generateRefreshToken(user);

        return AuthResponse.builder()
                .success(true)
                .message(isNewUser ? "Compte Google créé et connecté" : "Connexion Google réussie")
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(AuthResponse.UserInfo.builder()
                        .id(user.getId().toString())
                        .name(user.getName())
                        .email(user.getEmail())
                        .isVerified(true)
                        .role(user.getRole().name())
                        .build())
                .build();
    }
}