package com.intergiciel.auth_service.service;

import com.intergiciel.auth_service.dto.response.UserInfo;
import com.intergiciel.auth_service.entity.User;

public final class UserMapper {

    private UserMapper() {
    }

    public static UserInfo toUserInfo(User user) {
        if (user == null) {
            return null;
        }

        return UserInfo.builder()
                .id(user.getId() == null ? null : user.getId().toString())
                .name(user.getName())
                .username(user.getUsername())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .photoUrl(user.getPhotoUrl())
                .isVerified(user.isVerified())
                .enabled(user.isEnabled())
                .provider(user.getProvider())
                .role(user.getRole() == null ? null : user.getRole().name())
                .createdAt(user.getCreatedAt() == null ? null : user.getCreatedAt().toString())
                .updatedAt(user.getUpdatedAt() == null ? null : user.getUpdatedAt().toString())
                .build();
    }
}
