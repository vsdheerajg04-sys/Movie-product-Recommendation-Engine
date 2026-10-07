package com.recommendation.engine.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/algorithms")
@CrossOrigin(origins = "*")
public class AlgorithmInfoController {

    @GetMapping("/status")
    public ResponseEntity<?> getAlgorithmStatus() {
        List<Map<String, Object>> algorithms = List.of(
                Map.of(
                        "id", 1,
                        "name", "String Similarity",
                        "package", "com.recommendation.engine.algorithm.StringSimilarity",
                        "techniques", List.of("Jaccard Set Similarity", "Cosine Term Frequency (TF-IDF)", "N-Gram Dice Overlap"),
                        "status", "ACTIVE_IN_JAVA"
                ),
                Map.of(
                        "id", 2,
                        "name", "Edit Distance",
                        "package", "com.recommendation.engine.algorithm.EditDistance",
                        "techniques", List.of("Dynamic Programming Levenshtein Distance", "Damerau-Levenshtein Transposition", "Fuzzy Query Matching"),
                        "status", "ACTIVE_IN_JAVA"
                ),
                Map.of(
                        "id", 3,
                        "name", "Feature Hashing",
                        "package", "com.recommendation.engine.algorithm.FeatureHashing",
                        "techniques", List.of("MurmurHash3 32-bit Vectorizer", "MinHash Signatures (64 Hash Functions)", "Locality Sensitive Hashing (LSH) Buckets"),
                        "status", "ACTIVE_IN_JAVA"
                ),
                Map.of(
                        "id", 4,
                        "name", "User Similarity",
                        "package", "com.recommendation.engine.algorithm.UserSimilarity",
                        "techniques", List.of("Mean-Centered Pearson Correlation Coefficient", "Sparse Cosine Rating Vector Similarity", "Jaccard History Overlap"),
                        "status", "ACTIVE_IN_JAVA"
                ),
                Map.of(
                        "id", 5,
                        "name", "Randomized Selection",
                        "package", "com.recommendation.engine.algorithm.RandomizedSelection",
                        "techniques", List.of("O(N) Reservoir Sampling", "Hoare's Quickselect Partitioning", "Epsilon-Greedy Serendipity Exploration"),
                        "status", "ACTIVE_IN_JAVA"
                ),
                Map.of(
                        "id", 6,
                        "name", "Parallel Processing",
                        "package", "com.recommendation.engine.algorithm.ParallelPipeline",
                        "techniques", List.of("Java ForkJoinPool Multi-threading", "CompletableFuture Async Stages", "Parallel Stream Candidate Processing"),
                        "status", "ACTIVE_IN_JAVA"
                ),
                Map.of(
                        "id", 7,
                        "name", "Recommendation Scoring",
                        "package", "com.recommendation.engine.algorithm.ScoringEngine",
                        "techniques", List.of("Multi-Signal Hybrid Weighted Scoring", "Dynamic Natural Language Explainability Synthesis", "Personalized Confidence Weights"),
                        "status", "ACTIVE_IN_JAVA"
                ),
                Map.of(
                        "id", 8,
                        "name", "Recommendation Ranking",
                        "package", "com.recommendation.engine.algorithm.TopKRanking",
                        "techniques", List.of("O(N log K) Min-Heap PriorityQueue", "Maximal Marginal Relevance (MMR) Diversity Re-Ranking"),
                        "status", "ACTIVE_IN_JAVA"
                )
        );

        return ResponseEntity.ok(Map.of(
                "engine", "Java Spring Boot Recommendation Core",
                "version", "1.0.0",
                "algorithmsCount", 8,
                "algorithms", algorithms,
                "pipelineSequence", List.of(
                        "USER SIGNALS",
                        "CANDIDATES",
                        "STRING SIMILARITY",
                        "EDIT DISTANCE",
                        "HASHING",
                        "USER SIMILARITY",
                        "RANDOMIZED SELECTION",
                        "PARALLEL PROCESSING",
                        "RECOMMENDATION SCORE",
                        "RANKING",
                        "FINAL RECOMMENDATIONS"
                )
        ));
    }
}
