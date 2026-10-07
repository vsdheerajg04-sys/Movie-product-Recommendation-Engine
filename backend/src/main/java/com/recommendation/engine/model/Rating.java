package com.recommendation.engine.model;

import java.time.Instant;

public class Rating {
    private String id;
    private String userId;
    private String itemType; // "MOVIE" or "PRODUCT"
    private String itemId;
    private double ratingValue; // 1.0 to 5.0
    private String comment;
    private Instant timestamp;

    public Rating() {
        this.timestamp = Instant.now();
    }

    public Rating(String id, String userId, String itemType, String itemId, double ratingValue, String comment) {
        this.id = id;
        this.userId = userId;
        this.itemType = itemType;
        this.itemId = itemId;
        this.ratingValue = ratingValue;
        this.comment = comment;
        this.timestamp = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getItemType() { return itemType; }
    public void setItemType(String itemType) { this.itemType = itemType; }

    public String getItemId() { return itemId; }
    public void setItemId(String itemId) { this.itemId = itemId; }

    public double getRatingValue() { return ratingValue; }
    public void setRatingValue(double ratingValue) { this.ratingValue = ratingValue; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
}
