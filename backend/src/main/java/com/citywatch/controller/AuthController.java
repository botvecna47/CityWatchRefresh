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

    // City → RTO code mapping for Maharashtra
    private static final java.util.Map<String, String> CITY_TO_RTO = java.util.Map.ofEntries(
        java.util.Map.entry("nanded", "26"),
        java.util.Map.entry("mumbai", "01"),
        java.util.Map.entry("pune", "11"),
        java.util.Map.entry("nagpur", "13"),
        java.util.Map.entry("aurangabad", "09"),
        java.util.Map.entry("nashik", "15"),
        java.util.Map.entry("solapur", "22"),
        java.util.Map.entry("kolhapur", "09"),
        java.util.Map.entry("thane", "04"),
        java.util.Map.entry("latur", "24")
    );

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
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail().toLowerCase(), loginRequest.getPassword()));

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
        if (userRepository.existsByEmailIgnoreCase(email.toLowerCase())) {
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
        String emailLower = registerRequest.getEmail().toLowerCase();

        // Gate: OTP must have been verified before registration is allowed
        if (!emailVerificationService.isVerified(emailLower)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Email not verified. Please complete the OTP verification step first."));
        }

        // Strict case-insensitive email uniqueness check
        if (userRepository.existsByEmailIgnoreCase(emailLower)) {
            emailVerificationService.consumeVerification(emailLower); // clear the verified flag
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "An account with this email already exists."));
        }

        // Resolve stateCode / rtoCode — auto-detect from city, fallback to MH/26 (Nanded default)
        String stateCode = (registerRequest.getStateCode() != null && !registerRequest.getStateCode().isBlank())
                ? registerRequest.getStateCode().toUpperCase() : "MH";
        String cityLower = registerRequest.getCity() != null ? registerRequest.getCity().trim().toLowerCase() : "";
        String rtoCode = CITY_TO_RTO.getOrDefault(cityLower,
                (registerRequest.getRtoCode() != null && !registerRequest.getRtoCode().isBlank()
                        && !registerRequest.getRtoCode().equals("00"))
                        ? registerRequest.getRtoCode() : "26");

        // Generate structured user ID: {STATE}{RTO}{TYPE}{7-seq}
        String userId = idGenerator.nextUserId(Role.CITIZEN, stateCode, rtoCode);

        // Generate a unique username from the name (lowercase, underscores)
        String baseUsername = registerRequest.getName().toLowerCase().replaceAll("\\s+", "_");
        String username = baseUsername;
        int counter = 1;
        while (userRepository.existsByUsername(username)) {
            username = baseUsername + "_" + counter++;
        }

        // City with null-safety fallback
        String city = (registerRequest.getCity() != null && !registerRequest.getCity().isBlank())
                ? registerRequest.getCity() : "";

        // Create and persist the user — store email in lowercase for consistency
        User user = User.builder()
                .id(userId)
                .username(username)
                .fullName(registerRequest.getName().trim())  // store original cased name
                .email(emailLower)
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .role(Role.CITIZEN)
                .city(city)
                .stateCode(stateCode)
                .rtoCode(rtoCode)
                .build();

        user = userRepository.save(user);

        // Consume the verified status — prevents re-registration with same OTP session
        emailVerificationService.consumeVerification(emailLower);

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
                .name(user.getFullName())   // return real full name, not the handle
                .email(user.getEmail())
                .role(user.getRole().name())
                .status(user.getStatus().name())
                .area(user.getArea() != null ? user.getArea().getName() : null)
                .build();
    }
}
