package com.citywatch.controller;

import com.citywatch.dto.request.ApplicationRequest;
import com.citywatch.entity.CoordinatorApplication;
import com.citywatch.entity.User;
import com.citywatch.entity.Area;
import com.citywatch.enums.Role;
import com.citywatch.repository.CoordinatorApplicationRepository;
import com.citywatch.repository.UserRepository;
import com.citywatch.repository.AreaRepository;
import com.citywatch.security.CustomUserDetails;
import com.citywatch.util.CwIdGenerator;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final CoordinatorApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final AreaRepository areaRepository;
    private final CwIdGenerator idGenerator;

    public ApplicationController(CoordinatorApplicationRepository applicationRepository, UserRepository userRepository, AreaRepository areaRepository, CwIdGenerator idGenerator) {
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.areaRepository = areaRepository;
        this.idGenerator = idGenerator;
    }

    @PostMapping
    public ResponseEntity<CoordinatorApplication> submitApplication(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody ApplicationRequest req) {
        
        User user = principal.getUser();
        
        CoordinatorApplication app = CoordinatorApplication.builder()
                .id(idGenerator.nextApplicationId())
                .user(user)
                .userName(req.getName())
                .email(req.getEmail())
                .phone(req.getPhone())
                .address(req.getAddress())
                .experience(req.getExperience())
                .message(req.getMessage())
                .status("PENDING")
                .build();
                
        return ResponseEntity.ok(applicationRepository.save(app));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CoordinatorApplication>> getAllApplications() {
        return ResponseEntity.ok(applicationRepository.findAll());
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CoordinatorApplication> updateStatus(
            @PathVariable String id,
            @RequestParam String status,
            @RequestParam(required = false) Long areaId) {
        
        CoordinatorApplication app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));
                
        app.setStatus(status.toUpperCase());
        
        if ("APPROVED".equalsIgnoreCase(status)) {
            User user = app.getUser();
            if (user == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Application does not have a valid user attached.");
            }
            if (areaId == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "An Area ID must be provided when approving a coordinator application.");
            }
            Area area = areaRepository.findById(areaId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Area not found"));
            
            user.setRole(Role.COORDINATOR);
            user.setArea(area);
            userRepository.save(user);
        }
        
        return ResponseEntity.ok(applicationRepository.save(app));
    }
}

