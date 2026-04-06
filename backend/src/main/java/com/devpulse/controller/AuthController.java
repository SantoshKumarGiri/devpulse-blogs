package com.devpulse.controller;

import com.devpulse.dto.AuthDto;
import com.devpulse.model.User;
import com.devpulse.security.JwtUtil;
import com.devpulse.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Value("${app.admin.email:admin@devpulse.com}")
    private String adminEmail;

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthDto.LoginRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password is required"));
        }

        String email = request.getEmail().toLowerCase();
        if (email.equalsIgnoreCase(adminEmail)) {
            if (!adminPassword.equals(request.getPassword())) {
                return ResponseEntity.status(401).body(Map.of("error", "Wrong email or password"));
            }
            String token = jwtUtil.generateToken(adminEmail, "ADMIN");
            return ResponseEntity.ok(new AuthDto.LoginResponse(token, "Login successful"));
        }

        return userService.findByEmail(email)
                .filter(user -> passwordEncoder.matches(request.getPassword(), user.getPasswordHash()))
                .<ResponseEntity<?>>map(user -> ResponseEntity.ok(
                        new AuthDto.LoginResponse(jwtUtil.generateToken(user.getEmail(), user.getRole()), "Login successful")))
                .orElse(ResponseEntity.status(401).body(Map.of("error", "Wrong email or password")));
    }

    // POST /api/auth/register
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthDto.RegisterRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Name is required"));
        }
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password is required"));
        }

        String email = request.getEmail().toLowerCase();
        if (email.equalsIgnoreCase(adminEmail)) {
            return ResponseEntity.status(409).body(Map.of("error", "Cannot register as admin email"));
        }
        if (userService.existsByEmail(email)) {
            return ResponseEntity.status(409).body(Map.of("error", "Email already exists"));
        }

        User user = User.builder()
                .name(request.getName())
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role("AUTHOR")
                .bio(request.getBio())
                .build();

        userService.save(user);
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return ResponseEntity.ok(new AuthDto.LoginResponse(token, "Registration successful"));
    }

    // GET /api/auth/me  — verify token is valid
    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()) {
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            return ResponseEntity.ok(Map.of(
                    "ok", true,
                    "admin", isAdmin,
                    "user", authentication.getName()
            ));
        }
        return ResponseEntity.ok(Map.of("ok", false));
    }
}
