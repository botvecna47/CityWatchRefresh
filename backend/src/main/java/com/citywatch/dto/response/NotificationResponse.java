package com.citywatch.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {

    private Long id;
    private String title;
    private String message;
    private String type;
    private boolean isRead;
    private String link;
    private LocalDateTime createdAt;
}
