package com.citywatch.service;

import com.citywatch.dto.request.MessageRequest;
import com.citywatch.dto.response.MessageResponse;
import com.citywatch.entity.Complaint;
import com.citywatch.entity.Message;
import com.citywatch.entity.User;
import com.citywatch.enums.NotificationType;
import com.citywatch.enums.Role;
import com.citywatch.repository.ComplaintRepository;
import com.citywatch.repository.MessageRepository;
import com.citywatch.util.CwIdGenerator;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final ComplaintRepository complaintRepository;
    private final CwIdGenerator idGenerator;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;

    public MessageService(MessageRepository messageRepository, ComplaintRepository complaintRepository,
                          CwIdGenerator idGenerator, SimpMessagingTemplate messagingTemplate,
                          NotificationService notificationService) {
        this.messageRepository = messageRepository;
        this.complaintRepository = complaintRepository;
        this.idGenerator = idGenerator;
        this.messagingTemplate = messagingTemplate;
        this.notificationService = notificationService;
    }

    public List<MessageResponse> getMessages(User user, String complaintId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Complaint not found"));

        validateAccess(user, complaint);

        return messageRepository.findByComplaintOrderByCreatedAtAsc(complaint).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public MessageResponse sendMessage(User sender, String complaintId, MessageRequest req) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Complaint not found"));

        validateAccess(sender, complaint);

        Message message = Message.builder()
                .id(idGenerator.nextComplaintId().replace("CMP", "MSG"))
                .complaint(complaint)
                .sender(sender)
                .content(req.getContent())
                .build();

        message = messageRepository.save(message);

        MessageResponse response = toResponse(message);

        // Broadcast to WebSocket topic specific to this complaint
        messagingTemplate.convertAndSend("/topic/complaints/" + complaintId + "/messages", response);

        // Send a notification to the other party
        User recipient = null;
        if (sender.getRole() == Role.CITIZEN && complaint.getAssignedCoordinator() != null) {
            recipient = complaint.getAssignedCoordinator();
        } else if (sender.getRole() == Role.COORDINATOR) {
            recipient = complaint.getCitizen();
        }

        if (recipient != null) {
            notificationService.create(recipient, "New Message", "You have a new message on complaint #" + complaintId, NotificationType.COMPLAINT_UPDATE, complaintId);
        }

        return response;
    }

    private void validateAccess(User user, Complaint complaint) {
        if (user.getRole() == Role.ADMIN) return;
        if (user.getRole() == Role.CITIZEN && !complaint.getCitizen().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your complaint");
        }
        if (user.getRole() == Role.COORDINATOR && (complaint.getAssignedCoordinator() == null || !complaint.getAssignedCoordinator().getId().equals(user.getId()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not assigned to this complaint");
        }
    }

    private MessageResponse toResponse(Message m) {
        return MessageResponse.builder()
                .id(m.getId())
                .senderId(m.getSender().getId())
                .senderName(m.getSender().getUsername())
                .senderRole(m.getSender().getRole().name())
                .content(m.getContent())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
