package com.example.intervialion.controller;

import com.example.intervialion.model.SubCategory;
import com.example.intervialion.service.SubCategoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("api/subcategory")
@CrossOrigin
public class SubCategoryController {

    private final SubCategoryService subCategoryService;

    public SubCategoryController(SubCategoryService subCategoryService) {
        this.subCategoryService = subCategoryService;
    }

    @GetMapping("/GetSubCategories")
    public ResponseEntity<List<SubCategory>> getSubCategories() {
        List<SubCategory> subCategories = subCategoryService.getAllSubCategories();
        if (subCategories.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return new ResponseEntity<>(subCategories, HttpStatus.OK);
    }

    @GetMapping("/GetSubCategoriesByCategory/{id}")
    public ResponseEntity<List<SubCategory>> getSubCategoriesByCategory(@PathVariable Long id) {
        List<SubCategory> subCategories = subCategoryService.getSubCategoriesByCategoryId(id);
        if (subCategories.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return new ResponseEntity<>(subCategories, HttpStatus.OK);
    }

    // Everything below is MANAGER-only (see SecurityConfig).

    @PostMapping(value = "/addSubCategory", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SubCategory> addSubCategory(
            @RequestParam("name") String name,
            @RequestParam("categoryId") Long categoryId,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        SubCategory saved = subCategoryService.createSubCategory(name, categoryId, image);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PutMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SubCategory> setSubCategoryImage(
            @PathVariable Long id,
            @RequestPart("image") MultipartFile image
    ) {
        SubCategory updated = subCategoryService.setImage(id, image);
        return updated == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}/image")
    public ResponseEntity<SubCategory> removeSubCategoryImage(@PathVariable Long id) {
        SubCategory updated = subCategoryService.setImage(id, null);
        return updated == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(updated);
    }
}
