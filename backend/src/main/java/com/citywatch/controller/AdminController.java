package com.citywatch.controller;

import com.citywatch.dto.response.AuditLogResponse;
import com.citywatch.dto.response.ComplaintResponse;
import com.citywatch.dto.response.UserSummaryResponse;
import com.citywatch.entity.AuditLog;
import com.citywatch.entity.Complaint;
import com.citywatch.entity.Escalation;
import com.citywatch.entity.User;
import com.citywatch.enums.NotificationType;
import com.citywatch.enums.UserStatus;
import com.citywatch.repository.AuditLogRepository;
import com.citywatch.repository.ComplaintRepository;
import com.citywatch.repository.EscalationRepository;
import com.citywatch.repository.UserRepository;
import com.citywatch.security.CustomUserDetails;
import com.citywatch.service.AuditService;
import com.citywatch.service.ComplaintService;
import com.citywatch.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final ComplaintRepository complaintRepository;
    private final EscalationRepository escalationRepository;
    private final ComplaintService complaintService;
    private final NotificationService notificationService;
    private final AuditService auditService;
    private final AuditLogRepository auditLogRepository;

    public AdminController(UserRepository userRepository,
                           ComplaintRepository complaintRepository,
                           EscalationRepository escalationRepository,
                           ComplaintService complaintService,
                           NotificationService notificationService,
                           AuditService auditService,
                           AuditLogRepository auditLogRepository) {
        this.userRepository = userRepository;
        this.complaintRepository = complaintRepository;
        this.escalationRepository = escalationRepository;
        this.complaintService = complaintService;
        this.notificationService = notificationService;
        this.auditService = auditService;
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping("/users")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<org.springframework.data.domain.Page<UserSummaryResponse>> getAllUsers(org.springframework.data.domain.Pageable pageable) {
        return ResponseEntity.ok(
                userRepository.findAll(pageable)
                        .map(this::toUserSummary)
        );
    }

    @PatchMapping("/users/{id}/ban")
    public ResponseEntity<Map<String, String>> banUser(
            @PathVariable String id,
            @AuthenticationPrincipal CustomUserDetails principal) {
        userRepository.findById(id).ifPresent(u -> {
            u.setStatus(UserStatus.SUSPENDED);
            userRepository.save(u);

            // Notify the suspended user
            notificationService.create(
                u,
                "Account Suspended",
                "Your CityWatch account has been suspended by an administrator. If you believe this is an error, please contact support.",
                NotificationType.SYSTEM,
                null
            );

            // Log the action for admin audit trail
            auditService.logAction(
                principal.getUser(),
                "SUSPEND_USER",
                "USER",
                u.getId(),
                "ACTIVE",
                "SUSPENDED"
            );
        });
        return ResponseEntity.ok(Map.of("message", "User suspended"));
    }

    @PatchMapping("/users/{id}/unban")
    public ResponseEntity<Map<String, String>> unbanUser(
            @PathVariable String id,
            @AuthenticationPrincipal CustomUserDetails principal) {
        userRepository.findById(id).ifPresent(u -> {
            u.setStatus(UserStatus.ACTIVE);
            userRepository.save(u);

            // Notify the reinstated user
            notificationService.create(
                u,
                "Account Reinstated",
                "Your CityWatch account suspension has been lifted. You can now log in and use CityWatch again.",
                NotificationType.SYSTEM,
                null
            );

            // Log the action
            auditService.logAction(
                principal.getUser(),
                "REINSTATE_USER",
                "USER",
                u.getId(),
                "SUSPENDED",
                "ACTIVE"
            );
        });
        return ResponseEntity.ok(Map.of("message", "User reinstated"));
    }

    @GetMapping("/complaints")
    public ResponseEntity<org.springframework.data.domain.Page<ComplaintResponse>> getAllComplaints(org.springframework.data.domain.Pageable pageable) {
        return ResponseEntity.ok(complaintService.getAll(pageable));
    }

    @DeleteMapping("/complaints/{id}")
    public ResponseEntity<Map<String, String>> deleteComplaint(
            @PathVariable String id,
            @AuthenticationPrincipal CustomUserDetails principal) {
        complaintRepository.findById(id).ifPresent(c -> {
            c.setDeleted(true);
            complaintRepository.save(c);

            // Notify the report author
            if (c.getCitizen() != null) {
                notificationService.create(
                    c.getCitizen(),
                    "Your Report Was Removed",
                    "Your report \"" + (c.getTitle() != null ? c.getTitle() : "Reported Issue") + "\" has been removed by an administrator for not meeting community guidelines.",
                    NotificationType.SYSTEM,
                    null
                );
            }

            // Log the deletion
            auditService.logAction(
                principal.getUser(),
                "DELETE_REPORT",
                "COMPLAINT",
                c.getId(),
                c.getStatus() != null ? c.getStatus().name() : "UNKNOWN",
                "DELETED"
            );
        });
        return ResponseEntity.ok(Map.of("message", "Report soft-deleted"));
    }

    @GetMapping("/escalations")
    public ResponseEntity<List<Escalation>> getAllEscalations() {
        return ResponseEntity.ok(escalationRepository.findAll());
    }

    @PostMapping("/broadcast")
    public ResponseEntity<Map<String, String>> broadcast(@RequestBody Map<String, String> payload) {
        String title   = payload.getOrDefault("title", "System Broadcast");
        String message = payload.get("message");
        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Message cannot be empty"));
        }

        userRepository.findAll().forEach(user ->
            notificationService.create(user, title, message, NotificationType.SYSTEM, null)
        );

        return ResponseEntity.ok(Map.of("message", "Broadcast sent to all users"));
    }

    @PostMapping("/seed-notifications")
    public ResponseEntity<Map<String, String>> seedNotifications(@AuthenticationPrincipal CustomUserDetails principal) {
        for (int i = 1; i <= 10; i++) {
            notificationService.create(
                principal.getUser(),
                "Mock Notification " + i,
                "This is a simulated notification generated for testing purposes.",
                NotificationType.SYSTEM,
                null
            );
        }
        return ResponseEntity.ok(Map.of("message", "10 mock notifications generated successfully"));
    }

    @GetMapping("/audit-logs")
    @Transactional(readOnly = true)
    public ResponseEntity<List<AuditLogResponse>> getAuditLogs() {
        List<AuditLogResponse> response = auditLogRepository.findAllByOrderByTimestampDesc()
            .stream()
            .map(this::toAuditLogResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    private AuditLogResponse toAuditLogResponse(AuditLog log) {
        AuditLogResponse.AdminInfo adminInfo = null;
        if (log.getUser() != null) {
            adminInfo = AuditLogResponse.AdminInfo.builder()
                .id(log.getUser().getId())
                .username(log.getUser().getUsername())
                .build();
        }
        return AuditLogResponse.builder()
            .id(log.getId())
            .action(log.getAction())
            .entityType(log.getEntityType())
            .entityId(log.getEntityId())
            .oldValue(log.getOldValue())
            .newValue(log.getNewValue())
            .timestamp(log.getTimestamp())
            .user(adminInfo)
            .build();
    }

    private UserSummaryResponse toUserSummary(User u) {
        return UserSummaryResponse.builder()
                .id(u.getId())
                .username(u.getUsername())
                .email(u.getEmail())
                .role(u.getRole() != null ? u.getRole().name() : "CITIZEN")
                .status(u.getStatus() != null ? u.getStatus().name() : "ACTIVE")
                .trustLevel(u.getTrustLevel() != null ? u.getTrustLevel().name() : "NORMAL")
                .areaName(u.getArea() != null ? u.getArea().getName() : null)
                .city(u.getCity())
                .strikeCount(u.getStrikeCount() != null ? u.getStrikeCount() : 0)
                .createdAt(u.getCreatedAt())
                .build();
    }
}
