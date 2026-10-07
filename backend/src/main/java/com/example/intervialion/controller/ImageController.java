package com.example.intervialion.controller;

import com.example.intervialion.service.ImageStorageService;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.TimeUnit;

/** Serves uploaded images publicly (permitAll'd in SecurityConfig), like the browsing endpoints. */
@RestController
@RequestMapping("api/images")
@CrossOrigin
public class ImageController {

    private final ImageStorageService imageStorageService;

    public ImageController(ImageStorageService imageStorageService) {
        this.imageStorageService = imageStorageService;
    }

    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        Resource image = imageStorageService.load(filename);
        if (image == null) {
            return ResponseEntity.notFound().build();
        }
        // Filenames are random and never reused, so the content behind a URL never changes.
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(ImageStorageService.contentTypeFor(filename)))
                .cacheControl(CacheControl.maxAge(30, TimeUnit.DAYS).cachePublic())
                .body(image);
    }
}
