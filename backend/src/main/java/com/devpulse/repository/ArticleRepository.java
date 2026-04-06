package com.devpulse.repository;

import com.devpulse.model.Article;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArticleRepository extends MongoRepository<Article, String> {

    // All published articles (not drafts), newest first
    List<Article> findByDraftFalseOrderByCreatedAtDesc();

    // All drafts, newest first
    List<Article> findByDraftTrueOrderByCreatedAtDesc();

    // Search in title, body, tags (case-insensitive)
    @Query("{ 'draft': false, $or: [ " +
           "{ 'title': { $regex: ?0, $options: 'i' } }, " +
           "{ 'body':  { $regex: ?0, $options: 'i' } }, " +
           "{ 'tags':  { $regex: ?0, $options: 'i' } } ] }")
    List<Article> searchPublished(String query);

    // Articles by author
    List<Article> findByDraftFalseAndAuthorIdOrderByCreatedAtDesc(String authorId);

    // Bookmarked articles
    List<Article> findByDraftFalseAndBookmarkedTrueOrderByCreatedAtDesc();
}
