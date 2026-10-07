package com.recommendation.engine.model;

import java.time.Instant;
import java.util.Map;

public class UserSignal {
    private String id;
    private String userId;
    private String itemType; // "MOVIE" or "PRODUCT"
    private String signalType; // "SEARCH", "VIEW", "RATE", "CLICK"
    private String itemId;
    private String query;
    private Map<String, String> metadata;
    private Instant timestamp;

    public UserSignal() {
        this.timestamp = Instant.now();
    }

    public UserSignal(String id, String userId, String itemType, String signalType, String itemId, String query, Map<String, String> metadata) {
        this.id = id;
        this.userId = userId;
        this.itemType = itemType;
        this.signalType = signalType;
        this.itemId = itemId;
        this.query = query;
        this.metadata = metadata;
        this.timestamp = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getItemType() { return itemType; }
    public void setItemType(String itemType) { this.itemType = itemType; }

    public String getSignalType() { return signalType; }
    public void setSignalType(String signalType) { this.signalType = signalType; }

    public String getItemId() { return itemId; }
    public void setItemId(String itemId) { this.itemId = itemId; }

    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }

    public Map<String, String> getMetadata() { return metadata; }
    public void setMetadata(Map<String, String> metadata) { this.metadata = metadata; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
}
