package com.example.intervialion.dto;

import com.example.intervialion.model.ProductStatus;

/**
 * A donor's own product, shaped for the Personal Area: includes the
 * category/subCategory ids (needed to prefill the edit form - Product's own
 * JSON omits them via @JsonBackReference) and the real interestedCount.
 * <p>
 * There is no reserved recipient: the donor only decides to move an item
 * WITH_DONOR -> AT_CENTER; any interested user may collect it there, and the
 * donor marks it TAKEN once it's gone. Interest never reserves an item for a
 * specific person.
 */
public record ProductSummaryResponse(
        long id,
        String name,
        String manufacturerNameOrBrand,
        String quality,
        ProductStatus status,
        long interestedCount,
        Long categoryId,
        String categoryName,
        Long subCategoryId,
        String subCategoryName
) {
}
