package com.citywatch.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

public class SpamReportRequest {
 
    @NotBlank(message = "Target type is required")
    private String targetType;
 
    @NotBlank(message = "Target ID is required")
    private String targetId;
 
    @NotBlank(message = "Reason is required")
    private String reason;

    public String getTargetType() { return targetType; }
    public void setTargetType(String targetType) { this.targetType = targetType; }
    public String getTargetId() { return targetId; }
    public void setTargetId(String targetId) { this.targetId = targetId; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
