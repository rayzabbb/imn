package com.example.intervialion.dto;

/** Returned by /Login and /RegisterUser: the JWT plus the user's own profile. */
public record AuthResponse(String token, UserResponse user) {
}
