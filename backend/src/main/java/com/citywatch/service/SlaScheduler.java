package com.citywatch.service;

import com.citywatch.entity.Complaint;
import com.citywatch.entity.Escalation;
import com.citywatch.enums.ComplaintStatus;
import com.citywatch.enums.EscalationReason;
import com.citywatch.enums.NotificationType;
import com.citywatch.repository.ComplaintRepository;
import com.citywatch.repository.EscalationRepository;
import com.citywatch.util.CwIdGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class SlaScheduler {

    private final ComplaintRepository complaintRepository;
    private final EscalationRepository escalationRepository;
    private final NotificationService notificationService;
    private final CwIdGenerator idGenerator;

    // Runs every hour
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void checkSlaDeadlines() {
        List<Complaint> overdue = complaintRepository.findOverduComplaints(LocalDateTime.now());
        log.info("SLA check: found {} overdue complaints", overdue.size());

        for (Complaint complaint : overdue) {
            complaint.setStatus(ComplaintStatus.DELAYED);
            complaint.setEscalationLevel(complaint.getEscalationLevel() + 1);

            Escalation escalation = Escalation.builder()
                    .id(idGenerator.nextEscalationId())
                    .complaint(complaint)
                    .level(complaint.getEscalationLevel())
                    .reason(EscalationReason.SLA_EXCEEDED)
                    .notes("SLA deadline exceeded. Complaint past deadline: " + complaint.getSlaDeadline())
                    .build();

            escalationRepository.save(escalation);

            notificationService.notifyAdmins(
                    "SLA Breach — Complaint #" + complaint.getId(),
                    "Complaint in " + complaint.getArea().getName() + " has exceeded its SLA deadline.",
                    complaint.getId()  // String complaint ID
            );

            if (complaint.getAssignedCoordinator() != null) {
                notificationService.create(
                        complaint.getAssignedCoordinator(),
                        "SLA overdue warning",
                        "Complaint #" + complaint.getId() + " has passed its SLA deadline. Please escalate.",
                        NotificationType.SYSTEM,
                        complaint.getId()
                );
            }

            complaintRepository.save(complaint);
        }
    }
}
