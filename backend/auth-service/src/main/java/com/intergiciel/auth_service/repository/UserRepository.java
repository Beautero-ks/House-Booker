package com.intergiciel.auth_service.repository;

import com.intergiciel.auth_service.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmailAndDeletedAtIsNull(String email);
    Optional<User> findByEmailAndDeletedAtIsNullAndEnabledTrue(String email);
    Optional<User> findByIdAndDeletedAtIsNull(UUID id);
    boolean existsByEmailAndDeletedAtIsNull(String email);
    boolean existsByUsernameAndDeletedAtIsNull(String username);
    Page<User> findAllByDeletedAtIsNull(Pageable pageable);
}
