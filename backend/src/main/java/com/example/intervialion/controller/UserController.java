package com.example.intervialion.controller;

import com.example.intervialion.dto.AuthResponse;
import com.example.intervialion.dto.LoginRequest;
import com.example.intervialion.dto.UserResponse;
import com.example.intervialion.model.User;
import com.example.intervialion.security.JwtService;
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
    private final JwtService jwtService;

    public UserController(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    // Everything below (other than RegisterUser/Login, permitAll'd in
    // SecurityConfig) now requires a valid Bearer token just to be reached at
    // all - see SecurityConfig's authorizeHttpRequests rules.

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
    public ResponseEntity<AuthResponse> registerUser(@RequestBody User user) {
        // Duplicate-username failures surface as InvalidRequestException and are
        // turned into the same 400 + message response by GlobalExceptionHandler.
        User saved = userService.registerUser(user);
        String token = jwtService.generateToken(saved);
        return ResponseEntity.status(HttpStatus.CREATED).body(new AuthResponse(token, UserResponse.from(saved)));
    }

    @PostMapping("/Login")
    public ResponseEntity<AuthResponse> loginUser(@RequestBody LoginRequest request) {
        User user = userService.login(request.username(), request.password());
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(new AuthResponse(token, UserResponse.from(user)));
    }
}
