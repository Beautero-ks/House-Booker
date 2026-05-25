package com.intergiciel.booking_service.application.service;

import com.intergiciel.booking_service.application.dto.HouseDto;
import com.intergiciel.booking_service.domain.events.BookingCancelledEvent;
import com.intergiciel.booking_service.domain.events.BookingCreatedEvent;
import com.intergiciel.booking_service.domain.events.publisher.BookingEventPublisher;
import com.intergiciel.booking_service.domain.model.Availability;
import com.intergiciel.booking_service.domain.model.Booking;
import com.intergiciel.booking_service.domain.model.enums.BookingStatus;
import com.intergiciel.booking_service.domain.repository.AvailabilityRepository;
import com.intergiciel.booking_service.domain.repository.BookingRepository;
import com.intergiciel.booking_service.feign.HouseServiceClient;
import com.intergiciel.booking_service.shared.exception.BookingNotFoundException;
import com.intergiciel.booking_service.shared.exception.HouseNotAvailableException;
import com.intergiciel.booking_service.shared.exception.HouseNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingService {
    private final BookingRepository bookingRepository;
    private final AvailabilityRepository availabilityRepository;
    private final HouseServiceClient houseServiceClient; // Feign Client pour house-service
    private final BookingEventPublisher bookingEventPublisher; // Pour Kafka

    // Créer une réservation
    @Transactional
    public Booking createBooking(UUID userId, UUID houseId, LocalDate startDate, LocalDate endDate) {
        // 1. Vérifier que le logement existe
        HouseDto house = houseServiceClient.getHouseById(houseId);
        if (house == null) {
            throw new HouseNotFoundException("Logement introuvable avec l'ID: " + houseId);
        }

        if (!endDate.isAfter(startDate)) {
            throw new IllegalArgumentException(
                    "La date de fin doit être après la date de début"
            );
        }

        // 2. Vérifier la disponibilité
        if (!isHouseAvailable(houseId, startDate, endDate)) {
            throw new HouseNotAvailableException("Logement non disponible pour les dates demandées");
        }

        // 3. Calculer le prix total (ex: prix par nuit * nombre de nuits)
        long nights = ChronoUnit.DAYS.between(startDate, endDate);
        BigDecimal totalPrice = BigDecimal.valueOf(house.getPrix()).multiply(BigDecimal.valueOf(nights));

        // 4. Créer la réservation
        Booking booking = Booking.builder()
                .userId(userId)
                .houseId(houseId)
                .startDate(startDate)
                .endDate(endDate)
                .status(BookingStatus.PENDING)
                .totalPrice(totalPrice)
                .build();

        booking = bookingRepository.save(booking);

        // 5. Mettre à jour la disponibilité (optionnel, si vous utilisez la table availability)
        updateAvailability(houseId, startDate, endDate, false);

        // 6. Publier l'événement Kafka
        BookingCreatedEvent event = BookingCreatedEvent.builder()
                .bookingId(booking.getId())
                .userId(userId)
                .houseId(houseId)
                .startDate(startDate)
                .endDate(endDate)
                .totalPrice(totalPrice)
                .build();
        bookingEventPublisher.publishBookingCreated(event);

        return booking;
    }

    // Annuler une réservation
    @Transactional
    public Booking cancelBooking(UUID bookingId, UUID userId, String reason) {
        Booking booking = bookingRepository.findByIdAndUserId(bookingId, userId)
                .orElseThrow(() -> new BookingNotFoundException("Réservation introuvable"));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalStateException("La réservation est déjà annulée");
        }

        // Mettre à jour le statut
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setUpdatedAt(OffsetDateTime.now());
        booking = bookingRepository.save(booking);

        // Mettre à jour la disponibilité (optionnel)
        updateAvailability(booking.getHouseId(), booking.getStartDate(), booking.getEndDate(), true);

        // Publier l'événement Kafka
        BookingCancelledEvent event = BookingCancelledEvent.builder()
                .bookingId(booking.getId())
                .userId(userId)
                .houseId(booking.getHouseId())
                .reason(reason)
                .build();
        bookingEventPublisher.publishBookingCancelled(event);

        return booking;
    }

    // Récupérer une réservation par ID
    public Booking getBooking(UUID id, UUID userId) {
        return bookingRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new BookingNotFoundException("Réservation introuvable"));
    }

    // Récupérer les réservations d'un utilisateur (avec pagination et filtre par statut)
    public Page<Booking> getUserBookings(UUID userId, BookingStatus status, Pageable pageable) {
        if (status == null) {
            return bookingRepository.findByUserId(userId, pageable);
        } else {
            return bookingRepository.findByUserIdAndStatus(userId, status, pageable);
        }
    }

    // Vérifier la disponibilité d'un logement
    public boolean isHouseAvailable(UUID houseId, LocalDate startDate, LocalDate endDate) {
        // Vérifier les réservations existantes
        boolean hasOverlappingBooking = bookingRepository.existsOverlappingBooking(houseId, startDate, endDate);
        if (hasOverlappingBooking) {
            return false;
        }

        // Vérifier la table availability (optionnel)
        if (availabilityRepository != null) {
            List<Availability> availabilities = availabilityRepository
                    .findByHouseIdAndDateBetween(houseId, startDate, endDate);

            if (availabilities.isEmpty()) {
                return true;
            }

            return availabilities.stream().allMatch(Availability::isAvailable);
        }

        return true;
    }

    // Mettre à jour la disponibilité (optionnel)
    private void updateAvailability(UUID houseId, LocalDate startDate, LocalDate endDate, boolean isAvailable) {
        if (availabilityRepository == null) return;

        LocalDate date = startDate;
        while (!date.isAfter(endDate)) {
            Availability availability = availabilityRepository.findByHouseIdAndDate(houseId, date)
                    .orElse(new Availability(houseId, date, true));
            availability.setAvailable(isAvailable);
            availabilityRepository.save(availability);
            date = date.plusDays(1);
        }
    }
}
