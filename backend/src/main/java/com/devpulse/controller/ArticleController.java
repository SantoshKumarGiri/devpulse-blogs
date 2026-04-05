package com.devpulse.controller;

import com.devpulse.dto.ArticleDto;
import com.devpulse.dto.CommentDto;
import com.devpulse.model.Article;
import com.devpulse.service.ArticleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/articles")
public class ArticleController {

    @Autowired
    private ArticleService articleService;

    // GET /api/articles — all published (public)
    @GetMapping
    public ResponseEntity<List<Article>> getAllPublished() {
        return ResponseEntity.ok(articleService.getAllPublished());
    }

    // GET /api/articles/drafts — all drafts (protected)
    @GetMapping("/drafts")
    public ResponseEntity<List<Article>> getDrafts() {
        return ResponseEntity.ok(articleService.getAllDrafts());
    }

    // GET /api/articles/bookmarks — bookmarked (protected)
    @GetMapping("/bookmarks")
    public ResponseEntity<List<Article>> getBookmarked() {
        return ResponseEntity.ok(articleService.getBookmarked());
    }

    // GET /api/articles/search?q=kubernetes
    @GetMapping("/search")
    public ResponseEntity<List<Article>> search(@RequestParam String q) {
        return ResponseEntity.ok(articleService.search(q));
    }

    // GET /api/articles/:id
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        return articleService.getById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/articles (protected)
    @PostMapping
    public ResponseEntity<Article> create(@RequestBody ArticleDto dto) {
        return ResponseEntity.status(201).body(articleService.create(dto));
    }

    // PUT /api/articles/:id (protected)
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody ArticleDto dto) {
        return articleService.update(id, dto)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE /api/articles/:id (protected)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        if (articleService.delete(id)) {
            return ResponseEntity.ok(Map.of("ok", true));
        }
        return ResponseEntity.notFound().build();
    }

    // PATCH /api/articles/:id/read (public)
    @PatchMapping("/{id}/read")
    public ResponseEntity<?> incrementRead(@PathVariable String id) {
        return articleService.incrementReads(id)
                .<ResponseEntity<?>>map(a -> ResponseEntity.ok(Map.of("reads", a.getReads())))
                .orElse(ResponseEntity.notFound().build());
    }

    // PATCH /api/articles/:id/like (protected)
    @PatchMapping("/{id}/like")
    public ResponseEntity<?> toggleLike(@PathVariable String id) {
        return articleService.toggleLike(id)
                .<ResponseEntity<?>>map(a -> ResponseEntity.ok(
                        Map.of("liked", a.isLiked(), "likes", a.getLikes())))
                .orElse(ResponseEntity.notFound().build());
    }

    // PATCH /api/articles/:id/bookmark (protected)
    @PatchMapping("/{id}/bookmark")
    public ResponseEntity<?> toggleBookmark(@PathVariable String id) {
        return articleService.toggleBookmark(id)
                .<ResponseEntity<?>>map(a -> ResponseEntity.ok(
                        Map.of("bookmarked", a.isBookmarked())))
                .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/articles/:id/comments (protected)
    @PostMapping("/{id}/comments")
    public ResponseEntity<?> addComment(@PathVariable String id,
                                         @RequestBody CommentDto dto) {
        return articleService.addComment(id, dto)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // GET / health check
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of("status", "DevPulse API running 🚀"));
    }
}
