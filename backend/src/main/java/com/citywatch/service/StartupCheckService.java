package com.citywatch.service;

import com.citywatch.entity.Complaint;
import com.citywatch.enums.ComplaintStatus;
import com.citywatch.enums.NotificationType;
import com.citywatch.repository.ComplaintRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class StartupCheckService {

    private final ComplaintRepository complaintRepository;
    private final NotificationService notificationService;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void onApplicationReady() {
        log.info("Running startup checks for pending actions...");

        // 1. Find all REOPENED complaints where coordinator might need a reminder
        List<Complaint> reopenedComplaints = complaintRepository.findByStatusOrderByCreatedAtDesc(ComplaintStatus.REOPENED);
        
        for (Complaint complaint : reopenedComplaints) {
            if (complaint.getAssignedCoordinator() != null) {
                // Prevent spam: Check if we already sent a reminder recently
                boolean alreadyNotified = notificationService.getForUser(complaint.getAssignedCoordinator())
                    .stream()
                    .anyMatch(n -> n.getLink() != null 
                                && n.getLink().contains(complaint.getId()) 
                                && (n.getTitle().contains("Reopened") || n.getTitle().contains("Pending Reopened")));

                if (!alreadyNotified) {
                    log.info("Sending startup reminder for REOPENED complaint #{} to Coordinator {}", 
                            complaint.getId(), complaint.getAssignedCoordinator().getEmail());
                            
                    notificationService.create(
                            complaint.getAssignedCoordinator(),
                            "Pending Reopened Issue: " + complaint.getTitle(),
                            "Reminder: This issue was reopened by the citizen and requires your attention.\nReason: " + 
                            (complaint.getReopenReason() != null ? complaint.getReopenReason() : "No reason provided") + 
                            "\n\nPlease review and resolve it as soon as possible.",
                            NotificationType.COMPLAINT_UPDATE,
                            complaint.getId()
                    );
                } else {
                    log.info("Skipping reminder for {} - already notified.", complaint.getId());
                }
            }
        }
        
        log.info("Startup checks completed. Sent reminders for {} reopened complaints.", reopenedComplaints.size());
    }
}
