package com.intergiciel.auth_service.service;

import com.intergiciel.auth_service.dto.LoginInput;
import com.intergiciel.auth_service.dto.request.GoogleTokenVerifier;
import com.intergiciel.auth_service.dto.request.GoogleTokenVerifier.GoogleUserInfo;
import com.intergiciel.auth_service.entity.User;
import com.intergiciel.auth_service.enums.UserRole;
import com.intergiciel.auth_service.exception.UnauthorizedException;
import com.intergiciel.auth_service.kafka.EventPublisher;
import com.intergiciel.auth_service.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private OtpService otpService;

    @Mock
    private TokenService tokenService;

    @Mock
    private EventPublisher eventPublisher;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private GoogleTokenVerifier googleTokenVerifier;

    @InjectMocks
    private AuthService authService;

    @Test
    void loginRejectsBlockedUserWithClearMessage() {
        User blockedUser = blockedUser();
        when(userRepository.findByEmailAndDeletedAtIsNull(blockedUser.getEmail()))
                .thenReturn(Optional.of(blockedUser));

        assertThatThrownBy(() -> authService.login(new LoginInput(blockedUser.getEmail(), "secret")))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Votre compte est bloqué");

        verifyNoInteractions(passwordEncoder, tokenService);
    }

    @Test
    void googleLoginRejectsBlockedExistingUser() {
        User blockedUser = blockedUser();
        GoogleUserInfo googleUser = new GoogleUserInfo("google-123", blockedUser.getEmail(), blockedUser.getName(), null);
        when(googleTokenVerifier.verify("id-token")).thenReturn(googleUser);
        when(userRepository.findByGoogleIdAndDeletedAtIsNull(googleUser.googleId()))
                .thenReturn(Optional.of(blockedUser));

        assertThatThrownBy(() -> authService.loginWithGoogle("id-token"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Votre compte est bloqué");

        verify(userRepository, never()).save(blockedUser);
        verifyNoInteractions(tokenService);
    }

    @Test
    void refreshTokenRejectsBlockedUser() {
        User blockedUser = blockedUser();
        when(tokenService.validateRefreshTokenAndGetUserId("refresh-token"))
                .thenReturn(blockedUser.getId().toString());
        when(userRepository.findById(blockedUser.getId())).thenReturn(Optional.of(blockedUser));

        assertThatThrownBy(() -> authService.refreshToken("refresh-token"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Votre compte est bloqué");

        verify(tokenService, never()).generateAccessToken(blockedUser);
        verify(tokenService, never()).generateRefreshToken(blockedUser);
    }

    private User blockedUser() {
        return User.builder()
                .id(UUID.randomUUID())
                .name("Blocked User")
                .email("blocked@example.com")
                .password("encoded-password")
                .isVerified(true)
                .enabled(false)
                .role(UserRole.USER)
                .build();
    }
}
