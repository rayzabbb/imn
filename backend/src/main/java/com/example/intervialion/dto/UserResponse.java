package com.example.intervialion.dto;

import com.example.intervialion.model.User;

/**
 * A user shaped for the frontend's own use (profile display, currentUser
 * state) - never includes the password hash, and includes the derived role
 * so the client knows about it without decoding the JWT itself.
 */
public record UserResponse(
        Long id,
        String username,
        String email,
        int phone,
        String city,
        String adress,
        String timeToContac,
        String role
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPhone(),
                user.getCity(),
                user.getAdress(),
                user.getTimeToContac(),
                user.getRole()
        );
    }
}
