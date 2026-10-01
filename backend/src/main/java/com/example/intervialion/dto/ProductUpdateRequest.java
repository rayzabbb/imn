package com.example.intervialion.dto;

/**
 * Payload for PUT /api/product/updateProduct/{id}. Deliberately excludes
 * status - status transitions belong to the future interest/collection-center
 * workflow, not to a plain listing edit.
 */
public record ProductUpdateRequest(
        String name,
        String manufacturerNameOrBrand,
        String quality,
        Long subCategoryId
) {
}
