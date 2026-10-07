package com.recommendation.engine.repository;

import com.recommendation.engine.model.UserSignal;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

@Repository
public class UserSignalDataStore {

    private final List<UserSignal> signalList = new CopyOnWriteArrayList<>();

    public List<UserSignal> getAllSignals() {
        return new ArrayList<>(signalList);
    }

    public UserSignal recordSignal(String userId, String itemType, String signalType, String itemId, String query, Map<String, String> metadata) {
        String id = "sig-" + UUID.randomUUID().toString().substring(0, 8);
        UserSignal signal = new UserSignal(id, userId, itemType.toUpperCase(), signalType.toUpperCase(), itemId, query, metadata);
        signalList.add(signal);
        return signal;
    }

    public List<UserSignal> getSignalsByUser(String userId) {
        return signalList.stream()
                .filter(s -> s.getUserId().equals(userId))
                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                .collect(Collectors.toList());
    }

    public List<UserSignal> getSignalsByUserAndType(String userId, String itemType) {
        return signalList.stream()
                .filter(s -> s.getUserId().equals(userId) && s.getItemType().equalsIgnoreCase(itemType))
                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                .collect(Collectors.toList());
    }

    public List<String> getSearchQueriesByUser(String userId, String itemType) {
        return signalList.stream()
                .filter(s -> s.getUserId().equals(userId) &&
                        s.getItemType().equalsIgnoreCase(itemType) &&
                        "SEARCH".equalsIgnoreCase(s.getSignalType()) &&
                        s.getQuery() != null && !s.getQuery().trim().isEmpty())
                .map(UserSignal::getQuery)
                .distinct()
                .limit(10)
                .collect(Collectors.toList());
    }

    public Set<String> getViewedItemIdsByUser(String userId, String itemType) {
        return signalList.stream()
                .filter(s -> s.getUserId().equals(userId) &&
                        s.getItemType().equalsIgnoreCase(itemType) &&
                        "VIEW".equalsIgnoreCase(s.getSignalType()) &&
                        s.getItemId() != null)
                .map(UserSignal::getItemId)
                .collect(Collectors.toSet());
    }

    public boolean deleteSignal(String signalId, String userId) {
        return signalList.removeIf(s -> s.getId().equals(signalId) && s.getUserId().equals(userId));
    }

    public void clearUserHistory(String userId) {
        signalList.removeIf(s -> s.getUserId().equals(userId));
    }
}
