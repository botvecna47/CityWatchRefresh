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

@Component
public class SlaScheduler {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(SlaScheduler.class);

    private final ComplaintRepository complaintRepository;
    private final EscalationRepository escalationRepository;
    private final NotificationService notificationService;
    private final CwIdGenerator idGenerator;

    public SlaScheduler(ComplaintRepository complaintRepository, EscalationRepository escalationRepository,
                        NotificationService notificationService, CwIdGenerator idGenerator) {
        this.complaintRepository = complaintRepository;
        this.escalationRepository = escalationRepository;
        this.notificationService = notificationService;
        this.idGenerator = idGenerator;
    }

    // Runs every hour
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void checkSlaDeadlines() {
        List<Complaint> overdue = complaintRepository.findOverduComplaints(LocalDateTime.now());
        log.info("SLA check: found {} overdue complaints", overdue.size());

        for (Complaint complaint : overdue) {
            // Skip complaints already in a terminal state — they should never be set to DELAYED
            ComplaintStatus current = complaint.getStatus();
            if (current == ComplaintStatus.COMPLETED || current == ComplaintStatus.CLOSED
                    || current == ComplaintStatus.REJECTED || current == ComplaintStatus.ESCALATED) {
                log.info("SLA check: skipping {} — already in terminal state {}", complaint.getId(), current);
                continue;
            }

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

            String areaName = (complaint.getArea() != null) ? complaint.getArea().getName() : "Unknown Area";
            notificationService.notifyAdmins(
                    "SLA Breach — Complaint #" + complaint.getId(),
                    "Complaint in " + areaName + " has exceeded its SLA deadline.",
                    complaint.getId()
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
