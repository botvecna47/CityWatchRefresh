package com.citywatch.controller;

import com.citywatch.dto.request.UserSettingsRequest;
import com.citywatch.entity.User;
import com.citywatch.entity.UserSettings;
import com.citywatch.repository.UserSettingsRepository;
import com.citywatch.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings/me")
public class UserSettingsController {

    private final UserSettingsRepository userSettingsRepository;

    public UserSettingsController(UserSettingsRepository userSettingsRepository) {
        this.userSettingsRepository = userSettingsRepository;
    }

    @GetMapping
    public ResponseEntity<UserSettings> getSettings(@AuthenticationPrincipal CustomUserDetails principal) {
        User user = principal.getUser();
        UserSettings settings = userSettingsRepository.findByUser(user)
                .orElseGet(() -> {
                    UserSettings newSettings = new UserSettings(user);
                    return userSettingsRepository.save(newSettings);
                });
        return ResponseEntity.ok(settings);
    }

    @PatchMapping
    public ResponseEntity<UserSettings> updateSettings(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestBody UserSettingsRequest req) {
        User user = principal.getUser();
        UserSettings settings = userSettingsRepository.findByUser(user)
                .orElse(new UserSettings(user));

        if (req.getEmailNotifications() != null) settings.setEmailNotifications(req.getEmailNotifications());
        if (req.getSmsNotifications() != null) settings.setSmsNotifications(req.getSmsNotifications());
        if (req.getTheme() != null) settings.setTheme(req.getTheme());

        return ResponseEntity.ok(userSettingsRepository.save(settings));
    }
}
