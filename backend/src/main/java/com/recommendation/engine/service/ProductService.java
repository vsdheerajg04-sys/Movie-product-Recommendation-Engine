package com.recommendation.engine.service;

import com.recommendation.engine.algorithm.EditDistance;
import com.recommendation.engine.algorithm.StringSimilarity;
import com.recommendation.engine.model.Product;
import com.recommendation.engine.repository.ProductDataStore;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductDataStore productDataStore;

    public ProductService(ProductDataStore productDataStore) {
        this.productDataStore = productDataStore;
    }

    public List<Product> getAllProducts() {
        return productDataStore.getAllProducts();
    }

    public Optional<Product> getProductById(String id) {
        return productDataStore.getProductById(id);
    }

    public List<Product> getTrendingProducts(int limit) {
        return productDataStore.getTrendingProducts(limit);
    }

    public Set<String> getCategories() {
        return productDataStore.getAllCategories();
    }

    public List<Product> searchProducts(String query, String category, Double minRating, Double maxPrice, String sortBy) {
        List<Product> list = productDataStore.getAllProducts();

        if (category != null && !category.trim().isEmpty() && !"ALL".equalsIgnoreCase(category)) {
            list = list.stream()
                    .filter(p -> p.getCategory().equalsIgnoreCase(category))
                    .collect(Collectors.toList());
        }

        if (minRating != null && minRating > 0) {
            list = list.stream()
                    .filter(p -> p.getRating() >= minRating)
                    .collect(Collectors.toList());
        }

        if (maxPrice != null && maxPrice > 0) {
            list = list.stream()
                    .filter(p -> p.getPrice() <= maxPrice)
                    .collect(Collectors.toList());
        }

        if (query != null && !query.trim().isEmpty()) {
            final String q = query.trim().toLowerCase();
            Map<Product, Double> prodScores = new HashMap<>();
            for (Product p : list) {
                double editScore = EditDistance.fuzzyMatchQuery(q, p.getName() + " " + p.getBrand() + " " + p.getCategory());
                double tokenScore = StringSimilarity.cosineTextSimilarity(q, p.getName() + " " + p.getDescription());
                double score = (0.7 * editScore) + (0.3 * tokenScore);
                if (score > 0.25 || p.getName().toLowerCase().contains(q) || p.getBrand().toLowerCase().contains(q)) {
                    prodScores.put(p, score);
                }
            }

            list = prodScores.entrySet().stream()
                    .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                    .map(Map.Entry::getKey)
                    .collect(Collectors.toList());
            return list;
        }

        // Sorting
        if ("price_asc".equalsIgnoreCase(sortBy)) {
            list.sort(Comparator.comparingDouble(Product::getPrice));
        } else if ("price_desc".equalsIgnoreCase(sortBy)) {
            list.sort((a, b) -> Double.compare(b.getPrice(), a.getPrice()));
        } else if ("rating".equalsIgnoreCase(sortBy)) {
            list.sort((a, b) -> Double.compare(b.getRating(), a.getRating()));
        } else {
            list.sort((a, b) -> Double.compare(b.getTrendingScore(), a.getTrendingScore()));
        }

        return list;
    }
}
