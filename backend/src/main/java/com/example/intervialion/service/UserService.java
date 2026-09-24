package com.example.intervialion.service;

import com.example.intervialion.exception.InvalidRequestException;
import com.example.intervialion.model.User;
import com.example.intervialion.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
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

    public void delete(User user) {
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
