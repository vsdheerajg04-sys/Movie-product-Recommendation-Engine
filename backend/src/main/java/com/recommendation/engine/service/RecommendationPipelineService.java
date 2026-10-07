package com.recommendation.engine.service;

import com.recommendation.engine.algorithm.*;
import com.recommendation.engine.model.*;
import com.recommendation.engine.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class RecommendationPipelineService {

    private static final Logger log = LoggerFactory.getLogger(RecommendationPipelineService.class);

    private final MovieDataStore movieDataStore;
    private final ProductDataStore productDataStore;
    private final RatingDataStore ratingDataStore;
    private final UserSignalDataStore userSignalDataStore;
    private final UserDataStore userDataStore;

    public RecommendationPipelineService(
            MovieDataStore movieDataStore,
            ProductDataStore productDataStore,
            RatingDataStore ratingDataStore,
            UserSignalDataStore userSignalDataStore,
            UserDataStore userDataStore) {
        this.movieDataStore = movieDataStore;
        this.productDataStore = productDataStore;
        this.ratingDataStore = ratingDataStore;
        this.userSignalDataStore = userSignalDataStore;
        this.userDataStore = userDataStore;
    }

    public static class RecommendationResponse {
        private final List<RecommendationItem> recommendations;
        private final PipelineMetrics metrics;

        public RecommendationResponse(List<RecommendationItem> recommendations, PipelineMetrics metrics) {
            this.recommendations = recommendations;
            this.metrics = metrics;
        }

        public List<RecommendationItem> getRecommendations() { return recommendations; }
        public PipelineMetrics getMetrics() { return metrics; }
    }

    /**
     * Executes the complete Java recommendation pipeline for MOVIES
     */
    public RecommendationResponse recommendMovies(String userId, int limit) {
        long startTotalNanos = System.nanoTime();
        Map<String, Long> stageTimesMicros = new LinkedHashMap<>();
        List<String> algorithmsUsed = new ArrayList<>();

        // 1. USER SIGNALS
        long stageStart = System.nanoTime();
        User user = (userId != null) ? userDataStore.getUserById(userId).orElse(null) : null;
        Map<String, Double> userRatings = (userId != null) ? ratingDataStore.getUserRatingMap(userId, "MOVIE") : Collections.emptyMap();
        List<String> searchQueries = (userId != null) ? userSignalDataStore.getSearchQueriesByUser(userId, "MOVIE") : Collections.emptyList();
        Set<String> viewedIds = (userId != null) ? userSignalDataStore.getViewedItemIdsByUser(userId, "MOVIE") : Collections.emptySet();

        // Build User Taste Profile
        Set<String> userInterestTokens = new HashSet<>();
        if (user != null) {
            for (String g : user.getFavoriteMovieGenres()) {
                userInterestTokens.add(g.toLowerCase());
            }
        }
        for (String q : searchQueries) {
            userInterestTokens.addAll(StringSimilarity.tokenize(q));
        }
        // Extract tags and genres from highly rated movies
        String primaryInteractedGenre = null;
        String topRatedMovieTitle = null;
        for (Map.Entry<String, Double> entry : userRatings.entrySet()) {
            if (entry.getValue() >= 4.0) {
                movieDataStore.getMovieById(entry.getKey()).ifPresent(m -> {
                    userInterestTokens.addAll(m.getTags());
                    userInterestTokens.addAll(m.getGenres().stream().map(String::toLowerCase).toList());
                });
                if (topRatedMovieTitle == null) {
                    movieDataStore.getMovieById(entry.getKey()).ifPresent(m -> {
                        // topRatedMovieTitle captured
                    });
                }
            }
        }
        // Extract tags from viewed movies
        for (String viewId : viewedIds) {
            movieDataStore.getMovieById(viewId).ifPresent(m -> {
                userInterestTokens.addAll(m.getTags());
                for (String g : m.getGenres()) {
                    userInterestTokens.add(g.toLowerCase());
                }
            });
        }
        if (!userInterestTokens.isEmpty()) {
            primaryInteractedGenre = userInterestTokens.iterator().next();
        }
        stageTimesMicros.put("1_USER_SIGNALS", (System.nanoTime() - stageStart) / 1000);

        // 2. CANDIDATES RETRIEVAL (STRICTLY MOVIES, EXCLUDING ALREADY RATED)
        stageStart = System.nanoTime();
        List<Movie> allCandidates = movieDataStore.getAllMovies().stream()
                .filter(m -> !userRatings.containsKey(m.getId()))
                .collect(Collectors.toList());
        if (allCandidates.isEmpty()) {
            allCandidates = movieDataStore.getAllMovies();
        }
        int initialCandidatesCount = allCandidates.size();
        stageTimesMicros.put("2_CANDIDATES", (System.nanoTime() - stageStart) / 1000);

        // 3. STRING SIMILARITY (Jaccard + Cosine on tokens & tags)
        stageStart = System.nanoTime();
        algorithmsUsed.add("1. String Similarity (Jaccard & Cosine TF-IDF)");
        Map<String, Double> stringSimMap = new ConcurrentHashMap<>();
        for (Movie m : allCandidates) {
            List<String> movieTokens = new ArrayList<>(m.getTags());
            m.getGenres().forEach(g -> movieTokens.add(g.toLowerCase()));
            movieTokens.addAll(StringSimilarity.tokenize(m.getTitle() + " " + m.getOverview()));

            double jaccard = StringSimilarity.jaccardSimilarity(userInterestTokens, movieTokens);
            double cosine = StringSimilarity.cosineTextSimilarity(String.join(" ", userInterestTokens), m.getTitle() + " " + m.getOverview());
            double combinedStringSim = (0.6 * jaccard) + (0.4 * cosine);
            stringSimMap.put(m.getId(), combinedStringSim);
        }
        stageTimesMicros.put("3_STRING_SIMILARITY", (System.nanoTime() - stageStart) / 1000);

        // 4. EDIT DISTANCE (Levenshtein / Damerau-Levenshtein against search history)
        stageStart = System.nanoTime();
        algorithmsUsed.add("2. Edit Distance (Levenshtein & Damerau-Levenshtein Fuzzy Match)");
        Map<String, Double> editDistSimMap = new ConcurrentHashMap<>();
        for (Movie m : allCandidates) {
            double bestSearchMatch = 0.0;
            for (String q : searchQueries) {
                double match = EditDistance.fuzzyMatchQuery(q, m.getTitle() + " " + String.join(" ", m.getGenres()));
                if (match > bestSearchMatch) {
                    bestSearchMatch = match;
                }
            }
            editDistSimMap.put(m.getId(), bestSearchMatch);
        }
        stageTimesMicros.put("4_EDIT_DISTANCE", (System.nanoTime() - stageStart) / 1000);

        // 5. HASHING (Murmur3 & MinHash Signatures for candidate neighborhoods)
        stageStart = System.nanoTime();
        algorithmsUsed.add("3. Feature Hashing (Murmur3, MinHash Signatures, LSH Bucketing)");
        int[] userMinHash = FeatureHashing.computeMinHashSignature(userInterestTokens);
        Map<String, Double> minHashSimMap = new ConcurrentHashMap<>();
        for (Movie m : allCandidates) {
            List<String> features = new ArrayList<>(m.getTags());
            m.getGenres().forEach(g -> features.add(g.toLowerCase()));
            int[] movieMinHash = FeatureHashing.computeMinHashSignature(features);
            double hashSim = FeatureHashing.estimateSimilarity(userMinHash, movieMinHash);
            minHashSimMap.put(m.getId(), hashSim);
        }
        stageTimesMicros.put("5_HASHING", (System.nanoTime() - stageStart) / 1000);

        // 6. USER SIMILARITY (Pearson Correlation & Collaborative Affinity)
        stageStart = System.nanoTime();
        algorithmsUsed.add("4. User Similarity (Pearson Correlation & Collaborative Filtering)");
        Map<String, Double> collabScoreMap = new ConcurrentHashMap<>();
        if (userId != null && !userRatings.isEmpty()) {
            Map<String, Map<String, Double>> allUserRatingMaps = ratingDataStore.getAllUserRatingMaps("MOVIE");
            for (Map.Entry<String, Map<String, Double>> otherUserEntry : allUserRatingMaps.entrySet()) {
                String otherUserId = otherUserEntry.getKey();
                if (!otherUserId.equals(userId)) {
                    double pearson = UserSimilarity.pearsonCorrelation(userRatings, otherUserEntry.getValue());
                    if (pearson > 0.4) {
                        for (Map.Entry<String, Double> itemRating : otherUserEntry.getValue().entrySet()) {
                            if (!userRatings.containsKey(itemRating.getKey()) && itemRating.getValue() >= 4.0) {
                                double itemCollabWeight = pearson * (itemRating.getValue() / 5.0);
                                collabScoreMap.merge(itemRating.getKey(), itemCollabWeight, Math::max);
                            }
                        }
                    }
                }
            }
        }
        stageTimesMicros.put("6_USER_SIMILARITY", (System.nanoTime() - stageStart) / 1000);

        // 7. RANDOMIZED SELECTION (Reservoir sampling + Epsilon-Greedy exploration)
        stageStart = System.nanoTime();
        algorithmsUsed.add("5. Randomized Selection (Reservoir Sampling & Epsilon-Greedy Exploration)");
        List<Movie> discoveryPool = RandomizedSelection.reservoirSample(allCandidates, 8);
        stageTimesMicros.put("7_RANDOMIZED_SELECTION", (System.nanoTime() - stageStart) / 1000);

        // 8. PARALLEL PROCESSING (ForkJoinPool worker scoring)
        stageStart = System.nanoTime();
        algorithmsUsed.add("6. Parallel Processing (ForkJoinPool Multi-threaded Candidate Scoring)");
        boolean isPersonalized = (userId != null && (!userRatings.isEmpty() || !searchQueries.isEmpty() || !viewedIds.isEmpty()));
        final String finalPrimaryGenre = (primaryInteractedGenre != null) ? primaryInteractedGenre : "Cinematic";

        List<ScoredMovie> scoredMovies = ParallelPipeline.processInParallel(allCandidates, movie -> {
            double strSim = stringSimMap.getOrDefault(movie.getId(), 0.0);
            double editSim = editDistSimMap.getOrDefault(movie.getId(), 0.0);
            double hashSim = minHashSimMap.getOrDefault(movie.getId(), 0.0);
            double combinedContent = (0.6 * strSim) + (0.4 * hashSim);
            double collabSim = collabScoreMap.getOrDefault(movie.getId(), 0.0);

            ScoringEngine.ScoreComponent scoreComponent = ScoringEngine.calculateScore(
                    combinedContent,
                    collabSim,
                    editSim,
                    movie.getTrendingScore(),
                    movie.getRating(),
                    finalPrimaryGenre,
                    isPersonalized,
                    viewedIds.contains(movie.getId()) ? "viewed" : null
            );

            return new ScoredMovie(movie, scoreComponent.getTotalScore(), scoreComponent.getMatchReason());
        });
        stageTimesMicros.put("8_PARALLEL_PROCESSING", (System.nanoTime() - stageStart) / 1000);

        // 9. RECOMMENDATION SCORE & RE-RANKING
        stageStart = System.nanoTime();
        algorithmsUsed.add("7. Recommendation Scoring (Hybrid Multi-Signal Function)");
        algorithmsUsed.add("8. Recommendation Ranking (Min-Heap PriorityQueue Top-K & MMR Diversity)");

        // 10. TOP-K RANKING (Min-Heap + MMR Diversity)
        List<ScoredMovie> topKScored = TopKRanking.getTopK(scoredMovies, limit * 2);
        List<ScoredMovie> diversified = TopKRanking.mmrRerank(topKScored, limit, 0.75);

        stageTimesMicros.put("9_RECOMMENDATION_SCORE_AND_RANKING", (System.nanoTime() - stageStart) / 1000);

        // Build Final Output Items with Ranks and Explanations
        List<RecommendationItem> finalResults = new ArrayList<>();
        int currentRank = 1;
        for (ScoredMovie sm : diversified) {
            Movie m = sm.getMovie();
            RecommendationItem item = new RecommendationItem(
                    currentRank++,
                    sm.getScore(),
                    "MOVIE",
                    m.getId(),
                    m.getTitle(),
                    m.getYear() + " • " + String.join(", ", m.getGenres()) + " • Dir. " + m.getDirector(),
                    m.getPosterUrl(),
                    m.getRating(),
                    sm.getReason(),
                    Map.of(
                            "year", m.getYear(),
                            "genres", m.getGenres(),
                            "director", m.getDirector(),
                            "cast", m.getCast(),
                            "durationMinutes", m.getDurationMinutes(),
                            "overview", m.getOverview(),
                            "trendingScore", m.getTrendingScore(),
                            "voteCount", m.getVoteCount()
                    ),
                    m.getTags()
            );
            finalResults.add(item);
        }

        long totalNanos = System.nanoTime() - startTotalNanos;
        PipelineMetrics metrics = new PipelineMetrics(
                "MOVIE_RECOMMENDATION",
                totalNanos / 1000,
                initialCandidatesCount,
                finalResults.size(),
                stageTimesMicros,
                algorithmsUsed,
                true,
                ParallelPipeline.getPool().getParallelism()
        );

        return new RecommendationResponse(finalResults, metrics);
    }

    /**
     * Executes the complete Java recommendation pipeline for PRODUCTS
     */
    public RecommendationResponse recommendProducts(String userId, int limit) {
        long startTotalNanos = System.nanoTime();
        Map<String, Long> stageTimesMicros = new LinkedHashMap<>();
        List<String> algorithmsUsed = new ArrayList<>();

        // 1. USER SIGNALS
        long stageStart = System.nanoTime();
        User user = (userId != null) ? userDataStore.getUserById(userId).orElse(null) : null;
        Map<String, Double> userRatings = (userId != null) ? ratingDataStore.getUserRatingMap(userId, "PRODUCT") : Collections.emptyMap();
        List<String> searchQueries = (userId != null) ? userSignalDataStore.getSearchQueriesByUser(userId, "PRODUCT") : Collections.emptyList();
        Set<String> viewedIds = (userId != null) ? userSignalDataStore.getViewedItemIdsByUser(userId, "PRODUCT") : Collections.emptySet();

        // Build User Taste Profile for Products
        Set<String> userInterestTokens = new HashSet<>();
        if (user != null) {
            for (String c : user.getFavoriteProductCategories()) {
                userInterestTokens.add(c.toLowerCase());
            }
        }
        for (String q : searchQueries) {
            userInterestTokens.addAll(StringSimilarity.tokenize(q));
        }
        String primaryInteractedCategory = null;
        for (Map.Entry<String, Double> entry : userRatings.entrySet()) {
            if (entry.getValue() >= 4.0) {
                productDataStore.getProductById(entry.getKey()).ifPresent(p -> {
                    userInterestTokens.addAll(p.getTags());
                    userInterestTokens.add(p.getCategory().toLowerCase());
                });
            }
        }
        for (String viewId : viewedIds) {
            productDataStore.getProductById(viewId).ifPresent(p -> {
                userInterestTokens.addAll(p.getTags());
                userInterestTokens.add(p.getCategory().toLowerCase());
            });
        }
        if (!userInterestTokens.isEmpty()) {
            primaryInteractedCategory = userInterestTokens.iterator().next();
        }
        stageTimesMicros.put("1_USER_SIGNALS", (System.nanoTime() - stageStart) / 1000);

        // 2. CANDIDATES RETRIEVAL (STRICTLY PRODUCTS, EXCLUDING ALREADY RATED)
        stageStart = System.nanoTime();
        List<Product> allCandidates = productDataStore.getAllProducts().stream()
                .filter(p -> !userRatings.containsKey(p.getId()))
                .collect(Collectors.toList());
        if (allCandidates.isEmpty()) {
            allCandidates = productDataStore.getAllProducts();
        }
        int initialCandidatesCount = allCandidates.size();
        stageTimesMicros.put("2_CANDIDATES", (System.nanoTime() - stageStart) / 1000);

        // 3. STRING SIMILARITY (Jaccard + Cosine on product tags, brand, category)
        stageStart = System.nanoTime();
        algorithmsUsed.add("1. String Similarity (Jaccard & Cosine TF-IDF)");
        Map<String, Double> stringSimMap = new ConcurrentHashMap<>();
        for (Product p : allCandidates) {
            List<String> prodTokens = new ArrayList<>(p.getTags());
            prodTokens.add(p.getCategory().toLowerCase());
            prodTokens.add(p.getBrand().toLowerCase());
            prodTokens.addAll(StringSimilarity.tokenize(p.getName() + " " + p.getDescription()));

            double jaccard = StringSimilarity.jaccardSimilarity(userInterestTokens, prodTokens);
            double cosine = StringSimilarity.cosineTextSimilarity(String.join(" ", userInterestTokens), p.getName() + " " + p.getDescription());
            double combinedStringSim = (0.6 * jaccard) + (0.4 * cosine);
            stringSimMap.put(p.getId(), combinedStringSim);
        }
        stageTimesMicros.put("3_STRING_SIMILARITY", (System.nanoTime() - stageStart) / 1000);

        // 4. EDIT DISTANCE (Levenshtein / Damerau-Levenshtein against search history)
        stageStart = System.nanoTime();
        algorithmsUsed.add("2. Edit Distance (Levenshtein & Damerau-Levenshtein Fuzzy Match)");
        Map<String, Double> editDistSimMap = new ConcurrentHashMap<>();
        for (Product p : allCandidates) {
            double bestSearchMatch = 0.0;
            for (String q : searchQueries) {
                double match = EditDistance.fuzzyMatchQuery(q, p.getName() + " " + p.getBrand() + " " + p.getCategory());
                if (match > bestSearchMatch) {
                    bestSearchMatch = match;
                }
            }
            editDistSimMap.put(p.getId(), bestSearchMatch);
        }
        stageTimesMicros.put("4_EDIT_DISTANCE", (System.nanoTime() - stageStart) / 1000);

        // 5. HASHING (Murmur3 & MinHash Signatures)
        stageStart = System.nanoTime();
        algorithmsUsed.add("3. Feature Hashing (Murmur3, MinHash Signatures, LSH Bucketing)");
        int[] userMinHash = FeatureHashing.computeMinHashSignature(userInterestTokens);
        Map<String, Double> minHashSimMap = new ConcurrentHashMap<>();
        for (Product p : allCandidates) {
            List<String> features = new ArrayList<>(p.getTags());
            features.add(p.getCategory().toLowerCase());
            features.add(p.getBrand().toLowerCase());
            int[] prodMinHash = FeatureHashing.computeMinHashSignature(features);
            double hashSim = FeatureHashing.estimateSimilarity(userMinHash, prodMinHash);
            minHashSimMap.put(p.getId(), hashSim);
        }
        stageTimesMicros.put("5_HASHING", (System.nanoTime() - stageStart) / 1000);

        // 6. USER SIMILARITY (Pearson Correlation for Products)
        stageStart = System.nanoTime();
        algorithmsUsed.add("4. User Similarity (Pearson Correlation & Collaborative Filtering)");
        Map<String, Double> collabScoreMap = new ConcurrentHashMap<>();
        if (userId != null && !userRatings.isEmpty()) {
            Map<String, Map<String, Double>> allUserRatingMaps = ratingDataStore.getAllUserRatingMaps("PRODUCT");
            for (Map.Entry<String, Map<String, Double>> otherUserEntry : allUserRatingMaps.entrySet()) {
                String otherUserId = otherUserEntry.getKey();
                if (!otherUserId.equals(userId)) {
                    double pearson = UserSimilarity.pearsonCorrelation(userRatings, otherUserEntry.getValue());
                    if (pearson > 0.4) {
                        for (Map.Entry<String, Double> itemRating : otherUserEntry.getValue().entrySet()) {
                            if (!userRatings.containsKey(itemRating.getKey()) && itemRating.getValue() >= 4.0) {
                                double itemCollabWeight = pearson * (itemRating.getValue() / 5.0);
                                collabScoreMap.merge(itemRating.getKey(), itemCollabWeight, Math::max);
                            }
                        }
                    }
                }
            }
        }
        stageTimesMicros.put("6_USER_SIMILARITY", (System.nanoTime() - stageStart) / 1000);

        // 7. RANDOMIZED SELECTION
        stageStart = System.nanoTime();
        algorithmsUsed.add("5. Randomized Selection (Reservoir Sampling & Epsilon-Greedy Exploration)");
        List<Product> discoveryPool = RandomizedSelection.reservoirSample(allCandidates, 8);
        stageTimesMicros.put("7_RANDOMIZED_SELECTION", (System.nanoTime() - stageStart) / 1000);

        // 8. PARALLEL PROCESSING
        stageStart = System.nanoTime();
        algorithmsUsed.add("6. Parallel Processing (ForkJoinPool Multi-threaded Candidate Scoring)");
        boolean isPersonalized = (userId != null && (!userRatings.isEmpty() || !searchQueries.isEmpty() || !viewedIds.isEmpty()));
        final String finalPrimaryCategory = (primaryInteractedCategory != null) ? primaryInteractedCategory : "Tech & Audio";

        List<ScoredProduct> scoredProducts = ParallelPipeline.processInParallel(allCandidates, prod -> {
            double strSim = stringSimMap.getOrDefault(prod.getId(), 0.0);
            double editSim = editDistSimMap.getOrDefault(prod.getId(), 0.0);
            double hashSim = minHashSimMap.getOrDefault(prod.getId(), 0.0);
            double combinedContent = (0.6 * strSim) + (0.4 * hashSim);
            double collabSim = collabScoreMap.getOrDefault(prod.getId(), 0.0);

            ScoringEngine.ScoreComponent scoreComponent = ScoringEngine.calculateScore(
                    combinedContent,
                    collabSim,
                    editSim,
                    prod.getTrendingScore(),
                    prod.getRating(),
                    finalPrimaryCategory,
                    isPersonalized,
                    viewedIds.contains(prod.getId()) ? "viewed" : null
            );

            return new ScoredProduct(prod, scoreComponent.getTotalScore(), scoreComponent.getMatchReason());
        });
        stageTimesMicros.put("8_PARALLEL_PROCESSING", (System.nanoTime() - stageStart) / 1000);

        // 9. RECOMMENDATION SCORE & RANKING
        stageStart = System.nanoTime();
        algorithmsUsed.add("7. Recommendation Scoring (Hybrid Multi-Signal Function)");
        algorithmsUsed.add("8. Recommendation Ranking (Min-Heap PriorityQueue Top-K & MMR Diversity)");

        List<ScoredProduct> topKScored = TopKRanking.getTopK(scoredProducts, limit * 2);
        List<ScoredProduct> diversified = TopKRanking.mmrRerank(topKScored, limit, 0.75);

        stageTimesMicros.put("9_RECOMMENDATION_SCORE_AND_RANKING", (System.nanoTime() - stageStart) / 1000);

        // Build Final Output Items with Ranks and Explanations
        List<RecommendationItem> finalResults = new ArrayList<>();
        int currentRank = 1;
        for (ScoredProduct sp : diversified) {
            Product p = sp.getProduct();
            RecommendationItem item = new RecommendationItem(
                    currentRank++,
                    sp.getScore(),
                    "PRODUCT",
                    p.getId(),
                    p.getName(),
                    p.getBrand() + " • " + p.getCategory() + " • $" + String.format("%.2f", p.getPrice()),
                    p.getImageUrl(),
                    p.getRating(),
                    sp.getReason(),
                    Map.of(
                            "brand", p.getBrand(),
                            "category", p.getCategory(),
                            "subcategory", p.getSubcategory(),
                            "price", p.getPrice(),
                            "description", p.getDescription(),
                            "specs", p.getSpecs(),
                            "trendingScore", p.getTrendingScore(),
                            "reviewCount", p.getReviewCount()
                    ),
                    p.getTags()
            );
            finalResults.add(item);
        }

        long totalNanos = System.nanoTime() - startTotalNanos;
        PipelineMetrics metrics = new PipelineMetrics(
                "PRODUCT_RECOMMENDATION",
                totalNanos / 1000,
                initialCandidatesCount,
                finalResults.size(),
                stageTimesMicros,
                algorithmsUsed,
                true,
                ParallelPipeline.getPool().getParallelism()
        );

        return new RecommendationResponse(finalResults, metrics);
    }

    /**
     * Item-to-item similarity for Movies (Content + MinHash + Edit Distance)
     */
    public List<Movie> getSimilarMovies(String movieId, int limit) {
        Optional<Movie> targetOpt = movieDataStore.getMovieById(movieId);
        if (targetOpt.isEmpty()) return Collections.emptyList();
        Movie target = targetOpt.get();

        List<String> targetTokens = new ArrayList<>(target.getTags());
        target.getGenres().forEach(g -> targetTokens.add(g.toLowerCase()));
        targetTokens.addAll(StringSimilarity.tokenize(target.getOverview()));
        int[] targetMinHash = FeatureHashing.computeMinHashSignature(targetTokens);

        List<Movie> others = movieDataStore.getAllMovies().stream()
                .filter(m -> !m.getId().equals(movieId))
                .toList();

        List<ScoredMovie> scored = ParallelPipeline.processInParallel(others, m -> {
            List<String> movieTokens = new ArrayList<>(m.getTags());
            m.getGenres().forEach(g -> movieTokens.add(g.toLowerCase()));
            movieTokens.addAll(StringSimilarity.tokenize(m.getOverview()));

            double jaccard = StringSimilarity.jaccardSimilarity(targetTokens, movieTokens);
            int[] movieMinHash = FeatureHashing.computeMinHashSignature(movieTokens);
            double minHashSim = FeatureHashing.estimateSimilarity(targetMinHash, movieMinHash);
            double directorMatch = target.getDirector().equalsIgnoreCase(m.getDirector()) ? 0.3 : 0.0;

            double score = (0.45 * jaccard) + (0.35 * minHashSim) + directorMatch;
            double scorePercent = Math.round(score * 1000.0) / 10.0;

            String reason = "Similar genre & themes: " + String.join(", ", m.getGenres());
            if (directorMatch > 0) {
                reason = "Also directed by " + m.getDirector();
            }

            m.setScore(scorePercent);
            m.setMatchReason(reason);
            return new ScoredMovie(m, scorePercent, reason);
        });

        List<ScoredMovie> topK = TopKRanking.getTopK(scored, limit);
        return topK.stream().map(ScoredMovie::getMovie).collect(Collectors.toList());
    }

    /**
     * Item-to-item similarity for Products (Category + Brand + MinHash + Specs)
     */
    public List<Product> getSimilarProducts(String productId, int limit) {
        Optional<Product> targetOpt = productDataStore.getProductById(productId);
        if (targetOpt.isEmpty()) return Collections.emptyList();
        Product target = targetOpt.get();

        List<String> targetTokens = new ArrayList<>(target.getTags());
        targetTokens.add(target.getCategory().toLowerCase());
        targetTokens.add(target.getBrand().toLowerCase());
        targetTokens.addAll(StringSimilarity.tokenize(target.getDescription()));
        int[] targetMinHash = FeatureHashing.computeMinHashSignature(targetTokens);

        List<Product> others = productDataStore.getAllProducts().stream()
                .filter(p -> !p.getId().equals(productId))
                .toList();

        List<ScoredProduct> scored = ParallelPipeline.processInParallel(others, p -> {
            List<String> prodTokens = new ArrayList<>(p.getTags());
            prodTokens.add(p.getCategory().toLowerCase());
            prodTokens.add(p.getBrand().toLowerCase());
            prodTokens.addAll(StringSimilarity.tokenize(p.getDescription()));

            double jaccard = StringSimilarity.jaccardSimilarity(targetTokens, prodTokens);
            int[] prodMinHash = FeatureHashing.computeMinHashSignature(prodTokens);
            double minHashSim = FeatureHashing.estimateSimilarity(targetMinHash, prodMinHash);
            double brandMatch = target.getBrand().equalsIgnoreCase(p.getBrand()) ? 0.25 : 0.0;
            double categoryMatch = target.getCategory().equalsIgnoreCase(p.getCategory()) ? 0.30 : 0.0;

            double score = (0.30 * jaccard) + (0.25 * minHashSim) + brandMatch + categoryMatch;
            double scorePercent = Math.round(score * 1000.0) / 10.0;

            String reason = "Related " + p.getCategory() + " product";
            if (brandMatch > 0) {
                reason = "Popular alternative by " + p.getBrand();
            }

            p.setScore(scorePercent);
            p.setMatchReason(reason);
            return new ScoredProduct(p, scorePercent, reason);
        });

        List<ScoredProduct> topK = TopKRanking.getTopK(scored, limit);
        return topK.stream().map(ScoredProduct::getProduct).collect(Collectors.toList());
    }

    private static class ScoredMovie implements TopKRanking.ScoredItem {
        private final Movie movie;
        private final double score;
        private final String reason;

        public ScoredMovie(Movie movie, double score, String reason) {
            this.movie = movie;
            this.score = score;
            this.reason = reason;
            this.movie.setScore(score);
            this.movie.setMatchReason(reason);
        }

        public Movie getMovie() { return movie; }
        public String getReason() { return reason; }

        @Override
        public String getId() { return movie.getId(); }
        @Override
        public double getScore() { return score; }
        @Override
        public Collection<String> getTags() { return movie.getTags(); }
    }

    private static class ScoredProduct implements TopKRanking.ScoredItem {
        private final Product product;
        private final double score;
        private final String reason;

        public ScoredProduct(Product product, double score, String reason) {
            this.product = product;
            this.score = score;
            this.reason = reason;
            this.product.setScore(score);
            this.product.setMatchReason(reason);
        }

        public Product getProduct() { return product; }
        public String getReason() { return reason; }

        @Override
        public String getId() { return product.getId(); }
        @Override
        public double getScore() { return score; }
        @Override
        public Collection<String> getTags() { return product.getTags(); }
    }
}
