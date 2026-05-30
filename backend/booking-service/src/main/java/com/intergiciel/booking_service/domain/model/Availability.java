package com.intergiciel.booking_service.domain.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;


@Getter
@Setter
@Entity
@Table(name = "availability")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Availability {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "house_id", nullable = false)
    private UUID houseId;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "is_available", nullable = false)
    private boolean available = true;

    // Convenience constructor used by service code when creating a new availability record
    public Availability(UUID houseId, LocalDate date, boolean available) {
        this.houseId = houseId;
        this.date = date;
        this.available = available;
    }
}
