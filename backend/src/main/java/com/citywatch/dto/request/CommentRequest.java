package com.citywatch.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CommentRequest {

    @NotBlank(message = "Comment content cannot be empty")
    private String content;

    private Long parentId; // null for top-level, set for a reply
}
