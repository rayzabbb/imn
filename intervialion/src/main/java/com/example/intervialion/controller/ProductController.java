package com.example.intervialion.controller;

import com.example.intervialion.model.Product;
import com.example.intervialion.model.SubCategory;
import com.example.intervialion.model.User;
import com.example.intervialion.service.ProductRepository;
import com.example.intervialion.service.SubCategoryRepository;
import com.example.intervialion.service.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/product")
@CrossOrigin
public class ProductController {
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private SubCategoryRepository subCategoryRepository;
    @Autowired
    private UserRepository userRepository;

    public record ProductCreateRequest(
            String name,
            String manufacturerNameOrBrand,
            String quality,
            Long subCategoryId,
            Long userId
    ) {
    }

    @GetMapping("/GetProducts")
    public ResponseEntity<List<Product>> getProducts() {
        List<Product> products = productRepository.findAll();
        if (products.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    @GetMapping("/GetProductsBySubCategory/{id}")
    public ResponseEntity<List<Product>> getProductsBySubCategory(@PathVariable Long id) {
        List<Product> products = productRepository.findBySubCategoryId(id);
        if (products.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    @GetMapping("/GetProductById/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Product product = productRepository.findById(id).orElse(null);
        if (product == null) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(product, HttpStatus.OK);
    }

    @PostMapping("/addProduct")
    public ResponseEntity<Object> addProduct(@RequestBody ProductCreateRequest request) {
        if (request.name() == null || request.name().isBlank()) {
            return ResponseEntity.badRequest().body("Product name is required");
        }
        if (request.subCategoryId() == null) {
            return ResponseEntity.badRequest().body("subCategoryId is required");
        }
        if (request.userId() == null) {
            return ResponseEntity.badRequest().body("userId is required");
        }

        SubCategory subCategory = subCategoryRepository.findById(request.subCategoryId()).orElse(null);
        if (subCategory == null) {
            return ResponseEntity.badRequest().body("Invalid subCategoryId");
        }

        User user = userRepository.findById(request.userId()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("Invalid userId");
        }

        Product product = new Product();
        product.setName(request.name());
        product.setManufacturerNameOrBrand(request.manufacturerNameOrBrand());
        product.setQuality(request.quality());
        product.setSubCategory(subCategory);
        product.setUser(user);

        Product saved = productRepository.save(product);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }
}

