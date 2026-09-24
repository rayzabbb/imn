package com.example.intervialion.repository;

import com.example.intervialion.model.Interest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InterestRepository extends JpaRepository<Interest, Long> {

    boolean existsByProductIdAndUserId(Long productId, Long userId);

    Optional<Interest> findByProductIdAndUserId(Long productId, Long userId);

    long countByProductId(Long productId);

    void deleteByProductId(Long productId);
}
