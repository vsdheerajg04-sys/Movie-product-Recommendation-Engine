package com.recommendation.engine.algorithm;

import java.util.*;

/**
 * 5. Randomized Selection Algorithm (Java Implementation)
 * Provides:
 * - Reservoir Sampling for streaming candidate selection
 * - Epsilon-Greedy serendipitous exploration
 * - Quickselect (Hoare's partitioning) for O(N) top-K partitioning
 */
public class RandomizedSelection {

    private static final Random RANDOM = new Random();

    /**
     * Reservoir Sampling: Selects 'k' random items uniformly from a stream/list of size N in O(N) time
     */
    public static <T> List<T> reservoirSample(List<T> stream, int k) {
        if (stream == null || stream.isEmpty() || k <= 0) {
            return Collections.emptyList();
        }
        int n = stream.size();
        if (n <= k) {
            List<T> copy = new ArrayList<>(stream);
            Collections.shuffle(copy, RANDOM);
            return copy;
        }

        List<T> reservoir = new ArrayList<>(k);
        for (int i = 0; i < k; i++) {
            reservoir.add(stream.get(i));
        }

        for (int i = k; i < n; i++) {
            int j = RANDOM.nextInt(i + 1);
            if (j < k) {
                reservoir.set(j, stream.get(i));
            }
        }

        return reservoir;
    }

    /**
     * Quickselect algorithm to find the element that would be at index 'k' in sorted order (descending)
     * Average time complexity: O(N)
     */
    public static <T> void quickselect(List<T> list, int left, int right, int k, Comparator<T> comparator) {
        if (left >= right) return;

        int pivotIndex = left + RANDOM.nextInt(right - left + 1);
        pivotIndex = partition(list, left, right, pivotIndex, comparator);

        if (k == pivotIndex) {
            return;
        } else if (k < pivotIndex) {
            quickselect(list, left, pivotIndex - 1, k, comparator);
        } else {
            quickselect(list, pivotIndex + 1, right, k, comparator);
        }
    }

    private static <T> int partition(List<T> list, int left, int right, int pivotIndex, Comparator<T> comparator) {
        T pivotValue = list.get(pivotIndex);
        Collections.swap(list, pivotIndex, right);
        int storeIndex = left;

        for (int i = left; i < right; i++) {
            // Descending order comparison
            if (comparator.compare(list.get(i), pivotValue) > 0) {
                Collections.swap(list, i, storeIndex);
                storeIndex++;
            }
        }
        Collections.swap(list, storeIndex, right);
        return storeIndex;
    }

    /**
     * Epsilon-Greedy Exploration:
     * With probability (1 - epsilon), picks best exploitation candidate;
     * With probability epsilon, injects a serendipitous novelty candidate.
     */
    public static <T> List<T> epsilonGreedySelection(List<T> rankedCandidates, List<T> discoveryPool, int count, double epsilon) {
        List<T> selected = new ArrayList<>();
        Set<T> seen = new HashSet<>();

        int rankedIdx = 0;
        int discoveryIdx = 0;

        while (selected.size() < count && (rankedIdx < rankedCandidates.size() || discoveryIdx < discoveryPool.size())) {
            boolean explore = RANDOM.nextDouble() < epsilon;

            if (explore && discoveryIdx < discoveryPool.size()) {
                T candidate = discoveryPool.get(discoveryIdx++);
                if (candidate != null && seen.add(candidate)) {
                    selected.add(candidate);
                }
            } else if (rankedIdx < rankedCandidates.size()) {
                T candidate = rankedCandidates.get(rankedIdx++);
                if (candidate != null && seen.add(candidate)) {
                    selected.add(candidate);
                }
            } else if (discoveryIdx < discoveryPool.size()) {
                T candidate = discoveryPool.get(discoveryIdx++);
                if (candidate != null && seen.add(candidate)) {
                    selected.add(candidate);
                }
            } else {
                break;
            }
        }

        return selected;
    }
}
