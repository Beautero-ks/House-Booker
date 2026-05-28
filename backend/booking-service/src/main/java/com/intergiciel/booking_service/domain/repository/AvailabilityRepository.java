package com.intergiciel.booking_service.domain.repository;

import com.intergiciel.booking_service.domain.model.Availability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AvailabilityRepository extends JpaRepository<Availability, UUID> {
    List<Availability> findByHouseIdAndDateBetween(UUID houseId, LocalDate startDate, LocalDate endDate);
    Optional<Availability> findByHouseIdAndDate(UUID houseId, LocalDate date);
}
