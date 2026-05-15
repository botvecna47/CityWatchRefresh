package com.citywatch.controller;

import com.citywatch.dto.LoginRequest;
import com.citywatch.dto.LoginResponse;
import com.citywatch.dto.RegisterRequest;
import com.citywatch.entity.User;
import com.citywatch.enums.Role;
import com.citywatch.repository.UserRepository;
import com.citywatch.security.CustomUserDetails;
import com.citywatch.security.JwtUtils;
import com.citywatch.service.EmailVerificationService;
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
@Transactional
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CwIdGenerator idGenerator;
    private final EmailVerificationService emailVerificationService;

    // ─── POST /api/auth/login ───────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            User user = userDetails.getUser();

            LoginResponse response = buildLoginResponse(user, jwt);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid email or password."));
        }
    }

    // ─── POST /api/auth/send-otp ────────────────────────────────────────────
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required."));
        }
        if (userRepository.existsByEmail(email.toLowerCase())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "An account with this email already exists."));
        }
        emailVerificationService.sendOtp(email.toLowerCase());
        return ResponseEntity.ok(Map.of("message", "Verification code sent. Check your email (and the server console)."));
    }

    // ─── POST /api/auth/verify-otp ──────────────────────────────────────────
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp   = body.get("otp");
        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and OTP are required."));
        }
        boolean valid = emailVerificationService.verifyOtp(email.toLowerCase(), otp);
        if (!valid) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid or expired verification code. Please request a new one."));
        }
        return ResponseEntity.ok(Map.of("verified", true));
    }

    // ─── POST /api/auth/register ────────────────────────────────────────────
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {

        // Check if email already exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "An account with this email already exists."));
        }

        // Resolve stateCode / rtoCode (frontend may not send them; default to MH/00)
        String stateCode = (registerRequest.getStateCode() != null && !registerRequest.getStateCode().isBlank())
                ? registerRequest.getStateCode().toUpperCase() : "MH";
        String rtoCode   = (registerRequest.getRtoCode() != null && !registerRequest.getRtoCode().isBlank())
                ? registerRequest.getRtoCode() : "00";

        // Generate structured user ID: {STATE}{RTO}{TYPE}{7-seq}
        String userId = idGenerator.nextUserId(Role.CITIZEN, stateCode, rtoCode);

        // Generate a unique username from the name (lowercase, underscores)
        String baseUsername = registerRequest.getName().toLowerCase().replaceAll("\\s+", "_");
        String username = baseUsername;
        int counter = 1;
        while (userRepository.existsByUsername(username)) {
            username = baseUsername + "_" + counter++;
        }

        // Create and persist the user
        User user = User.builder()
                .id(userId)
                .username(username)
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .role(Role.CITIZEN)
                .city(registerRequest.getCity())
                .stateCode(stateCode)
                .rtoCode(rtoCode)
                .build();

        user = userRepository.save(user);

        // Auto-login: generate JWT for the new user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(registerRequest.getEmail(), registerRequest.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        LoginResponse response = buildLoginResponse(user, jwt);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ─── GET /api/auth/me ───────────────────────────────────────────────────
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()
                || authentication.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Not authenticated."));
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getUser().getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        LoginResponse response = buildLoginResponse(user, null);
        return ResponseEntity.ok(response);
    }

    private LoginResponse buildLoginResponse(User user, String jwt) {
        return LoginResponse.builder()
                .token(jwt)
                .id(user.getId())
                .username(user.getUsername())
                .name(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .status(user.getStatus().name())
                .area(user.getArea() != null ? user.getArea().getName() : null)
                .build();
    }
}
