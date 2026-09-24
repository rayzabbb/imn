package com.example.intervialion.service;

import com.example.intervialion.dto.ProductCreateRequest;
import com.example.intervialion.dto.ProductSummaryResponse;
import com.example.intervialion.dto.ProductUpdateRequest;
import com.example.intervialion.exception.ForbiddenException;
import com.example.intervialion.exception.InvalidRequestException;
import com.example.intervialion.model.Product;
import com.example.intervialion.model.SubCategory;
import com.example.intervialion.model.User;
import com.example.intervialion.repository.InterestRepository;
import com.example.intervialion.repository.ProductRepository;
import com.example.intervialion.repository.SubCategoryRepository;
import com.example.intervialion.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final SubCategoryRepository subCategoryRepository;
    private final UserRepository userRepository;
    private final InterestRepository interestRepository;

    public ProductService(ProductRepository productRepository,
                          SubCategoryRepository subCategoryRepository,
                          UserRepository userRepository,
                          InterestRepository interestRepository) {
        this.productRepository = productRepository;
        this.subCategoryRepository = subCategoryRepository;
        this.userRepository = userRepository;
        this.interestRepository = interestRepository;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public List<Product> getProductsBySubCategoryId(Long subCategoryId) {
        return productRepository.findBySubCategoryId(subCategoryId);
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id).orElse(null);
    }

    /**
     * Validates and persists a new listing. The validation order and the exact
     * messages match what ProductController returned before the refactor.
     */
    public Product createProduct(ProductCreateRequest request) {
        if (request.name() == null || request.name().isBlank()) {
            throw new InvalidRequestException("Product name is required");
        }
        if (request.subCategoryId() == null) {
            throw new InvalidRequestException("subCategoryId is required");
        }
        if (request.userId() == null) {
            throw new InvalidRequestException("userId is required");
        }

        SubCategory subCategory = subCategoryRepository.findById(request.subCategoryId()).orElse(null);
        if (subCategory == null) {
            throw new InvalidRequestException("Invalid subCategoryId");
        }

        User user = userRepository.findById(request.userId()).orElse(null);
        if (user == null) {
            throw new InvalidRequestException("Invalid userId");
        }

        Product product = new Product();
        product.setName(request.name());
        product.setManufacturerNameOrBrand(request.manufacturerNameOrBrand());
        product.setQuality(request.quality());
        product.setSubCategory(subCategory);
        product.setUser(user);

        return productRepository.save(product);
    }

    /**
     * A donor's own products for the Personal Area, shaped into
     * ProductSummaryResponse (Product's own JSON hides category/subCategory
     * via @JsonBackReference, and the donor needs those ids to edit).
     */
    public List<ProductSummaryResponse> getProductsByUser(Long userId) {
        return productRepository.findByUserId(userId).stream()
                .map(this::toSummary)
                .toList();
    }

    private ProductSummaryResponse toSummary(Product product) {
        SubCategory subCategory = product.getSubCategory();
        Long subCategoryId = subCategory != null ? subCategory.getId() : null;
        String subCategoryName = subCategory != null ? subCategory.getName() : null;
        Long categoryId = subCategory != null && subCategory.getCategory() != null
                ? subCategory.getCategory().getId() : null;
        String categoryName = subCategory != null && subCategory.getCategory() != null
                ? subCategory.getCategory().getName() : null;

        return new ProductSummaryResponse(
                product.getId(),
                product.getName(),
                product.getManufacturerNameOrBrand(),
                product.getQuality(),
                product.getStatus(),
                countInterestedUsers(product),
                categoryId,
                categoryName,
                subCategoryId,
                subCategoryName
        );
    }

    /** Real count from the interests table - no fake or cached data. */
    private long countInterestedUsers(Product product) {
        return interestRepository.countByProductId(product.getId());
    }

    /**
     * Updates the editable listing fields of a product. Status is
     * intentionally not editable here - it belongs to the future
     * interest/collection-center workflow. Only the owning donor may edit.
     */
    public ProductSummaryResponse updateProduct(Long id, ProductUpdateRequest request, Long requesterUserId) {
        Product product = productRepository.findById(id).orElse(null);
        if (product == null) {
            return null;
        }
        if (requesterUserId == null || product.getUser() == null
                || !product.getUser().getId().equals(requesterUserId)) {
            throw new ForbiddenException("You can only edit your own products");
        }

        if (request.name() == null || request.name().isBlank()) {
            throw new InvalidRequestException("Product name is required");
        }
        if (request.subCategoryId() == null) {
            throw new InvalidRequestException("subCategoryId is required");
        }
        SubCategory subCategory = subCategoryRepository.findById(request.subCategoryId()).orElse(null);
        if (subCategory == null) {
            throw new InvalidRequestException("Invalid subCategoryId");
        }

        product.setName(request.name());
        product.setManufacturerNameOrBrand(request.manufacturerNameOrBrand());
        product.setQuality(request.quality());
        product.setSubCategory(subCategory);

        Product saved = productRepository.save(product);
        return toSummary(saved);
    }

    /**
     * Deletes a product. Returns false when it doesn't exist; throws when the
     * requester isn't the owner. Only the owning donor may delete. Any open
     * interests are removed first - Interest has no cascade-delete relation
     * to Product, so the FK would otherwise reject the delete.
     */
    @Transactional
    public boolean deleteProduct(Long id, Long requesterUserId) {
        Product product = productRepository.findById(id).orElse(null);
        if (product == null) {
            return false;
        }
        if (requesterUserId == null || product.getUser() == null
                || !product.getUser().getId().equals(requesterUserId)) {
            throw new ForbiddenException("You can only delete your own products");
        }
        interestRepository.deleteByProductId(id);
        productRepository.delete(product);
        return true;
    }
}
