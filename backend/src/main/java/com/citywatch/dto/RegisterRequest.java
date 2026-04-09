package com.citywatch.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 50, message = "Name must be 2-50 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "City is required")
    private String city;

    /**
     * 2-letter Indian state code (e.g. GJ, MH, DL, KA, TN).
     * Used to build the user ID: {STATE}{RTO}{TYPE}{7-seq}
     */
    @NotBlank(message = "State code is required")
    @Size(min = 2, max = 2, message = "State code must be exactly 2 letters")
    @Pattern(regexp = "[A-Za-z]{2}", message = "State code must be 2 alphabetic characters")
    private String stateCode;

    /**
     * 2-digit RTO district code (e.g. 01, 05, 12).
     * Prefixed in the user ID to encode their registration zone.
     */
    @NotBlank(message = "RTO code is required")
    @Size(min = 2, max = 2, message = "RTO code must be exactly 2 digits")
    @Pattern(regexp = "\\d{2}", message = "RTO code must be 2 digits")
    private String rtoCode;
}
