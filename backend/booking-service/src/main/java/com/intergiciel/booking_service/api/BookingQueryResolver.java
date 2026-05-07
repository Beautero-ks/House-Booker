package com.intergiciel.booking_service.api;

import com.intergiciel.booking_service.application.service.BookingService;
import com.intergiciel.booking_service.domain.model.Booking;
import com.intergiciel.booking_service.domain.model.enums.BookingStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Controller;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class BookingQueryResolver {
    private final BookingService bookingService;

    public Booking booking(UUID id, UUID userId) {
        return bookingService.getBooking(id, userId);
    }

    public List<Booking> myBookings(UUID userId, BookingStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Booking> bookingsPage = bookingService.getUserBookings(userId, status, pageable);
        return bookingsPage.getContent();
    }

    public boolean checkAvailability(UUID houseId, LocalDate startDate, LocalDate endDate) {
        return bookingService.isHouseAvailable(houseId, startDate, endDate);
    }
}
