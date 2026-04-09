package com.citywatch.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CommentResponse {

    private String id;           // CMT-DDMMYY-000001
    private String complaintId;  // CMP-DDMMYY-000001
    private String authorId;     // GJ05C0000001
    private String authorName;
    private String authorRole;
    private String content;
    private String parentId;     // CMT-DDMMYY-000001 or null
    private LocalDateTime createdAt;
}
