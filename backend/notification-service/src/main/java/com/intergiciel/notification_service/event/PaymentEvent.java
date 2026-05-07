package com.intergiciel.notification_service.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentEvent {
    private String paymentId;
    private String bookingId;
    private String userId;
    private double amount;
    private String status; // SUCCESS, FAILED
}