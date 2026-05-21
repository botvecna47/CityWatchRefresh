package com.citywatch.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AuditLogResponse {
    private String id;
    private String action;
    private String entityType;
    private String entityId;
    private String oldValue;
    private String newValue;
    private LocalDateTime timestamp;
    private AdminInfo user;

    @Data
    @Builder
    public static class AdminInfo {
        private String id;
        private String username;
    }
}
