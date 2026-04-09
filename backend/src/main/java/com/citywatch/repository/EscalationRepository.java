package com.citywatch.repository;

import com.citywatch.entity.Complaint;
import com.citywatch.entity.Escalation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EscalationRepository extends JpaRepository<Escalation, String> {

    List<Escalation> findByComplaintOrderByTriggeredAtDesc(Complaint complaint);
}
