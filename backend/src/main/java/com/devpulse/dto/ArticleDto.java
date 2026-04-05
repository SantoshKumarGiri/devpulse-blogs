package com.devpulse.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArticleDto {
    private String title;
    private String subtitle;
    private String body;
    private String tags;
    private String emoji;
    private boolean draft;
}
