package com.devpulse.service;

import com.devpulse.dto.ArticleDto;
import com.devpulse.dto.CommentDto;
import com.devpulse.model.Article;
import com.devpulse.repository.ArticleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class ArticleService {

    @Autowired
    private ArticleRepository articleRepository;

    // ── READ ──────────────────────────────────────────────────
    public List<Article> getAllPublished() {
        return articleRepository.findByDraftFalseOrderByCreatedAtDesc();
    }

    public List<Article> getAllDrafts() {
        return articleRepository.findByDraftTrueOrderByCreatedAtDesc();
    }

    public Optional<Article> getById(String id) {
        return articleRepository.findById(id);
    }

    public List<Article> search(String query) {
        return articleRepository.searchPublished(query);
    }

    public List<Article> getPublishedByAuthor(String authorId) {
        return articleRepository.findByDraftFalseAndAuthorIdOrderByCreatedAtDesc(authorId);
    }

    public List<Article> getBookmarked() {
        return articleRepository.findByDraftFalseAndBookmarkedTrueOrderByCreatedAtDesc();
    }

    // ── CREATE ────────────────────────────────────────────────
    public Article create(ArticleDto dto) {
        Article article = Article.builder()
                .title(dto.getTitle())
                .subtitle(dto.getSubtitle())
                .body(dto.getBody())
                .tags(dto.getTags())
                .emoji(dto.getEmoji() != null ? dto.getEmoji() : "📝")
                .coverImageUrl(dto.getCoverImageUrl())
                .draft(dto.isDraft())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        return articleRepository.save(article);
    }

    // ── UPDATE ────────────────────────────────────────────────
    public Optional<Article> update(String id, ArticleDto dto) {
        return articleRepository.findById(id).map(existing -> {
            existing.setTitle(dto.getTitle());
            existing.setSubtitle(dto.getSubtitle());
            existing.setBody(dto.getBody());
            existing.setTags(dto.getTags());
            if (dto.getEmoji() != null) existing.setEmoji(dto.getEmoji());
            if (dto.getCoverImageUrl() != null) existing.setCoverImageUrl(dto.getCoverImageUrl());
            existing.setDraft(dto.isDraft());
            existing.setUpdatedAt(Instant.now());
            return articleRepository.save(existing);
        });
    }

    // ── DELETE ────────────────────────────────────────────────
    public boolean delete(String id) {
        if (!articleRepository.existsById(id)) return false;
        articleRepository.deleteById(id);
        return true;
    }

    // ── INCREMENT READS ───────────────────────────────────────
    public Optional<Article> incrementReads(String id) {
        return articleRepository.findById(id).map(a -> {
            a.setReads(a.getReads() + 1);
            return articleRepository.save(a);
        });
    }

    // ── TOGGLE LIKE ───────────────────────────────────────────
    public Optional<Article> toggleLike(String id) {
        return articleRepository.findById(id).map(a -> {
            a.setLiked(!a.isLiked());
            a.setLikes(Math.max(0, a.getLikes() + (a.isLiked() ? 1 : -1)));
            return articleRepository.save(a);
        });
    }

    // ── TOGGLE BOOKMARK ───────────────────────────────────────
    public Optional<Article> toggleBookmark(String id) {
        return articleRepository.findById(id).map(a -> {
            a.setBookmarked(!a.isBookmarked());
            return articleRepository.save(a);
        });
    }

    // ── ADD COMMENT ───────────────────────────────────────────
    public Optional<Article> addComment(String id, CommentDto dto) {
        return articleRepository.findById(id).map(a -> {
            Article.Comment comment = Article.Comment.builder()
                    .text(dto.getText())
                    .ts(Instant.now())
                    .build();
            a.getComments().add(comment);
            return articleRepository.save(a);
        });
    }
}
