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
     * Rejects a duplicate username, otherwise persists the new user.
     * Scans all users exactly as the controller did before the refactor.
     */
    public void registerUser(User user) {
        List<User> users = userRepository.findAll();
        for (User existingUser : users) {
            if (existingUser.getUsername().equals(user.getUsername())) {
                throw new InvalidRequestException("Username already exists");
            }
        }
        userRepository.save(user);
    }

    /**
     * Returns the user with this username, or null when none matches.
     * Linear scan, preserved from the original controller implementation.
     */
    public User findByUsername(String username) {
        List<User> users = userRepository.findAll();
        for (User user : users) {
            if (user.getUsername().equals(username)) {
                return user;
            }
        }
        return null;
    }
}
