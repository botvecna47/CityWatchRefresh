package com.citywatch.service;

import com.citywatch.entity.AuditLog;
import com.citywatch.entity.Complaint;
import com.citywatch.entity.User;
import com.citywatch.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public void log(User actor, String action, Complaint complaint) {
        AuditLog log = AuditLog.builder()
                .user(actor)
                .action(action)
                .entityType("COMPLAINT")
                .entityId(complaint.getId())
                .newValue(complaint.getStatus().name())
                .build();
        auditLogRepository.save(log);
    }

    public void logAction(User actor, String action, String entityType, Long entityId, String oldValue, String newValue) {
        AuditLog log = AuditLog.builder()
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
