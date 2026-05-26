package com.citywatch.service;

import com.citywatch.dto.request.CommentRequest;
import com.citywatch.dto.response.CommentResponse;
import com.citywatch.entity.Comment;
import com.citywatch.entity.Complaint;
import com.citywatch.entity.User;
import com.citywatch.repository.CommentRepository;
import com.citywatch.repository.ComplaintRepository;
import com.citywatch.util.CwIdGenerator;
import com.citywatch.enums.NotificationType;
import com.citywatch.enums.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final ComplaintRepository complaintRepository;
    private final CwIdGenerator idGenerator;
    private final NotificationService notificationService;

    public CommentService(CommentRepository commentRepository, ComplaintRepository complaintRepository, CwIdGenerator idGenerator, NotificationService notificationService) {
        this.commentRepository = commentRepository;
        this.complaintRepository = complaintRepository;
        this.idGenerator = idGenerator;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
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

        Comment savedComment = commentRepository.save(comment);

        // --- Notification Logic ---
        if (user.getRole() == Role.COORDINATOR && complaint.getCitizen() != null) {
            notificationService.create(
                complaint.getCitizen(),
                "New Response on Your Report",
                user.getFullName() + " left a comment on your report: \"" + complaint.getTitle() + "\"",
                NotificationType.COMPLAINT_UPDATE,
                complaint.getId()
            );
        } else if (user.getRole() == Role.CITIZEN && complaint.getAssignedCoordinator() != null) {
            notificationService.create(
                complaint.getAssignedCoordinator(),
                "New Comment from Citizen",
                "The citizen commented on your assigned task: \"" + complaint.getTitle() + "\"",
                NotificationType.COMPLAINT_UPDATE,
                complaint.getId()
            );
        }

        return toResponse(savedComment);
    }

    @Transactional
    public void moderateComment(String commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));
        comment.setIsModerated(true);
        commentRepository.save(comment);

        // Notify the author that their comment was moderated
        notificationService.create(
            comment.getUser(),
            "Comment Removed",
            "Your comment on the report \"" + comment.getComplaint().getTitle() + "\" was removed by a moderator for violating community guidelines.",
            NotificationType.SYSTEM,
            comment.getComplaint().getId()
        );
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
                .authorName(c.getUser().getFullName())
                .authorRole(c.getUser().getRole().name())
                .content(c.getContent())
                .parentId(c.getParent() != null ? c.getParent().getId() : null)
                .createdAt(c.getCreatedAt())
                .build();
    }
}
