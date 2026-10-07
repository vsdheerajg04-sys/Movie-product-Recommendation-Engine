package com.recommendation.engine.model;

import com.recommendation.engine.algorithm.TopKRanking;
import java.util.*;

public class Movie implements TopKRanking.ScoredItem {
    private String id;
    private String title;
    private int year;
    private List<String> genres;
    private String director;
    private List<String> cast;
    private double rating;
    private int voteCount;
    private String posterUrl;
    private String backdropUrl;
    private String overview;
    private int durationMinutes;
    private double trendingScore;
    private List<String> tags;

    // Transient recommendation scoring fields
    private double score;
    private int rank;
    private String matchReason;

    public Movie() {
        this.genres = new ArrayList<>();
        this.cast = new ArrayList<>();
        this.tags = new ArrayList<>();
    }

    public Movie(String id, String title, int year, List<String> genres, String director,
                 List<String> cast, double rating, int voteCount, String posterUrl,
                 String backdropUrl, String overview, int durationMinutes, double trendingScore,
                 List<String> tags) {
        this.id = id;
        this.title = title;
        this.year = year;
        this.genres = genres != null ? genres : new ArrayList<>();
        this.director = director;
        this.cast = cast != null ? cast : new ArrayList<>();
        this.rating = rating;
        this.voteCount = voteCount;
        this.posterUrl = posterUrl;
        this.backdropUrl = backdropUrl;
        this.overview = overview;
        this.durationMinutes = durationMinutes;
        this.trendingScore = trendingScore;
        this.tags = tags != null ? tags : new ArrayList<>();
    }

    @Override
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }

    public List<String> getGenres() { return genres; }
    public void setGenres(List<String> genres) { this.genres = genres; }

    public String getDirector() { return director; }
    public void setDirector(String director) { this.director = director; }

    public List<String> getCast() { return cast; }
    public void setCast(List<String> cast) { this.cast = cast; }

    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }

    public int getVoteCount() { return voteCount; }
    public void setVoteCount(int voteCount) { this.voteCount = voteCount; }

    public String getPosterUrl() { return posterUrl; }
    public void setPosterUrl(String posterUrl) { this.posterUrl = posterUrl; }

    public String getBackdropUrl() { return backdropUrl; }
    public void setBackdropUrl(String backdropUrl) { this.backdropUrl = backdropUrl; }

    public String getOverview() { return overview; }
    public void setOverview(String overview) { this.overview = overview; }

    public int getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }

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
