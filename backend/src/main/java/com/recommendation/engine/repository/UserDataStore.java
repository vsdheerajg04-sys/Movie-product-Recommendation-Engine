package com.recommendation.engine.repository;

import com.recommendation.engine.model.User;
import org.springframework.stereotype.Repository;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class UserDataStore {

    private final Map<String, User> userById = new ConcurrentHashMap<>();
    private final Map<String, User> userByEmail = new ConcurrentHashMap<>();
    private final Map<String, User> userByUsername = new ConcurrentHashMap<>();
    private final Map<String, String> tokenToUserId = new ConcurrentHashMap<>();

    public UserDataStore() {
        // Seed a few diverse reviewer profiles for realistic collaborative filtering
        seedUser("u-alex", "Alex Chen", "alex@example.com", "Action,Sci-Fi,Thriller", "Gaming,Audio,Computing");
        seedUser("u-sarah", "Sarah Jenkins", "sarah@example.com", "Drama,Romance,Comedy", "Smart Home,Wearables");
        seedUser("u-marcus", "Marcus Vance", "marcus@example.com", "Sci-Fi,Adventure,Animation", "Photography,Audio,Electronics");
        seedUser("u-elena", "Elena Rostova", "elena@example.com", "Crime,Mystery,Biography", "Computing,Smart Home");
    }

    private void seedUser(String id, String username, String email, String movieGenres, String prodCategories) {
        User u = new User(id, username, email, hashPassword("securePassword123!"));
        if (movieGenres != null) {
            u.getFavoriteMovieGenres().addAll(Arrays.asList(movieGenres.split(",")));
        }
        if (prodCategories != null) {
            u.getFavoriteProductCategories().addAll(Arrays.asList(prodCategories.split(",")));
        }
        userById.put(id, u);
        userByEmail.put(email.toLowerCase(), u);
        userByUsername.put(username.toLowerCase(), u);
    }

    public synchronized User register(String username, String email, String rawPassword) {
        if (userByEmail.containsKey(email.toLowerCase())) {
            throw new IllegalArgumentException("Email is already registered");
        }
        if (userByUsername.containsKey(username.toLowerCase())) {
            throw new IllegalArgumentException("Username is already taken");
        }

        String id = "u-" + UUID.randomUUID().toString().substring(0, 8);
        String hash = hashPassword(rawPassword);
        User user = new User(id, username, email, hash);

        userById.put(id, user);
        userByEmail.put(email.toLowerCase(), user);
        userByUsername.put(username.toLowerCase(), user);

        return user;
    }

    public Optional<User> authenticate(String identifier, String rawPassword) {
        String idLower = identifier.trim().toLowerCase();
        User user = userByEmail.get(idLower);
        if (user == null) {
            user = userByUsername.get(idLower);
        }

        if (user != null && verifyPassword(rawPassword, user.getPasswordHash())) {
            return Optional.of(user);
        }
        return Optional.empty();
    }

    public String createSessionToken(String userId) {
        String token = "jwt_" + UUID.randomUUID().toString().replace("-", "") + "_" + System.currentTimeMillis();
        tokenToUserId.put(token, userId);
        return token;
    }

    public Optional<User> getUserByToken(String token) {
        if (token == null) return Optional.empty();
        String cleanToken = token.startsWith("Bearer ") ? token.substring(7).trim() : token.trim();
        String userId = tokenToUserId.get(cleanToken);
        if (userId == null) return Optional.empty();
        return Optional.ofNullable(userById.get(userId));
    }

    public void removeSessionToken(String token) {
        if (token != null) {
            String cleanToken = token.startsWith("Bearer ") ? token.substring(7).trim() : token.trim();
            tokenToUserId.remove(cleanToken);
        }
    }

    public Optional<User> getUserById(String userId) {
        return Optional.ofNullable(userById.get(userId));
    }

    public List<User> getAllUsers() {
        return new ArrayList<>(userById.values());
    }

    public static String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }

    public static boolean verifyPassword(String rawPassword, String hashedPassword) {
        return hashPassword(rawPassword).equals(hashedPassword);
    }
}
