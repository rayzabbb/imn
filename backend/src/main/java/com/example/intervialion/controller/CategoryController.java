package com.example.intervialion.controller;

import com.example.intervialion.model.Category;
import com.example.intervialion.service.CategoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
