package com.citywatch.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MessageResponse {
    private String id;
    private String senderId;
    private String senderName;
    private String senderRole;
    private String content;
    private LocalDateTime createdAt;
}
