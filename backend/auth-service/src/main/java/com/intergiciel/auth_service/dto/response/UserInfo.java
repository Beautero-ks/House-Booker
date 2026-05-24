package com.intergiciel.auth_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInfo {
    private String id;
    private String name;
    private String username;
    private String email;
    private String phoneNumber;
    private String photoUrl;
    private boolean isVerified;
    private boolean enabled;
    private String provider;
    private String role;
    private String createdAt;
    private String updatedAt;
}
