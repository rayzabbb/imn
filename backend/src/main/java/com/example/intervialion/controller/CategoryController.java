package com.example.intervialion.controller;

import com.example.intervialion.model.Category;
import com.example.intervialion.service.CategoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("api/category")
@CrossOrigin
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping("/GetCategories")
    public ResponseEntity<List<Category>> getCategories() {
        List<Category> categories = categoryService.getAllCategories();
        if (categories.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return new ResponseEntity<>(categories, HttpStatus.OK);
    }

    // Everything below is MANAGER-only (see SecurityConfig).

    @PostMapping(value = "/addCategory", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Category> addCategory(
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        Category saved = categoryService.createCategory(name, description, image);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PutMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Category> setCategoryImage(
            @PathVariable Long id,
            @RequestPart("image") MultipartFile image
    ) {
        Category updated = categoryService.setImage(id, image);
        return updated == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}/image")
    public ResponseEntity<Category> removeCategoryImage(@PathVariable Long id) {
        Category updated = categoryService.setImage(id, null);
        return updated == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(updated);
    }
}
