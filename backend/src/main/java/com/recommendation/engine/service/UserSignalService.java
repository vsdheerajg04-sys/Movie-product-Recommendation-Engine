package com.recommendation.engine.service;

import com.recommendation.engine.model.UserSignal;
import com.recommendation.engine.repository.UserSignalDataStore;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class UserSignalService {

    private final UserSignalDataStore userSignalDataStore;

    public UserSignalService(UserSignalDataStore userSignalDataStore) {
        this.userSignalDataStore = userSignalDataStore;
    }

    public UserSignal recordSearch(String userId, String itemType, String query) {
        return userSignalDataStore.recordSignal(userId, itemType, "SEARCH", null, query, null);
    }

    public UserSignal recordView(String userId, String itemType, String itemId, Map<String, String> metadata) {
        return userSignalDataStore.recordSignal(userId, itemType, "VIEW", itemId, null, metadata);
    }

    public List<UserSignal> getUserHistory(String userId) {
        return userSignalDataStore.getSignalsByUser(userId);
    }

    public boolean deleteSignal(String signalId, String userId) {
        return userSignalDataStore.deleteSignal(signalId, userId);
    }

    public void clearHistory(String userId) {
        userSignalDataStore.clearUserHistory(userId);
    }
}
