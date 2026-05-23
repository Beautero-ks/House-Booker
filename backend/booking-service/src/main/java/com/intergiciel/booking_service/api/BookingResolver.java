package com.intergiciel.booking_service.api;

import com.intergiciel.booking_service.application.dto.House;
import com.intergiciel.booking_service.application.dto.HouseDto;
import com.intergiciel.booking_service.application.dto.User;
import com.intergiciel.booking_service.domain.model.Booking;
import com.intergiciel.booking_service.feign.HouseServiceClient;
import com.intergiciel.booking_service.feign.UserServiceClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class BookingResolver  {
    private final UserServiceClient userServiceClient;
    private final HouseServiceClient houseServiceClient;

    public User user(Booking booking) {
        return userServiceClient.getUserById(booking.getUserId());
    }

    public HouseDto house(Booking booking) {
        return houseServiceClient.getHouseById(booking.getHouseId());
    }
}
