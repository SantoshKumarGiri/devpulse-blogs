package com.devpulse.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "articles")
public class Article {

    @Id
    private String id;

    // ── Content ──────────────────────────────────────────────
    private String title;
    private String subtitle;

    // body is stored exactly as the user typed — no encoding/stripping
    private String body;

    private String tags;
    private String emoji;

    // ── Cover image ──────────────────────────────────────────
    // Optional: either a base64 data URL, a Cloudinary URL, or any HTTPS image URL
    // If set, displayed instead of emoji on the article page
    private String coverImageUrl;

    // ── Author ───────────────────────────────────────────────
    private String authorId;
    private String authorName;
    private String authorInitials;

    // ── Status ───────────────────────────────────────────────
    @Builder.Default
    private boolean draft = false;

    // ── Engagement ───────────────────────────────────────────
    @Builder.Default private int     likes      = 0;
    @Builder.Default private boolean liked      = false;
    @Builder.Default private boolean bookmarked = false;
    @Builder.Default private long    reads      = 0;

    @Builder.Default
    private List<Comment> comments = new ArrayList<>();

    // ── Timestamps ───────────────────────────────────────────
    @Builder.Default private Instant createdAt = Instant.now();
    @Builder.Default private Instant updatedAt = Instant.now();

    // ── Embedded comment ─────────────────────────────────────
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Comment {
        private String  authorId;
        @Builder.Default private String  name     = "Anonymous";
        @Builder.Default private String  initials = "?";
        private String  text;
        @Builder.Default private Instant ts = Instant.now();
    }
}
