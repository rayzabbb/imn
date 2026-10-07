package com.example.intervialion.dto;

/**
 * Inbound payload for creating a product listing. No userId field - the
 * owner is always the authenticated caller (from the JWT), never something
 * the client puts in the request body.
 */
public record ProductCreateRequest(
        String name,
        String manufacturerNameOrBrand,
        String quality,
        Long subCategoryId
) {
}
