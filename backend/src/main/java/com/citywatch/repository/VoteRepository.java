package com.citywatch.repository;

import com.citywatch.entity.Complaint;
import com.citywatch.entity.User;
import com.citywatch.entity.Vote;
import com.citywatch.enums.VoteDecision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoteRepository extends JpaRepository<Vote, String> {

    List<Vote> findByComplaint(Complaint complaint);

    Optional<Vote> findByComplaintAndCoordinator(Complaint complaint, User coordinator);

    boolean existsByComplaintAndCoordinator(Complaint complaint, User coordinator);

    long countByComplaintAndDecision(Complaint complaint, VoteDecision decision);

    long countByComplaint(Complaint complaint);
}
