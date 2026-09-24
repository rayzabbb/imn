package com.example.intervialion.controller;

import com.example.intervialion.dto.ProductCreateRequest;
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
}
