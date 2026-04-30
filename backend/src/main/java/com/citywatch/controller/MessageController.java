package com.citywatch.controller;

import com.citywatch.dto.request.MessageRequest;
import com.citywatch.dto.response.MessageResponse;
import com.citywatch.entity.User;
import com.citywatch.security.CustomUserDetails;
import com.citywatch.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints/{complaintId}/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @GetMapping
    public ResponseEntity<List<MessageResponse>> getMessages(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable String complaintId) {
        return ResponseEntity.ok(messageService.getMessages(principal.getUser(), complaintId));
    }

    @PostMapping
    public ResponseEntity<MessageResponse> sendMessage(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable String complaintId,
            @Valid @RequestBody MessageRequest req) {
        return ResponseEntity.ok(messageService.sendMessage(principal.getUser(), complaintId, req));
    }
}
