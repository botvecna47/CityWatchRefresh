package com.citywatch.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintResponse {

    private String id;           // CMP-DDMMYY-000001
    private String category;
    private String title;
    private String description;
    private List<String> imageUrls;
    private String locationText;
    private String status;
    private String priority;
    private String resolutionImageUrl; // Proof of work
    private String resolutionPdfUrl;
    private Double latitude;
    private Double longitude;
    private Double intensityScore;
    private Long areaId;         // areas table keeps Long PK
    private String areaName;
    private String citizenId;    // GJ05C0000001
    private String citizenName;
    private String coordinatorId; // GJ05M0000001 or null
    private String coordinatorName;
    private int upvotes;
    private int downvotes;
    private java.util.Set<String> upvotedCitizenIds; // who has upvoted
    private int escalationLevel;
    private int reopenCount;
    private int commentCount;
    private LocalDateTime createdAt;
    private LocalDateTime slaDeadline;
    private LocalDateTime closedAt;
}
