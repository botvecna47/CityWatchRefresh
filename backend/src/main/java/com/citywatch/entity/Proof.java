package com.citywatch.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "proofs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Proof {

    /**
     * 17-char ID: PRF-{DDMMYY}-{6-digit-seq}
     * Example: PRF-090426-000001
     */
    @Id
    @Column(name = "id", length = 17, updatable = false, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Complaint complaint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coordinator_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User coordinator;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "pdf_url")
    private String pdfUrl;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(name = "distance_from_complaint")
    private Double distanceFromComplaint;

    @Builder.Default
    @Column(name = "is_location_valid")
    private Boolean isLocationValid = false;

    @CreationTimestamp
    @Column(name = "submitted_at", updatable = false)
    private LocalDateTime submittedAt;
}
