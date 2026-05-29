package com.intergiciel.auth_service.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.intergiciel.auth_service.dto.request.AssignRoleInput;
import com.intergiciel.auth_service.dto.request.ChangePasswordInput;
import com.intergiciel.auth_service.dto.request.DeleteAccountInput;
import com.intergiciel.auth_service.dto.request.UpdateProfileInput;
import com.intergiciel.auth_service.dto.response.AuthResponse;
import com.intergiciel.auth_service.dto.response.UserInfo;
import com.intergiciel.auth_service.dto.response.UserPage;
import com.intergiciel.auth_service.entity.User;
import com.intergiciel.auth_service.enums.UserRole;
import com.intergiciel.auth_service.config.SecurityUtils;
import com.intergiciel.auth_service.exception.BadRequestException;
import com.intergiciel.auth_service.exception.ConflictException;
import com.intergiciel.auth_service.exception.ResourceNotFoundException;
import com.intergiciel.auth_service.exception.UnauthorizedException;
import com.intergiciel.auth_service.kafka.EventPublisher;
import com.intergiciel.auth_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;
    private final OtpService otpService;
    private final EventPublisher eventPublisher;

    public UserInfo getCurrentUser() {
        User user = getAuthenticatedUser();
        return UserMapper.toUserInfo(user);
    }

    public UserInfo getUserById(String id) {
        User currentUser = getAuthenticatedUser();
        User target = findActiveUserById(id);

        if (!isAdmin(currentUser) && !currentUser.getId().equals(target.getId())) {
            throw new UnauthorizedException("Accès refusé");
        }
        return UserMapper.toUserInfo(target);
    }

    public UserPage getUsers(int page, int size) {
        Page<User> result = userRepository.findAllByDeletedAtIsNull(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));

        return UserPage.builder()
                .items(result.stream().map(UserMapper::toUserInfo).toList())
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .build();
    }

    @Transactional
    public UserInfo updateProfile(UpdateProfileInput input) throws JsonProcessingException {
        User user = getAuthenticatedUser();

        if (input.getUsername() != null && !input.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsernameAndDeletedAtIsNull(input.getUsername())) {
                throw new ConflictException("Ce nom d'utilisateur est déjà utilisé");
            }
            user.setUsername(input.getUsername());
        }

        if (input.getEmail() != null && !input.getEmail().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmailAndDeletedAtIsNull(input.getEmail())) {
                throw new ConflictException("Un compte avec cet email existe déjà");
            }
            user.setEmail(input.getEmail());
            user.setVerified(false);
            String otpCode = otpService.generateAndSave(user);
            eventPublisher.publishUserCreated(user, otpCode, otpService.getExpirationMinutes());
        }

        if (input.getName() != null) {
            user.setName(input.getName());
        }

        if (input.getPhoneNumber() != null) {
            user.setPhoneNumber(input.getPhoneNumber());
        }

        if (input.getPhotoUrl() != null) {
            user.setPhotoUrl(input.getPhotoUrl());
        }

        userRepository.save(user);
        log.info("[UserService] Profil mis à jour pour {}", user.getEmail());
        return UserMapper.toUserInfo(user);
    }

    @Transactional
    public AuthResponse changePassword(ChangePasswordInput input) {
        User user = getAuthenticatedUser();

        if (user.getPassword() == null || !passwordEncoder.matches(input.getCurrentPassword(), user.getPassword())) {
            throw new UnauthorizedException("Mot de passe actuel incorrect");
        }

        if (input.getCurrentPassword().equals(input.getNewPassword())) {
            throw new BadRequestException("Le nouveau mot de passe doit être différent de l'ancien");
        }

        user.setPassword(passwordEncoder.encode(input.getNewPassword()));
        userRepository.save(user);
        tokenService.revokeRefreshTokensByUserId(user.getId());

        log.info("[UserService] Mot de passe changé pour {}", user.getEmail());
        return AuthResponse.builder()
                .success(true)
                .message("Mot de passe mis à jour. Vous devez vous reconnecter.")
                .build();
    }

    @Transactional
    public AuthResponse deleteAccount(DeleteAccountInput input) {
        User user = getAuthenticatedUser();

        boolean verifiedDeletion = false;

        if (input.getCurrentPassword() != null && user.getPassword() != null) {
            verifiedDeletion = passwordEncoder.matches(input.getCurrentPassword(), user.getPassword());
            if (!verifiedDeletion) {
                throw new UnauthorizedException("Mot de passe incorrect");
            }
        }

        if (!verifiedDeletion && input.getOtpCode() != null) {
            otpService.verify(user.getId(), input.getOtpCode());
            verifiedDeletion = true;
        }

        if (!verifiedDeletion) {
            throw new BadRequestException("Une confirmation est requise pour supprimer le compte");
        }

        tokenService.revokeRefreshTokensByUserId(user.getId());
        otpService.invalidateAllByUserId(user.getId());
        user.setEnabled(false);
        user.setDeletedAt(LocalDateTime.now());
        userRepository.save(user);

        log.info("[UserService] Compte supprimé pour {}", user.getEmail());
        return AuthResponse.builder()
                .success(true)
                .message("Compte supprimé avec succès")
                .build();
    }

    @Transactional
    public UserInfo assignRole(AssignRoleInput input) {
        User currentUser = getAuthenticatedUser();
        if (!isAdmin(currentUser)) {
            throw new UnauthorizedException("Accès administrateur requis");
        }

        User target = findActiveUserById(input.getUserId());
        UserRole role;
        try {
            role = UserRole.valueOf(input.getRole().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Rôle invalide : " + input.getRole());
        }
        if (role != UserRole.USER && role != UserRole.PROPRIETAIRE) {
            throw new BadRequestException("Seuls les rôles USER et PROPRIETAIRE peuvent être attribués");
        }

        ensureAdminDoesNotActOnSelf(currentUser, target);
        target.setRole(role);
        userRepository.save(target);

        log.info("[UserService] Rôle assigné à {} : {}", target.getEmail(), role);
        return UserMapper.toUserInfo(target);
    }

    @Transactional
    public UserInfo removeRole(String userId) {
        User currentUser = getAuthenticatedUser();
        if (!isAdmin(currentUser)) {
            throw new UnauthorizedException("Accès administrateur requis");
        }

        User target = findActiveUserById(userId);
        target.setRole(UserRole.USER);
        userRepository.save(target);

        log.info("[UserService] Rôle réinitialisé pour {} en USER", target.getEmail());
        return UserMapper.toUserInfo(target);
    }

    @Transactional
    public UserInfo blockUser(String userId) {
        User currentUser = getAuthenticatedUser();
        if (!isAdmin(currentUser)) {
            throw new UnauthorizedException("Accès administrateur requis");
        }

        User target = findActiveUserById(userId);
        ensureAdminDoesNotActOnSelf(currentUser, target);
        target.setEnabled(false);
        tokenService.revokeRefreshTokensByUserId(target.getId());
        userRepository.save(target);

        log.info("[UserService] Compte bloqué par admin : {}", target.getEmail());
        return UserMapper.toUserInfo(target);
    }

    @Transactional
    public UserInfo unblockUser(String userId) {
        User currentUser = getAuthenticatedUser();
        if (!isAdmin(currentUser)) {
            throw new UnauthorizedException("Accès administrateur requis");
        }

        User target = findActiveUserById(userId);
        target.setEnabled(true);
        userRepository.save(target);

        log.info("[UserService] Compte débloqué par admin : {}", target.getEmail());
        return UserMapper.toUserInfo(target);
    }

    @Transactional
    public AuthResponse deleteUserByAdmin(String userId) {
        User currentUser = getAuthenticatedUser();
        if (!isAdmin(currentUser)) {
            throw new UnauthorizedException("Accès administrateur requis");
        }

        User target = findActiveUserById(userId);
        ensureAdminDoesNotActOnSelf(currentUser, target);
        tokenService.revokeRefreshTokensByUserId(target.getId());
        otpService.invalidateAllByUserId(target.getId());
        target.setEnabled(false);
        target.setDeletedAt(LocalDateTime.now());
        userRepository.save(target);

        log.info("[UserService] Compte supprimé par admin : {}", target.getEmail());
        return AuthResponse.builder()
                .success(true)
                .message("Utilisateur supprimé avec succès")
                .build();
    }

    private User getAuthenticatedUser() {
        return SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new UnauthorizedException("Authentification requise"));
    }

    private User findActiveUserById(String id) {
        try {
            return userRepository.findByIdAndDeletedAtIsNull(UUID.fromString(id))
                    .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Identifiant utilisateur invalide");
        }
    }

    private boolean isAdmin(User user) {
        return user.getRole() == UserRole.ADMIN;
    }

    private void ensureAdminDoesNotActOnSelf(User currentUser, User target) {
        if (currentUser.getId().equals(target.getId())) {
            throw new BadRequestException("Un administrateur ne peut pas effectuer cette action sur son propre compte");
        }
    }
}
