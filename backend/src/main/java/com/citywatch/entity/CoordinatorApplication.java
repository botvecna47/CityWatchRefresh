package com.citywatch.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "coordinator_applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoordinatorApplication {

    @Id
    @Column(length = 17, updatable = false, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    /** Expose only the user ID (not the full entity) in JSON responses. */
    @JsonProperty("userId")
    public String getUserId() { return user != null ? user.getId() : null; }

    @Column(name = "user_name", nullable = false, length = 100)
    private String userName;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String address;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String experience;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(length = 20)
    @Builder.Default
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
