package com.citywatch.entity;

import com.citywatch.enums.NotificationType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    /**
     * 17-char ID: NTF-{DDMMYY}-{6-digit-seq}
     * Example: NTF-090426-000001
     */
    @Id
    @Column(name = "id", length = 17, updatable = false, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private NotificationType type;

    /**
     * Loose reference to a complaint or escalation ID (VARCHAR, no FK).
     * Use `type` to determine what entity this points to.
     * Example: "CMP-090426-000001"
     */
    @Column(name = "reference_id", length = 17)
    private String referenceId;

    @Builder.Default
    @Column(name = "is_read")
    private Boolean isRead = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
