package com.example.intervialion.repository;
import com.example.intervialion.model.Product;
import com.example.intervialion.model.ProductStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findBySubCategoryId(Long subCategoryId);
    List<Product> findByUserId(Long userId);

    // Public browsing listings exclude TAKEN items (already given away).
    // GetProductById, GetProductsByUser and the interest endpoints
    // deliberately do NOT use these - they still need to show a TAKEN item
    // to its donor, to a previously-interested user, or via a direct link.
    List<Product> findBySubCategoryIdAndStatusNot(Long subCategoryId, ProductStatus status);
    List<Product> findByStatusNot(ProductStatus status);
}
