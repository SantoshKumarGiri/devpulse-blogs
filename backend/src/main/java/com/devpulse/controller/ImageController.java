package com.devpulse.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

/**
 * Handles cover image uploads.
 *
 * Strategy A (default, zero-config): encode image as base64 data URL.
 *   Pros: works immediately with no extra accounts.
 *   Cons: base64 images are ~33% larger; fine for a personal blog.
 *
 * Strategy B (production): upload to Cloudinary (free tier: 25GB).
 *   Set CLOUDINARY_URL env var to enable automatically.
 *   Format: cloudinary://api_key:api_secret@cloud_name
 */
@RestController
@RequestMapping("/api/images")
public class ImageController {

    // Optional: set CLOUDINARY_URL env var to enable Cloudinary uploads
    @Value("${CLOUDINARY_URL:}")
    private String cloudinaryUrl;

    /**
     * POST /api/images/upload
     * Accepts multipart image, returns { url: "..." }
     * Protected: AUTHOR or ADMIN only (SecurityConfig handles this)
     */
    @PostMapping("/upload")
    public ResponseEntity<?> upload(@RequestParam("image") MultipartFile file) {

        // Validate
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No file provided"));
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(Map.of("error", "File must be an image"));
        }

        if (file.getSize() > 5 * 1024 * 1024) { // 5MB limit
            return ResponseEntity.badRequest().body(Map.of("error", "Image must be under 5MB"));
        }

        // Strategy B — Cloudinary (if configured)
        if (cloudinaryUrl != null && !cloudinaryUrl.isBlank()) {
            return uploadToCloudinary(file);
        }

        // Strategy A — Base64 data URL (default, no config needed)
        return uploadAsBase64(file);
    }

    private ResponseEntity<?> uploadAsBase64(MultipartFile file) {
        try {
            byte[] bytes = file.getBytes();
            String base64 = Base64.getEncoder().encodeToString(bytes);
            String dataUrl = "data:" + file.getContentType() + ";base64," + base64;
            return ResponseEntity.ok(Map.of("url", dataUrl, "method", "base64"));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to read image: " + e.getMessage()));
        }
    }

    private ResponseEntity<?> uploadToCloudinary(MultipartFile file) {
        // Cloudinary SDK upload
        // Add to pom.xml:
        // <dependency>
        //   <groupId>com.cloudinary</groupId>
        //   <artifactId>cloudinary-http44</artifactId>
        //   <version>1.38.0</version>
        // </dependency>
        //
        // Then replace this comment block with:
        //
        // Cloudinary cloudinary = new Cloudinary(cloudinaryUrl);
        // cloudinary.config.secure = true;
        // try {
        //     Map uploadResult = cloudinary.uploader().upload(
        //         file.getBytes(),
        //         ObjectUtils.asMap("public_id", "devpulse/" + UUID.randomUUID())
        //     );
        //     String url = (String) uploadResult.get("secure_url");
        //     return ResponseEntity.ok(Map.of("url", url, "method", "cloudinary"));
        // } catch (Exception e) {
        //     return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        // }

        return ResponseEntity.status(501).body(
            Map.of("error", "Cloudinary not fully configured — add SDK dependency to pom.xml"));
    }
}
