package com.example.intervialion.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * Records that one user is interested in one product. No inverse collections
 * on Product/User - every lookup goes through InterestRepository (by
 * product/user id), so this entity never needs to be serialized directly and
 * carries no Jackson reference annotations.
 * <p>
 * The unique constraint is the actual "can't express interest twice"
 * guarantee; InterestService also checks it explicitly first so a duplicate
 * attempt gets a clean 400 message instead of a raw constraint-violation
 * error.
 */
@Entity
@Table(name = "interests", uniqueConstraints = @UniqueConstraint(columnNames = {"product_id", "user_id"}))
public class Interest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Interest() {
    }

    public Long getId() {
        return id;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
