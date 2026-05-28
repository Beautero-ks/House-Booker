package com.intergiciel.booking_service.service;

import com.intergiciel.booking_service.domain.events.BookingCreatedEvent;
import com.intergiciel.booking_service.domain.model.Booking;
import com.intergiciel.booking_service.domain.model.enums.BookingStatus;
import com.intergiciel.booking_service.event.BookingEventProducer;
import com.intergiciel.booking_service.domain.repository.BookingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Service
public class BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);

    private final BookingRepository bookingRepository;
    private final BookingEventProducer bookingEventProducer;

    public BookingService(BookingRepository bookingRepository, BookingEventProducer bookingEventProducer) {
        this.bookingRepository = bookingRepository;
        this.bookingEventProducer = bookingEventProducer;
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

        // Calculate total price (placeholder - should be fetched from house-service in production)
        BigDecimal totalPrice = calculateTotalPrice(startDate, endDate);

        // Create the booking entity
        Booking booking = Booking.builder()
                .userId(userId)
                .houseId(houseId)
                .startDate(startDate)
                .endDate(endDate)
                .totalPrice(totalPrice)
                .build();

        // Save the booking (will trigger auditing timestamps)
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
     * Placeholder implementation: €100 per night
     * In production, this should query the house-service for pricing.
     *
     * @param startDate the booking start date
     * @param endDate the booking end date
     * @return the calculated total price
     */
    private BigDecimal calculateTotalPrice(LocalDate startDate, LocalDate endDate) {
        long nights = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate);
        BigDecimal pricePerNight = new BigDecimal("100.00");
        return pricePerNight.multiply(new BigDecimal(nights));
    }

    public Booking cancelBooking(UUID bookingId, UUID effectiveUserId, String reason) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'cancelBooking'");
    }

    public Booking getBooking(UUID id, UUID effectiveUserId) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getBooking'");
    }

    public Page<Booking> getUserBookings(UUID effectiveUserId, BookingStatus status, Pageable pageable) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getUserBookings'");
    }

    public boolean isHouseAvailable(UUID houseId, LocalDate startDate, LocalDate endDate) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'isHouseAvailable'");
    }
}


