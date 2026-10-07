package com.example.intervialion.controller;

import com.example.intervialion.dto.DonorContactResponse;
import com.example.intervialion.dto.InterestStatusResponse;
import com.example.intervialion.dto.InterestedUserResponse;
import com.example.intervialion.dto.MyInterestResponse;
import com.example.intervialion.security.JwtUserPrincipal;
import com.example.intervialion.service.InterestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Every endpoint here requires a valid Bearer token (not in SecurityConfig's
// permitAll list) - expressing interest, viewing your own status/interests,
// or a donor's interested-users/contact view all only make sense for a real,
// authenticated identity, which @AuthenticationPrincipal supplies from the
// verified JWT rather than a userId the client would otherwise send.
@RestController
@RequestMapping("api/interest")
@CrossOrigin
public class InterestController {

    private final InterestService interestService;

    public InterestController(InterestService interestService) {
        this.interestService = interestService;
    }

    /** The caller expresses interest in a product. */
    @PostMapping("/product/{productId}")
    public ResponseEntity<InterestStatusResponse> expressInterest(
            @PathVariable Long productId,
            @AuthenticationPrincipal JwtUserPrincipal principal
    ) {
        // Business-rule failures (already interested, own product, unknown
        // user) surface as InvalidRequestException -> 400 via GlobalExceptionHandler.
        InterestStatusResponse status = interestService.expressInterest(productId, principal.getId());
        if (status == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(status);
    }

    /** The caller withdraws their interest in a product. */
    @DeleteMapping("/product/{productId}")
    public ResponseEntity<InterestStatusResponse> cancelInterest(
            @PathVariable Long productId,
            @AuthenticationPrincipal JwtUserPrincipal principal
    ) {
        InterestStatusResponse status = interestService.cancelInterest(productId, principal.getId());
        if (status == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(status);
    }

    /** Whether the caller is interested in this product, plus the total count. */
    @GetMapping("/product/{productId}/status")
    public ResponseEntity<InterestStatusResponse> getStatus(
            @PathVariable Long productId,
            @AuthenticationPrincipal JwtUserPrincipal principal
    ) {
        InterestStatusResponse status = interestService.getStatus(productId, principal.getId());
        if (status == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(status);
    }

    /** The donor's view of who is interested, with contact details. */
    @GetMapping("/product/{productId}/interested")
    public ResponseEntity<List<InterestedUserResponse>> getInterestedUsers(
            @PathVariable Long productId,
            @AuthenticationPrincipal JwtUserPrincipal principal
    ) {
        // Non-donor requesters surface as ForbiddenException -> 403 via GlobalExceptionHandler.
        List<InterestedUserResponse> users = interestService.getInterestedUsers(productId, principal.getId());
        if (users == null) {
            return ResponseEntity.notFound().build();
        }
        if (users.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(users);
    }

    /** The donor's contact details, visible only to a caller who has expressed interest. */
    @GetMapping("/product/{productId}/donor-contact")
    public ResponseEntity<DonorContactResponse> getDonorContact(
            @PathVariable Long productId,
            @AuthenticationPrincipal JwtUserPrincipal principal
    ) {
        // Callers who never expressed interest surface as ForbiddenException -> 403.
        DonorContactResponse contact = interestService.getDonorContact(productId, principal.getId());
        if (contact == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(contact);
    }

    /** Every product the caller has expressed interest in, for their Personal Area. */
    @GetMapping("/mine")
    public ResponseEntity<List<MyInterestResponse>> getMyInterests(@AuthenticationPrincipal JwtUserPrincipal principal) {
        List<MyInterestResponse> interests = interestService.getMyInterests(principal.getId());
        if (interests.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(interests);
    }
}
