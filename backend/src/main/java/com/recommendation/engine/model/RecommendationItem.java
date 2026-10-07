package com.recommendation.engine.model;

import java.util.List;
import java.util.Map;

public class RecommendationItem {
    private int rank;
    private double score; // 0.0 to 100.0%
    private String itemType; // "MOVIE" or "PRODUCT"
    private String id;
    private String titleOrName;
    private String subtitle;
    private String imageUrl;
    private double rating;
    private String matchReason;
    private Map<String, Object> details;
    private List<String> tags;

    public RecommendationItem() {}

    public RecommendationItem(int rank, double score, String itemType, String id,
                              String titleOrName, String subtitle, String imageUrl,
                              double rating, String matchReason, Map<String, Object> details,
                              List<String> tags) {
        this.rank = rank;
        this.score = score;
        this.itemType = itemType;
        this.id = id;
        this.titleOrName = titleOrName;
        this.subtitle = subtitle;
        this.imageUrl = imageUrl;
        this.rating = rating;
        this.matchReason = matchReason;
        this.details = details;
        this.tags = tags;
    }

    public int getRank() { return rank; }
    public void setRank(int rank) { this.rank = rank; }

    public double getScore() { return score; }
    public void setScore(double score) { this.score = score; }

    public String getItemType() { return itemType; }
    public void setItemType(String itemType) { this.itemType = itemType; }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitleOrName() { return titleOrName; }
    public void setTitleOrName(String titleOrName) { this.titleOrName = titleOrName; }

    public String getSubtitle() { return subtitle; }
    public void setSubtitle(String subtitle) { this.subtitle = subtitle; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }

    public String getMatchReason() { return matchReason; }
    public void setMatchReason(String matchReason) { this.matchReason = matchReason; }

    public Map<String, Object> getDetails() { return details; }
    public void setDetails(Map<String, Object> details) { this.details = details; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
}
