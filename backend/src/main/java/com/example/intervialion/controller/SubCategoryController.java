package com.example.intervialion.controller;

import com.example.intervialion.model.SubCategory;
import com.example.intervialion.service.SubCategoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
