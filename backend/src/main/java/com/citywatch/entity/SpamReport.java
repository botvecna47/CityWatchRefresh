package com.citywatch.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "spam_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpamReport {

    @Id
    @Column(length = 17, updatable = false, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User reporter;

    @Column(name = "reporter_name", nullable = false, length = 100)
    private String reporterName;

    @Column(name = "target_type", nullable = false, length = 20)
    private String targetType; // USER, REPORT, COMMENT

    @Column(name = "target_id", nullable = false, length = 17)
    private String targetId;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String reason;

    @Column(length = 20)
    @Builder.Default
    private String status = "PENDING"; // PENDING, RESOLVED, DISMISSED

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
