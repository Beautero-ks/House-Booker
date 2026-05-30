package com.intergiciel.booking_service.domain.repository;

import com.intergiciel.booking_service.domain.model.Booking;
import com.intergiciel.booking_service.domain.model.enums.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {
    // Trouver une réservation par ID et userId (pour la sécurité)
    Optional<Booking> findByIdAndUserId(UUID id, UUID userId);

    // Trouver toutes les réservations d'un utilisateur (avec pagination)
    Page<Booking> findByUserId(UUID userId, Pageable pageable);

    // Trouver toutes les réservations d'un utilisateur avec un statut spécifique
    Page<Booking> findByUserIdAndStatus(UUID userId, BookingStatus status, Pageable pageable);

    // Vérifier si un logement est déjà réservé sur une période donnée.
    boolean existsByHouseIdAndStatusInAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            UUID houseId,
            Collection<BookingStatus> statuses,
            LocalDate endDate,
            LocalDate startDate
    );

    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.houseId = :houseId " +
            "AND b.status NOT IN ('CANCELLED', 'REFUNDED') " +
            "AND b.startDate < :newEndDate AND b.endDate > :newStartDate")
    boolean existsOverlappingBooking(
            @Param("houseId") UUID houseId,
            @Param("newStartDate") LocalDate newStartDate,
            @Param("newEndDate") LocalDate newEndDate
    );

    // Trouver les réservations pour un logement spécifique
    List<Booking> findByHouseId(UUID houseId);

    // Trouver les réservations pour plusieurs logements.
    List<Booking> findByHouseIdIn(Collection<UUID> houseIds);

//    boolean existsOverlappingBooking(UUID houseId, LocalDate startDate, LocalDate endDate);
}
