package com.intergiciel.booking_service.service;

import com.intergiciel.booking_service.domain.events.BookingCreatedEvent;
import com.intergiciel.booking_service.application.dto.HouseDto;
import com.intergiciel.booking_service.domain.model.Booking;
import com.intergiciel.booking_service.domain.model.enums.BookingStatus;
import com.intergiciel.booking_service.event.BookingEventProducer;
import com.intergiciel.booking_service.feign.HouseServiceClient;
import com.intergiciel.booking_service.domain.repository.BookingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);
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

    private final BookingRepository bookingRepository;
    private final BookingEventProducer bookingEventProducer;
    private final HouseServiceClient houseServiceClient;

    public BookingService(BookingRepository bookingRepository,
                          BookingEventProducer bookingEventProducer,
                          HouseServiceClient houseServiceClient) {
        this.bookingRepository = bookingRepository;
        this.bookingEventProducer = bookingEventProducer;
        this.houseServiceClient = houseServiceClient;
    }

    /**
     * Create a booking and emit a BookingCreated event.
     *
     * @param userId the user ID
     * @param houseId the house ID
     * @param startDate the booking start date
     * @param endDate the booking end date
     * @return the created Booking entity
     */
    @Transactional
    public Booking createBooking(UUID userId, UUID houseId, LocalDate startDate, LocalDate endDate) {
        log.info("Creating booking for user {} for house {} from {} to {}", userId, houseId, startDate, endDate);
        validateBookingRequest(userId, houseId, startDate, endDate);

        if (!isHouseAvailable(houseId, startDate, endDate)) {
            throw new IllegalArgumentException("House is not available for the selected dates");
        }

        BigDecimal totalPrice = calculateTotalPrice(houseId, startDate, endDate);

        Booking booking = Booking.builder()
                .userId(userId)
                .houseId(houseId)
                .startDate(startDate)
                .endDate(endDate)
                .status(BookingStatus.PENDING)
                .totalPrice(totalPrice)
                .build();

        Booking savedBooking = bookingRepository.save(booking);
        log.info("Booking created with ID: {}", savedBooking.getId());

        // Emit the booking created event to Kafka for notification service to pick up
        try {
            BookingCreatedEvent event = BookingCreatedEvent.builder()
                    .bookingId(savedBooking.getId())
                    .userId(savedBooking.getUserId())
                    .houseId(savedBooking.getHouseId())
                    .startDate(savedBooking.getStartDate())
                    .endDate(savedBooking.getEndDate())
                    .totalPrice(savedBooking.getTotalPrice())
                    .build();

            bookingEventProducer.sendBookingCreated(event);
            log.info("BookingCreated event published for booking {}", savedBooking.getId());
        } catch (Exception e) {
            // Log but don't fail the transaction - booking is already persisted
            log.error("Failed to publish BookingCreated event for booking {}: {}", savedBooking.getId(), e.getMessage(), e);
        }

        return savedBooking;
    }

    /**
     * Calculate the total price for a booking based on duration.
     *
     * Uses the current house price and the same fixed service fee shown at checkout.
     * The persisted value is what user/admin pages receive through GraphQL.
     *
     * @param houseId the house ID
     * @param startDate the booking start date
     * @param endDate the booking end date
     * @return the calculated total price
     */
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

    @Transactional
    public Booking cancelBooking(UUID bookingId, UUID effectiveUserId, String reason) {
        if (bookingId == null || effectiveUserId == null) {
            throw new IllegalArgumentException("Booking ID and user ID are required");
        }

        Booking booking = bookingRepository.findByIdAndUserId(bookingId, effectiveUserId)
                .orElseThrow(() -> new NoSuchElementException("Booking not found"));

        if (!CANCELLABLE_STATUSES.contains(booking.getStatus())) {
            throw new IllegalArgumentException("Only unpaid pending or confirmed bookings can be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }

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

    @Transactional(readOnly = true)
    public Booking getBooking(UUID id, UUID effectiveUserId) {
        if (id == null || effectiveUserId == null) {
            throw new IllegalArgumentException("Booking ID and user ID are required");
        }

        return bookingRepository.findByIdAndUserId(id, effectiveUserId)
                .orElseThrow(() -> new NoSuchElementException("Booking not found"));
    }

    @Transactional(readOnly = true)
    public Page<Booking> getUserBookings(UUID effectiveUserId, BookingStatus status, Pageable pageable) {
        if (effectiveUserId == null) {
            throw new IllegalArgumentException("User ID is required");
        }

        if (status != null) {
            return bookingRepository.findByUserIdAndStatus(effectiveUserId, status, pageable);
        }

        return bookingRepository.findByUserId(effectiveUserId, pageable);
    }

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

    @Transactional(readOnly = true)
    public boolean isHouseAvailable(UUID houseId, LocalDate startDate, LocalDate endDate) {
        validateDateRange(houseId, startDate, endDate);
        return !bookingRepository.existsByHouseIdAndStatusInAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                houseId,
                ACTIVE_STATUSES,
                endDate,
                startDate
        );
    }

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
}
