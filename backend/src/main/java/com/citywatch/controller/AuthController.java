package com.citywatch.controller;

import com.citywatch.dto.LoginRequest;
import com.citywatch.dto.LoginResponse;
import com.citywatch.dto.RegisterRequest;
import com.citywatch.entity.User;
import com.citywatch.enums.Role;
import com.citywatch.repository.UserRepository;
import com.citywatch.security.CustomUserDetails;
import com.citywatch.security.JwtUtils;
import com.citywatch.util.CwIdGenerator;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Transactional
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CwIdGenerator idGenerator;

    // ─── POST /api/auth/login ───────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            User user = userDetails.getUser();

            LoginResponse response = LoginResponse.builder()
                    .token(jwt)
                    .id(user.getId())
                    .username(user.getUsername())
                    .name(user.getUsername())
                    .email(user.getEmail())
                    .role(user.getRole().name())
                    .status(user.getStatus().name())
                    .area(user.getArea() != null ? user.getArea().getName() : null)
                    .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid email or password."));
        }
    }

    // ─── POST /api/auth/register ────────────────────────────────────────
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {

        // Check if email already exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "An account with this email already exists."));
        }

        // Generate structured user ID: {STATE}{RTO}{TYPE}{7-seq}
        // Example: GJ05C0000001
        String userId = idGenerator.nextUserId(
                Role.CITIZEN,
                registerRequest.getStateCode(),
                registerRequest.getRtoCode()
        );

        // Generate a username from the name (lowercase, no spaces)
        String baseUsername = registerRequest.getName().toLowerCase().replaceAll("\\s+", "_");
        String username = baseUsername;
        int counter = 1;
        while (userRepository.existsByUsername(username)) {
            username = baseUsername + "_" + counter++;
        }

        // Create the user
        User user = User.builder()
                .id(userId)
                .username(username)
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .role(Role.CITIZEN)  // new signups are always citizens
                .city(registerRequest.getCity())
                .stateCode(registerRequest.getStateCode().toUpperCase())
                .rtoCode(registerRequest.getRtoCode())
                .build();

        user = userRepository.save(user);

        // Auto-login: generate JWT for the new user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(registerRequest.getEmail(), registerRequest.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        LoginResponse response = LoginResponse.builder()
                .token(jwt)
                .id(user.getId())
                .username(user.getUsername())
                .name(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .status(user.getStatus().name())
                .area(null)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ─── GET /api/auth/me ───────────────────────────────────────────────
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()
                || authentication.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Not authenticated."));
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();

        LoginResponse response = LoginResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .name(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .status(user.getStatus().name())
                .area(user.getArea() != null ? user.getArea().getName() : null)
                .build();

        return ResponseEntity.ok(response);
    }

    // ─── GET /api/auth/debug_users ───────────────────────────────────────────────
    @GetMapping("/debug_users")
    public ResponseEntity<?> debugUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }
}
