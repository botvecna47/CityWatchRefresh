package com.citywatch.service;

import com.citywatch.dto.request.VoteRequest;
import com.citywatch.entity.Complaint;
import com.citywatch.entity.User;
import com.citywatch.entity.Vote;
import com.citywatch.enums.ComplaintStatus;
import com.citywatch.enums.NotificationType;
import com.citywatch.enums.TrustLevel;
import com.citywatch.enums.VoteDecision;
import com.citywatch.repository.ComplaintRepository;
import com.citywatch.repository.UserRepository;
import com.citywatch.repository.VoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class VoteService {

    private final VoteRepository voteRepository;
    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;
    private final ComplaintService complaintService;

    @Transactional
    public void castVote(User coordinator, Long complaintId, VoteRequest req) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Complaint not found"));

        if (complaint.getStatus() != ComplaintStatus.PENDING_REVIEW) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Complaint is not open for voting");
        }

        if (voteRepository.existsByComplaintAndCoordinator(complaint, coordinator)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already voted on this complaint");
        }

        Vote vote = Vote.builder()
                .complaint(complaint)
                .coordinator(coordinator)
                .decision(req.getDecision())
                .comment(req.getComment())
                .build();

        voteRepository.save(vote);
        auditService.logAction(coordinator, "VOTE_CAST", "COMPLAINT", complaintId, null, req.getDecision().name());

        evaluateVotes(complaint);
    }

    private void evaluateVotes(Complaint complaint) {
        long totalVotes = voteRepository.countByComplaint(complaint);
        if (totalVotes < 3) return;

        long validVotes = voteRepository.countByComplaintAndDecision(complaint, VoteDecision.VALID);
        long invalidVotes = voteRepository.countByComplaintAndDecision(complaint, VoteDecision.INVALID);

        double validRatio = (double) validVotes / totalVotes;
        double invalidRatio = (double) invalidVotes / totalVotes;

        if (validRatio >= 0.6) {
            complaint.setStatus(ComplaintStatus.APPROVED);
            complaintRepository.save(complaint);
            complaintService.assignCoordinator(complaint);
            complaintService.recalculateIntensity(complaint);

            notificationService.create(
                    complaint.getCitizen(),
                    "Complaint approved",
                    "Your complaint has been validated and a coordinator has been assigned.",
                    NotificationType.COMPLAINT_UPDATE,
                    complaint.getId()
            );

        } else if (invalidRatio >= 0.6) {
            complaint.setStatus(ComplaintStatus.REJECTED);
            complaintRepository.save(complaint);

            User citizen = complaint.getCitizen();
            citizen.setStrikeCount(citizen.getStrikeCount() + 1);
            if (citizen.getStrikeCount() >= 3) {
                citizen.setTrustLevel(TrustLevel.RESTRICTED);
            } else if (citizen.getStrikeCount() >= 1) {
                citizen.setTrustLevel(TrustLevel.UNDER_REVIEW);
            }
            userRepository.save(citizen);

            notificationService.create(
                    citizen,
                    "Complaint rejected",
                    "Your complaint could not be validated by coordinators.",
                    NotificationType.COMPLAINT_UPDATE,
                    complaint.getId()
            );

        } else {
            notificationService.notifyAdmins(
                    "Vote tie — admin review needed",
                    "Complaint #" + complaint.getId() + " has a voting tie and needs admin review.",
                    complaint.getId()
            );
        }
    }
}
