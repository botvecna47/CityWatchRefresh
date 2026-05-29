package com.citywatch.repository;

import com.citywatch.entity.Comment;
import com.citywatch.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, String> {
    List<Comment> findByComplaintAndIsModeratedFalseOrderByCreatedAtAsc(Complaint complaint);
    long countByComplaintAndIsModeratedFalse(Complaint complaint);
}
