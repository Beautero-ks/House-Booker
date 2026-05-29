package com.intergiciel.booking_service.api;

import com.intergiciel.booking_service.domain.model.Booking;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.ContextValue;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class BookingMutationResolver {
    private final com.intergiciel.booking_service.service.BookingService bookingService;

    @MutationMapping
    public Booking cancelBooking(@Argument UUID bookingId,
                                 @Argument String reason,
                                 @Argument UUID userId,
                                 @ContextValue(name = "userId", required = false) String contextUserId) {
        UUID effectiveUserId = resolveUserId(userId, contextUserId);
        return bookingService.cancelBooking(bookingId, effectiveUserId, reason);
    }

    @MutationMapping
    public Booking cancelBookingByOwner(@Argument UUID bookingId,
                                        @Argument String reason,
                                        @Argument UUID ownerId,
                                        @ContextValue(name = "userId", required = false) String contextUserId) {
        UUID effectiveOwnerId = resolveUserId(ownerId, contextUserId);
        return bookingService.cancelBookingByOwner(bookingId, effectiveOwnerId, reason);
    }

    @MutationMapping
    public Boolean deleteBookingByOwner(@Argument UUID bookingId,
                                        @Argument UUID ownerId,
                                        @ContextValue(name = "userId", required = false) String contextUserId) {
        UUID effectiveOwnerId = resolveUserId(ownerId, contextUserId);
        return bookingService.deleteBookingByOwner(bookingId, effectiveOwnerId);
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
