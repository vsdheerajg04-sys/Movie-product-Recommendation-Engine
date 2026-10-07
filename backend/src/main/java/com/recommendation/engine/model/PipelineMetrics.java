package com.recommendation.engine.model;

import java.util.List;
import java.util.Map;

public class PipelineMetrics {
    private String pipelineType; // "MOVIE_RECOMMENDATION" or "PRODUCT_RECOMMENDATION"
    private long totalExecutionTimeMicros;
    private double totalExecutionTimeMs;
    private int candidatesCount;
    private int rankedCount;
    private Map<String, Long> stageTimesMicros;
    private List<String> algorithmsExecuted;
    private boolean parallelExecutionEnabled;
    private int parallelWorkerThreads;

    public PipelineMetrics() {}

    public PipelineMetrics(String pipelineType, long totalExecutionTimeMicros, int candidatesCount,
                           int rankedCount, Map<String, Long> stageTimesMicros,
                           List<String> algorithmsExecuted, boolean parallelExecutionEnabled,
                           int parallelWorkerThreads) {
        this.pipelineType = pipelineType;
        this.totalExecutionTimeMicros = totalExecutionTimeMicros;
        this.totalExecutionTimeMs = totalExecutionTimeMicros / 1000.0;
        this.candidatesCount = candidatesCount;
        this.rankedCount = rankedCount;
        this.stageTimesMicros = stageTimesMicros;
        this.algorithmsExecuted = algorithmsExecuted;
        this.parallelExecutionEnabled = parallelExecutionEnabled;
        this.parallelWorkerThreads = parallelWorkerThreads;
    }

    public String getPipelineType() { return pipelineType; }
    public void setPipelineType(String pipelineType) { this.pipelineType = pipelineType; }

    public long getTotalExecutionTimeMicros() { return totalExecutionTimeMicros; }
    public void setTotalExecutionTimeMicros(long totalExecutionTimeMicros) {
        this.totalExecutionTimeMicros = totalExecutionTimeMicros;
        this.totalExecutionTimeMs = totalExecutionTimeMicros / 1000.0;
    }

    public double getTotalExecutionTimeMs() { return totalExecutionTimeMs; }

    public int getCandidatesCount() { return candidatesCount; }
    public void setCandidatesCount(int candidatesCount) { this.candidatesCount = candidatesCount; }

    public int getRankedCount() { return rankedCount; }
    public void setRankedCount(int rankedCount) { this.rankedCount = rankedCount; }

    public Map<String, Long> getStageTimesMicros() { return stageTimesMicros; }
    public void setStageTimesMicros(Map<String, Long> stageTimesMicros) { this.stageTimesMicros = stageTimesMicros; }

    public List<String> getAlgorithmsExecuted() { return algorithmsExecuted; }
    public void setAlgorithmsExecuted(List<String> algorithmsExecuted) { this.algorithmsExecuted = algorithmsExecuted; }

    public boolean isParallelExecutionEnabled() { return parallelExecutionEnabled; }
    public void setParallelExecutionEnabled(boolean parallelExecutionEnabled) { this.parallelExecutionEnabled = parallelExecutionEnabled; }

    public int getParallelWorkerThreads() { return parallelWorkerThreads; }
    public void setParallelWorkerThreads(int parallelWorkerThreads) { this.parallelWorkerThreads = parallelWorkerThreads; }
}
