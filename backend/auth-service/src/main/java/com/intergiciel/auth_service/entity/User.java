package com.intergiciel.auth_service.entity;

import com.intergiciel.auth_service.enums.UserRole;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = true)
    private String password;

    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @ColumnDefault("'USER'")
    @Builder.Default
    private UserRole role = UserRole.USER;

    /** Identifiant unique Google (sub). Null pour les comptes LOCAL. */
    @Column(unique = true)
    private String googleId;

    /**
     * Fournisseur d'identité : "LOCAL" (email+password) ou "GOOGLE" (OAuth2).
     * Par défaut : LOCAL pour les comptes créés via le formulaire d'inscription.
     */
    @Column(nullable = false)
    @Builder.Default
    private String provider = "LOCAL";

    @Column(nullable = false)
    @Builder.Default
    private boolean isVerified = false;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
