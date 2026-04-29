package com.citywatch.controller;

import com.citywatch.dto.request.SpamReportRequest;
import com.citywatch.entity.SpamReport;
import com.citywatch.entity.User;
import com.citywatch.repository.SpamReportRepository;
import com.citywatch.security.CustomUserDetails;
import com.citywatch.util.CwIdGenerator;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/spam-reports")
public class SpamReportController {

    private final SpamReportRepository spamReportRepository;
    private final CwIdGenerator idGenerator;

    public SpamReportController(SpamReportRepository spamReportRepository, CwIdGenerator idGenerator) {
        this.spamReportRepository = spamReportRepository;
        this.idGenerator = idGenerator;
    }

    @PostMapping
    public ResponseEntity<SpamReport> submitSpamReport(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody SpamReportRequest req) {
        
        User user = principal.getUser();
        
        SpamReport report = SpamReport.builder()
                .id(idGenerator.nextSpamId())
                .reporter(user)
                .reporterName(user.getUsername())
                .targetType(req.getTargetType())
                .targetId(req.getTargetId())
                .reason(req.getReason())
                .status("PENDING")
                .build();
                
        return ResponseEntity.ok(spamReportRepository.save(report));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SpamReport>> getAllSpamReports() {
        return ResponseEntity.ok(spamReportRepository.findAll());
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SpamReport> updateStatus(
            @PathVariable String id,
            @RequestParam String status) {
        
        SpamReport report = spamReportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Spam report not found"));
                
        report.setStatus(status.toUpperCase());
        return ResponseEntity.ok(spamReportRepository.save(report));
    }
}
