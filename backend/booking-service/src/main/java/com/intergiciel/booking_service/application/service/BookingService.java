package com.intergiciel.booking_service.application.service;

import com.intergiciel.booking_service.application.dto.HouseDto;
import com.intergiciel.booking_service.domain.events.BookingCancelledEvent;
import com.intergiciel.booking_service.domain.events.BookingCreatedEvent;
import com.intergiciel.booking_service.kafka.publisher.BookingEventPublisher;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingService {
    private static final Logger log = LoggerFactory.getLogger(BookingService.class);
    private final BookingRepository bookingRepository;
    private final AvailabilityRepository availabilityRepository;
    private final HouseServiceClient houseServiceClient; // Feign Client pour house-service
    private final BookingEventPublisher bookingEventPublisher; // Pour Kafka

    private static final List<BookingStatus> ACTIVE_STATUSES = List.of(
            BookingStatus.PENDING,
            BookingStatus.CONFIRMED,
            BookingStatus.PAID
    );
    private static final List<BookingStatus> CANCELLABLE_STATUSES = List.of(
            BookingStatus.PENDING,
            BookingStatus.CONFIRMED
    );
    private static final BigDecimal SERVICE_FEE = new BigDecimal("1000.00");

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
                .createdAt(OffsetDateTime.now())
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

//    @Transactional(readOnly = true)
//    public Page<Booking> getUserBookings(UUID effectiveUserId, BookingStatus status, Pageable pageable) {
//        if (effectiveUserId == null) {
//            throw new IllegalArgumentException("User ID is required");
//        }
//
//        if (status != null) {
//            return bookingRepository.findByUserIdAndStatus(effectiveUserId, status, pageable);
//        }
//
//        return bookingRepository.findByUserId(effectiveUserId, pageable);
//    }

    @Transactional(readOnly = true)
    public List<Booking> getAllBookings(int page, int size) {
        Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return bookingRepository.findAll(pageable).getContent();
    }

    @Transactional(readOnly = true)
    public List<Booking> getBookingsByHouseIds(List<UUID> houseIds) {
        if (houseIds == null || houseIds.isEmpty()) {
            return List.of();
        }

        return bookingRepository.findByHouseIdIn(houseIds);
    }

    @Transactional(readOnly = true)
    public List<Booking> getOwnerBookings(UUID ownerId) {
        if (ownerId == null) {
            throw new IllegalArgumentException("Owner ID is required");
        }

        List<UUID> houseIds = houseServiceClient.getHousesByOwnerId(ownerId).stream()
                .map(HouseDto::getId)
                .filter(java.util.Objects::nonNull)
                .toList();

        return getBookingsByHouseIds(houseIds);
    }

//    @Transactional(readOnly = true)
//    public boolean isHouseAvailable(UUID houseId, LocalDate startDate, LocalDate endDate) {
//        validateDateRange(houseId, startDate, endDate);
//        return !bookingRepository.existsByHouseIdAndStatusInAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
//                houseId,
//                ACTIVE_STATUSES,
//                endDate,
//                startDate
//        );
//    }

    private void validateBookingRequest(UUID userId, UUID houseId, LocalDate startDate, LocalDate endDate) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID is required");
        }

        validateDateRange(houseId, startDate, endDate);
    }

    private void validateDateRange(UUID houseId, LocalDate startDate, LocalDate endDate) {
        if (houseId == null || startDate == null || endDate == null) {
            throw new IllegalArgumentException("House ID, start date and end date are required");
        }

        if (!endDate.isAfter(startDate)) {
            throw new IllegalArgumentException("End date must be after start date");
        }
    }

    private Booking getOwnerBookingOrThrow(UUID bookingId, UUID ownerId) {
        if (bookingId == null || ownerId == null) {
            throw new IllegalArgumentException("Booking ID and owner ID are required");
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NoSuchElementException("Booking not found"));
        HouseDto house = houseServiceClient.getHouseById(booking.getHouseId());

        if (house.getProprietaireId() == null || !ownerId.equals(house.getProprietaireId())) {
            throw new IllegalArgumentException("This booking does not belong to one of your houses");
        }

        return booking;
    }

    private BigDecimal calculateTotalPrice(UUID houseId, LocalDate startDate, LocalDate endDate) {
        long nights = ChronoUnit.DAYS.between(startDate, endDate);
        HouseDto house = houseServiceClient.getHouseById(houseId);

        if (house.getPrix() == null || house.getPrix() <= 0) {
            throw new IllegalArgumentException("House price is required to create a booking");
        }

        BigDecimal pricePerNight = BigDecimal.valueOf(house.getPrix());
        return pricePerNight.multiply(BigDecimal.valueOf(nights))
                .add(SERVICE_FEE)
                .setScale(2, RoundingMode.HALF_UP);
    }

//    @Transactional
//    public Booking cancelBooking(UUID bookingId, UUID effectiveUserId, String reason) {
//        if (bookingId == null || effectiveUserId == null) {
//            throw new IllegalArgumentException("Booking ID and user ID are required");
//        }
//
//        Booking booking = bookingRepository.findByIdAndUserId(bookingId, effectiveUserId)
//                .orElseThrow(() -> new NoSuchElementException("Booking not found"));
//
//        if (!CANCELLABLE_STATUSES.contains(booking.getStatus())) {
//            throw new IllegalArgumentException("Only unpaid pending or confirmed bookings can be cancelled");
//        }
//
//        booking.setStatus(BookingStatus.CANCELLED);
//        return bookingRepository.save(booking);
//    }

    @Transactional
    public Booking cancelBookingByOwner(UUID bookingId, UUID ownerId, String reason) {
        Booking booking = getOwnerBookingOrThrow(bookingId, ownerId);

        if (!CANCELLABLE_STATUSES.contains(booking.getStatus())) {
            throw new IllegalArgumentException("Only unpaid pending or confirmed bookings can be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }

    @Transactional
    public boolean deleteBookingByOwner(UUID bookingId, UUID ownerId) {
        Booking booking = getOwnerBookingOrThrow(bookingId, ownerId);
        bookingRepository.delete(booking);
        return true;
    }

//    @Transactional(readOnly = true)
//    public Booking getBooking(UUID id, UUID effectiveUserId) {
//        if (id == null || effectiveUserId == null) {
//            throw new IllegalArgumentException("Booking ID and user ID are required");
//        }
//
//        return bookingRepository.findByIdAndUserId(id, effectiveUserId)
//                .orElseThrow(() -> new NoSuchElementException("Booking not found"));
//    }
}
