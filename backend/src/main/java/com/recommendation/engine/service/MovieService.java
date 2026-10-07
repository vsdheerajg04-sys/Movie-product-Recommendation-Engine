package com.recommendation.engine.service;

import com.recommendation.engine.algorithm.EditDistance;
import com.recommendation.engine.algorithm.StringSimilarity;
import com.recommendation.engine.model.Movie;
import com.recommendation.engine.repository.MovieDataStore;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class MovieService {

    private final MovieDataStore movieDataStore;

    public MovieService(MovieDataStore movieDataStore) {
        this.movieDataStore = movieDataStore;
    }

    public List<Movie> getAllMovies() {
        return movieDataStore.getAllMovies();
    }

    public Optional<Movie> getMovieById(String id) {
        return movieDataStore.getMovieById(id);
    }

    public List<Movie> getTrendingMovies(int limit) {
        return movieDataStore.getTrendingMovies(limit);
    }

    public Set<String> getGenres() {
        return movieDataStore.getAllGenres();
    }

    public List<Movie> searchMovies(String query, String genre, Double minRating, Integer minYear, String sortBy) {
        List<Movie> list = movieDataStore.getAllMovies();

        if (genre != null && !genre.trim().isEmpty() && !"ALL".equalsIgnoreCase(genre)) {
            list = list.stream()
                    .filter(m -> m.getGenres().stream().anyMatch(g -> g.equalsIgnoreCase(genre)))
                    .collect(Collectors.toList());
        }

        if (minRating != null && minRating > 0) {
            list = list.stream()
                    .filter(m -> m.getRating() >= minRating)
                    .collect(Collectors.toList());
        }

        if (minYear != null && minYear > 0) {
            list = list.stream()
                    .filter(m -> m.getYear() >= minYear)
                    .collect(Collectors.toList());
        }

        if (query != null && !query.trim().isEmpty()) {
            final String q = query.trim().toLowerCase();
            // Fuzzy search using Java Edit Distance and String Similarity
            Map<Movie, Double> movieScores = new HashMap<>();
            for (Movie m : list) {
                double editScore = EditDistance.fuzzyMatchQuery(q, m.getTitle() + " " + m.getDirector() + " " + String.join(" ", m.getGenres()));
                double tokenScore = StringSimilarity.cosineTextSimilarity(q, m.getTitle() + " " + m.getOverview());
                double score = (0.7 * editScore) + (0.3 * tokenScore);
                if (score > 0.25 || m.getTitle().toLowerCase().contains(q) || m.getDirector().toLowerCase().contains(q)) {
                    movieScores.put(m, score);
                }
            }

            list = movieScores.entrySet().stream()
                    .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                    .map(Map.Entry::getKey)
                    .collect(Collectors.toList());
            return list;
        }

        // Apply sorting
        if ("rating".equalsIgnoreCase(sortBy)) {
            list.sort((a, b) -> Double.compare(b.getRating(), a.getRating()));
        } else if ("year".equalsIgnoreCase(sortBy)) {
            list.sort((a, b) -> Integer.compare(b.getYear(), a.getYear()));
        } else if ("trending".equalsIgnoreCase(sortBy)) {
            list.sort((a, b) -> Double.compare(b.getTrendingScore(), a.getTrendingScore()));
        } else {
            // Default sort by rating & trending
            list.sort((a, b) -> Double.compare(b.getTrendingScore(), a.getTrendingScore()));
        }

        return list;
    }

    public Movie createMovie(Movie movie) {
        if (movie.getTitle() == null || movie.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Movie title is required");
        }
        if (movie.getGenres() == null || movie.getGenres().isEmpty()) {
            movie.setGenres(List.of("Drama"));
        }
        return movieDataStore.addCustomMovie(movie);
    }
}
