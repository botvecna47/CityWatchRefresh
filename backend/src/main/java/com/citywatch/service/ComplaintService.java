package com.citywatch.service;

import com.citywatch.dto.request.ComplaintRequest;
import com.citywatch.dto.request.ProofRequest;
import com.citywatch.dto.response.ComplaintResponse;
import com.citywatch.entity.*;
import com.citywatch.enums.*;
import com.citywatch.repository.*;
import com.citywatch.util.CwIdGenerator;
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
    private final AreaRepository areaRepository;
    private final UserRepository userRepository;
    private final SlaConfigRepository slaConfigRepository;
    private final ProofRepository proofRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;
    private final CwIdGenerator idGenerator;

    private static final double NEARBY_DELTA = 0.005; // ~500m

    @Transactional
    public ComplaintResponse submit(User citizen, ComplaintRequest req) {
        long recentCount = complaintRepository.countByCitizenSince(citizen, LocalDateTime.now().minusHours(24));
        if (recentCount >= 3) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "You can submit at most 3 complaints per day.");
        }

        Area area = findNearestArea(req.getLatitude(), req.getLongitude());

        Category category;
        try {
            category = Category.valueOf(req.getCategory().toUpperCase());
        } catch (IllegalArgumentException e) {
            category = Category.OTHER;
        }

        Complaint complaint = Complaint.builder()
                .id(idGenerator.nextComplaintId())
                .citizen(citizen)
                .area(area)
                .category(category)
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
                "A new " + category.name().toLowerCase() + " complaint was submitted in your area.",
                complaint.getId()
        );

        return toResponse(complaint);
    }

    public List<ComplaintResponse> getAll() {
        return complaintRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<ComplaintResponse> getByArea(Long areaId) {
        Area area = areaRepository.findById(areaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Area not found"));
        return complaintRepository.findByAreaOrderByCreatedAtDesc(area)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<ComplaintResponse> getMyCitizen(User citizen) {
        return complaintRepository.findByCitizenOrderByCreatedAtDesc(citizen)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<ComplaintResponse> getAssigned(User coordinator) {
        return complaintRepository.findByAssignedCoordinatorOrderByCreatedAtDesc(coordinator)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<ComplaintResponse> getNearby(Double lat, Double lng) {
        return complaintRepository.findNearby(lat, lng, NEARBY_DELTA)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ComplaintResponse getById(String id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional
    public ComplaintResponse updateStatus(User coordinator, String id, ComplaintStatus newStatus) {
        Complaint complaint = findOrThrow(id);
        validateTransition(complaint.getStatus(), newStatus);

        ComplaintStatus old = complaint.getStatus();
        complaint.setStatus(newStatus);

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
        if (!complaint.getUpvotedCitizenIds().contains(citizen.getId())) {
            complaint.getUpvotedCitizenIds().add(citizen.getId());
            recalculateIntensity(complaint);
            complaintRepository.save(complaint);
        }
        return toResponse(complaint);
    }

    @Transactional
    public ComplaintResponse submitProof(User coordinator, String id, ProofRequest req) {
        Complaint complaint = findOrThrow(id);

        if (complaint.getAssignedCoordinator() == null ||
                !complaint.getAssignedCoordinator().getId().equals(coordinator.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not assigned to this complaint");
        }

        double dLat = Math.abs(req.getLatitude() - complaint.getLatitude());
        double dLng = Math.abs(req.getLongitude() - complaint.getLongitude());
        double distance = Math.sqrt(dLat * dLat + dLng * dLng);
        boolean locationValid = distance <= NEARBY_DELTA * 2;

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
    public ComplaintResponse citizenResolve(User citizen, String id, boolean accepted) {
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
        List<User> coordinators = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.COORDINATOR
                        && u.getStatus() == UserStatus.ACTIVE
                        && complaint.getArea().equals(u.getArea()))
                .collect(Collectors.toList());

        if (coordinators.isEmpty()) return;

        User assigned = coordinators.get(new Random().nextInt(coordinators.size()));
        complaint.setAssignedCoordinator(assigned);
        complaint.setStatus(ComplaintStatus.ASSIGNED);

        slaConfigRepository.findByCategory(complaint.getCategory()).ifPresent(sla ->
                complaint.setSlaDeadline(LocalDateTime.now().plusHours(sla.getSlaHours()))
        );

        complaintRepository.save(complaint);

        notificationService.create(
                assigned,
                "Complaint assigned to you",
                "A new complaint has been assigned to you in " + complaint.getArea().getName(),
                NotificationType.COMPLAINT_UPDATE,
                complaint.getId()
        );
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
        return ComplaintResponse.builder()
                .id(c.getId())
                .category(c.getCategory().name())
                .description(c.getDescription())
                .imageUrls(c.getImageUrls())
                .status(c.getStatus().name())
                .priority(c.getPriority().name())
                .latitude(c.getLatitude())
                .longitude(c.getLongitude())
                .intensityScore(c.getIntensityScore())
                .areaId(c.getArea() != null ? c.getArea().getId() : null)
                .areaName(c.getArea() != null ? c.getArea().getName() : null)
                .citizenId(c.getCitizen().getId())
                .citizenName(c.getCitizen().getUsername())
                .coordinatorId(c.getAssignedCoordinator() != null ? c.getAssignedCoordinator().getId() : null)
                .coordinatorName(c.getAssignedCoordinator() != null ? c.getAssignedCoordinator().getUsername() : null)
                .escalationLevel(c.getEscalationLevel())
                .reopenCount(c.getReopenCount())
                .upvotes(c.getUpvotedCitizenIds() != null ? c.getUpvotedCitizenIds().size() : 0)
                .createdAt(c.getCreatedAt())
                .slaDeadline(c.getSlaDeadline())
                .closedAt(c.getClosedAt())
                .build();
    }

    private Complaint findOrThrow(String id) {
        return complaintRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Complaint not found"));
    }

    private Area findNearestArea(Double lat, Double lng) {
        return areaRepository.findAll().stream()
                .min((a, b) -> {
                    double da = Math.abs(a.getCenterLat() - lat) + Math.abs(a.getCenterLng() - lng);
                    double db = Math.abs(b.getCenterLat() - lat) + Math.abs(b.getCenterLng() - lng);
                    return Double.compare(da, db);
                })
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No areas configured"));
    }

    private void validateTransition(ComplaintStatus current, ComplaintStatus next) {
        boolean valid = switch (current) {
            case PENDING_REVIEW -> next == ComplaintStatus.APPROVED || next == ComplaintStatus.REJECTED;
            case APPROVED -> next == ComplaintStatus.ASSIGNED;
            case ASSIGNED -> next == ComplaintStatus.IN_PROGRESS;
            case IN_PROGRESS -> next == ComplaintStatus.COMPLETED || next == ComplaintStatus.DELAYED;
            case COMPLETED -> next == ComplaintStatus.CLOSED || next == ComplaintStatus.REOPENED;
            case REOPENED -> next == ComplaintStatus.ASSIGNED;
            case DELAYED -> next == ComplaintStatus.IN_PROGRESS || next == ComplaintStatus.ESCALATED;
            default -> false;
        };
        if (!valid) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid status transition: " + current + " → " + next);
        }
    }
}
