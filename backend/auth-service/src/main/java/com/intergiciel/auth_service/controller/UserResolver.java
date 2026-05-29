package com.intergiciel.auth_service.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.intergiciel.auth_service.dto.request.AssignRoleInput;
import com.intergiciel.auth_service.dto.request.ChangePasswordInput;
import com.intergiciel.auth_service.dto.request.DeleteAccountInput;
import com.intergiciel.auth_service.dto.request.UpdateProfileInput;
import com.intergiciel.auth_service.dto.response.AuthResponse;
import com.intergiciel.auth_service.dto.response.UserInfo;
import com.intergiciel.auth_service.dto.response.UserPage;
import com.intergiciel.auth_service.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class UserResolver {

    private final UserService userService;

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public UserInfo getCurrentUser() {
        log.info("[UserResolver] query getCurrentUser");
        return userService.getCurrentUser();
    }

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public UserInfo getUserById(@Argument String id) {
        log.info("[UserResolver] query getUserById → {}", id);
        return userService.getUserById(id);
    }

    @QueryMapping
    @PreAuthorize("hasRole('ADMIN')")
    public UserPage getUsers(@Argument int page, @Argument int size) {
        log.info("[UserResolver] query getUsers → page={}, size={}", page, size);
        return userService.getUsers(page, size);
    }

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public UserInfo updateProfile(@Argument @Valid UpdateProfileInput input) throws JsonProcessingException {
        log.info("[UserResolver] mutation updateProfile");
        return userService.updateProfile(input);
    }

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public AuthResponse changePassword(@Argument @Valid ChangePasswordInput input) {
        log.info("[UserResolver] mutation changePassword");
        return userService.changePassword(input);
    }

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public AuthResponse deleteAccount(@Argument @Valid DeleteAccountInput input) {
        log.info("[UserResolver] mutation deleteAccount");
        return userService.deleteAccount(input);
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public UserInfo assignRole(@Argument @Valid AssignRoleInput input) {
        log.info("[UserResolver] mutation assignRole → {}", input.getUserId());
        return userService.assignRole(input);
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public UserInfo removeRole(@Argument String userId) {
        log.info("[UserResolver] mutation removeRole → {}", userId);
        return userService.removeRole(userId);
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public UserInfo blockUser(@Argument String userId) {
        log.info("[UserResolver] mutation blockUser → {}", userId);
        return userService.blockUser(userId);
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public UserInfo unblockUser(@Argument String userId) {
        log.info("[UserResolver] mutation unblockUser → {}", userId);
        return userService.unblockUser(userId);
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public AuthResponse deleteUserByAdmin(@Argument String userId) {
        log.info("[UserResolver] mutation deleteUserByAdmin → {}", userId);
        return userService.deleteUserByAdmin(userId);
    }
}
