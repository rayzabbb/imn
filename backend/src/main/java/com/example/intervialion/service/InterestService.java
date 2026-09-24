package com.example.intervialion.service;

import com.example.intervialion.dto.InterestStatusResponse;
import com.example.intervialion.dto.InterestedUserResponse;
import com.example.intervialion.exception.ForbiddenException;
import com.example.intervialion.exception.InvalidRequestException;
import com.example.intervialion.model.Interest;
import com.example.intervialion.model.Product;
import com.example.intervialion.model.ProductStatus;
import com.example.intervialion.model.User;
import com.example.intervialion.repository.InterestRepository;
import com.example.intervialion.repository.ProductRepository;
import com.example.intervialion.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InterestService {

    private final InterestRepository interestRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public InterestService(InterestRepository interestRepository,
                            ProductRepository productRepository,
                            UserRepository userRepository) {
        this.interestRepository = interestRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    /**
     * Registers interest. Returns null when the product doesn't exist (404
     * territory - it's addressed by path variable). Throws when the request
     * itself is invalid: unknown user, the requester is the product's own
     * donor, or interest was already expressed (all 400s).
     */
    public InterestStatusResponse expressInterest(Long productId, Long userId) {
        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) {
            return null;
        }

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            throw new InvalidRequestException("Invalid userId");
        }

        if (isOwner(product, userId)) {
            throw new InvalidRequestException("You cannot express interest in your own product");
        }

        if (product.getStatus() != ProductStatus.WITH_DONOR) {
            throw new InvalidRequestException("This product is no longer available");
        }

        if (interestRepository.existsByProductIdAndUserId(productId, userId)) {
            throw new InvalidRequestException("You have already expressed interest in this product");
        }

        Interest interest = new Interest();
        interest.setProduct(product);
        interest.setUser(user);
        interestRepository.save(interest);

        return buildStatus(product, userId);
    }

    /**
     * Withdraws interest. Idempotent: cancelling when no interest exists
     * simply returns the current (already-not-interested) status rather than
     * erroring. Returns null when the product doesn't exist.
     */
    public InterestStatusResponse cancelInterest(Long productId, Long userId) {
        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) {
            return null;
        }

        interestRepository.findByProductIdAndUserId(productId, userId)
                .ifPresent(interestRepository::delete);

        return buildStatus(product, userId);
    }

    /** Current interest status for one viewer on one product. */
    public InterestStatusResponse getStatus(Long productId, Long userId) {
        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) {
            return null;
        }
        return buildStatus(product, userId);
    }

    /**
     * The full list of interested users for one product, with contact
     * details so the donor can arrange a handoff. Only the product's own
     * donor may see this - it's never exposed publicly. Returns null when
     * the product doesn't exist.
     */
    public List<InterestedUserResponse> getInterestedUsers(Long productId, Long requesterUserId) {
        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) {
            return null;
        }
        if (!isOwner(product, requesterUserId)) {
            throw new ForbiddenException("Only the donor can view interested users");
        }

        return interestRepository.findByProductIdOrderByCreatedAtAsc(productId).stream()
                .map(interest -> {
                    User user = interest.getUser();
                    return new InterestedUserResponse(
                            user.getId(),
                            user.getUsername(),
                            user.getEmail(),
                            user.getPhone(),
                            user.getCity(),
                            user.getTimeToContac(),
                            interest.getCreatedAt()
                    );
                })
                .toList();
    }

    private InterestStatusResponse buildStatus(Product product, Long userId) {
        boolean interested = interestRepository.existsByProductIdAndUserId(product.getId(), userId);
        long count = interestRepository.countByProductId(product.getId());
        return new InterestStatusResponse(interested, count, isOwner(product, userId));
    }

    private boolean isOwner(Product product, Long userId) {
        return product.getUser() != null && product.getUser().getId().equals(userId);
    }
}
