package com.intergiciel.auth_service.service;

import com.intergiciel.auth_service.entity.OtpCode;
import com.intergiciel.auth_service.entity.User;
import com.intergiciel.auth_service.repository.OtpRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.scheduling.annotation.Scheduled;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final OtpRepository otpRepository;

    @Value("${otp.expiration-minutes}")
    private int expirationMinutes;

    // SecureRandom pour une génération cryptographiquement sûre
    private static final SecureRandom secureRandom = new SecureRandom();

    /**
     * Génère un OTP à 6 chiffres, invalide les anciens et le sauvegarde en BD.
     * @return le code OTP généré (envoyé ensuite dans l'event Kafka)
     */
    @Transactional
    public String generateAndSave(User user) {
        // Invalider tous les OTPs précédents de cet utilisateur
        otpRepository.invalidateAllByUserId(user.getId());

        // Générer un code à 6 chiffres (format "000000" à "999999")
        String code = String.format("%06d", secureRandom.nextInt(1_000_000));

        OtpCode otp = OtpCode.builder()
                .code(code)
                .user(user)
                .expiresAt(LocalDateTime.now().plusMinutes(expirationMinutes))
                .used(false)
                .build();

        otpRepository.save(otp);
        log.info("[OtpService] OTP généré pour l'utilisateur {}", user.getId());

        return code;
    }

    /**
     * Vérifie un OTP soumis par l'utilisateur.
     * Lance une exception si invalide ou expiré.
     */
    @Transactional
    public void verify(UUID userId, String code) {
        OtpCode otp = otpRepository.findValidOtp(userId, code)
                .orElseThrow(() -> new RuntimeException("Code OTP invalide"));

        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            otp.setUsed(true);
            otpRepository.save(otp);
            throw new RuntimeException("Code OTP expiré. Demandez-en un nouveau.");
        }

        // Marquer comme utilisé
        otp.setUsed(true);
        otpRepository.save(otp);
        log.info("[OtpService] OTP vérifié avec succès pour l'utilisateur {}", userId);
    }

    public int getExpirationMinutes() {
        return expirationMinutes;
    }


    // Supprime les OTP deja utiliser dans la base de donnees 
    @Scheduled(fixedRate = 600000) // 10 min
    @Transactional
    public void cleanExpiredOtps() {
        otpRepository.deleteExpiredAndUsed(LocalDateTime.now());
    }
}