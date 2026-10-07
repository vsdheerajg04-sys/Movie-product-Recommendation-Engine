# CineTech - Movie & Product Recommendation Engine

A full-stack, enterprise-grade Recommendation Engine built with a **Java Spring Boot backend** executing **8 custom Data Structures & Algorithms (DSA)** in pure Java, paired with a modern cinematic **React 19 + TypeScript** frontend.

---

## 🏗️ Architecture Overview

- **Backend**: Java 21, Spring Boot 3.2.5, Maven, RESTful APIs, JWT & Guest Session Support.
- **Frontend**: React 19, TypeScript, Vite, Vanilla CSS Design System, Lucide Icons.
- **Segregation Guarantee**: Complete isolation between Movies and Products (zero data mixing).
- **Sub-5ms Latency**: Multi-threaded parallel processing using Java `ForkJoinPool`.

---

## ⚡ The 8 Pure Java DSA Algorithms

All algorithms are implemented from scratch in Java:

1. **String Similarity** (`com.recommendation.engine.algorithm.StringSimilarity`):
   - Jaccard Similarity on tokenized feature sets.
   - Cosine Text Similarity with Term-Frequency weighting.
   - N-Gram sub-token analysis.

2. **Edit Distance** (`com.recommendation.engine.algorithm.EditDistance`):
   - Dynamic Programming Levenshtein Distance Matrix.
   - Damerau-Levenshtein transposition awareness for typo tolerance and fuzzy matching.

3. **Feature Hashing & MinHash LSH** (`com.recommendation.engine.algorithm.FeatureHashing`):
   - 32-bit MurmurHash3 hashing function.
   - 64-signature MinHash vectors for fast Jaccard estimation.
   - Locality Sensitive Hashing (LSH) candidate bucket indexing.

4. **User Similarity & Collaborative Filtering** (`com.recommendation.engine.algorithm.UserSimilarity`):
   - Pearson Correlation Coefficient over sparse rating vectors.
   - Cosine vector similarity with mean centering.

5. **Randomized Selection & Serendipity** (`com.recommendation.engine.algorithm.RandomizedSelection`):
   - Reservoir Sampling algorithm for uniform discovery.
   - Epsilon-Greedy exploration to avoid filter bubbles.
   - Quickselect for $O(N)$ median/quantile retrieval.

6. **Parallel Pipeline Processing** (`com.recommendation.engine.algorithm.ParallelPipeline`):
   - `ForkJoinPool` parallel streams executing scoring workers across available CPU cores.

7. **Recommendation Scoring Function** (`com.recommendation.engine.algorithm.ScoringEngine`):
   - Multi-signal weighted hybrid formula combining collaborative signals, content vectors, trending velocity, and rating decay.
   - Dynamic explainability reason generator.

8. **Top-K Ranking & Diversity** (`com.recommendation.engine.algorithm.TopKRanking`):
   - Min-Heap (`PriorityQueue`) Top-K selection in $O(N \log K)$.
   - Maximal Marginal Relevance (MMR) re-ranking for recommendation diversity.

---

## 🚀 How to Run Locally

### 1. Start the Java Backend (Port 8088)
```bash
cd backend
mvn spring-boot:run
```
*Backend runs on `http://localhost:8088`.*

### 2. Start the Frontend (Port 3000)
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`.*

---

## 📁 Key Endpoints

- `GET /api/movies/recommended` - Computes real-time personalized movie recommendations.
- `GET /api/products/recommended` - Computes real-time personalized product recommendations.
- `POST /api/ratings` - Submits a rating (triggers dynamic recalculation in memory).
- `POST /api/signals/search` - Records user search queries.
- `GET /api/signals/history` - Returns strictly segregated user activity history.
- `GET /api/algorithms/status` - Returns live telemetry of the 8 Java algorithms.
