package com.intergiciel.auth_service.repository;

import com.intergiciel.auth_service.entity.OtpCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OtpRepository extends JpaRepository<OtpCode, UUID> {
    Optional<OtpCode> findByUserIdAndCode(UUID userId, String code);
    void deleteByUserId(UUID userId);
    void deleteByExpiresAtBefore(LocalDateTime now);

    @Modifying
    @Query("UPDATE OtpCode o SET o.used = true WHERE o.user.id = :userId AND o.used = false")
    void invalidateAllByUserId(@Param("userId") UUID userId);

    @Query("SELECT o FROM OtpCode o WHERE o.user.id = :userId AND o.code = :code AND o.used = false AND o.expiresAt > CURRENT_TIMESTAMP")
    Optional<OtpCode> findValidOtp(@Param("userId") UUID userId, @Param("code") String code);

    @Modifying
    @Query("DELETE FROM OtpCode o WHERE o.expiresAt < :now OR o.used = true")
    int deleteExpiredAndUsed(@Param("now") LocalDateTime now);
    
}
