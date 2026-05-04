package com.intergiciel.auth_service.job;

import com.intergiciel.auth_service.repository.OtpRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class OtpCleanerJob {

    private final OtpRepository otpRepository;

    /**
     * Supprime automatiquement tous les OTPs :
     *   - expirés (expiresAt < maintenant)
     *   - déjà utilisés (used = true)
     *
     * S'exécute toutes les heures (cron = "0 0 * * * *")
     * En production : ajuster la fréquence selon le volume
     */
    @Scheduled(cron = "0 0 * * * *")
    public void cleanExpiredOtps() {
        log.info("[OtpCleanerJob] Début du nettoyage des OTPs expirés...");

        int deletedCount = otpRepository.deleteExpiredAndUsed(LocalDateTime.now());

        log.info("[OtpCleanerJob] Nettoyage terminé. {} OTP(s) supprimé(s).", deletedCount);
    }
}