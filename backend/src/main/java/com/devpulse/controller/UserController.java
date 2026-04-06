package com.devpulse.controller;

import com.devpulse.dto.UserDto;
import com.devpulse.model.Article;
import com.devpulse.service.ArticleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private ArticleService articleService;

    @GetMapping("/{id}/public")
    public ResponseEntity<UserDto> getPublicProfile(@PathVariable String id) {
        String name = generateDisplayName(id);
        String initials = generateInitials(id);
        String role = id.equalsIgnoreCase("admin") ? "ADMIN" : "AUTHOR";
        String joinedAt = Instant.now().minusSeconds(60L * 60 * 24 * 180).toString();

        UserDto profile = new UserDto(id, name, "", initials, role, joinedAt);
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/{id}/articles")
    public ResponseEntity<List<Article>> getAuthorArticles(@PathVariable String id) {
        return ResponseEntity.ok(articleService.getPublishedByAuthor(id));
    }

    private String generateDisplayName(String id) {
        if (id == null || id.isBlank()) {
            return "Author";
        }
        if (id.equalsIgnoreCase("admin")) {
            return "Admin";
        }
        String[] parts = id.split("[^A-Za-z0-9]+");
        if (parts.length == 0) {
            return capitalize(id);
        }
        return java.util.Arrays.stream(parts)
                .filter(p -> !p.isBlank())
                .map(this::capitalize)
                .collect(Collectors.joining(" "));
    }

    private String generateInitials(String id) {
        if (id == null || id.isBlank()) {
            return "A";
        }
        String[] parts = id.split("[^A-Za-z0-9]+|");
        return java.util.Arrays.stream(parts)
                .filter(p -> !p.isBlank())
                .map(p -> p.substring(0, 1).toUpperCase(Locale.ENGLISH))
                .limit(2)
                .collect(Collectors.joining());
    }

    private String capitalize(String text) {
        if (text == null || text.isBlank()) {
            return "";
        }
        String lower = text.toLowerCase(Locale.ENGLISH);
        return Character.toUpperCase(lower.charAt(0)) + lower.substring(1);
    }
}
