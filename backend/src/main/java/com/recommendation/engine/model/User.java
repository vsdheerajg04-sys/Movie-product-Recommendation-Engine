package com.recommendation.engine.model;

import java.time.Instant;
import java.util.*;

public class User {
    private String id;
    private String username;
    private String email;
    private String passwordHash;
    private Instant createdAt;
    private Set<String> favoriteMovieGenres;
    private Set<String> favoriteProductCategories;

    public User() {
        this.createdAt = Instant.now();
        this.favoriteMovieGenres = new HashSet<>();
        this.favoriteProductCategories = new HashSet<>();
    }

    public User(String id, String username, String email, String passwordHash) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.passwordHash = passwordHash;
        this.createdAt = Instant.now();
        this.favoriteMovieGenres = new HashSet<>();
        this.favoriteProductCategories = new HashSet<>();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Set<String> getFavoriteMovieGenres() { return favoriteMovieGenres; }
    public void setFavoriteMovieGenres(Set<String> favoriteMovieGenres) { this.favoriteMovieGenres = favoriteMovieGenres; }

    public Set<String> getFavoriteProductCategories() { return favoriteProductCategories; }
    public void setFavoriteProductCategories(Set<String> favoriteProductCategories) { this.favoriteProductCategories = favoriteProductCategories; }
}
