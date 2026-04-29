package com.citywatch.dto.request;

import lombok.Data;

public class UserSettingsRequest {
    private Boolean emailNotifications;
    private Boolean smsNotifications;
    private String theme;

    public Boolean getEmailNotifications() { return emailNotifications; }
    public void setEmailNotifications(Boolean emailNotifications) { this.emailNotifications = emailNotifications; }
    public Boolean getSmsNotifications() { return smsNotifications; }
    public void setSmsNotifications(Boolean smsNotifications) { this.smsNotifications = smsNotifications; }
    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }
}
