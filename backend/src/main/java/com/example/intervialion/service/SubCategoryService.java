package com.example.intervialion.service;

import com.example.intervialion.exception.InvalidRequestException;
import com.example.intervialion.model.Category;
import com.example.intervialion.model.SubCategory;
import com.example.intervialion.repository.CategoryRepository;
import com.example.intervialion.repository.SubCategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class SubCategoryService {

    private final SubCategoryRepository subCategoryRepository;
    private final CategoryRepository categoryRepository;
    private final ImageStorageService imageStorageService;

    public SubCategoryService(SubCategoryRepository subCategoryRepository,
                              CategoryRepository categoryRepository,
                              ImageStorageService imageStorageService) {
        this.subCategoryRepository = subCategoryRepository;
        this.categoryRepository = categoryRepository;
        this.imageStorageService = imageStorageService;
    }

    public List<SubCategory> getAllSubCategories() {
        return subCategoryRepository.findAll();
    }

    public List<SubCategory> getSubCategoriesByCategoryId(Long categoryId) {
        return subCategoryRepository.findByCategoryId(categoryId);
    }

    /** Manager-only (see SecurityConfig). The image is optional. */
    public SubCategory createSubCategory(String name, Long categoryId, MultipartFile image) {
        String trimmedName = name == null ? "" : name.trim();
        if (trimmedName.isEmpty()) {
            throw new InvalidRequestException("Subcategory name is required");
        }
        if (categoryId == null) {
            throw new InvalidRequestException("categoryId is required");
        }
        Category category = categoryRepository.findById(categoryId).orElse(null);
        if (category == null) {
            throw new InvalidRequestException("Invalid categoryId");
        }
        boolean duplicate = subCategoryRepository.findByCategoryId(categoryId).stream()
                .anyMatch(sc -> sc.getName() != null && sc.getName().trim().equalsIgnoreCase(trimmedName));
        if (duplicate) {
            throw new InvalidRequestException("A subcategory with this name already exists in this category");
        }

        SubCategory subCategory = new SubCategory();
        subCategory.setName(trimmedName);
        subCategory.setCategory(category);
        if (image != null && !image.isEmpty()) {
            subCategory.setImageUrl(imageStorageService.store(image));
        }
        try {
            return subCategoryRepository.save(subCategory);
        } catch (RuntimeException e) {
            imageStorageService.delete(subCategory.getImageUrl());
            throw e;
        }
    }

    /**
     * Manager-only. Replaces the subcategory's image (image != null) or
     * clears it (image == null). Returns null when it doesn't exist.
     */
    public SubCategory setImage(Long id, MultipartFile image) {
        SubCategory subCategory = subCategoryRepository.findById(id).orElse(null);
        if (subCategory == null) {
            return null;
        }
        String previousImageUrl = subCategory.getImageUrl();
        String newImageUrl = image != null && !image.isEmpty() ? imageStorageService.store(image) : null;
        subCategory.setImageUrl(newImageUrl);

        SubCategory saved;
        try {
            saved = subCategoryRepository.save(subCategory);
        } catch (RuntimeException e) {
            imageStorageService.delete(newImageUrl);
            throw e;
        }
        imageStorageService.delete(previousImageUrl);
        return saved;
    }
}
