package com.intergiciel.booking_service.service;

import com.intergiciel.booking_service.application.dto.HouseDto;
import com.intergiciel.booking_service.domain.model.Booking;
import com.intergiciel.booking_service.domain.model.enums.BookingStatus;
import com.intergiciel.booking_service.domain.repository.BookingRepository;
import com.intergiciel.booking_service.event.BookingEventProducer;
import com.intergiciel.booking_service.feign.HouseServiceClient;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private BookingEventProducer bookingEventProducer;

    @Mock
    private HouseServiceClient houseServiceClient;

    @InjectMocks
    private BookingService bookingService;

    @Test
    void createBookingPersistsHousePriceForAllNightsPlusServiceFee() {
        UUID userId = UUID.randomUUID();
        UUID houseId = UUID.randomUUID();
        LocalDate startDate = LocalDate.of(2026, 6, 10);
        LocalDate endDate = LocalDate.of(2026, 6, 12);

        HouseDto house = HouseDto.builder()
                .prix(15000.0)
                .build();

        when(bookingRepository.existsByHouseIdAndStatusInAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                eq(houseId),
                any(),
                eq(endDate),
                eq(startDate)
        )).thenReturn(false);
        when(houseServiceClient.getHouseById(houseId)).thenReturn(house);
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Booking created = bookingService.createBooking(userId, houseId, startDate, endDate);

        assertThat(created.getTotalPrice()).isEqualByComparingTo(new BigDecimal("31000.00"));
        assertThat(created.getStatus()).isEqualTo(BookingStatus.PENDING);

        ArgumentCaptor<Booking> bookingCaptor = ArgumentCaptor.forClass(Booking.class);
        verify(bookingRepository).save(bookingCaptor.capture());
        assertThat(bookingCaptor.getValue().getTotalPrice()).isEqualByComparingTo(new BigDecimal("31000.00"));
        verify(bookingEventProducer).sendBookingCreated(any());
    }

    @Test
    void cancelBookingCancelsPendingBooking() {
        UUID bookingId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Booking booking = Booking.builder()
                .id(bookingId)
                .userId(userId)
                .houseId(UUID.randomUUID())
                .startDate(LocalDate.of(2026, 6, 10))
                .endDate(LocalDate.of(2026, 6, 12))
                .status(BookingStatus.PENDING)
                .totalPrice(new BigDecimal("31000.00"))
                .build();

        when(bookingRepository.findByIdAndUserId(bookingId, userId)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Booking cancelled = bookingService.cancelBooking(bookingId, userId, "Annulation utilisateur");

        assertThat(cancelled.getStatus()).isEqualTo(BookingStatus.CANCELLED);
        verify(bookingRepository).save(booking);
    }

    @Test
    void cancelBookingRejectsPaidBooking() {
        UUID bookingId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Booking booking = Booking.builder()
                .id(bookingId)
                .userId(userId)
                .houseId(UUID.randomUUID())
                .startDate(LocalDate.of(2026, 6, 10))
                .endDate(LocalDate.of(2026, 6, 12))
                .status(BookingStatus.PAID)
                .totalPrice(new BigDecimal("31000.00"))
                .build();

        when(bookingRepository.findByIdAndUserId(bookingId, userId)).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingService.cancelBooking(bookingId, userId, "Annulation utilisateur"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Only unpaid pending or confirmed bookings can be cancelled");

        verify(bookingRepository, never()).save(any(Booking.class));
    }
}
