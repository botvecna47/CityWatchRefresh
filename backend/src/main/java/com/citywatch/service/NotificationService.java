package com.citywatch.service;

import com.citywatch.dto.response.NotificationResponse;
import com.citywatch.entity.Notification;
import com.citywatch.entity.User;
import com.citywatch.enums.NotificationType;
import com.citywatch.enums.Role;
import com.citywatch.repository.NotificationRepository;
import com.citywatch.repository.UserRepository;
import com.citywatch.util.CwIdGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final CwIdGenerator idGenerator;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository,
                               CwIdGenerator idGenerator, SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.idGenerator = idGenerator;
        this.messagingTemplate = messagingTemplate;
    }

    public void create(User user, String title, String message, NotificationType type, String referenceId) {
        Notification notification = Notification.builder()
                .id(idGenerator.nextNotificationId())
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .referenceId(referenceId)
                .build();
        notificationRepository.save(notification);
        
        // Push to WebSocket
        messagingTemplate.convertAndSend(
                "/topic/notifications/" + user.getId(), 
                toResponse(notification)
        );
    }

    public void notifyCoordinatorsInArea(com.citywatch.entity.Area area, String title, String message, String referenceId) {
        List<User> coordinators = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.COORDINATOR
                        && u.getArea() != null
                        && area.getId().equals(u.getArea().getId()))  // ID equality — safe for JPA proxies
                .collect(Collectors.toList());

        for (User coordinator : coordinators) {
            create(coordinator, title, message, NotificationType.COMPLAINT_UPDATE, referenceId);
        }
    }

    public void notifyAdmins(String title, String message, String referenceId) {
        List<User> admins = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ADMIN)
                .collect(Collectors.toList());

        for (User admin : admins) {
            create(admin, title, message, NotificationType.SYSTEM, referenceId);
        }
    }

    public List<NotificationResponse> getForUser(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public void markRead(User user, String notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (n.getUser().getId().equals(user.getId())) {
                n.setIsRead(true);
                notificationRepository.save(n);
            }
        });
    }

    public void markAllRead(User user) {
        notificationRepository.markAllReadForUser(user);
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType().name())
                .isRead(Boolean.TRUE.equals(n.getIsRead()))
                .link(n.getReferenceId() != null ? "/report/" + n.getReferenceId() : null)
                .createdAt(n.getCreatedAt())
                .build();
    }
}
