package com.recommendation.engine.controller;

import com.recommendation.engine.model.User;
import com.recommendation.engine.model.UserSignal;
import com.recommendation.engine.service.AuthService;
import com.recommendation.engine.service.UserSignalService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/signals")
@CrossOrigin(origins = "*")
public class UserSignalController {

    private final UserSignalService userSignalService;
    private final AuthService authService;

    public UserSignalController(UserSignalService userSignalService, AuthService authService) {
        this.userSignalService = userSignalService;
        this.authService = authService;
    }

    private String resolveUserId(String authHeader, String guestHeader) {
        if (authHeader != null && !authHeader.trim().isEmpty()) {
            Optional<User> user = authService.getCurrentUser(authHeader);
            if (user.isPresent()) {
                return user.get().getId();
            }
        }
        if (guestHeader != null && !guestHeader.trim().isEmpty()) {
            return guestHeader.trim();
        }
        return null;
    }

    @PostMapping("/view")
    public ResponseEntity<?> recordView(
            @RequestBody Map<String, Object> payload,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Guest-Id", required = false) String guestHeader) {
        String userId = resolveUserId(authHeader, guestHeader);
        if (userId == null) {
            userId = "guest_" + UUID.randomUUID().toString().substring(0, 8);
        }

        String itemType = (String) payload.getOrDefault("itemType", "MOVIE");
        String itemId = (String) payload.get("itemId");
        @SuppressWarnings("unchecked")
        Map<String, String> meta = (Map<String, String>) payload.getOrDefault("metadata", Collections.emptyMap());

        UserSignal sig = userSignalService.recordView(userId, itemType, itemId, meta);
        return ResponseEntity.ok(sig);
    }

    @PostMapping("/search")
    public ResponseEntity<?> recordSearch(
            @RequestBody Map<String, String> payload,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Guest-Id", required = false) String guestHeader) {
        String userId = resolveUserId(authHeader, guestHeader);
        if (userId == null) {
            userId = "guest_" + UUID.randomUUID().toString().substring(0, 8);
        }

        String itemType = payload.getOrDefault("itemType", "ALL");
        String query = payload.get("query");

        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Query is required"));
        }

        UserSignal sig = userSignalService.recordSearch(userId, itemType, query.trim());
        return ResponseEntity.ok(sig);
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Guest-Id", required = false) String guestHeader) {
        String userId = resolveUserId(authHeader, guestHeader);
        if (userId == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        List<UserSignal> history = userSignalService.getUserHistory(userId);
        return ResponseEntity.ok(history);
    }

    @DeleteMapping("/history/{id}")
    public ResponseEntity<?> deleteSignal(
            @PathVariable String id,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Guest-Id", required = false) String guestHeader) {
        String userId = resolveUserId(authHeader, guestHeader);
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        boolean removed = userSignalService.deleteSignal(id, userId);
        return ResponseEntity.ok(Map.of("deleted", removed));
    }

    @DeleteMapping("/history/clear")
    public ResponseEntity<?> clearHistory(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Guest-Id", required = false) String guestHeader) {
        String userId = resolveUserId(authHeader, guestHeader);
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        userSignalService.clearHistory(userId);
        return ResponseEntity.ok(Map.of("message", "History cleared"));
    }
}
