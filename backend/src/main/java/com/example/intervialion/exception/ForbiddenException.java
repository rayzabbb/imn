package com.example.intervialion.exception;

/**
 * Raised when a request tries to modify a resource it doesn't own (e.g.
 * editing/deleting someone else's product). Translated to 403 by
 * GlobalExceptionHandler.
 */
public class ForbiddenException extends RuntimeException {

    public ForbiddenException(String message) {
        super(message);
    }
}
