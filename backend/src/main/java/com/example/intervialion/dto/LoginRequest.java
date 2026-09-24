package com.example.intervialion.dto;

/** Credentials submitted to POST /api/user/Login. */
public record LoginRequest(String username, String password) {
}
