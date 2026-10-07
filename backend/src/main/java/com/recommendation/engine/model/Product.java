package com.recommendation.engine.model;

import com.recommendation.engine.algorithm.TopKRanking;
import java.util.*;

public class Product implements TopKRanking.ScoredItem {
    private String id;
    private String name;
    private String brand;
    private String category;
    private String subcategory;
    private double price;
    private double rating;
    private int reviewCount;
    private String imageUrl;
    private String description;
    private Map<String, String> specs;
    private double trendingScore;
    private List<String> tags;

    // Transient recommendation scoring fields
    private double score;
    private int rank;
    private String matchReason;

    public Product() {
        this.specs = new HashMap<>();
        this.tags = new ArrayList<>();
    }

    public Product(String id, String name, String brand, String category, String subcategory,
                   double price, double rating, int reviewCount, String imageUrl,
                   String description, Map<String, String> specs, double trendingScore,
                   List<String> tags) {
        this.id = id;
        this.name = name;
        this.brand = brand;
        this.category = category;
        this.subcategory = subcategory;
        this.price = price;
        this.rating = rating;
        this.reviewCount = reviewCount;
        this.imageUrl = imageUrl;
        this.description = description;
        this.specs = specs != null ? specs : new HashMap<>();
        this.trendingScore = trendingScore;
        this.tags = tags != null ? tags : new ArrayList<>();
    }

    @Override
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSubcategory() { return subcategory; }
    public void setSubcategory(String subcategory) { this.subcategory = subcategory; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }

    public int getReviewCount() { return reviewCount; }
    public void setReviewCount(int reviewCount) { this.reviewCount = reviewCount; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Map<String, String> getSpecs() { return specs; }
    public void setSpecs(Map<String, String> specs) { this.specs = specs; }

    public double getTrendingScore() { return trendingScore; }
    public void setTrendingScore(double trendingScore) { this.trendingScore = trendingScore; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    @Override
    public double getScore() { return score; }
    public void setScore(double score) { this.score = score; }

    public int getRank() { return rank; }
    public void setRank(int rank) { this.rank = rank; }

    public String getMatchReason() { return matchReason; }
    public void setMatchReason(String matchReason) { this.matchReason = matchReason; }
}
