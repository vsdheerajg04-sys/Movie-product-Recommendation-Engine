package com.recommendation.engine.algorithm;

import java.util.*;

/**
 * 1. String Similarity Algorithm (Java Implementation)
 * Provides Jaccard Similarity, Cosine Token Similarity, and N-Gram overlap.
 */
public class StringSimilarity {

    /**
     * Calculates Jaccard similarity between two token collections (0.0 to 1.0)
     */
    public static double jaccardSimilarity(Collection<String> tokens1, Collection<String> tokens2) {
        if (tokens1 == null || tokens2 == null || tokens1.isEmpty() || tokens2.isEmpty()) {
            return 0.0;
        }
        Set<String> set1 = new HashSet<>();
        for (String t : tokens1) {
            if (t != null && !t.trim().isEmpty()) {
                set1.add(t.trim().toLowerCase());
            }
        }
        Set<String> set2 = new HashSet<>();
        for (String t : tokens2) {
            if (t != null && !t.trim().isEmpty()) {
                set2.add(t.trim().toLowerCase());
            }
        }
        if (set1.isEmpty() && set2.isEmpty()) return 1.0;
        if (set1.isEmpty() || set2.isEmpty()) return 0.0;

        Set<String> intersection = new HashSet<>(set1);
        intersection.retainAll(set2);

        Set<String> union = new HashSet<>(set1);
        union.addAll(set2);

        return (double) intersection.size() / union.size();
    }

    /**
     * Calculates Cosine Similarity between two text documents based on Term Frequency (TF)
     */
    public static double cosineTextSimilarity(String text1, String text2) {
        if (text1 == null || text2 == null || text1.trim().isEmpty() || text2.trim().isEmpty()) {
            return 0.0;
        }

        Map<String, Integer> tf1 = getTermFrequencies(tokenize(text1));
        Map<String, Integer> tf2 = getTermFrequencies(tokenize(text2));

        Set<String> allTerms = new HashSet<>(tf1.keySet());
        allTerms.addAll(tf2.keySet());

        double dotProduct = 0.0;
        double norm1 = 0.0;
        double norm2 = 0.0;

        for (String term : allTerms) {
            int count1 = tf1.getOrDefault(term, 0);
            int count2 = tf2.getOrDefault(term, 0);

            dotProduct += count1 * count2;
            norm1 += count1 * count1;
            norm2 += count2 * count2;
        }

        if (norm1 == 0.0 || norm2 == 0.0) {
            return 0.0;
        }

        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }

    /**
     * Calculates character 2-gram (Bi-gram) Dice coefficient similarity
     */
    public static double nGramSimilarity(String s1, String s2) {
        if (s1 == null || s2 == null) return 0.0;
        String str1 = s1.trim().toLowerCase();
        String str2 = s2.trim().toLowerCase();
        if (str1.equals(str2)) return 1.0;
        if (str1.length() < 2 || str2.length() < 2) return 0.0;

        List<String> grams1 = getCharacterNGrams(str1, 2);
        List<String> grams2 = getCharacterNGrams(str2, 2);

        Map<String, Integer> counts1 = getTermFrequencies(grams1);
        Map<String, Integer> counts2 = getTermFrequencies(grams2);

        int intersection = 0;
        for (Map.Entry<String, Integer> entry : counts1.entrySet()) {
            int c2 = counts2.getOrDefault(entry.getKey(), 0);
            intersection += Math.min(entry.getValue(), c2);
        }

        return (2.0 * intersection) / (grams1.size() + grams2.size());
    }

    public static List<String> tokenize(String text) {
        if (text == null) return Collections.emptyList();
        String[] raw = text.toLowerCase().replaceAll("[^a-zA-Z0-9\\s]", " ").split("\\s+");
        List<String> tokens = new ArrayList<>();
        for (String s : raw) {
            if (s.length() > 1 && !isStopWord(s)) {
                tokens.add(s);
            }
        }
        return tokens;
    }

    private static List<String> getCharacterNGrams(String str, int n) {
        List<String> ngrams = new ArrayList<>();
        for (int i = 0; i <= str.length() - n; i++) {
            ngrams.add(str.substring(i, i + n));
        }
        return ngrams;
    }

    private static Map<String, Integer> getTermFrequencies(List<String> tokens) {
        Map<String, Integer> freq = new HashMap<>();
        for (String t : tokens) {
            freq.put(t, freq.getOrDefault(t, 0) + 1);
        }
        return freq;
    }

    private static boolean isStopWord(String word) {
        Set<String> stopWords = Set.of(
            "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "with",
            "about", "against", "between", "into", "through", "during", "before", "after",
            "above", "below", "from", "up", "down", "of", "off", "over", "under", "is",
            "are", "was", "were", "be", "been", "being", "have", "has", "had", "it", "this"
        );
        return stopWords.contains(word);
    }
}
