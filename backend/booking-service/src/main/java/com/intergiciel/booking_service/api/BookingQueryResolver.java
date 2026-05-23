package com.intergiciel.booking_service.api;

import com.intergiciel.booking_service.application.service.BookingService;
import com.intergiciel.booking_service.domain.model.Booking;
import com.intergiciel.booking_service.domain.model.enums.BookingStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.ContextValue;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Controller;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class BookingQueryResolver {
    private final BookingService bookingService;

    @QueryMapping
    public Booking booking(@Argument UUID id, @Argument UUID userId,
                           @ContextValue(name = "userId", required = false) String contextUserId) {
        UUID effectiveUserId = resolveUserId(userId, contextUserId);
        return bookingService.getBooking(id, effectiveUserId);
    }

    @QueryMapping
    public List<Booking> myBookings(@Argument UUID userId,
                                    @ContextValue(name = "userId", required = false) String contextUserId,
                                    @Argument BookingStatus status,
                                    @Argument int page,
                                    @Argument int size) {
        UUID effectiveUserId = resolveUserId(userId, contextUserId);
        Pageable pageable = PageRequest.of(page, size);
        Page<Booking> bookingsPage = bookingService.getUserBookings(effectiveUserId, status, pageable);
        return bookingsPage.getContent();
    }

    @QueryMapping
    public boolean checkAvailability(@Argument UUID houseId,
                                     @Argument LocalDate startDate,
                                     @Argument LocalDate endDate) {
        return bookingService.isHouseAvailable(houseId, startDate, endDate);
    }

    private UUID resolveUserId(UUID userIdFromArguments, String userIdFromContext) {
        if (userIdFromArguments != null) {
            return userIdFromArguments;
        }

        if (userIdFromContext == null || userIdFromContext.isBlank()) {
            throw new IllegalArgumentException("User ID is required");
        }

        return UUID.fromString(userIdFromContext);
    }
}
