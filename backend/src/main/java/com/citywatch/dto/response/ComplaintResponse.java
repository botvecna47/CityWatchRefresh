package com.citywatch.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public class ComplaintResponse {

    private String id;           // CMP-DDMMYY-000001
    private String category;
    private String description;
    private List<String> imageUrls;
    private String locationText;
    private String status;
    private String priority;
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
    private int escalationLevel;
    private int reopenCount;
    private LocalDateTime createdAt;
    private LocalDateTime slaDeadline;
    private LocalDateTime closedAt;

    public ComplaintResponse() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }

    public String getLocationText() { return locationText; }
    public void setLocationText(String locationText) { this.locationText = locationText; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Double getIntensityScore() { return intensityScore; }
    public void setIntensityScore(Double intensityScore) { this.intensityScore = intensityScore; }

    public Long getAreaId() { return areaId; }
    public void setAreaId(Long areaId) { this.areaId = areaId; }

    public String getAreaName() { return areaName; }
    public void setAreaName(String areaName) { this.areaName = areaName; }

    public String getCitizenId() { return citizenId; }
    public void setCitizenId(String citizenId) { this.citizenId = citizenId; }

    public String getCitizenName() { return citizenName; }
    public void setCitizenName(String citizenName) { this.citizenName = citizenName; }

    public String getCoordinatorId() { return coordinatorId; }
    public void setCoordinatorId(String coordinatorId) { this.coordinatorId = coordinatorId; }

    public String getCoordinatorName() { return coordinatorName; }
    public void setCoordinatorName(String coordinatorName) { this.coordinatorName = coordinatorName; }

    public int getUpvotes() { return upvotes; }
    public void setUpvotes(int upvotes) { this.upvotes = upvotes; }

    public int getDownvotes() { return downvotes; }
    public void setDownvotes(int downvotes) { this.downvotes = downvotes; }

    public int getEscalationLevel() { return escalationLevel; }
    public void setEscalationLevel(int escalationLevel) { this.escalationLevel = escalationLevel; }

    public int getReopenCount() { return reopenCount; }
    public void setReopenCount(int reopenCount) { this.reopenCount = reopenCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getSlaDeadline() { return slaDeadline; }
    public void setSlaDeadline(LocalDateTime slaDeadline) { this.slaDeadline = slaDeadline; }

    public LocalDateTime getClosedAt() { return closedAt; }
    public void setClosedAt(LocalDateTime closedAt) { this.closedAt = closedAt; }

    public static ComplaintResponseBuilder builder() { return new ComplaintResponseBuilder(); }

    public static class ComplaintResponseBuilder {
        private ComplaintResponse c = new ComplaintResponse();
        public ComplaintResponseBuilder id(String id) { c.setId(id); return this; }
        public ComplaintResponseBuilder category(String category) { c.setCategory(category); return this; }
        public ComplaintResponseBuilder description(String description) { c.setDescription(description); return this; }
        public ComplaintResponseBuilder imageUrls(List<String> imageUrls) { c.setImageUrls(imageUrls); return this; }
        public ComplaintResponseBuilder locationText(String locationText) { c.setLocationText(locationText); return this; }
        public ComplaintResponseBuilder status(String status) { c.setStatus(status); return this; }
        public ComplaintResponseBuilder priority(String priority) { c.setPriority(priority); return this; }
        public ComplaintResponseBuilder latitude(Double latitude) { c.setLatitude(latitude); return this; }
        public ComplaintResponseBuilder longitude(Double longitude) { c.setLongitude(longitude); return this; }
        public ComplaintResponseBuilder intensityScore(Double intensityScore) { c.setIntensityScore(intensityScore); return this; }
        public ComplaintResponseBuilder areaId(Long areaId) { c.setAreaId(areaId); return this; }
        public ComplaintResponseBuilder areaName(String areaName) { c.setAreaName(areaName); return this; }
        public ComplaintResponseBuilder citizenId(String citizenId) { c.setCitizenId(citizenId); return this; }
        public ComplaintResponseBuilder citizenName(String citizenName) { c.setCitizenName(citizenName); return this; }
        public ComplaintResponseBuilder coordinatorId(String coordinatorId) { c.setCoordinatorId(coordinatorId); return this; }
        public ComplaintResponseBuilder coordinatorName(String coordinatorName) { c.setCoordinatorName(coordinatorName); return this; }
        public ComplaintResponseBuilder upvotes(int upvotes) { c.setUpvotes(upvotes); return this; }
        public ComplaintResponseBuilder downvotes(int downvotes) { c.setDownvotes(downvotes); return this; }
        public ComplaintResponseBuilder escalationLevel(int escalationLevel) { c.setEscalationLevel(escalationLevel); return this; }
        public ComplaintResponseBuilder reopenCount(int reopenCount) { c.setReopenCount(reopenCount); return this; }
        public ComplaintResponseBuilder createdAt(LocalDateTime createdAt) { c.setCreatedAt(createdAt); return this; }
        public ComplaintResponseBuilder slaDeadline(LocalDateTime slaDeadline) { c.setSlaDeadline(slaDeadline); return this; }
        public ComplaintResponseBuilder closedAt(LocalDateTime closedAt) { c.setClosedAt(closedAt); return this; }
        public ComplaintResponse build() { return c; }
    }
}
