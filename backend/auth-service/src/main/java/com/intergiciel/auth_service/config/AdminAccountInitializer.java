package com.intergiciel.auth_service.config;

import com.intergiciel.auth_service.entity.User;
import com.intergiciel.auth_service.enums.UserRole;
import com.intergiciel.auth_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminAccountInitializer implements ApplicationRunner {

    private static final String DEFAULT_ADMIN_EMAIL = "housebookeradmin@gmail.com";
    private static final String DEFAULT_ADMIN_PASSWORD = "housebooker1";
    private static final String DEFAULT_ADMIN_NAME = "HouseBooker Admin";
    private static final String ADMIN_ROLE = "ADMIN";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        userRepository.findByEmail(DEFAULT_ADMIN_EMAIL).ifPresentOrElse(existing -> {
            boolean updated = false;

            if (existing.getRole() == null || !UserRole.ADMIN.equals(existing.getRole())) {
                existing.setRole(UserRole.ADMIN);
                updated = true;
            }

            if (!existing.isVerified()) {
                existing.setVerified(true);
                updated = true;
            }

            if (existing.getPassword() == null || existing.getPassword().isBlank()) {
                existing.setPassword(passwordEncoder.encode(DEFAULT_ADMIN_PASSWORD));
                updated = true;
            }

            if (updated) {
                userRepository.save(existing);
                log.info("[AdminAccountInitializer] Compte admin existant mis à jour : {}", DEFAULT_ADMIN_EMAIL);
            } else {
                log.info("[AdminAccountInitializer] Le compte admin existe déjà et est prêt : {}", DEFAULT_ADMIN_EMAIL);
            }
        }, () -> {
            User admin = User.builder()
                    .name(DEFAULT_ADMIN_NAME)
                    .email(DEFAULT_ADMIN_EMAIL)
                    .password(passwordEncoder.encode(DEFAULT_ADMIN_PASSWORD))
                    .isVerified(true)
                    .role(UserRole.ADMIN)
                    .provider("LOCAL")
                    .build();

            userRepository.save(admin);
            log.info("[AdminAccountInitializer] Compte admin créé : {}", DEFAULT_ADMIN_EMAIL);
        });
    }
}
