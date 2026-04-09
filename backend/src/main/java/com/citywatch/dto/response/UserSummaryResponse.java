package com.citywatch.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserSummaryResponse {

    private String id;
    private String username;
    private String email;
    private String role;
    private String status;
    private String trustLevel;
    private String areaName;
    private String city;
    private int strikeCount;
    private LocalDateTime createdAt;
}
