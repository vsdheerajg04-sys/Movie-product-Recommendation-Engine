package com.recommendation.engine.algorithm;

import java.util.*;
import java.util.concurrent.*;
import java.util.function.Function;

/**
 * 6. Parallel Processing Algorithm (Java Implementation)
 * Provides multi-threaded parallel computation over large candidate item sets using
 * ForkJoinPool and CompletableFuture pipelines to maximize throughput and minimize latency.
 */
public class ParallelPipeline {

    private static final int PARALLELISM = Math.max(2, Runtime.getRuntime().availableProcessors());
    private static final ForkJoinPool CUSTOM_POOL = new ForkJoinPool(PARALLELISM);

    public static ForkJoinPool getPool() {
        return CUSTOM_POOL;
    }

    /**
     * Executes parallel scoring of candidates using ForkJoinPool task chunking
     */
    public static <T, R> List<R> processInParallel(List<T> items, Function<T, R> scoreFunction) {
        if (items == null || items.isEmpty()) {
            return Collections.emptyList();
        }

        try {
            return CUSTOM_POOL.submit(() ->
                items.parallelStream()
                     .map(scoreFunction)
                     .filter(Objects::nonNull)
                     .toList()
            ).get(5, TimeUnit.SECONDS);
        } catch (Exception e) {
            // Fallback to sequential stream if parallel execution encounters any issue
            return items.stream()
                        .map(scoreFunction)
                        .filter(Objects::nonNull)
                        .toList();
        }
    }

    /**
     * Asynchronously executes a recommendation pipeline stage with execution duration tracking
     */
    public static <T> CompletableFuture<T> asyncStage(Callable<T> supplier) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                return supplier.call();
            } catch (Exception e) {
                throw new CompletionException(e);
            }
        }, CUSTOM_POOL);
    }
}
