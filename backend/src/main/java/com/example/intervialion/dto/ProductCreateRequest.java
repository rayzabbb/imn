package com.example.intervialion.dto;

/**
 * Inbound payload for creating a product listing.
 * Extracted verbatim from ProductController so the controller no longer
 * carries its own request shape.
 */
public record ProductCreateRequest(
        String name,
        String manufacturerNameOrBrand,
        String quality,
        Long subCategoryId,
        Long userId
) {
}
