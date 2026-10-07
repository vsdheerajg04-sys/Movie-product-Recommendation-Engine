package com.recommendation.engine.algorithm;

import java.util.*;

/**
 * 4. User Similarity Algorithm (Java Implementation)
 * Computes User-to-User Collaborative Filtering affinities using:
 * - Pearson Correlation Coefficient (centered on user mean rating)
 * - Cosine Vector Similarity
 * - Jaccard Interaction Similarity
 */
public class UserSimilarity {

    /**
     * Pearson Correlation Coefficient between two users' rating maps {itemId -> ratingVal}
     * Returns a score from -1.0 to 1.0 (normalized to 0.0 to 1.0 for recommendation weight).
     */
    public static double pearsonCorrelation(Map<String, Double> user1Ratings, Map<String, Double> user2Ratings) {
        if (user1Ratings == null || user2Ratings == null || user1Ratings.isEmpty() || user2Ratings.isEmpty()) {
            return 0.0;
        }

        Set<String> commonItems = new HashSet<>(user1Ratings.keySet());
        commonItems.retainAll(user2Ratings.keySet());

        if (commonItems.isEmpty()) {
            return 0.0;
        }

        // If only 1 common item, calculate normalized distance
        if (commonItems.size() == 1) {
            String item = commonItems.iterator().next();
            double diff = Math.abs(user1Ratings.get(item) - user2Ratings.get(item));
            return Math.max(0.0, 1.0 - (diff / 4.0));
        }

        double sum1 = 0.0, sum2 = 0.0;
        for (String item : commonItems) {
            sum1 += user1Ratings.get(item);
            sum2 += user2Ratings.get(item);
        }
        double mean1 = sum1 / commonItems.size();
        double mean2 = sum2 / commonItems.size();

        double numerator = 0.0;
        double denom1 = 0.0;
        double denom2 = 0.0;

        for (String item : commonItems) {
            double diff1 = user1Ratings.get(item) - mean1;
            double diff2 = user2Ratings.get(item) - mean2;

            numerator += diff1 * diff2;
            denom1 += diff1 * diff1;
            denom2 += diff2 * diff2;
        }

        if (denom1 == 0.0 || denom2 == 0.0) {
            return 0.5; // Neutral baseline when standard deviation is 0
        }

        double rawPearson = numerator / (Math.sqrt(denom1) * Math.sqrt(denom2));
        // Normalize from [-1.0, 1.0] to [0.0, 1.0]
        return Math.max(0.0, Math.min(1.0, (rawPearson + 1.0) / 2.0));
    }

    /**
     * Cosine similarity between two sparse user interaction/rating vectors
     */
    public static double cosineVectorSimilarity(Map<String, Double> vectorA, Map<String, Double> vectorB) {
        if (vectorA == null || vectorB == null || vectorA.isEmpty() || vectorB.isEmpty()) {
            return 0.0;
        }

        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (Map.Entry<String, Double> entry : vectorA.entrySet()) {
            double valA = entry.getValue();
            normA += valA * valA;
            if (vectorB.containsKey(entry.getKey())) {
                dotProduct += valA * vectorB.get(entry.getKey());
            }
        }

        for (double valB : vectorB.values()) {
            normB += valB * valB;
        }

        if (normA == 0.0 || normB == 0.0) {
            return 0.0;
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * Interaction Overlap Affinity between two users
     */
    public static double interactionAffinity(Set<String> user1History, Set<String> user2History) {
        return StringSimilarity.jaccardSimilarity(user1History, user2History);
    }
}
