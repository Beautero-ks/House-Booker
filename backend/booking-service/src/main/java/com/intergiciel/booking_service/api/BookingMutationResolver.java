package com.intergiciel.booking_service.api;

import com.intergiciel.booking_service.application.dto.request.BookingCreateRequest;
import com.intergiciel.booking_service.application.service.BookingService;
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
    private final BookingService bookingService;

    @MutationMapping
    public Booking createBooking(@Argument BookingCreateRequest input,
                                 @Argument UUID userId,
                                 @ContextValue(name = "userId", required = false) String contextUserId) {
        UUID effectiveUserId = resolveUserId(userId, contextUserId);

        return bookingService.createBooking(
                effectiveUserId,
                input.getHouseId(),
                input.getStartDate(),
                input.getEndDate()
        );
    }

    @MutationMapping
    public Booking cancelBooking(@Argument UUID bookingId,
                                 @Argument String reason,
                                 @Argument UUID userId,
                                 @ContextValue(name = "userId", required = false) String contextUserId) {
        UUID effectiveUserId = resolveUserId(userId, contextUserId);
        return bookingService.cancelBooking(bookingId, effectiveUserId, reason);
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
