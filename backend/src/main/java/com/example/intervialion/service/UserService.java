package com.example.intervialion.service;

import com.example.intervialion.exception.InvalidRequestException;
import com.example.intervialion.model.Product;
import com.example.intervialion.model.User;
import com.example.intervialion.repository.InterestRepository;
import com.example.intervialion.repository.ProductRepository;
import com.example.intervialion.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final InterestRepository interestRepository;
    private final ProductRepository productRepository;

    public UserService(UserRepository userRepository,
                        InterestRepository interestRepository,
                        ProductRepository productRepository) {
        this.userRepository = userRepository;
        this.interestRepository = interestRepository;
        this.productRepository = productRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public User addUser(User user) {
        return userRepository.save(user);
    }

    /**
     * Deletes a user. Two FK relations point at User with no cascade of their
     * own and are cleared first:
     * - interests this user expressed on others' products,
     * - interests on products THIS user owns: User.products already cascades
     *   (CascadeType.ALL) to delete those products, but that Hibernate-level
     *   cascade happens outside ProductService.deleteProduct, so it would hit
     *   the same interests FK that method guards against - it has to be
     *   handled here too.
     */
    @Transactional
    public void delete(User user) {
        interestRepository.deleteByUserId(user.getId());
        for (Product owned : productRepository.findByUserId(user.getId())) {
            interestRepository.deleteByProductId(owned.getId());
        }
        userRepository.delete(user);
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    /**
     * Rejects a duplicate username, otherwise persists the new user and
     * returns it (so the caller gets the generated id back).
     */
    public User registerUser(User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new InvalidRequestException("Username already exists");
        }
        return userRepository.save(user);
    }

    /**
     * Verifies credentials and returns the matching user, or null when the
     * username is unknown or the password doesn't match.
     */
    public User login(String username, String password) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null || user.getPassword() == null || !user.getPassword().equals(password)) {
            return null;
        }
        return user;
    }
}
