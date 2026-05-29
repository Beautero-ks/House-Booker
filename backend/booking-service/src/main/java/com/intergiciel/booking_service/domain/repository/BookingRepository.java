package com.intergiciel.booking_service.domain.repository;

import com.intergiciel.booking_service.domain.model.Booking;
import com.intergiciel.booking_service.domain.model.enums.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
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

    // Trouver les réservations pour un logement spécifique
    List<Booking> findByHouseId(UUID houseId);

    // Trouver les réservations pour plusieurs logements.
    List<Booking> findByHouseIdIn(Collection<UUID> houseIds);
}
