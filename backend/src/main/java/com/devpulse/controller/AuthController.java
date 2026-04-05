package com.devpulse.controller;

import com.devpulse.dto.AuthDto;
import com.devpulse.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${app.admin.password}")
    private String adminPassword;

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthDto.LoginRequest request) {
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password is required"));
        }
        if (!adminPassword.equals(request.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("error", "Wrong password"));
        }
        String token = jwtUtil.generateToken();
        return ResponseEntity.ok(new AuthDto.LoginResponse(token, "Login successful"));
    }

    // GET /api/auth/me  — verify token is valid
    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()) {
            return ResponseEntity.ok(Map.of("ok", true, "admin", true, "user", authentication.getName()));
        }
        return ResponseEntity.ok(Map.of("ok", false));
    }
}
