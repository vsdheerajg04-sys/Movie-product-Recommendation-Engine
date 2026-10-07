package com.recommendation.engine.algorithm;

/**
 * 2. Edit Distance Algorithm (Java Implementation)
 * Implements Dynamic Programming Levenshtein and Damerau-Levenshtein distances,
 * along with normalized similarity scoring and fuzzy substring matching.
 */
public class EditDistance {

    /**
     * Calculates Levenshtein Distance between two strings using DP matrix (O(M * N))
     */
    public static int levenshteinDistance(String s1, String s2) {
        if (s1 == null && s2 == null) return 0;
        if (s1 == null) return s2.length();
        if (s2 == null) return s1.length();

        int len1 = s1.length();
        int len2 = s2.length();

        int[][] dp = new int[len1 + 1][len2 + 1];

        for (int i = 0; i <= len1; i++) {
            dp[i][0] = i;
        }
        for (int j = 0; j <= len2; j++) {
            dp[0][j] = j;
        }

        for (int i = 1; i <= len1; i++) {
            char c1 = Character.toLowerCase(s1.charAt(i - 1));
            for (int j = 1; j <= len2; j++) {
                char c2 = Character.toLowerCase(s2.charAt(j - 1));

                int cost = (c1 == c2) ? 0 : 1;

                dp[i][j] = Math.min(
                    Math.min(dp[i - 1][j] + 1,      // Deletion
                             dp[i][j - 1] + 1),     // Insertion
                    dp[i - 1][j - 1] + cost         // Substitution
                );
            }
        }

        return dp[len1][len2];
    }

    /**
     * Calculates Damerau-Levenshtein distance (supports transpositions)
     */
    public static int damerauLevenshteinDistance(String s1, String s2) {
        if (s1 == null && s2 == null) return 0;
        if (s1 == null) return s2.length();
        if (s2 == null) return s1.length();

        int len1 = s1.length();
        int len2 = s2.length();

        int[][] dp = new int[len1 + 1][len2 + 1];

        for (int i = 0; i <= len1; i++) dp[i][0] = i;
        for (int j = 0; j <= len2; j++) dp[0][j] = j;

        for (int i = 1; i <= len1; i++) {
            char c1 = Character.toLowerCase(s1.charAt(i - 1));
            for (int j = 1; j <= len2; j++) {
                char c2 = Character.toLowerCase(s2.charAt(j - 1));
                int cost = (c1 == c2) ? 0 : 1;

                dp[i][j] = Math.min(
                    Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1),
                    dp[i - 1][j - 1] + cost
                );

                // Transposition
                if (i > 1 && j > 1 &&
                    Character.toLowerCase(s1.charAt(i - 1)) == Character.toLowerCase(s2.charAt(j - 2)) &&
                    Character.toLowerCase(s1.charAt(i - 2)) == Character.toLowerCase(s2.charAt(j - 1))) {
                    dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + cost);
                }
            }
        }

        return dp[len1][len2];
    }

    /**
     * Normalized edit similarity score between 0.0 and 1.0
     */
    public static double normalizedEditSimilarity(String s1, String s2) {
        if (s1 == null || s2 == null) return 0.0;
        String str1 = s1.trim();
        String str2 = s2.trim();
        if (str1.equalsIgnoreCase(str2)) return 1.0;

        int maxLen = Math.max(str1.length(), str2.length());
        if (maxLen == 0) return 1.0;

        int dist = damerauLevenshteinDistance(str1, str2);
        double score = 1.0 - ((double) dist / maxLen);
        return Math.max(0.0, score);
    }

    /**
     * Fuzzy match query against target text (e.g. search queries matching titles with typos)
     */
    public static double fuzzyMatchQuery(String query, String target) {
        if (query == null || target == null || query.trim().isEmpty() || target.trim().isEmpty()) {
            return 0.0;
        }

        String q = query.trim().toLowerCase();
        String t = target.trim().toLowerCase();

        // Exact containment bonus
        if (t.contains(q)) {
            return 0.95 + (0.05 * ((double) q.length() / t.length()));
        }

        // Token-level fuzzy match
        String[] qTokens = q.split("\\s+");
        String[] tTokens = t.split("\\s+");

        double totalScore = 0.0;
        for (String qTok : qTokens) {
            double bestTokenScore = 0.0;
            for (String tTok : tTokens) {
                double sim = normalizedEditSimilarity(qTok, tTok);
                if (sim > bestTokenScore) {
                    bestTokenScore = sim;
                }
            }
            totalScore += bestTokenScore;
        }

        return Math.min(1.0, totalScore / qTokens.length);
    }
}
