package com.intergiciel.booking_service.feign;

import com.intergiciel.booking_service.application.dto.HouseDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@Component
@FeignClient(name = "house-service", url = "${house-service.url}")
public interface HouseServiceClient {
    @GetMapping("/api/houses/{id}")
    HouseDto getHouseById(@PathVariable UUID id);
}
