package com.healthsync.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * Data Transfer Object modeling bed utilization capacity and ward breakdowns.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BedUtilizationDTO {
    private long totalBeds;
    private long occupiedBeds;
    private long availableBeds;
    private double utilizationRate;
    private List<WardBreakdown> wardBreakdown;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WardBreakdown {
        private String wardName;
        private String wardType;
        private String healthCenterName;
        private long total;
        private long occupied;
        private long available;
    }
}
