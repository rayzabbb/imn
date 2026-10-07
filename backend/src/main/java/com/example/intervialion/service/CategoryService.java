package com.example.intervialion.service;

import com.example.intervialion.exception.InvalidRequestException;
import com.example.intervialion.model.Category;
import com.example.intervialion.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ImageStorageService imageStorageService;

    public CategoryService(CategoryRepository categoryRepository, ImageStorageService imageStorageService) {
        this.categoryRepository = categoryRepository;
        this.imageStorageService = imageStorageService;
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    /** Manager-only (see SecurityConfig). The image is optional. */
    public Category createCategory(String name, String description, MultipartFile image) {
        String trimmedName = name == null ? "" : name.trim();
        if (trimmedName.isEmpty()) {
            throw new InvalidRequestException("Category name is required");
        }
        boolean duplicate = categoryRepository.findAll().stream()
                .anyMatch(c -> c.getName() != null && c.getName().trim().equalsIgnoreCase(trimmedName));
        if (duplicate) {
            throw new InvalidRequestException("A category with this name already exists");
        }

        Category category = new Category();
        category.setName(trimmedName);
        category.setDescription(description == null || description.isBlank() ? null : description.trim());
        if (image != null && !image.isEmpty()) {
            category.setImageUrl(imageStorageService.store(image));
        }
        try {
            return categoryRepository.save(category);
        } catch (RuntimeException e) {
            imageStorageService.delete(category.getImageUrl());
            throw e;
        }
    }

    /**
     * Manager-only. Replaces the category's image (image != null) or clears
     * it (image == null). Returns null when the category doesn't exist.
     */
    public Category setImage(Long id, MultipartFile image) {
        Category category = categoryRepository.findById(id).orElse(null);
        if (category == null) {
            return null;
        }
        String previousImageUrl = category.getImageUrl();
        String newImageUrl = image != null && !image.isEmpty() ? imageStorageService.store(image) : null;
        category.setImageUrl(newImageUrl);

        Category saved;
        try {
            saved = categoryRepository.save(category);
        } catch (RuntimeException e) {
            imageStorageService.delete(newImageUrl);
            throw e;
        }
        imageStorageService.delete(previousImageUrl);
        return saved;
    }
}
