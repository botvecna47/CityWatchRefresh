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

    private static final double NEARBY_DELTA = 0.00025; // ~25m radius (50m diameter)

    @Transactional
    public ComplaintResponse submit(User citizen, ComplaintRequest req) {
        long recentCount = complaintRepository.countByCitizenSince(citizen, LocalDateTime.now().minusHours(24));
        if (recentCount >= 10) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "You can submit at most 10 complaints per day.");
        }

        // Auto-assign Area strictly by Live Location
        Area area = areaService.findNearestArea(req.getLatitude(), req.getLongitude());

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

        notificationService.notifyCoordinatorsInArea(
                area,
                "New complaint needs review",
                "A new " + category.getName().toLowerCase() + " complaint was submitted in your area.",
                complaint.getId()
        );

        return toResponse(complaint);
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> getAll() {
        return complaintRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> getByArea(Long areaId) {
        Area area = areaService.getById(areaId);
        return complaintRepository.findByAreaOrderByCreatedAtDesc(area)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> getMyCitizen(User citizen) {
        return complaintRepository.findByCitizenOrderByCreatedAtDesc(citizen)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> getAssigned(User coordinator) {
        return complaintRepository.findByAssignedCoordinatorOrderByCreatedAtDesc(coordinator)
                .stream().map(this::toResponse).collect(Collectors.toList());
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
        }

        if (newStatus == ComplaintStatus.CLOSED) {
            complaint.setClosedAt(LocalDateTime.now());
        }

        complaintRepository.save(complaint);
        auditService.logAction(coordinator, "STATUS_CHANGED", "COMPLAINT", id, old.name(), newStatus.name());

        notificationService.create(
                complaint.getCitizen(),
                "Complaint status updated",
                "Your complaint is now: " + newStatus.name().replace("_", " "),
                NotificationType.COMPLAINT_UPDATE,
                id
        );

        return toResponse(complaint);
    }

    @Transactional
    public ComplaintResponse upvote(User citizen, String id) {
        Complaint complaint = findOrThrow(id);
        if (complaint.getUpvotedCitizenIds() == null) {
            complaint.setUpvotedCitizenIds(new java.util.HashSet<String>());
        }
        // Toggle: remove if already voted, add if not
        if (complaint.getUpvotedCitizenIds().contains(citizen.getId())) {
            complaint.getUpvotedCitizenIds().remove(citizen.getId());
        } else {
            complaint.getUpvotedCitizenIds().add(citizen.getId());
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

        double dLat = Math.abs(req.getLatitude() - complaint.getLatitude());
        double dLng = Math.abs(req.getLongitude() - complaint.getLongitude());
        double distance = Math.sqrt(dLat * dLat + dLng * dLng);
        if (distance > NEARBY_DELTA) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You must be within 25 meters of the complaint location to complete it.");
        }
        boolean locationValid = true;

        Proof proof = Proof.builder()
                .id(idGenerator.nextProofId())
                .complaint(complaint)
                .coordinator(coordinator)
                .imageUrl(req.getImageUrl())
                .latitude(req.getLatitude())
                .longitude(req.getLongitude())
                .distanceFromComplaint(distance)
                .isLocationValid(locationValid)
                .build();

        proofRepository.save(proof);
        complaint.setStatus(ComplaintStatus.COMPLETED);
        complaintRepository.save(complaint);

        notificationService.create(
                complaint.getCitizen(),
                "Resolution submitted",
                "Your complaint has been marked as resolved. Please confirm or reject.",
                NotificationType.COMPLAINT_UPDATE,
                id
        );

        return toResponse(complaint);
    }

    @Transactional
    public ComplaintResponse citizenResolve(User detachedCitizen, String id, boolean accepted) {
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
            complaint.setAssignedCoordinator(null);
            complaintRepository.save(complaint);
            assignCoordinator(complaint);
            auditService.log(citizen, "COMPLAINT_REOPENED", complaint);
        }

        complaintRepository.save(complaint);
        return toResponse(complaint);
    }

    @Transactional
    public void assignCoordinator(Complaint complaint) {
        // Use area ID equality (not object reference) to avoid JPA proxy mismatch
        Long areaId = complaint.getArea() != null ? complaint.getArea().getId() : null;
        List<User> coordinators = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.COORDINATOR
                        && u.getStatus() == UserStatus.ACTIVE
                        && u.getArea() != null
                        && u.getArea().getId().equals(areaId))
                .collect(Collectors.toList());

        if (coordinators.isEmpty()) return;

        User assigned = coordinators.get(new Random().nextInt(coordinators.size()));
        complaint.setAssignedCoordinator(assigned);
        complaint.setStatus(ComplaintStatus.ASSIGNED);

        complaint.setSlaDeadline(LocalDateTime.now().plusHours(complaint.getCategory().getDefaultSlaHours()));

        complaintRepository.save(complaint);

        notificationService.create(
                assigned,
                "Complaint assigned to you",
                "A new complaint has been assigned to you in " + complaint.getArea().getName(),
                NotificationType.COMPLAINT_UPDATE,
                complaint.getId()
        );
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

    public ComplaintResponse toResponse(Complaint c) {
        return complaintMapper.toResponse(c);
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
                next == ComplaintStatus.COMPLETED || next == ComplaintStatus.DELAYED;
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
