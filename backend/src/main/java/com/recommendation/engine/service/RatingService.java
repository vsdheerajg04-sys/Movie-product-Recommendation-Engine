package com.recommendation.engine.service;

import com.recommendation.engine.model.Rating;
import com.recommendation.engine.repository.RatingDataStore;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RatingService {

    private final RatingDataStore ratingDataStore;

    public RatingService(RatingDataStore ratingDataStore) {
        this.ratingDataStore = ratingDataStore;
    }

    public Rating addOrUpdateRating(String userId, String itemType, String itemId, double ratingValue, String comment) {
        if (ratingValue < 1.0 || ratingValue > 5.0) {
            throw new IllegalArgumentException("Rating value must be between 1.0 and 5.0");
        }
        return ratingDataStore.saveRating(userId, itemType, itemId, ratingValue, comment);
    }

    public List<Rating> getUserRatings(String userId) {
        return ratingDataStore.getRatingsByUser(userId);
    }

    public List<Rating> getItemRatings(String itemType, String itemId) {
        return ratingDataStore.getRatingsByItem(itemType, itemId);
    }

    public boolean deleteRating(String ratingId, String userId) {
        return ratingDataStore.deleteRating(ratingId, userId);
    }
}
