package com.intergiciel.booking_service.controller;

import com.intergiciel.booking_service.domain.model.Booking;
import com.intergiciel.booking_service.service.BookingService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

import java.time.LocalDate;
import java.util.UUID;

@Controller
public class BookingMutationController {

    private final BookingService bookingService;

    public BookingMutationController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @MutationMapping
    public Booking createBooking(
            @Argument UUID userId,
            @Argument BookingCreateInputDto input) {

        return bookingService.createBooking(
                userId,
                input.getHouseId(),
                input.getStartDate(),
                input.getEndDate()
        );
    }

    // DTO for the GraphQL input type
    public static class BookingCreateInputDto {
        private UUID houseId;
        private LocalDate startDate;
        private LocalDate endDate;

        public UUID getHouseId() {
            return houseId;
        }

        public void setHouseId(UUID houseId) {
            this.houseId = houseId;
        }

        public LocalDate getStartDate() {
            return startDate;
        }

        public void setStartDate(LocalDate startDate) {
            this.startDate = startDate;
        }

        public LocalDate getEndDate() {
            return endDate;
        }

        public void setEndDate(LocalDate endDate) {
            this.endDate = endDate;
        }
    }
}


