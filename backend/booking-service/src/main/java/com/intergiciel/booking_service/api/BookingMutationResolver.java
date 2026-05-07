package com.intergiciel.booking_service.api;

import com.intergiciel.booking_service.application.dto.request.BookingCreateRequest;
import com.intergiciel.booking_service.application.service.BookingService;
import com.intergiciel.booking_service.domain.model.Booking;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class BookingMutationResolver {
    private final BookingService bookingService;

    public Booking createBooking(BookingCreateRequest input, UUID userId) {
        return bookingService.createBooking(
                userId,
                input.getHouseId(),
                input.getStartDate(),
                input.getEndDate()
        );
    }

    public Booking cancelBooking(UUID bookingId, String reason, UUID userId) {
        return bookingService.cancelBooking(bookingId, userId, reason);
    }
}
