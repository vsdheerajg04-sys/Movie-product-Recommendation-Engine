package com.recommendation.engine.controller;

import com.recommendation.engine.model.Product;
import com.recommendation.engine.model.User;
import com.recommendation.engine.service.AuthService;
import com.recommendation.engine.service.ProductService;
import com.recommendation.engine.service.RecommendationPipelineService;
import com.recommendation.engine.service.UserSignalService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductService productService;
    private final RecommendationPipelineService recommendationPipelineService;
    private final AuthService authService;
    private final UserSignalService userSignalService;

    public ProductController(
            ProductService productService,
            RecommendationPipelineService recommendationPipelineService,
            AuthService authService,
            UserSignalService userSignalService) {
        this.productService = productService;
        this.recommendationPipelineService = recommendationPipelineService;
        this.authService = authService;
        this.userSignalService = userSignalService;
    }

    @GetMapping
    public ResponseEntity<List<Product>> getProducts(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false, defaultValue = "trending") String sortBy,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        if (query != null && !query.trim().isEmpty() && authHeader != null) {
            authService.getCurrentUser(authHeader).ifPresent(user ->
                userSignalService.recordSearch(user.getId(), "PRODUCT", query.trim())
            );
        }

        List<Product> products = productService.searchProducts(query, category, minRating, maxPrice, sortBy);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(
            @PathVariable String id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Optional<Product> prodOpt = productService.getProductById(id);
        if (prodOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Product product = prodOpt.get();

        if (authHeader != null) {
            authService.getCurrentUser(authHeader).ifPresent(user ->
                userSignalService.recordView(user.getId(), "PRODUCT", id, Map.of("name", product.getName(), "brand", product.getBrand()))
            );
        }

        return ResponseEntity.ok(product);
    }

    @GetMapping("/trending")
    public ResponseEntity<List<Product>> getTrendingProducts(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(productService.getTrendingProducts(limit));
    }

    @GetMapping("/recommended")
    public ResponseEntity<?> getRecommendedProducts(
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
                recommendationPipelineService.recommendProducts(userId, limit);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/similar")
    public ResponseEntity<List<Product>> getSimilarProducts(
            @PathVariable String id,
            @RequestParam(defaultValue = "6") int limit) {
        return ResponseEntity.ok(recommendationPipelineService.getSimilarProducts(id, limit));
    }

    @GetMapping("/categories")
    public ResponseEntity<Set<String>> getCategories() {
        return ResponseEntity.ok(productService.getCategories());
    }
}
