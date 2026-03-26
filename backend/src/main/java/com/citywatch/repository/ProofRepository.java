package com.citywatch.repository;

import com.citywatch.entity.Complaint;
import com.citywatch.entity.Proof;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProofRepository extends JpaRepository<Proof, Long> {

    Optional<Proof> findByComplaint(Complaint complaint);
}
