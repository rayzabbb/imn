package com.example.intervialion.dto;

/**
 * Returned by every /api/interest endpoint so the caller can update its UI
 * from the response alone, without a second fetch.
 *
 * @param interested      whether the requesting user currently has an open
 *                        interest in this product
 * @param interestedCount total number of users interested in this product
 * @param owner           whether the requesting user is the product's donor
 *                        (they can't express interest in their own item)
 */
public record InterestStatusResponse(boolean interested, long interestedCount, boolean owner) {
}
