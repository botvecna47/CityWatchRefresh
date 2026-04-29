package com.citywatch.controller;

import com.citywatch.dto.request.CommentRequest;
import com.citywatch.dto.response.CommentResponse;
import com.citywatch.security.CustomUserDetails;
import com.citywatch.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaints/{complaintId}/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable String complaintId) {
        return ResponseEntity.ok(commentService.getComments(complaintId));
    }

    @PostMapping
    public ResponseEntity<CommentResponse> addComment(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable String complaintId,
            @Valid @RequestBody CommentRequest req) {
        return ResponseEntity.ok(commentService.addComment(principal.getUser(), complaintId, req));
    }

    @DeleteMapping("/{commentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> moderateComment(@PathVariable String commentId) {
        commentService.moderateComment(commentId);
        return ResponseEntity.ok(Map.of("message", "Comment moderated"));
    }
}
