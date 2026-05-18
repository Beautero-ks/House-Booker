package com.notification.kafka.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContractGeneratedEvent {
    private UUID contractId;
    private UUID bookingId;
    private UUID userId;
    private String contractUrl;
}