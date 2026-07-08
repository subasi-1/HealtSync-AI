package com.healthsync.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object modeling AI predictions, center health scores, and warnings.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiInsightDTO {
    private String healthCenterId;
    private String healthCenterName;
    private int healthScore;
    private String status;
    private long alertCount;
    private String recommendations;
}
