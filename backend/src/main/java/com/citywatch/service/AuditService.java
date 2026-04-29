package com.citywatch.service;

import com.citywatch.entity.AuditLog;
import com.citywatch.entity.Complaint;
import com.citywatch.entity.User;
import com.citywatch.repository.AuditLogRepository;
import com.citywatch.util.CwIdGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final CwIdGenerator idGenerator;

    public AuditService(AuditLogRepository auditLogRepository, CwIdGenerator idGenerator) {
        this.auditLogRepository = auditLogRepository;
        this.idGenerator = idGenerator;
    }

    public void log(User actor, String action, Complaint complaint) {
        AuditLog log = AuditLog.builder()
                .id(idGenerator.nextAuditId())
                .user(actor)
                .action(action)
                .entityType("COMPLAINT")
                .entityId(complaint.getId())
                .newValue(complaint.getStatus().name())
                .build();
        auditLogRepository.save(log);
    }

    public void logAction(User actor, String action, String entityType, String entityId, String oldValue, String newValue) {
        AuditLog log = AuditLog.builder()
                .id(idGenerator.nextAuditId())
                .user(actor)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .oldValue(oldValue)
                .newValue(newValue)
                .build();
        auditLogRepository.save(log);
    }
}
