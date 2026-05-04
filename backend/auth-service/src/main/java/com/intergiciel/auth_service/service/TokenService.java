package com.intergiciel.auth_service.service;

import com.intergiciel.auth_service.entity.RefreshToken;
import com.intergiciel.auth_service.entity.User;
import com.intergiciel.auth_service.repository.RefreshTokenRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.HexFormat;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.access-token-expiration}")
    private long accessTokenExpiration;

    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExpiration;

    // ===== ACCESS TOKEN (15 min) =====
    public String generateAccessToken(String userId) {
        return Jwts.builder()
                .setSubject(userId)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + accessTokenExpiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // ===== REFRESH TOKEN (FIXED) =====
    public String generateRefreshToken(User user) {

        String token = Jwts.builder()
                .setSubject(user.getId().toString())
                .setId(UUID.randomUUID().toString())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshTokenExpiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();

        // ✅ FIX : update si existe déjà, sinon insert
        RefreshToken refreshToken =refreshTokenRepository.findByUser_Id(user.getId())
                .map(existing -> {
                    existing.setToken(token);
                    existing.setExpiresAt(LocalDateTime.now()
                            .plusSeconds(refreshTokenExpiration / 1000));
                    return existing;
                })
                .orElseGet(() -> RefreshToken.builder()
                        .token(token)
                        .user(user)
                        .expiresAt(LocalDateTime.now()
                                .plusSeconds(refreshTokenExpiration / 1000))
                        .build()
                );

        refreshTokenRepository.save(refreshToken);

        log.info("[TokenService] Refresh token généré/mis à jour pour l'utilisateur {}", user.getId());

        return token;
    }

    // ===== VALIDATION DU REFRESH TOKEN =====
    public String validateRefreshTokenAndGetUserId(String token) {

        Claims claims = parseClaims(token);

        RefreshToken stored = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Refresh token invalide ou révoqué"));

        if (stored.getExpiresAt().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(stored);
            throw new RuntimeException("Refresh token expiré");
        }

        return claims.getSubject();
    }

    public String extractUserId(String token) {
        return parseClaims(token).getSubject();
    }

    public boolean validateAccessToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("[TokenService] Token invalide : {}", e.getMessage());
            return false;
        }
    }

    private Key getSigningKey() {
        byte[] keyBytes = HexFormat.of().parseHex(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}