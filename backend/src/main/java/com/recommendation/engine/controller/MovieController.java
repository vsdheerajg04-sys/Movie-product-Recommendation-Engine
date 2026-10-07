package com.recommendation.engine.controller;

import com.recommendation.engine.model.Movie;
import com.recommendation.engine.model.User;
import com.recommendation.engine.service.AuthService;
import com.recommendation.engine.service.MovieService;
import com.recommendation.engine.service.RecommendationPipelineService;
import com.recommendation.engine.service.UserSignalService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/movies")
@CrossOrigin(origins = "*")
public class MovieController {

    private final MovieService movieService;
    private final RecommendationPipelineService recommendationPipelineService;
    private final AuthService authService;
    private final UserSignalService userSignalService;

    public MovieController(
            MovieService movieService,
            RecommendationPipelineService recommendationPipelineService,
            AuthService authService,
            UserSignalService userSignalService) {
        this.movieService = movieService;
        this.recommendationPipelineService = recommendationPipelineService;
        this.authService = authService;
        this.userSignalService = userSignalService;
    }

    @GetMapping
    public ResponseEntity<List<Movie>> getMovies(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) Integer minYear,
            @RequestParam(required = false, defaultValue = "trending") String sortBy,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        if (query != null && !query.trim().isEmpty() && authHeader != null) {
            authService.getCurrentUser(authHeader).ifPresent(user ->
                userSignalService.recordSearch(user.getId(), "MOVIE", query.trim())
            );
        }

        List<Movie> movies = movieService.searchMovies(query, genre, minRating, minYear, sortBy);
        return ResponseEntity.ok(movies);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMovieById(
            @PathVariable String id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Optional<Movie> movieOpt = movieService.getMovieById(id);
        if (movieOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Movie movie = movieOpt.get();

        if (authHeader != null) {
            authService.getCurrentUser(authHeader).ifPresent(user ->
                userSignalService.recordView(user.getId(), "MOVIE", id, Map.of("title", movie.getTitle()))
            );
        }

        return ResponseEntity.ok(movie);
    }

    @GetMapping("/trending")
    public ResponseEntity<List<Movie>> getTrendingMovies(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(movieService.getTrendingMovies(limit));
    }

    @GetMapping("/recommended")
    public ResponseEntity<?> getRecommendedMovies(
            @RequestParam(defaultValue = "10") int limit,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Guest-Id", required = false) String guestHeader) {
        String userId = null;
        if (authHeader != null) {
            Optional<User> user = authService.getCurrentUser(authHeader);
            if (user.isPresent()) {
                userId = user.get().getId();
            }
        }
        if (userId == null && guestHeader != null && !guestHeader.trim().isEmpty()) {
            userId = guestHeader.trim();
        }

        RecommendationPipelineService.RecommendationResponse response =
                recommendationPipelineService.recommendMovies(userId, limit);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/similar")
    public ResponseEntity<List<Movie>> getSimilarMovies(
            @PathVariable String id,
            @RequestParam(defaultValue = "6") int limit) {
        return ResponseEntity.ok(recommendationPipelineService.getSimilarMovies(id, limit));
    }

    @GetMapping("/genres")
    public ResponseEntity<Set<String>> getGenres() {
        return ResponseEntity.ok(movieService.getGenres());
    }
}
