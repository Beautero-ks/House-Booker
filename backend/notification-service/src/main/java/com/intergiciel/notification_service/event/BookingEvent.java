package com.intergiciel.notification_service.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingEvent {
    private String bookingId;
    private String userId;
    private String houseTitle;
    private String checkInDate;
    private String checkOutDate;
    private String status; // CONFIRMED, CANCELLED, PENDING
}
