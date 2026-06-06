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
import org.springframework.security.crypto.password.PasswordEncoder;
import com.citywatch.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;

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

    @PostMapping("/password")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestBody java.util.Map<String, String> body,
            @Autowired PasswordEncoder passwordEncoder,
            @Autowired UserRepository userRepository) {
        User user = principal.getUser();
        if (user.getPassword() != null && !passwordEncoder.matches(body.get("currentPw"), user.getPassword())) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Incorrect current password"));
        }
        user.setPassword(passwordEncoder.encode(body.get("newPw")));
        userRepository.save(user);
        return ResponseEntity.ok(java.util.Map.of("message", "Password updated successfully"));
    }
}
