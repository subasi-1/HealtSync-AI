package com.healthsync.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object modeling aggregate metrics for HealthSync AI dashboard summary.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDTO {
    private long totalHealthCenters;
    private long totalDoctors;
    private long totalPatientsToday;
    private long availableBeds;
    private long occupiedBeds;
    private long medicineLowStockCount;
    private long criticalAlertsCount;
    private int overallHealthScore;
}
