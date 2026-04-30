package com.citywatch.repository;

import com.citywatch.entity.Complaint;
import com.citywatch.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, String> {
    List<Message> findByComplaintOrderByCreatedAtAsc(Complaint complaint);
}
