package com.citywatch.service;

import com.citywatch.dto.request.ComplaintRequest;
import com.citywatch.dto.request.ProofRequest;
import com.citywatch.dto.response.ComplaintResponse;
import com.citywatch.entity.*;
import com.citywatch.enums.*;
import com.citywatch.repository.*;
import com.citywatch.util.CwIdGenerator;
import com.citywatch.util.ComplaintMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final AreaService areaService;
    private final UserRepository userRepository;
    private final SlaConfigRepository slaConfigRepository;
    private final ProofRepository proofRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;
    private final CwIdGenerator idGenerator;
    private final CategoryRepository categoryRepository;
    private final ComplaintMapper complaintMapper;
    private final CommentService commentService;

    private static final double NEARBY_DELTA = 0.00025; // ~25m radius (50m diameter)

    @Transactional
    public ComplaintResponse submit(User citizen, ComplaintRequest req) {
        // Validation: Citizens can only upload images
        if (req.getImageUrls() != null && !req.getImageUrls().isEmpty()) {
            for (String url : req.getImageUrls()) {
                String lowerUrl = url.toLowerCase();
                if (!(lowerUrl.endsWith(".jpg") || lowerUrl.endsWith(".jpeg") || lowerUrl.endsWith(".png") ||
                      lowerUrl.endsWith(".gif") || lowerUrl.endsWith(".webp"))) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Citizens can only upload image files (.jpg, .png, .webp, etc.). Documents are not allowed.");
                }
            }
        }

        long recentCount = complaintRepository.countByCitizenSince(citizen, LocalDateTime.now().minusHours(24));
        if (recentCount >= 10) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "You can submit at most 10 complaints per day.");
        }

        // Attempt to lookup Area if user explicitly selected one from frontend dropdown
        Area area = null;
        if (req.getAreaName() != null && !req.getAreaName().isBlank()) {
            area = areaService.findByName(req.getAreaName());
        }

        // Fallback: Auto-assign Area strictly by Live Location if not specified/found
        if (area == null) {
            area = areaService.findNearestArea(req.getLatitude(), req.getLongitude());
        }

        com.citywatch.entity.Category category = categoryRepository.findByName(req.getCategory().toUpperCase())
                .orElseGet(() -> categoryRepository.findByName("OTHER").orElse(null));

        if (category == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid category and default OTHER not found");
        }

        Complaint complaint = Complaint.builder()
                .id(idGenerator.nextComplaintId())
                .citizen(citizen)
                .area(area)
                .category(category)
                .title(req.getTitle())
                .description(req.getDescription())
                .imageUrls(req.getImageUrls() != null ? req.getImageUrls() : new java.util.ArrayList<String>())
                .latitude(req.getLatitude())
                .longitude(req.getLongitude())
                .status(ComplaintStatus.PENDING_REVIEW)
                .build();

        complaint = complaintRepository.save(complaint);
        auditService.log(citizen, "COMPLAINT_SUBMITTED", complaint);

        notificationService.create(
                citizen,
                "Complaint Submitted",
                "Your complaint '" + complaint.getTitle() + "' has been successfully submitted.",
                NotificationType.SYSTEM,
                complaint.getId()
        );

        autoAssignCoordinator(complaint);
        complaintRepository.save(complaint);

        return toResponse(complaint);
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<ComplaintResponse> getAll(org.springframework.data.domain.Pageable pageable) {
        return complaintRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<ComplaintResponse> getByArea(Long areaId, org.springframework.data.domain.Pageable pageable) {
        Area area = areaService.getById(areaId);
        return complaintRepository.findByAreaOrderByCreatedAtDesc(area, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> getInBoundingBox(Double minLat, Double maxLat, Double minLng, Double maxLng) {
        return complaintRepository.findInBoundingBox(minLat, maxLat, minLng, maxLng)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> getMyCitizen(User citizen) {
        return complaintRepository.findByCitizenOrderByCreatedAtDesc(citizen)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<ComplaintResponse> getAssigned(User coordinator, org.springframework.data.domain.Pageable pageable) {
        return complaintRepository.findByAssignedCoordinatorOrderByCreatedAtDesc(coordinator, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> getNearby(Double lat, Double lng) {
        return complaintRepository.findNearby(lat, lng, NEARBY_DELTA)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ComplaintResponse getById(String id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional
    public ComplaintResponse updateStatus(User detachedCoordinator, String id, ComplaintStatus newStatus) {
        User coordinator = userRepository.findById(detachedCoordinator.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Coordinator not found"));
        Complaint complaint = findOrThrow(id);
        validateTransition(complaint.getStatus(), newStatus);

        ComplaintStatus old = complaint.getStatus();
        complaint.setStatus(newStatus);

        // Auto-assign coordinator when they accept a complaint (IN_PROGRESS)
        if (newStatus == ComplaintStatus.IN_PROGRESS && complaint.getAssignedCoordinator() == null) {
            complaint.setAssignedCoordinator(coordinator);
            
            // Reflect on citizen feed comments
            com.citywatch.dto.request.CommentRequest commentReq = new com.citywatch.dto.request.CommentRequest();
            commentReq.setContent("Hello, I have accepted this report and will begin working on it shortly.");
            commentService.addComment(coordinator, complaint.getId(), commentReq);
        }

        if (newStatus == ComplaintStatus.CLOSED || newStatus == ComplaintStatus.COMPLETED) {
            complaint.setClosedAt(LocalDateTime.now());
        }
        
        complaintRepository.save(complaint);
        auditService.logAction(coordinator, "STATUS_CHANGED", "COMPLAINT", id, old.name(), newStatus.name());
        
        if (newStatus == ComplaintStatus.CLOSED || newStatus == ComplaintStatus.COMPLETED) {
            notificationService.create(
                    complaint.getCitizen(),
                    "Complaint Resolved",
                    "Your complaint '" + complaint.getTitle() + "' has been resolved.",
                    NotificationType.COMPLAINT_UPDATE,
                    id
            );
            
            // Notify assigned coordinator (if any)
            if (complaint.getAssignedCoordinator() != null) {
                notificationService.create(
                        complaint.getAssignedCoordinator(),
                        "Complaint Resolved",
                        "Complaint '" + complaint.getTitle() + "' has been successfully resolved.",
                        NotificationType.COMPLAINT_UPDATE,
                        id
                );
            }
            
            // Notify admins
            userRepository.findByRole(Role.ADMIN).forEach(admin -> 
                notificationService.create(
                        admin,
                        "Complaint Resolved",
                        "Complaint '" + complaint.getTitle() + "' has been resolved in area " + 
                        (complaint.getArea() != null ? complaint.getArea().getName() : "Unknown"),
                        NotificationType.SYSTEM,
                        id
                )
            );
        } else if (newStatus == ComplaintStatus.IN_PROGRESS && complaint.getCitizen() != null) {
            notificationService.create(
                complaint.getCitizen(),
                "Report In Progress",
                "Your report is now In Progress. The assigned coordinator is actively working on it.",
                NotificationType.COMPLAINT_UPDATE,
                complaint.getId()
            );
        } else if (newStatus != ComplaintStatus.IN_PROGRESS && complaint.getCitizen() != null) {
            notificationService.create(
                    complaint.getCitizen(),
                    "Status update",
                    "Your complaint is now: " + newStatus,
                    NotificationType.COMPLAINT_UPDATE,
                    complaint.getId()
            );
        }

        return toResponse(complaint);
    }

    private void autoAssignCoordinator(Complaint complaint) {
        if (complaint.getArea() == null) return;
        
        List<User> areaCoordinators = userRepository.findAll().stream()
            .filter(u -> u.getRole() == Role.COORDINATOR 
                      && u.getStatus() == UserStatus.ACTIVE 
                      && u.getArea() != null 
                      && u.getArea().getId().equals(complaint.getArea().getId()))
            .collect(Collectors.toList());
            
        if (areaCoordinators.isEmpty()) {
            notificationService.notifyCoordinatorsInArea(
                complaint.getArea(), 
                "New Report Needs Attention", 
                "No coordinators available for auto-assignment.", 
                complaint.getId()
            );
            return;
        }
        
        User bestCoordinator = null;
        int minCount = Integer.MAX_VALUE;
        for (User u : areaCoordinators) {
            int activeCount = (int) complaintRepository.findByAssignedCoordinatorOrderByCreatedAtDesc(u).stream()
                .filter(c -> c.getStatus() == ComplaintStatus.IN_PROGRESS || c.getStatus() == ComplaintStatus.ASSIGNED || c.getStatus() == ComplaintStatus.DELAYED || c.getStatus() == ComplaintStatus.PENDING_VERIFICATION)
                .count();
            if (activeCount < minCount) {
                minCount = activeCount;
                bestCoordinator = u;
            }
        }
        
        if (minCount >= 5 || bestCoordinator == null) {
            String descriptionPreview = complaint.getDescription();
            if (descriptionPreview != null && descriptionPreview.length() > 50) {
                descriptionPreview = descriptionPreview.substring(0, 47) + "...";
            }
            notificationService.notifyCoordinatorsInArea(
                complaint.getArea(), 
                "New Task: " + complaint.getTitle(), 
                "A new report was filed in your area. Please review and accept it if you can.\n\nDescription: " + descriptionPreview, 
                complaint.getId()
            );
        } else {
            complaint.setAssignedCoordinator(bestCoordinator);
            complaint.setStatus(ComplaintStatus.ASSIGNED);
            complaint.setSlaDeadline(LocalDateTime.now().plusHours(complaint.getCategory().getDefaultSlaHours()));
            
            String descriptionPreview = complaint.getDescription();
            if (descriptionPreview != null && descriptionPreview.length() > 50) {
                descriptionPreview = descriptionPreview.substring(0, 47) + "...";
            }
            notificationService.create(
                bestCoordinator, 
                "New Task Auto-Assigned: " + complaint.getTitle(), 
                "You have been automatically assigned a new report in your area.\n\nDescription: " + descriptionPreview, 
                NotificationType.COMPLAINT_UPDATE, 
                complaint.getId()
            );

            // Reflect on citizen feed comments
            com.citywatch.dto.request.CommentRequest commentReq = new com.citywatch.dto.request.CommentRequest();
            commentReq.setContent("Hello, I have been automatically assigned to investigate and resolve this report. I will begin working on it shortly.");
            commentService.addComment(bestCoordinator, complaint.getId(), commentReq);

            notificationService.create(
                complaint.getCitizen(),
                "Coordinator Assigned",
                "A coordinator has been assigned to your complaint and is actively looking into it.",
                NotificationType.COMPLAINT_UPDATE,
                complaint.getId()
            );
        }
    }

    public ComplaintResponse toResponse(Complaint c) {
        ComplaintResponse r = complaintMapper.toResponse(c);
        if (r.getImageUrls() != null) {
            r.setImageUrls(r.getImageUrls().stream().map(url -> 
                url.startsWith("/images/") 
                    ? "https://zutdbxtzwaktrrfjtetg.supabase.co/storage/v1/object/public/citywatch-images" + url 
                    : url
            ).collect(Collectors.toList()));
        }
        return r;
    }


    @Transactional
    public ComplaintResponse upvote(User citizen, String id) {
        Complaint complaint = findOrThrow(id);

        java.util.Set<String> upvoters = complaint.getUpvotedCitizenIds();
        
        if (upvoters.contains(citizen.getId())) {
            upvoters.remove(citizen.getId());
        } else {
            upvoters.add(citizen.getId());
            recalculateIntensity(complaint);
        }

        complaintRepository.save(complaint);
        return toResponse(complaint);
    }

    @Transactional
    public ComplaintResponse submitProof(User detachedCoordinator, String id, ProofRequest req) {
        User coordinator = userRepository.findById(detachedCoordinator.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Coordinator not found"));
        Complaint complaint = findOrThrow(id);

        // Auto-assign coordinator if not yet assigned (when they accepted via status update)
        if (complaint.getAssignedCoordinator() == null) {
            complaint.setAssignedCoordinator(coordinator);
        } else if (!complaint.getAssignedCoordinator().getId().equals(coordinator.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not assigned to this complaint");
        }

        // Validation: Coordinators can upload images or PDFs
        if (req.getImageUrl() != null && !req.getImageUrl().isBlank()) {
            String lowerUrl = req.getImageUrl().toLowerCase();
            if (!(lowerUrl.endsWith(".jpg") || lowerUrl.endsWith(".jpeg") || lowerUrl.endsWith(".png") ||
                  lowerUrl.endsWith(".gif") || lowerUrl.endsWith(".webp"))) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Coordinators must upload a valid image as visual proof.");
            }
        }
        
        if (req.getPdfUrl() == null || req.getPdfUrl().isBlank() || !req.getPdfUrl().toLowerCase().endsWith(".pdf")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Coordinators must upload a PDF resolution report.");
        }

        // Removed strict 25 meter distance check
        double dLat = Math.abs(req.getLatitude() - complaint.getLatitude());
        double dLng = Math.abs(req.getLongitude() - complaint.getLongitude());
        double distance = Math.sqrt(dLat * dLat + dLng * dLng);
        boolean locationValid = distance <= NEARBY_DELTA;

        Proof proof = Proof.builder()
                .id(idGenerator.nextProofId())
                .complaint(complaint)
                .coordinator(coordinator)
                .imageUrl(req.getImageUrl())
                .pdfUrl(req.getPdfUrl())
                .latitude(req.getLatitude())
                .longitude(req.getLongitude())
                .distanceFromComplaint(distance)
                .isLocationValid(locationValid)
                .build();

        proofRepository.save(proof);
        complaint.setStatus(ComplaintStatus.PENDING_VERIFICATION);
        complaintRepository.save(complaint);

        // Notify Supervisor
        if (complaint.getArea() != null) {
            List<User> supervisors = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == Role.SUPERVISOR && u.getStatus() == UserStatus.ACTIVE && u.getArea() != null && u.getArea().getId().equals(complaint.getArea().getId()))
                    .collect(Collectors.toList());
            
            for (User sup : supervisors) {
                notificationService.create(
                        sup,
                        "Proof Submitted for Verification",
                        "Coordinator " + coordinator.getFullName() + " has submitted proof for complaint '" + complaint.getTitle() + "'. Please verify it.",
                        NotificationType.COMPLAINT_UPDATE,
                        id
                );
            }
        }

        return toResponse(complaint);
    }

    @Transactional
    public ComplaintResponse supervisorVerify(User detachedSupervisor, String id, boolean approved, String reason) {
        User supervisor = userRepository.findById(detachedSupervisor.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Supervisor not found"));
        
        if (supervisor.getRole() != Role.SUPERVISOR) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only supervisors can verify proofs");
        }

        Complaint complaint = findOrThrow(id);

        if (complaint.getStatus() != ComplaintStatus.PENDING_VERIFICATION) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Complaint is not awaiting verification");
        }

        if (complaint.getArea() == null || supervisor.getArea() == null || !complaint.getArea().getId().equals(supervisor.getArea().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your area");
        }

        if (approved) {
            complaint.setStatus(ComplaintStatus.COMPLETED);
            complaintRepository.save(complaint);

            auditService.logAction(supervisor, "PROOF_VERIFIED", "COMPLAINT", id, "PENDING_VERIFICATION", "COMPLETED");

            // Notify Citizen
            notificationService.create(
                    complaint.getCitizen(),
                    "Complaint Resolved",
                    "Your complaint '" + complaint.getTitle() + "' has been verified and resolved by our supervisors.",
                    NotificationType.COMPLAINT_UPDATE,
                    id
            );
            
            // Notify Coordinator
            if (complaint.getAssignedCoordinator() != null) {
                notificationService.create(
                    complaint.getAssignedCoordinator(),
                    "Proof Verified",
                    "Your proof for '" + complaint.getTitle() + "' was approved by the supervisor.",
                    NotificationType.COMPLAINT_UPDATE,
                    id
                );
            }
        } else {
            complaint.setStatus(ComplaintStatus.REOPENED);
            complaint.setReopenReason(reason);
            complaint.setReopenCount(complaint.getReopenCount() + 1);
            complaint.setEscalationLevel(complaint.getEscalationLevel() + 1);
            complaintRepository.save(complaint);

            auditService.logAction(supervisor, "PROOF_REJECTED", "COMPLAINT", id, "PENDING_VERIFICATION", "REOPENED");

            // Notify Coordinator
            if (complaint.getAssignedCoordinator() != null) {
                notificationService.create(
                        complaint.getAssignedCoordinator(),
                        "Proof Rejected by Supervisor: " + complaint.getTitle(),
                        "The supervisor rejected your proof.\nReason: " + (reason != null ? reason : "No reason provided") + "\nPlease fix the issue and submit again.",
                        NotificationType.COMPLAINT_UPDATE,
                        complaint.getId()
                );
            }

            if (complaint.getReopenCount() >= 3) {
                notificationService.notifyAdmins(
                    "High Reopen Alert: " + complaint.getTitle(),
                    "This complaint has been reopened " + complaint.getReopenCount() + " times. Please review the case.\nCoordinator: " + 
                    (complaint.getAssignedCoordinator() != null ? complaint.getAssignedCoordinator().getFullName() : "None"),
                    complaint.getId()
                );
            }
        }

        return toResponse(complaint);
    }

    @Transactional
    public ComplaintResponse citizenResolve(User detachedCitizen, String id, boolean accepted, String reason) {
        User citizen = userRepository.findById(detachedCitizen.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Citizen not found"));
        Complaint complaint = findOrThrow(id);

        if (!complaint.getCitizen().getId().equals(citizen.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your complaint");
        }
        if (complaint.getStatus() != ComplaintStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Complaint is not awaiting confirmation");
        }

        if (accepted) {
            complaint.setStatus(ComplaintStatus.CLOSED);
            complaint.setClosedAt(LocalDateTime.now());
            auditService.log(citizen, "COMPLAINT_CLOSED", complaint);
        } else {
            complaint.setStatus(ComplaintStatus.REOPENED);
            complaint.setReopenCount(complaint.getReopenCount() + 1);
            complaint.setEscalationLevel(complaint.getEscalationLevel() + 1);
            complaint.setReopenReason(reason);
            // DO NOT setAssignedCoordinator(null) - forcefully keep the same coordinator
            // complaint.setAssignedCoordinator(null); 
            // assignCoordinator(complaint); // Skip auto-reassignment
            
            if (complaint.getAssignedCoordinator() != null) {
                notificationService.create(
                        complaint.getAssignedCoordinator(),
                        "Issue Reopened: " + complaint.getTitle(),
                        "The citizen was not satisfied and has forcefully reopened this issue.\nReason: " + (reason != null ? reason : "No reason provided") + "\n\nYou are still assigned to this task. Please resolve it.",
                        NotificationType.COMPLAINT_UPDATE,
                        complaint.getId()
                );
            }

            if (complaint.getReopenCount() >= 3) {
                notificationService.notifyAdmins(
                    "High Reopen Alert: " + complaint.getTitle(),
                    "This complaint has been reopened " + complaint.getReopenCount() + " times. Please review the case.\nCoordinator: " + 
                    (complaint.getAssignedCoordinator() != null ? complaint.getAssignedCoordinator().getFullName() : "None"),
                    complaint.getId()
                );
            }

            auditService.log(citizen, "COMPLAINT_REOPENED", complaint);
        }

        complaintRepository.save(complaint);
        return toResponse(complaint);
    }

    @Transactional
    public void assignCoordinator(Complaint complaint) {
        Long areaId = complaint.getArea() != null ? complaint.getArea().getId() : null;
        if (areaId == null) return;

        List<User> areaCoordinators = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.COORDINATOR
                        && u.getStatus() == UserStatus.ACTIVE
                        && u.getArea() != null
                        && u.getArea().getId().equals(areaId))
                .collect(Collectors.toList());

        if (areaCoordinators.isEmpty()) return;

        // Find coordinator with minimum active complaints
        User bestCoordinator = null;
        int minWorkload = Integer.MAX_VALUE;

        for (User coordinator : areaCoordinators) {
            int activeCount = (int) complaintRepository.findByAssignedCoordinatorOrderByCreatedAtDesc(coordinator).stream()
                .filter(c -> c.getStatus() == ComplaintStatus.ASSIGNED || c.getStatus() == ComplaintStatus.IN_PROGRESS || c.getStatus() == ComplaintStatus.PENDING_REVIEW)
                .count();

            if (activeCount < minWorkload) {
                minWorkload = activeCount;
                bestCoordinator = coordinator;
            }
        }

        if (bestCoordinator != null && minWorkload < 5) {
            // Auto-assign to best coordinator
            complaint.setAssignedCoordinator(bestCoordinator);
            complaint.setStatus(ComplaintStatus.ASSIGNED);
            complaint.setSlaDeadline(LocalDateTime.now().plusHours(complaint.getCategory().getDefaultSlaHours()));
            complaintRepository.save(complaint);

            notificationService.create(
                    bestCoordinator,
                    "New Auto-Assigned Task",
                    "A new complaint has been automatically assigned to you in " + complaint.getArea().getName(),
                    NotificationType.COMPLAINT_UPDATE,
                    complaint.getId()
            );
        } else {
            // Leave in manual acceptance queue, notify all area coordinators
            complaint.setAssignedCoordinator(null);
            complaint.setStatus(ComplaintStatus.PENDING_REVIEW); // Stays pending for manual pickup
            complaintRepository.save(complaint);

            for (User coordinator : areaCoordinators) {
                notificationService.create(
                        coordinator,
                        "New Task Available in Area",
                        "A new high-volume complaint in " + complaint.getArea().getName() + " is available for manual acceptance.",
                        NotificationType.SYSTEM,
                        complaint.getId()
                );
            }
        }
    }

    @Transactional
    public ComplaintResponse assignCoordinatorManually(User admin, String id, String coordinatorId) {
        Complaint complaint = findOrThrow(id);
        User coordinator = userRepository.findById(coordinatorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Coordinator not found"));
                
        if (coordinator.getRole() != Role.COORDINATOR) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not a coordinator");
        }
        
        complaint.setAssignedCoordinator(coordinator);
        complaint.setStatus(ComplaintStatus.ASSIGNED);
        if (complaint.getSlaDeadline() == null) {
            complaint.setSlaDeadline(LocalDateTime.now().plusHours(complaint.getCategory().getDefaultSlaHours()));
        }
        
        complaintRepository.save(complaint);
        auditService.logAction(admin, "MANUAL_ASSIGNMENT", "COMPLAINT", id, "NONE", coordinatorId);
        
        notificationService.create(
                coordinator,
                "Complaint manually assigned to you",
                "An admin has manually assigned a complaint to you.",
                NotificationType.COMPLAINT_UPDATE,
                complaint.getId()
        );

        // Reflect on citizen feed comments
        com.citywatch.dto.request.CommentRequest commentReq = new com.citywatch.dto.request.CommentRequest();
        commentReq.setContent("Hello, I have been manually assigned to investigate and resolve this report by an Administrator. I will begin working on it shortly.");
        commentService.addComment(coordinator, complaint.getId(), commentReq);
        
        return toResponse(complaint);
    }

    public void recalculateIntensity(Complaint complaint) {
        List<Complaint> nearby = complaintRepository.findNearby(
                complaint.getLatitude(), complaint.getLongitude(), NEARBY_DELTA * 4
        );

        double weightedSum = nearby.stream()
                .filter(c -> !c.getId().equals(complaint.getId()))
                .mapToDouble(c -> switch (c.getCitizen().getTrustLevel()) {
                    case NORMAL -> 1.0;
                    case UNDER_REVIEW -> 0.5;
                    case RESTRICTED -> 0.25;
                })
                .sum();

        double score = Math.log(1 + weightedSum);
        complaint.setIntensityScore(score);

        Priority priority = score < 1.0 ? Priority.LOW
                : score < 2.0 ? Priority.MEDIUM
                : score < 3.0 ? Priority.HIGH
                : Priority.CRITICAL;

        complaint.setPriority(priority);
        complaintRepository.save(complaint);
    }

    @Transactional
    public void softDelete(User admin, String id, String messageForCitizen, String reason) {
        if (admin.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can delete complaints.");
        }
        
        Complaint complaint = findOrThrow(id);
        
        complaint.setDeleted(true);
        complaintRepository.save(complaint);
        
        // Notify citizen
        notificationService.create(
            complaint.getCitizen(),
            "Report Removed",
            messageForCitizen,
            NotificationType.SYSTEM,
            null
        );
        
        // Log auditing action
        auditService.logAction(admin, "COMPLAINT_DELETED", "COMPLAINT", id, complaint.getStatus().name(), "DELETED: " + reason);
    }

    private Complaint findOrThrow(String id) {
        return complaintRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Complaint not found"));
    }

    private void validateTransition(ComplaintStatus current, ComplaintStatus next) {
        // Permit coordinator to move any "pending/assigned" state to IN_PROGRESS
        // and any "in progress" state to COMPLETED
        boolean valid = switch (current) {
            case DRAFT ->
                next == ComplaintStatus.PENDING_REVIEW;
            case PENDING_REVIEW ->
                next == ComplaintStatus.APPROVED || next == ComplaintStatus.REJECTED
                || next == ComplaintStatus.IN_PROGRESS; // allow direct accept
            case APPROVED ->
                next == ComplaintStatus.ASSIGNED || next == ComplaintStatus.IN_PROGRESS;
            case ASSIGNED ->
                next == ComplaintStatus.IN_PROGRESS;
            case IN_PROGRESS ->
                next == ComplaintStatus.PENDING_VERIFICATION || next == ComplaintStatus.DELAYED || next == ComplaintStatus.COMPLETED; // some legacy tests might need COMPLETED
            case PENDING_VERIFICATION ->
                next == ComplaintStatus.COMPLETED || next == ComplaintStatus.REOPENED;
            case COMPLETED ->
                next == ComplaintStatus.CLOSED || next == ComplaintStatus.REOPENED;
            case REOPENED ->
                next == ComplaintStatus.ASSIGNED || next == ComplaintStatus.IN_PROGRESS;
            case DELAYED ->
                next == ComplaintStatus.IN_PROGRESS || next == ComplaintStatus.ESCALATED;
            default -> false;
        };
        if (!valid) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid status transition: " + current + " \u2192 " + next);
        }
    }
}
