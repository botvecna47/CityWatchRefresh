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
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final ComplaintRepository complaintRepository;
    private final EscalationRepository escalationRepository;
    private final ComplaintService complaintService;

    @GetMapping("/users")
    public ResponseEntity<List<UserSummaryResponse>> getAllUsers() {
        return ResponseEntity.ok(
                userRepository.findAll().stream()
                        .map(this::toUserSummary)
                        .collect(Collectors.toList())
        );
    }

    @PatchMapping("/users/{id}/ban")
    public ResponseEntity<Map<String, String>> banUser(@PathVariable Long id) {
        userRepository.findById(id).ifPresent(u -> {
            u.setStatus(UserStatus.SUSPENDED);
            userRepository.save(u);
        });
        return ResponseEntity.ok(Map.of("message", "User banned"));
    }

    @PatchMapping("/users/{id}/unban")
    public ResponseEntity<Map<String, String>> unbanUser(@PathVariable Long id) {
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

    @GetMapping("/escalations")
    public ResponseEntity<List<Escalation>> getAllEscalations() {
        return ResponseEntity.ok(escalationRepository.findAll());
    }

    private UserSummaryResponse toUserSummary(User u) {
        return UserSummaryResponse.builder()
                .id(u.getId())
                .username(u.getUsername())
                .email(u.getEmail())
                .role(u.getRole().name())
                .status(u.getStatus().name())
                .trustLevel(u.getTrustLevel().name())
                .areaName(u.getArea() != null ? u.getArea().getName() : null)
                .city(u.getCity())
                .strikeCount(u.getStrikeCount())
                .createdAt(u.getCreatedAt())
                .build();
    }
}
