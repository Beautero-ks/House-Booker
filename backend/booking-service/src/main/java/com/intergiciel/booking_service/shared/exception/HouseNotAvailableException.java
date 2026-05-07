package com.intergiciel.booking_service.shared.exception;

public class HouseNotAvailableException extends RuntimeException {
    public HouseNotAvailableException(String message) {
        super(message);
    }
}
