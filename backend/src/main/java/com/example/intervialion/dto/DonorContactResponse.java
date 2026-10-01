package com.example.intervialion.dto;

/**
 * The donor's contact details for one product, shown only to a user who has
 * actually expressed interest in it - the mirror image of
 * InterestedUserResponse (which shows the donor who's interested).
 */
public record DonorContactResponse(
        String username,
        String email,
        int phone,
        String city,
        String timeToContac
) {
}
