package com.recommendation.engine.algorithm;

import java.util.*;

/**
 * 3. Hashing Algorithm (Java Implementation)
 * Implements MurmurHash3-inspired 32-bit feature hashing, MinHash signatures,
 * and Locality-Sensitive Hashing (LSH) for fast sub-linear candidate retrieval.
 */
public class FeatureHashing {

    private static final int NUM_HASH_FUNCTIONS = 64;
    private static final long LARGE_PRIME = 2147483647L; // 2^31 - 1
    private static final int[] HASH_A = new int[NUM_HASH_FUNCTIONS];
    private static final int[] HASH_B = new int[NUM_HASH_FUNCTIONS];

    static {
        Random rand = new Random(1337L);
        for (int i = 0; i < NUM_HASH_FUNCTIONS; i++) {
            HASH_A[i] = 1 + rand.nextInt(100000);
            HASH_B[i] = rand.nextInt(100000);
        }
    }

    /**
     * MurmurHash3 32-bit hash implementation
     */
    public static int murmur3(String data) {
        if (data == null) return 0;
        byte[] bytes = data.getBytes();
        int length = bytes.length;
        int seed = 0x9747b28c;
        int c1 = 0xcc9e2d51;
        int c2 = 0x1b873593;
        int h1 = seed;

        int nblocks = length / 4;
        for (int i = 0; i < nblocks; i++) {
            int i4 = i * 4;
            int k1 = (bytes[i4] & 0xff) |
                    ((bytes[i4 + 1] & 0xff) << 8) |
                    ((bytes[i4 + 2] & 0xff) << 16) |
                    ((bytes[i4 + 3] & 0xff) << 24);

            k1 *= c1;
            k1 = Integer.rotateLeft(k1, 15);
            k1 *= c2;

            h1 ^= k1;
            h1 = Integer.rotateLeft(h1, 13);
            h1 = h1 * 5 + 0xe6546b64;
        }

        int tail = 0;
        int tailStart = nblocks * 4;
        switch (length & 3) {
            case 3:
                tail ^= (bytes[tailStart + 2] & 0xff) << 16;
            case 2:
                tail ^= (bytes[tailStart + 1] & 0xff) << 8;
            case 1:
                tail ^= (bytes[tailStart] & 0xff);
                tail *= c1;
                tail = Integer.rotateLeft(tail, 15);
                tail *= c2;
                h1 ^= tail;
        }

        h1 ^= length;
        h1 ^= (h1 >>> 16);
        h1 *= 0x85ebca6b;
        h1 ^= (h1 >>> 13);
        h1 *= 0xc2b2ae35;
        h1 ^= (h1 >>> 16);

        return h1;
    }

    /**
     * Computes a MinHash signature vector for a set of string features
     */
    public static int[] computeMinHashSignature(Collection<String> features) {
        int[] signature = new int[NUM_HASH_FUNCTIONS];
        Arrays.fill(signature, Integer.MAX_VALUE);

        if (features == null || features.isEmpty()) {
            return signature;
        }

        for (String feature : features) {
            int rawHash = Math.abs(murmur3(feature.toLowerCase().trim()));
            for (int i = 0; i < NUM_HASH_FUNCTIONS; i++) {
                long h = ((long) HASH_A[i] * rawHash + HASH_B[i]) % LARGE_PRIME;
                int hashVal = (int) h;
                if (hashVal < signature[i]) {
                    signature[i] = hashVal;
                }
            }
        }

        return signature;
    }

    /**
     * Estimates Jaccard similarity between two MinHash signatures (0.0 to 1.0)
     */
    public static double estimateSimilarity(int[] sig1, int[] sig2) {
        if (sig1 == null || sig2 == null || sig1.length != sig2.length || sig1.length == 0) {
            return 0.0;
        }
        int matches = 0;
        for (int i = 0; i < sig1.length; i++) {
            if (sig1[i] == sig2[i]) {
                matches++;
            }
        }
        return (double) matches / sig1.length;
    }

    /**
     * Locality-Sensitive Hashing (LSH) Band Bucketing for fast candidate retrieval
     */
    public static List<String> getLshBucketKeys(int[] signature, int numBands, int rowsPerBand) {
        List<String> bucketKeys = new ArrayList<>();
        if (signature == null || signature.length < numBands * rowsPerBand) {
            return bucketKeys;
        }

        for (int band = 0; band < numBands; band++) {
            StringBuilder sb = new StringBuilder();
            sb.append("b").append(band).append(":");
            for (int row = 0; row < rowsPerBand; row++) {
                int index = band * rowsPerBand + row;
                sb.append(signature[index]).append(",");
            }
            int bandHash = murmur3(sb.toString());
            bucketKeys.add("b" + band + "_" + bandHash);
        }

        return bucketKeys;
    }
}
