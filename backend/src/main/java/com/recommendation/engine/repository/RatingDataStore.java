package com.recommendation.engine.repository;

import com.recommendation.engine.model.Rating;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

@Repository
public class RatingDataStore {

    private final List<Rating> ratingsList = new CopyOnWriteArrayList<>();
    private final Map<String, Rating> ratingById = new ConcurrentHashMap<>();

    public RatingDataStore() {
        initSampleCollaborativeRatings();
    }

    public List<Rating> getAllRatings() {
        return new ArrayList<>(ratingsList);
    }

    public synchronized Rating saveRating(String userId, String itemType, String itemId, double ratingValue, String comment) {
        // Check if user already rated this item, update if exists
        Optional<Rating> existing = ratingsList.stream()
                .filter(r -> r.getUserId().equals(userId) && r.getItemType().equalsIgnoreCase(itemType) && r.getItemId().equals(itemId))
                .findFirst();

        if (existing.isPresent()) {
            Rating r = existing.get();
            r.setRatingValue(ratingValue);
            r.setComment(comment);
            return r;
        } else {
            String id = "r-" + UUID.randomUUID().toString().substring(0, 8);
            Rating rating = new Rating(id, userId, itemType.toUpperCase(), itemId, ratingValue, comment);
            ratingsList.add(rating);
            ratingById.put(id, rating);
            return rating;
        }
    }

    public List<Rating> getRatingsByUser(String userId) {
        return ratingsList.stream()
                .filter(r -> r.getUserId().equals(userId))
                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                .collect(Collectors.toList());
    }

    public List<Rating> getRatingsByUserAndType(String userId, String itemType) {
        return ratingsList.stream()
                .filter(r -> r.getUserId().equals(userId) && r.getItemType().equalsIgnoreCase(itemType))
                .collect(Collectors.toList());
    }

    public List<Rating> getRatingsByItem(String itemType, String itemId) {
        return ratingsList.stream()
                .filter(r -> r.getItemType().equalsIgnoreCase(itemType) && r.getItemId().equals(itemId))
                .collect(Collectors.toList());
    }

    public Map<String, Double> getUserRatingMap(String userId, String itemType) {
        Map<String, Double> map = new HashMap<>();
        for (Rating r : ratingsList) {
            if (r.getUserId().equals(userId) && r.getItemType().equalsIgnoreCase(itemType)) {
                map.put(r.getItemId(), r.getRatingValue());
            }
        }
        return map;
    }

    public Map<String, Map<String, Double>> getAllUserRatingMaps(String itemType) {
        Map<String, Map<String, Double>> result = new HashMap<>();
        for (Rating r : ratingsList) {
            if (r.getItemType().equalsIgnoreCase(itemType)) {
                result.computeIfAbsent(r.getUserId(), k -> new HashMap<>()).put(r.getItemId(), r.getRatingValue());
            }
        }
        return result;
    }

    public boolean deleteRating(String ratingId, String userId) {
        Rating r = ratingById.get(ratingId);
        if (r != null && r.getUserId().equals(userId)) {
            ratingById.remove(ratingId);
            ratingsList.remove(r);
            return true;
        }
        return false;
    }

    private void initSampleCollaborativeRatings() {
        // Alex Chen (Sci-Fi, Action fan)
        saveRating("u-alex", "MOVIE", "m-1", 5.0, "Mind blowing masterpiece!");
        saveRating("u-alex", "MOVIE", "m-2", 5.0, "Tears every time I watch this.");
        saveRating("u-alex", "MOVIE", "m-5", 4.5, "Pinnacle cyberpunk action.");
        saveRating("u-alex", "MOVIE", "m-9", 5.0, "Visual spectacle of the decade.");
        saveRating("u-alex", "PRODUCT", "p-1", 5.0, "Best ANC on the market.");
        saveRating("u-alex", "PRODUCT", "p-3", 4.5, "Incredible 60fps raytracing performance.");

        // Sarah Jenkins (Drama, Smart Home fan)
        saveRating("u-sarah", "MOVIE", "m-7", 5.0, "Astonishing pacing and performances.");
        saveRating("u-sarah", "MOVIE", "m-11", 5.0, "Unbelievable storytelling.");
        saveRating("u-sarah", "MOVIE", "m-12", 4.5, "Electrifying tension.");
        saveRating("u-sarah", "PRODUCT", "p-10", 5.0, "Laser detection actually works wonders.");
        saveRating("u-sarah", "PRODUCT", "p-15", 5.0, "Transformed our living room ambience.");

        // Marcus Vance (Adventure, Tech fan)
        saveRating("u-marcus", "MOVIE", "m-2", 5.0, "My favorite film of all time.");
        saveRating("u-marcus", "MOVIE", "m-8", 5.0, "Spider-verse animation is unmatched.");
        saveRating("u-marcus", "MOVIE", "m-18", 4.8, "Wildest emotional rollercoaster.");
        saveRating("u-marcus", "PRODUCT", "p-2", 5.0, "M3 Max compiles projects instantly.");
        saveRating("u-marcus", "PRODUCT", "p-7", 5.0, "Autofocus and color science are peerless.");

        // Elena Rostova (Crime, Mystery, Computing fan)
        saveRating("u-elena", "MOVIE", "m-3", 5.0, "Heath Ledger gave the greatest villain performance.");
        saveRating("u-elena", "MOVIE", "m-4", 4.5, "Iconic dialogue and memorable soundtrack.");
        saveRating("u-elena", "MOVIE", "m-17", 4.8, "Masterclass in stunt choreography.");
        saveRating("u-elena", "PRODUCT", "p-6", 5.0, "Best typing feel on any keyboard I have owned.");
        saveRating("u-elena", "PRODUCT", "p-9", 5.0, "MX Master 3S wheel is pure productivity joy.");
    }
}
