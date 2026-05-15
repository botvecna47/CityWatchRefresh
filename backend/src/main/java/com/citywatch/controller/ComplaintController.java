package com.citywatch.controller;

import com.citywatch.dto.request.ComplaintRequest;
import com.citywatch.dto.request.ProofRequest;
import com.citywatch.dto.response.ComplaintResponse;

import com.citywatch.enums.ComplaintStatus;
import com.citywatch.security.CustomUserDetails;
import com.citywatch.service.ComplaintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    // ── Submit a complaint (Citizen only) ────────────────────────────────────
    @PostMapping
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<ComplaintResponse> submit(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody ComplaintRequest req) {
        return ResponseEntity.ok(complaintService.submit(principal.getUser(), req));
    }

    // ── List complaints ──────────────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<?> list(
            @RequestParam(required = false) Long areaId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) Double minLat,
            @RequestParam(required = false) Double maxLat,
            @RequestParam(required = false) Double minLng,
            @RequestParam(required = false) Double maxLng,
            org.springframework.data.domain.Pageable pageable) {

        if (minLat != null && maxLat != null && minLng != null && maxLng != null) {
            return ResponseEntity.ok(complaintService.getInBoundingBox(minLat, maxLat, minLng, maxLng));
        }
        if (lat != null && lng != null) {
            return ResponseEntity.ok(complaintService.getNearby(lat, lng));
        }
        if (areaId != null) {
            return ResponseEntity.ok(complaintService.getByArea(areaId, pageable));
        }
        return ResponseEntity.ok(complaintService.getAll(pageable));
    }

    // ── Get a single complaint ───────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<ComplaintResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(complaintService.getById(id));
    }

    // ── Get my complaints (Citizen) ──────────────────────────────────────────
    @GetMapping("/mine")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<List<ComplaintResponse>> mine(
            @AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(complaintService.getMyCitizen(principal.getUser()));
    }

    // ── Get assigned complaints (Coordinator) ────────────────────────────────
    @GetMapping("/assigned")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<List<ComplaintResponse>> assigned(
            @AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(complaintService.getAssigned(principal.getUser()));
    }

    // ── Update status (Coordinator) ─────────────────────────────────────────
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('COORDINATOR', 'ADMIN')")
    public ResponseEntity<ComplaintResponse> updateStatus(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        String statusStr = body.get("status");
        if (statusStr == null || statusStr.isBlank()) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.BAD_REQUEST, "'status' field is required in request body");
        }
        ComplaintStatus newStatus = ComplaintStatus.valueOf(statusStr.toUpperCase());
        return ResponseEntity.ok(complaintService.updateStatus(principal.getUser(), id, newStatus));
    }

    // ── Submit completion proof (Coordinator) ───────────────────────────────
    @PostMapping("/{id}/proof")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<ComplaintResponse> submitProof(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable String id,
            @Valid @RequestBody ProofRequest req) {
        return ResponseEntity.ok(complaintService.submitProof(principal.getUser(), id, req));
    }

    // ── Citizen confirm/reject resolution ───────────────────────────────────
    @PostMapping("/{id}/resolve")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<ComplaintResponse> resolve(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable String id,
            @RequestBody Map<String, Boolean> body) {
        return ResponseEntity.ok(complaintService.citizenResolve(principal.getUser(), id, body.get("accepted")));
    }

    // ── Citizen Upvote (Citizens only — coordinators and admins cannot vote) ─
    @PostMapping("/{id}/upvote")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<ComplaintResponse> upvote(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable String id) {
        return ResponseEntity.ok(complaintService.upvote(principal.getUser(), id));
    }

    // ── Admin assign coordinator ──────────────────────────────────────────────
    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ComplaintResponse> assign(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(complaintService.assignCoordinatorManually(principal.getUser(), id, body.get("coordinatorId")));
    }
}
