package com.citywatch.controller;

import com.citywatch.dto.request.VoteRequest;
import com.citywatch.entity.Vote;
import com.citywatch.repository.VoteRepository;
import com.citywatch.repository.ComplaintRepository;
import com.citywatch.security.CustomUserDetails;
import com.citywatch.service.VoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaints/{complaintId}/votes")
@RequiredArgsConstructor
public class VoteController {

    private final VoteService voteService;
    private final VoteRepository voteRepository;
    private final ComplaintRepository complaintRepository;

    @PostMapping
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<Map<String, String>> castVote(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long complaintId,
            @Valid @RequestBody VoteRequest req) {
        voteService.castVote(principal.getUser(), complaintId, req);
        return ResponseEntity.ok(Map.of("message", "Vote recorded"));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Vote>> getVotes(@PathVariable Long complaintId) {
        return complaintRepository.findById(complaintId)
                .map(voteRepository::findByComplaint)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
