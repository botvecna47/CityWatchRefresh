package com.citywatch.dto.request;

import com.citywatch.enums.VoteDecision;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VoteRequest {

    @NotNull(message = "Vote decision is required")
    private VoteDecision decision; // VALID, INVALID, NEEDS_CLARIFICATION

    private String comment; // optional note from coordinator
}
