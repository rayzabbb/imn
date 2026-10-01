package com.example.intervialion.dto;

import java.time.LocalDateTime;

/**
 * One interested user, as shown only to the product's own donor (never
 * exposed publicly) so they can decide who to hand the item to. Includes
 * contact fields the donor needs to actually arrange the handoff.
 */
public record InterestedUserResponse(
        Long userId,
        String username,
        String email,
        int phone,
        String city,
        String timeToContac,
        LocalDateTime expressedAt
) {
}
