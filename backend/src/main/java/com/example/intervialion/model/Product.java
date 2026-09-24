package com.example.intervialion.model;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private String name;
    private String ManufacturerNameOrBrand;
    private String quality;

    // Lifecycle of the donation: WITH_DONOR (default, just published) ->
    // AT_CENTER -> TAKEN. Stored as STRING so future statuses can be added
    // without an ordinal-based data migration.
    @Enumerated(EnumType.STRING)
    private ProductStatus status = ProductStatus.WITH_DONOR;

    @ManyToOne
    @JoinColumn(name = "sub_category_id", nullable = false)
    @JsonBackReference("subCategory-products") // מונע חזרה אינסופית מתת הקטגוריה
    private SubCategory subCategory;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference("user-products") // מונע חזרה אינסופית מהמשתמש
    private User user;

    public Product() {}

    public Product(long id, String name, String manufacturerNameOrBrand, String quality, SubCategory subCategory, User user) {
        this.id = id;
        this.name = name;
        this.ManufacturerNameOrBrand = manufacturerNameOrBrand;
        this.quality = quality;
        this.subCategory = subCategory;
        this.user = user;
    }

    public long getId() { return id; }
    public void setId(long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getManufacturerNameOrBrand() { return ManufacturerNameOrBrand; }
    public void setManufacturerNameOrBrand(String manufacturerNameOrBrand) { this.ManufacturerNameOrBrand = manufacturerNameOrBrand; }
    public String getQuality() { return quality; }
    public void setQuality(String quality) { this.quality = quality; }

    public ProductStatus getStatus() { return status; }
    public void setStatus(ProductStatus status) { this.status = status; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public SubCategory getSubCategory() { return subCategory; }
    public void setSubCategory(SubCategory subCategory) { this.subCategory = subCategory; }
}
