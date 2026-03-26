package com.citywatch.controller;

import com.citywatch.dto.response.NotificationResponse;
import com.citywatch.security.CustomUserDetails;
import com.citywatch.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(
            @AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(notificationService.getForUser(principal.getUser()));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Map<String, String>> markRead(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long id) {
        notificationService.markRead(principal.getUser(), id);
        return ResponseEntity.ok(Map.of("message", "Marked as read"));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllRead(
            @AuthenticationPrincipal CustomUserDetails principal) {
        notificationService.markAllRead(principal.getUser());
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }
}
