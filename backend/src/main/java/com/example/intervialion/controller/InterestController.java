package com.example.intervialion.controller;

import com.example.intervialion.dto.InterestStatusResponse;
import com.example.intervialion.service.InterestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/interest")
@CrossOrigin
public class InterestController {

    private final InterestService interestService;

    public InterestController(InterestService interestService) {
        this.interestService = interestService;
    }

    /** A logged-in user expresses interest in a product. */
    @PostMapping("/product/{productId}")
    public ResponseEntity<InterestStatusResponse> expressInterest(
            @PathVariable Long productId,
            @RequestParam Long userId
    ) {
        // Business-rule failures (already interested, own product, unknown
        // user) surface as InvalidRequestException -> 400 via GlobalExceptionHandler.
        InterestStatusResponse status = interestService.expressInterest(productId, userId);
        if (status == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(status);
    }

    /** A user withdraws their interest in a product. */
    @DeleteMapping("/product/{productId}")
    public ResponseEntity<InterestStatusResponse> cancelInterest(
            @PathVariable Long productId,
            @RequestParam Long userId
    ) {
        InterestStatusResponse status = interestService.cancelInterest(productId, userId);
        if (status == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(status);
    }

    /** Whether this user is interested in this product, plus the total count. */
    @GetMapping("/product/{productId}/status")
    public ResponseEntity<InterestStatusResponse> getStatus(
            @PathVariable Long productId,
            @RequestParam Long userId
    ) {
        InterestStatusResponse status = interestService.getStatus(productId, userId);
        if (status == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(status);
    }
}
