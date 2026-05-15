package com.citywatch.controller;

import com.citywatch.dto.response.ComplaintResponse;
import com.citywatch.dto.response.UserSummaryResponse;
import com.citywatch.entity.Escalation;
import com.citywatch.entity.User;
import com.citywatch.enums.UserStatus;
import com.citywatch.repository.ComplaintRepository;
import com.citywatch.repository.EscalationRepository;
import com.citywatch.repository.UserRepository;
import com.citywatch.service.ComplaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
    private final com.citywatch.service.NotificationService notificationService;

    public AdminController(UserRepository userRepository, ComplaintRepository complaintRepository,
                           EscalationRepository escalationRepository, ComplaintService complaintService,
                           com.citywatch.service.NotificationService notificationService) {
        this.userRepository = userRepository;
        this.complaintRepository = complaintRepository;
        this.escalationRepository = escalationRepository;
        this.complaintService = complaintService;
        this.notificationService = notificationService;
    }

    @GetMapping("/users")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<List<UserSummaryResponse>> getAllUsers() {
        return ResponseEntity.ok(
                userRepository.findAll().stream()
                        .map(this::toUserSummary)
                        .collect(Collectors.toList())
        );
    }

    @PatchMapping("/users/{id}/ban")
    public ResponseEntity<Map<String, String>> banUser(@PathVariable String id) {
        userRepository.findById(id).ifPresent(u -> {
            u.setStatus(UserStatus.SUSPENDED);
            userRepository.save(u);
        });
        return ResponseEntity.ok(Map.of("message", "User banned"));
    }

    @PatchMapping("/users/{id}/unban")
    public ResponseEntity<Map<String, String>> unbanUser(@PathVariable String id) {
        userRepository.findById(id).ifPresent(u -> {
            u.setStatus(UserStatus.ACTIVE);
            userRepository.save(u);
        });
        return ResponseEntity.ok(Map.of("message", "User unbanned"));
    }

    @GetMapping("/complaints")
    public ResponseEntity<List<ComplaintResponse>> getAllComplaints() {
        return ResponseEntity.ok(
                complaintRepository.findAllByOrderByCreatedAtDesc().stream()
                        .map(complaintService::toResponse)
                        .collect(Collectors.toList())
        );
    }

    @DeleteMapping("/complaints/{id}")
    public ResponseEntity<Map<String, String>> deleteComplaint(@PathVariable String id) {
        complaintRepository.findById(id).ifPresent(c -> {
            c.setDeleted(true);
            complaintRepository.save(c);
        });
        return ResponseEntity.ok(Map.of("message", "Complaint deleted"));
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
            notificationService.create(user, title, message, com.citywatch.enums.NotificationType.SYSTEM, null)
        );
        
        return ResponseEntity.ok(Map.of("message", "Broadcast sent to all users"));
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
