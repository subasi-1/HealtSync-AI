package com.healthsync.ai.dto;

public record FastApiResponse<T>(
    boolean success,
    T prediction,
    double confidence,
    String timestamp
) {}
