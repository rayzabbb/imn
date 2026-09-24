package com.example.intervialion.exception;

/**
 * Raised by the service layer when an inbound request fails validation.
 * Translated to a 400 response carrying the message by GlobalExceptionHandler,
 * preserving the exact bodies the controllers returned previously.
 */
public class InvalidRequestException extends RuntimeException {

    public InvalidRequestException(String message) {
        super(message);
    }
}
