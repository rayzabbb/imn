package com.example.intervialion.controller;

import com.example.intervialion.model.SubCategory;
import com.example.intervialion.service.SubCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/subcategory")
@CrossOrigin
public class SubCategoryController {
    @Autowired
    private SubCategoryRepository subCategoryRepository;

    @GetMapping("/GetSubCategories")
    public ResponseEntity<List<SubCategory>> getSubCategories() {
        List<SubCategory> subCategories = subCategoryRepository.findAll();
        if (subCategories.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return new ResponseEntity<>(subCategories, HttpStatus.OK);
    }
}
