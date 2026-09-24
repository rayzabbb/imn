package com.example.intervialion.repository;

import com.example.intervialion.model.Interest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InterestRepository extends JpaRepository<Interest, Long> {

    boolean existsByProductIdAndUserId(Long productId, Long userId);

    Optional<Interest> findByProductIdAndUserId(Long productId, Long userId);

    long countByProductId(Long productId);

    void deleteByProductId(Long productId);

    void deleteByUserId(Long userId);

    List<Interest> findByProductIdOrderByCreatedAtAsc(Long productId);
}
