package com.recommendation.engine.service;

import com.recommendation.engine.model.AuthResponse;
import com.recommendation.engine.model.User;
import com.recommendation.engine.repository.UserDataStore;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserDataStore userDataStore;

    public AuthService(UserDataStore userDataStore) {
        this.userDataStore = userDataStore;
    }

    public AuthResponse register(String username, String email, String password) {
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("Username is required");
        }
        if (email == null || !email.contains("@")) {
            throw new IllegalArgumentException("Valid email is required");
        }
        if (password == null || password.length() < 4) {
            throw new IllegalArgumentException("Password must be at least 4 characters");
        }

        User user = userDataStore.register(username.trim(), email.trim(), password);
        String token = userDataStore.createSessionToken(user.getId());

        return new AuthResponse(token, user.getId(), user.getUsername(), user.getEmail(), "Registration successful");
    }

    public AuthResponse login(String identifier, String password) {
        if (identifier == null || password == null) {
            throw new IllegalArgumentException("Credentials cannot be blank");
        }

        Optional<User> userOpt = userDataStore.authenticate(identifier, password);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Invalid email/username or password");
        }

        User user = userOpt.get();
        String token = userDataStore.createSessionToken(user.getId());

        return new AuthResponse(token, user.getId(), user.getUsername(), user.getEmail(), "Login successful");
    }

    public void logout(String token) {
        userDataStore.removeSessionToken(token);
    }

    public Optional<User> getCurrentUser(String token) {
        return userDataStore.getUserByToken(token);
    }
}
