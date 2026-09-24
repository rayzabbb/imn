package com.example.intervialion.service;

import com.example.intervialion.dto.ProductCreateRequest;
import com.example.intervialion.exception.InvalidRequestException;
import com.example.intervialion.model.Product;
import com.example.intervialion.model.SubCategory;
import com.example.intervialion.model.User;
import com.example.intervialion.repository.ProductRepository;
import com.example.intervialion.repository.SubCategoryRepository;
import com.example.intervialion.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final SubCategoryRepository subCategoryRepository;
    private final UserRepository userRepository;

    public ProductService(ProductRepository productRepository,
                          SubCategoryRepository subCategoryRepository,
                          UserRepository userRepository) {
        this.productRepository = productRepository;
        this.subCategoryRepository = subCategoryRepository;
        this.userRepository = userRepository;
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
}
