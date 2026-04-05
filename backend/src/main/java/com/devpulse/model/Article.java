package com.devpulse.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
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

    private String title;
    private String subtitle;
    private String body;
    private String tags;
    private String emoji;

    @Builder.Default
    private boolean draft = false;

    @Builder.Default
    private int likes = 0;

    @Builder.Default
    private boolean liked = false;

    @Builder.Default
    private boolean bookmarked = false;

    @Builder.Default
    private long reads = 0;

    @Builder.Default
    private List<Comment> comments = new ArrayList<>();

    @Builder.Default
    private Instant createdAt = Instant.now();

    @Builder.Default
    private Instant updatedAt = Instant.now();

    // ── Inner class for embedded comments ──
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Comment {
        @Builder.Default
        private String name = "Santosh Kumar Giri";
        @Builder.Default
        private String initials = "SK";
        private String text;
        @Builder.Default
        private Instant ts = Instant.now();
    }
}
