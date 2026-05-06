package com.intergiciel.house_service.exception;

public class LogementNotFoundException extends RuntimeException {

    public LogementNotFoundException(String message) {
        super(message);
    }
}