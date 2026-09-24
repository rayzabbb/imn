package com.example.intervialion.model;

/**
 * Lifecycle of a donated item. Every product starts WITH_DONOR when
 * published. The future interest/collection-center workflow will move it
 * through AT_CENTER once handed over, then to TAKEN once someone collects
 * it - that transition logic doesn't exist yet, this enum just reserves
 * the states so the Personal Area has something real to display.
 */
public enum ProductStatus {
    WITH_DONOR,
    AT_CENTER,
    TAKEN
}
