package com.citywatch.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CommentResponse {

    private Long id;
    private Long complaintId;
    private Long authorId;
    private String authorName;
    private String authorRole;
    private String content;
    private Long parentId;
    private LocalDateTime createdAt;
}
