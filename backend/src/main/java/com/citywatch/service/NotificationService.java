package com.citywatch.service;

import com.citywatch.dto.response.NotificationResponse;
import com.citywatch.entity.Notification;
import com.citywatch.entity.User;
import com.citywatch.enums.NotificationType;
import com.citywatch.enums.Role;
import com.citywatch.repository.NotificationRepository;
import com.citywatch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public void create(User user, String title, String message, NotificationType type, Long referenceId) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .referenceId(referenceId)
                .build();
        notificationRepository.save(notification);
    }

    public void notifyCoordinatorsInArea(com.citywatch.entity.Area area, String title, String message, Long referenceId) {
        List<User> coordinators = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.COORDINATOR && area.equals(u.getArea()))
                .collect(Collectors.toList());

        for (User coordinator : coordinators) {
            create(coordinator, title, message, NotificationType.COMPLAINT_UPDATE, referenceId);
        }
    }

    public void notifyAdmins(String title, String message, Long referenceId) {
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

    public void markRead(User user, Long notificationId) {
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
