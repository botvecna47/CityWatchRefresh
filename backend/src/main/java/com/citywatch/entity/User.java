package com.citywatch.entity;

import com.citywatch.enums.Role;
import com.citywatch.enums.TrustLevel;
import com.citywatch.enums.UserStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_user_email", columnList = "email"),
    @Index(name = "idx_user_username", columnList = "username"),
    @Index(name = "idx_user_role", columnList = "role"),
    @Index(name = "idx_user_status", columnList = "status")
})
public class User {
    public User() {}

    @Id
    @Column(name = "id", length = 12, updatable = false, nullable = false)
    private String id;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String password;

    @Column(unique = true, length = 15)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(name = "trust_level", length = 20)
    private TrustLevel trustLevel = TrustLevel.NORMAL;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private UserStatus status = UserStatus.ACTIVE;

    @Column(name = "strike_count")
    private Integer strikeCount = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "area_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Area area;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(name = "state_code", length = 2)
    private String stateCode;

    @Column(name = "rto_code", length = 2)
    private String rtoCode;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private UserSettings settings;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public TrustLevel getTrustLevel() { return trustLevel; }
    public void setTrustLevel(TrustLevel trustLevel) { this.trustLevel = trustLevel; }
    public UserStatus getStatus() { return status; }
    public void setStatus(UserStatus status) { this.status = status; }
    public Integer getStrikeCount() { return strikeCount; }
    public void setStrikeCount(Integer strikeCount) { this.strikeCount = strikeCount; }
    public Area getArea() { return area; }
    public void setArea(Area area) { this.area = area; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getStateCode() { return stateCode; }
    public void setStateCode(String stateCode) { this.stateCode = stateCode; }
    public String getRtoCode() { return rtoCode; }
    public void setRtoCode(String rtoCode) { this.rtoCode = rtoCode; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public UserSettings getSettings() { return settings; }
    public void setSettings(UserSettings settings) { this.settings = settings; }

    public static UserBuilder builder() { return new UserBuilder(); }
    public static class UserBuilder {
        private User u = new User();
        public UserBuilder id(String id) { u.setId(id); return this; }
        public UserBuilder username(String username) { u.setUsername(username); return this; }
        public UserBuilder email(String email) { u.setEmail(email); return this; }
        public UserBuilder password(String password) { u.setPassword(password); return this; }
        public UserBuilder role(Role role) { u.setRole(role); return this; }
        public UserBuilder city(String city) { u.setCity(city); return this; }
        public UserBuilder stateCode(String stateCode) { u.setStateCode(stateCode); return this; }
        public UserBuilder rtoCode(String rtoCode) { u.setRtoCode(rtoCode); return this; }
        public UserBuilder area(Area area) { u.setArea(area); return this; }
        public User build() { return u; }
    }
}
