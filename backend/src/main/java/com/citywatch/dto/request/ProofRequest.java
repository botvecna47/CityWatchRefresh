package com.citywatch.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProofRequest {

    @NotBlank(message = "Proof image URL is required")
    private String imageUrl;

    @NotNull
    private Double latitude;

    @NotNull
    private Double longitude;
}
