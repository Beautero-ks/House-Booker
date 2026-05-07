package com.intergiciel.booking_service.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "availabilities")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Availability {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "house_id", nullable = false)
    private UUID houseId;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private boolean isAvailable = true;

    public Availability(UUID houseId, LocalDate date, boolean b) {
        this.houseId = houseId;
        this.date = date;
        this.isAvailable = b;
    }

    @PrePersist
    protected void onCreate() {
        isAvailable = true; // Par défaut, disponible
    }
}
