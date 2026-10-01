package com.example.intervialion.dto;

import com.example.intervialion.model.ProductStatus;

import java.time.LocalDateTime;

/**
 * One product a user has expressed interest in, for their Personal Area
 * "מוצרים שמעניינים אותי" section. Shows the product's current real status so
 * the interested user can see whether it's still with its donor, already at
 * the collection center (so they can go collect it), or already taken.
 */
public record MyInterestResponse(
        long productId,
        String name,
        String manufacturerNameOrBrand,
        String quality,
        ProductStatus status,
        LocalDateTime expressedAt
) {
}
