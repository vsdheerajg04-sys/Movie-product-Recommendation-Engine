package com.recommendation.engine.algorithm;

import java.util.*;

/**
 * 7. Recommendation Scoring Algorithm (Java Implementation)
 * Computes multi-signal weighted hybrid scores combining:
 * - Content-based similarity (genres, tags, descriptions)
 * - Collaborative user similarity
 * - Search query relevance & edit distance
 * - Item popularity & trending rating quality
 * - Real-time explainability synthesis
 */
public class ScoringEngine {

    public static class ScoreComponent {
        private final double totalScore;
        private final double contentScore;
        private final double collabScore;
        private final double searchScore;
        private final double trendingScore;
        private final double qualityScore;
        private final String matchReason;

        public ScoreComponent(double totalScore, double contentScore, double collabScore,
                              double searchScore, double trendingScore, double qualityScore,
                              String matchReason) {
            this.totalScore = Math.min(100.0, Math.max(0.0, totalScore));
            this.contentScore = contentScore;
            this.collabScore = collabScore;
            this.searchScore = searchScore;
            this.trendingScore = trendingScore;
            this.qualityScore = qualityScore;
            this.matchReason = matchReason;
        }

        public double getTotalScore() { return totalScore; }
        public double getContentScore() { return contentScore; }
        public double getCollabScore() { return collabScore; }
        public double getSearchScore() { return searchScore; }
        public double getTrendingScore() { return trendingScore; }
        public double getQualityScore() { return qualityScore; }
        public String getMatchReason() { return matchReason; }
    }

    /**
     * Calculates combined score with weighted formula and human-readable reason
     */
    public static ScoreComponent calculateScore(
            double contentSim,
            double collabSim,
            double searchSim,
            double trendingRating,
            double avgRating,
            String primaryFeatureName,
            boolean isPersonalized,
            String recentInteractionType) {

        double wContent = isPersonalized ? 0.35 : 0.20;
        double wCollab = isPersonalized ? 0.30 : 0.05;
        double wSearch = searchSim > 0.0 ? 0.25 : 0.0;
        double wTrending = isPersonalized ? 0.15 : 0.45;
        double wQuality = isPersonalized ? 0.15 : 0.30;

        double sumWeights = wContent + wCollab + wSearch + wTrending + wQuality;
        wContent /= sumWeights;
        wCollab /= sumWeights;
        wSearch /= sumWeights;
        wTrending /= sumWeights;
        wQuality /= sumWeights;

        double normalizedTrending = Math.min(1.0, trendingRating / 100.0);
        double normalizedQuality = Math.min(1.0, avgRating / 5.0);

        double composite = (wContent * contentSim)
                         + (wCollab * collabSim)
                         + (wSearch * searchSim)
                         + (wTrending * normalizedTrending)
                         + (wQuality * normalizedQuality);

        // Convert to percentage score 0-100%
        double finalScorePercent = Math.round(composite * 1000.0) / 10.0;

        // Reason generator
        String reason;
        if (searchSim > 0.6) {
            reason = "Matches your recent search interest and fuzzy query similarity (" + Math.round(searchSim * 100) + "% match)";
        } else if (contentSim > 0.65 && primaryFeatureName != null && !primaryFeatureName.isEmpty()) {
            reason = "Recommended because you frequently interact with " + primaryFeatureName + " content.";
        } else if (collabSim > 0.60) {
            reason = "Highly rated by users sharing your taste profile and rating patterns.";
        } else if (recentInteractionType != null && !recentInteractionType.isEmpty()) {
            reason = "Aligned with your recent " + recentInteractionType.toLowerCase() + " activity and preferences.";
        } else if (normalizedTrending > 0.70) {
            reason = "Currently trending with exceptional community engagement and top reviews.";
        } else if (normalizedQuality > 0.85) {
            reason = "Critically acclaimed with an outstanding " + avgRating + " / 5.0 rating.";
        } else {
            reason = "Recommended based on overall popularity, genre alignment, and positive feedback.";
        }

        return new ScoreComponent(finalScorePercent, contentSim, collabSim, searchSim, normalizedTrending, normalizedQuality, reason);
    }
}
