package com.citywatch.util;

import com.citywatch.dto.response.ComplaintResponse;
import com.citywatch.entity.Complaint;
import org.springframework.stereotype.Component;

import java.util.HashSet;

@Component
public class ComplaintMapper {

    public ComplaintResponse toResponse(Complaint c) {
        String locText = c.getArea() != null
                ? c.getArea().getName() + ", Nanded"
                : String.format("%.4f, %.4f", c.getLatitude(), c.getLongitude());
                
        return ComplaintResponse.builder()
                .id(c.getId())
                .category(c.getCategory() != null ? c.getCategory().getName() : "OTHER")
                .title(c.getTitle())
                .description(c.getDescription())
                .imageUrls(c.getImageUrls())
                .locationText(locText)
                .status(c.getStatus().name())
                .priority(c.getPriority() != null ? c.getPriority().name() : "LOW")
                .latitude(c.getLatitude())
                .longitude(c.getLongitude())
                .intensityScore(c.getIntensityScore())
                .areaId(c.getArea() != null ? c.getArea().getId() : null)
                .areaName(c.getArea() != null ? c.getArea().getName() : null)
                .citizenId(c.getCitizen() != null ? c.getCitizen().getId() : null)
                .citizenName(c.getCitizen() != null ? c.getCitizen().getUsername() : null)
                .coordinatorId(c.getAssignedCoordinator() != null ? c.getAssignedCoordinator().getId() : null)
                .coordinatorName(c.getAssignedCoordinator() != null ? c.getAssignedCoordinator().getUsername() : null)
                .escalationLevel(c.getEscalationLevel())
                .reopenCount(c.getReopenCount())
                .upvotes(c.getUpvotedCitizenIds() != null ? c.getUpvotedCitizenIds().size() : 0)
                .upvotedCitizenIds(c.getUpvotedCitizenIds() != null ? c.getUpvotedCitizenIds() : new HashSet<>())
                .createdAt(c.getCreatedAt())
                .slaDeadline(c.getSlaDeadline())
                .closedAt(c.getClosedAt())
                .build();
    }
}
