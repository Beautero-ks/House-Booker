package com.intergiciel.auth_service.service;

import com.intergiciel.auth_service.dto.request.LoginInput;
import com.intergiciel.auth_service.dto.request.RegisterInput;
import com.intergiciel.auth_service.dto.response.AuthResponse;
import com.intergiciel.auth_service.entity.User;
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
    private final EventPublisher    eventPublisher;
    private final PasswordEncoder   passwordEncoder;

    // ─────────────────────────────────────────────────
    // mutation register
    // ─────────────────────────────────────────────────
    @Transactional
    public AuthResponse register(RegisterInput input) {

        if (userRepository.existsByEmail(input.getEmail()))
            throw new RuntimeException("Un compte avec cet email existe déjà");

        User user = User.builder()
                .name(input.getName())
                .email(input.getEmail())
                .password(passwordEncoder.encode(input.getPassword()))
                .phoneNumber(input.getPhoneNumber())
                .isVerified(false)
                .build();

        userRepository.save(user);
        log.info("[AuthService] Utilisateur créé : {}", user.getEmail());

        String accessToken  = tokenService.generateAccessToken(user.getId().toString());
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
        userRepository.save(user);

        log.info("[AuthService] Compte vérifié : {}", user.getEmail());

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

        User user = userRepository.findByEmail(input.getEmail())
                .orElseThrow(() -> new RuntimeException("Email ou mot de passe incorrect"));

        if (!user.isVerified())
            throw new RuntimeException("Compte non vérifié. Vérifiez votre boîte mail.");

        if (!passwordEncoder.matches(input.getPassword(), user.getPassword()))
            throw new RuntimeException("Email ou mot de passe incorrect");

        log.info("[AuthService] Connexion réussie : {}", user.getEmail());

        return AuthResponse.builder()
                .success(true)
                .message("Connexion réussie")
                .accessToken(tokenService.generateAccessToken(user.getId().toString()))
                .refreshToken(tokenService.generateRefreshToken(user))
                .user(AuthResponse.UserInfo.builder()
                        .id(user.getId().toString())
                        .name(user.getName())
                        .email(user.getEmail())
                        .isVerified(true)
                        .build())
                .build();
    }

    // ─────────────────────────────────────────────────
    // mutation refreshToken
    // ─────────────────────────────────────────────────
    public AuthResponse refreshToken(String refreshToken) {

        String userId = tokenService.validateRefreshTokenAndGetUserId(refreshToken);

        userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        return AuthResponse.builder()
                .success(true)
                .message("Token renouvelé")
                .accessToken(tokenService.generateAccessToken(userId))
                .refreshToken(refreshToken)
                .build();
    }

    // ─────────────────────────────────────────────────
    // mutation resendOtp
    // ─────────────────────────────────────────────────
    @Transactional
    public AuthResponse resendOtp(String userId) {

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
}