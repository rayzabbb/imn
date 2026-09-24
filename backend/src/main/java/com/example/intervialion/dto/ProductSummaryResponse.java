package com.example.intervialion.dto;

import com.example.intervialion.model.ProductStatus;

/**
 * A donor's own product, shaped for the Personal Area: includes the
 * category/subCategory ids (needed to prefill the edit form - Product's own
 * JSON omits them via @JsonBackReference), the real interestedCount, and -
 * once the donor has picked someone (status AT_CENTER/TAKEN) - who the
 * recipient is. recipientUserId/recipientUsername are null until then.
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
        String subCategoryName,
        Long recipientUserId,
        String recipientUsername
) {
}
