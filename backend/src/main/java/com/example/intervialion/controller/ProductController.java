package com.example.intervialion.controller;

import com.example.intervialion.dto.ProductCreateRequest;
import com.example.intervialion.dto.ProductSummaryResponse;
import com.example.intervialion.dto.ProductUpdateRequest;
import com.example.intervialion.model.Product;
import com.example.intervialion.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/product")
@CrossOrigin
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/GetProducts")
    public ResponseEntity<List<Product>> getProducts() {
        List<Product> products = productService.getAllProducts();
        if (products.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    @GetMapping("/GetProductsBySubCategory/{id}")
    public ResponseEntity<List<Product>> getProductsBySubCategory(@PathVariable Long id) {
        List<Product> products = productService.getProductsBySubCategoryId(id);
        if (products.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    @GetMapping("/GetProductById/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        if (product == null) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(product, HttpStatus.OK);
    }

    @PostMapping("/addProduct")
    public ResponseEntity<Object> addProduct(@RequestBody ProductCreateRequest request) {
        // Validation failures surface as InvalidRequestException and are turned
        // into the same 400 + message responses by GlobalExceptionHandler.
        Product saved = productService.createProduct(request);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    /** A donor's own listings, for the Personal Area. */
    @GetMapping("/GetProductsByUser/{userId}")
    public ResponseEntity<List<ProductSummaryResponse>> getProductsByUser(@PathVariable Long userId) {
        List<ProductSummaryResponse> products = productService.getProductsByUser(userId);
        if (products.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    @PutMapping("/updateProduct/{id}")
    public ResponseEntity<Object> updateProduct(
            @PathVariable Long id,
            @RequestBody ProductUpdateRequest request,
            @RequestParam Long requesterUserId
    ) {
        // Ownership failures surface as ForbiddenException (403) and validation
        // failures as InvalidRequestException (400), both via GlobalExceptionHandler.
        ProductSummaryResponse updated = productService.updateProduct(id, request, requesterUserId);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/deleteProduct/{id}")
    public ResponseEntity<Object> deleteProduct(
            @PathVariable Long id,
            @RequestParam Long requesterUserId
    ) {
        boolean deleted = productService.deleteProduct(id, requesterUserId);
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }

    /**
     * Collection-center step 1: the donor brings the item to the center.
     * Not reserved for anyone - any interested user (or anyone at all) may
     * come collect it there.
     */
    @PutMapping("/{id}/moveToCenter")
    public ResponseEntity<Object> moveToCenter(
            @PathVariable Long id,
            @RequestParam Long requesterUserId
    ) {
        ProductSummaryResponse updated = productService.moveToCenter(id, requesterUserId);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    /** Collection-center step 2: the donor confirms the item was collected. */
    @PutMapping("/{id}/markTaken")
    public ResponseEntity<Object> markTaken(
            @PathVariable Long id,
            @RequestParam Long requesterUserId
    ) {
        ProductSummaryResponse updated = productService.markTaken(id, requesterUserId);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }
}
