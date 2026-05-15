package com.citywatch.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 3, max = 50, message = "Name must be 3-50 characters")
    @Pattern(regexp = "^[a-zA-Z\\s\\-]+$", message = "Name can only contain letters, spaces, and hyphens")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email")
    private String email;

    /**
     * Strong password policy enforced on both frontend and backend.
     * Must be at least 12 characters and include:
     * - 1 uppercase letter
     * - 1 lowercase letter
     * - 1 digit
     * - 1 special character from: !@#$%^&*(),.?":{}|<>
     */
    @NotBlank(message = "Password is required")
    @Size(min = 12, message = "Password must be at least 12 characters")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*(),.?\":{}|<>]).{12,}$",
        message = "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character"
    )
    private String password;

    @NotBlank(message = "City is required")
    private String city;

    /**
     * stateCode and rtoCode are kept for ID generation backward-compatibility,
     * but are now optional — the frontend sends "MH" / "00" as defaults.
     * Defaulting is handled in AuthController if null.
     */
    private String stateCode = "MH";
    private String rtoCode   = "00";
}
