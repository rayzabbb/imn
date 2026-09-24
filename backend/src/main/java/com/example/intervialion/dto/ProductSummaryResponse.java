package com.example.intervialion.dto;

import com.example.intervialion.model.ProductStatus;

/**
 * A donor's own product, shaped for the Personal Area: includes the
 * category/subCategory ids (needed to prefill the edit form - Product's own
 * JSON omits them via @JsonBackReference) and an interestedCount seam for
 * the future interest workflow. Today interestedCount is always 0; once an
 * Interest entity exists, ProductService.countInterestedUsers is the only
 * place that needs to change.
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
