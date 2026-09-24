package com.example.intervialion.controller;

import com.example.intervialion.model.User;
import com.example.intervialion.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/user")
@CrossOrigin
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/GetUsers")
    public ResponseEntity<List<User>> getUsers() {
        List<User> users = userService.getAllUsers();
        if (users.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @GetMapping("/userById/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User c = userService.getUserById(id);
        if (c == null) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(c, HttpStatus.OK);
    }

    @PostMapping("/addUser")
    public ResponseEntity<User> addUser(@RequestBody User user) {
        User c = userService.addUser(user);
        return new ResponseEntity<>(c, HttpStatus.CREATED);
    }

    @DeleteMapping("/deleteUser/{id}")
    public ResponseEntity deleteUser(@PathVariable Long id) {
        User c = userService.getUserById(id);
        if (c == null) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
        userService.delete(c);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping("/updateUser/{id}")
    public ResponseEntity<User> updateUser(@RequestBody User user, @PathVariable Long id) {
        User c = userService.getUserById(id);
        if (c == null) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
        if (user.getId() != id) {
            return new ResponseEntity<>(HttpStatus.CONFLICT);
        }
        c = userService.save(user);
        return new ResponseEntity<>(c, HttpStatus.CREATED);
    }

    @PostMapping("/RegisterUser")
    public ResponseEntity<String> registerUser(@RequestBody User user) {
        // Duplicate-username failures surface as InvalidRequestException and are
        // turned into the same 400 + message response by GlobalExceptionHandler.
        userService.registerUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body("User registered successfully");
    }

    @PostMapping("/Login")
    public ResponseEntity<User> loginUser(@RequestParam String username) {
        User user = userService.findByUsername(username);
        if (user != null) {
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
}
