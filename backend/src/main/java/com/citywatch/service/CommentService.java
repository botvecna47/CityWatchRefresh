package com.citywatch.service;

import com.citywatch.dto.request.CommentRequest;
import com.citywatch.dto.response.CommentResponse;
import com.citywatch.entity.Comment;
import com.citywatch.entity.Complaint;
import com.citywatch.entity.User;
import com.citywatch.repository.CommentRepository;
import com.citywatch.repository.ComplaintRepository;
import com.citywatch.util.CwIdGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final ComplaintRepository complaintRepository;
    private final CwIdGenerator idGenerator;

    public List<CommentResponse> getComments(String complaintId) {
        Complaint complaint = findComplaint(complaintId);
        return commentRepository.findByComplaintAndIsModeratedFalseOrderByCreatedAtAsc(complaint)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public CommentResponse addComment(User user, String complaintId, CommentRequest req) {
        Complaint complaint = findComplaint(complaintId);

        Comment parent = null;
        if (req.getParentId() != null) {
            parent = commentRepository.findById(req.getParentId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parent comment not found"));
        }

        Comment comment = Comment.builder()
                .id(idGenerator.nextCommentId())
                .complaint(complaint)
                .user(user)
                .content(req.getContent())
                .parent(parent)
                .build();

        return toResponse(commentRepository.save(comment));
    }

    @Transactional
    public void moderateComment(String commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));
        comment.setIsModerated(true);
        commentRepository.save(comment);
    }

    private Complaint findComplaint(String id) {
        return complaintRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Complaint not found"));
    }

    private CommentResponse toResponse(Comment c) {
        return CommentResponse.builder()
                .id(c.getId())
                .complaintId(c.getComplaint().getId())
                .authorId(c.getUser().getId())
                .authorName(c.getUser().getUsername())
                .authorRole(c.getUser().getRole().name())
                .content(c.getContent())
                .parentId(c.getParent() != null ? c.getParent().getId() : null)
                .createdAt(c.getCreatedAt())
                .build();
    }
}
