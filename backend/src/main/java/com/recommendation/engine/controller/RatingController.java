package com.recommendation.engine.controller;

import com.recommendation.engine.model.Rating;
import com.recommendation.engine.model.User;
import com.recommendation.engine.service.AuthService;
import com.recommendation.engine.service.RatingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/ratings")
@CrossOrigin(origins = "*")
public class RatingController {

    private final RatingService ratingService;
    private final AuthService authService;

    public RatingController(RatingService ratingService, AuthService authService) {
        this.ratingService = ratingService;
        this.authService = authService;
    }

    @PostMapping
    public ResponseEntity<?> submitRating(
            @RequestBody Map<String, Object> payload,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Guest-Id", required = false) String guestHeader) {

        String effectiveUserId = null;
        if (authHeader != null && !authHeader.trim().isEmpty()) {
            Optional<User> user = authService.getCurrentUser(authHeader);
            if (user.isPresent()) {
                effectiveUserId = user.get().getId();
            }
        }
        if (effectiveUserId == null && guestHeader != null && !guestHeader.trim().isEmpty()) {
            effectiveUserId = guestHeader.trim();
        }
        if (effectiveUserId == null && payload.containsKey("userId")) {
            effectiveUserId = (String) payload.get("userId");
        }
        if (effectiveUserId == null || effectiveUserId.trim().isEmpty()) {
            effectiveUserId = "guest_" + UUID.randomUUID().toString().substring(0, 8);
        }

        String itemType = (String) payload.getOrDefault("itemType", "MOVIE");
        String itemId = (String) payload.get("itemId");
        Object rawVal = payload.get("ratingValue");
        if (rawVal == null) {
            rawVal = payload.get("rating");
        }
        String comment = (String) payload.getOrDefault("comment", payload.getOrDefault("review", ""));

        if (itemId == null || rawVal == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "itemId and rating/ratingValue are required"));
        }

        double ratingValue;
        try {
            ratingValue = Double.parseDouble(rawVal.toString());
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid ratingValue format"));
        }

        Rating rating = ratingService.addOrUpdateRating(
                effectiveUserId,
                itemType,
                itemId,
                ratingValue,
                comment
        );

        return ResponseEntity.ok(rating);
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyRatings(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Guest-Id", required = false) String guestHeader) {

        String effectiveUserId = null;
        if (authHeader != null) {
            Optional<User> user = authService.getCurrentUser(authHeader);
            if (user.isPresent()) {
                effectiveUserId = user.get().getId();
            }
        }
        if (effectiveUserId == null && guestHeader != null && !guestHeader.trim().isEmpty()) {
            effectiveUserId = guestHeader.trim();
        }

        if (effectiveUserId == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        List<Rating> ratings = ratingService.getUserRatings(effectiveUserId);
        return ResponseEntity.ok(ratings);
    }

    @GetMapping("/item/{itemType}/{itemId}")
    public ResponseEntity<List<Rating>> getItemRatings(
            @PathVariable String itemType,
            @PathVariable String itemId) {
        return ResponseEntity.ok(ratingService.getItemRatings(itemType, itemId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRating(
            @PathVariable String id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        Optional<User> user = authService.getCurrentUser(authHeader);
        if (user.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        boolean deleted = ratingService.deleteRating(id, user.get().getId());
        return ResponseEntity.ok(Map.of("deleted", deleted));
    }
}
