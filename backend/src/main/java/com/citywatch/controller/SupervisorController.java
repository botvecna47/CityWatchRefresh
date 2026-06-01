package com.citywatch.controller;

import com.citywatch.dto.response.ComplaintResponse;
import com.citywatch.security.CustomUserDetails;
import com.citywatch.service.ComplaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/supervisor")
@RequiredArgsConstructor
public class SupervisorController {

    private final ComplaintService complaintService;

    @PostMapping("/complaints/{id}/verify")
    @PreAuthorize("hasRole('SUPERVISOR')")
    public ResponseEntity<ComplaintResponse> verifyProof(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable String id,
            @RequestParam boolean approved,
            @RequestParam(required = false) String reason) {
        
        return ResponseEntity.ok(complaintService.supervisorVerify(principal.getUser(), id, approved, reason));
    }
}
