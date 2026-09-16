package com.example.intervialion.controller;

import com.example.intervialion.model.User;
import com.example.intervialion.service.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/user")
@CrossOrigin
public class UserController {

    @Autowired
    private UserRepository userRepository;  // יש לוודא שזו השורה הזו

    @GetMapping("/GetUsers")
    public ResponseEntity<List<User>> getUsers() {
        List<User> users = userRepository.findAll();
        if (users.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @GetMapping("/userById/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User c = userRepository.findById(id).orElse(null);
        if (c == null) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(c, HttpStatus.OK);
    }

    @PostMapping("/addUser")
    public ResponseEntity<User> addUser(@RequestBody User user) {
        User c = userRepository.save(user);
        return new ResponseEntity<>(c, HttpStatus.CREATED);
    }

    @DeleteMapping("/deleteUser/{id}")
    public ResponseEntity deleteUser(@PathVariable Long id) {
        User c = userRepository.findById(id).orElse(null);
        if (c == null) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
        userRepository.delete(c);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping("/updateUser/{id}")
    public ResponseEntity<User> updateUser(@RequestBody User user, @PathVariable Long id) {
        User c = userRepository.findById(id).orElse(null);
        if (c == null) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
        if (user.getId() != id) {
            return new ResponseEntity<>(HttpStatus.CONFLICT);
        }
        c = userRepository.save(user);
        return new ResponseEntity<>(c, HttpStatus.CREATED);
    }

    @PostMapping("/RegisterUser")
    public ResponseEntity<String> registerUser(@RequestBody User user) {
        // בדיקת אם שם המשתמש כבר קיים
        List<User> users = userRepository.findAll();
        for (User existingUser : users) {
            if (existingUser.getUsername().equals(user.getUsername())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username already exists");
            }
        }
        // אם לא נמצא משתמש עם אותו שם משתמש, נשמור את המשתמש החדש
        userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body("User registered successfully");
    }

    @PostMapping("/Login")
    public ResponseEntity<User> loginUser(@RequestParam String username) {
        // חיפוש משתמש לפי שם המשתמש
        List<User> users = userRepository.findAll();
        for (User user : users) {
            if (user.getUsername().equals(username)) {
                return ResponseEntity.ok(user);
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
}

