package com.citywatch.controller;

import com.citywatch.dto.request.ApplicationRequest;
import com.citywatch.entity.CoordinatorApplication;
import com.citywatch.entity.User;
import com.citywatch.entity.Area;
import com.citywatch.enums.NotificationType;
import com.citywatch.enums.Role;
import com.citywatch.repository.CoordinatorApplicationRepository;
import com.citywatch.repository.UserRepository;
import com.citywatch.repository.AreaRepository;
import com.citywatch.security.CustomUserDetails;
import com.citywatch.service.NotificationService;
import com.citywatch.util.CwIdGenerator;
import jakarta.validation.Valid;
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
    private final NotificationService notificationService;

    public ApplicationController(CoordinatorApplicationRepository applicationRepository,
                                 UserRepository userRepository,
                                 AreaRepository areaRepository,
                                 CwIdGenerator idGenerator,
                                 NotificationService notificationService) {
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.areaRepository = areaRepository;
        this.idGenerator = idGenerator;
        this.notificationService = notificationService;
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

        // Notify admins of the new application
        notificationService.notifyAdmins(
            "New Coordinator Application",
            user.getUsername() + " has applied to become a Coordinator. Review their application in the Admin Panel.",
            app.getId()
        );

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

            // Notify the applicant of approval
            notificationService.create(
                user,
                "🎉 Application Approved!",
                "Congratulations! Your application to become a Coordinator has been approved. You have been assigned to the " + area.getName() + " area. Your dashboard now has coordinator tools.",
                NotificationType.SYSTEM,
                null
            );
        } else if ("REJECTED".equalsIgnoreCase(status)) {
            User user = app.getUser();
            if (user != null) {
                // Notify the applicant of rejection
                notificationService.create(
                    user,
                    "Application Status Update",
                    "Thank you for your interest in becoming a CityWatch Coordinator. After reviewing your application, we regret to inform you that we are unable to proceed at this time. You are welcome to apply again in the future.",
                    NotificationType.SYSTEM,
                    null
                );
            }
        }

        return ResponseEntity.ok(applicationRepository.save(app));
    }
}
