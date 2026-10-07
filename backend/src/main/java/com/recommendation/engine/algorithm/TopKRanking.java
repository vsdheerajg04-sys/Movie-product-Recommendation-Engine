package com.recommendation.engine.algorithm;

import java.util.*;

/**
 * 8. Recommendation Ranking Algorithm (Java Implementation)
 * Uses Min-Heap PriorityQueue for Top-K extraction (O(N log K)) and
 * Maximal Marginal Relevance (MMR) for diversity re-ranking.
 */
public class TopKRanking {

    public interface ScoredItem {
        String getId();
        double getScore();
        Collection<String> getTags();
    }

    /**
     * Top-K Min-Heap selection: keeps highest score elements in O(N log K) time
     */
    public static <T extends ScoredItem> List<T> getTopK(List<T> items, int k) {
        if (items == null || items.isEmpty() || k <= 0) {
            return Collections.emptyList();
        }

        PriorityQueue<T> minHeap = new PriorityQueue<>(k, Comparator.comparingDouble(ScoredItem::getScore));

        for (T item : items) {
            if (minHeap.size() < k) {
                minHeap.offer(item);
            } else if (item.getScore() > minHeap.peek().getScore()) {
                minHeap.poll();
                minHeap.offer(item);
            }
        }

        List<T> result = new ArrayList<>(minHeap);
        result.sort((a, b) -> Double.compare(b.getScore(), a.getScore()));
        return result;
    }

    /**
     * Maximal Marginal Relevance (MMR) Re-Ranking for diversity:
     * Balances high score with diversity from already selected items:
     * MMR = lambda * Score(item) - (1 - lambda) * max_{s in S}(Similarity(item, s))
     */
    public static <T extends ScoredItem> List<T> mmrRerank(List<T> candidates, int k, double lambda) {
        if (candidates == null || candidates.isEmpty() || k <= 0) {
            return Collections.emptyList();
        }

        List<T> remaining = new ArrayList<>(candidates);
        List<T> selected = new ArrayList<>();

        while (selected.size() < k && !remaining.isEmpty()) {
            T bestCandidate = null;
            double bestMmrScore = -Double.MAX_VALUE;

            for (T candidate : remaining) {
                double relevance = candidate.getScore() / 100.0;
                double maxSim = 0.0;

                for (T chosen : selected) {
                    double sim = StringSimilarity.jaccardSimilarity(candidate.getTags(), chosen.getTags());
                    if (sim > maxSim) {
                        maxSim = sim;
                    }
                }

                double mmr = (lambda * relevance) - ((1.0 - lambda) * maxSim);
                if (mmr > bestMmrScore) {
                    bestMmrScore = mmr;
                    bestCandidate = candidate;
                }
            }

            if (bestCandidate != null) {
                selected.add(bestCandidate);
                remaining.remove(bestCandidate);
            } else {
                break;
            }
        }

        return selected;
    }
}
