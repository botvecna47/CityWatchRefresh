package com.citywatch.entity;

import com.citywatch.enums.EscalationReason;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "escalations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Escalation {

    /**
     * 17-char ID: ESC-{DDMMYY}-{6-digit-seq}
     * Example: ESC-090426-000001
     */
    @Id
    @Column(name = "id", length = 17, updatable = false, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @Column(nullable = false)
    private Integer level;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private EscalationReason reason;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "is_resolved")
    private Boolean isResolved = false;

    @CreationTimestamp
    @Column(name = "triggered_at", updatable = false)
    private LocalDateTime triggeredAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
}
