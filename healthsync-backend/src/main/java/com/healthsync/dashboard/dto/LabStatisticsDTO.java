package com.healthsync.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * Data Transfer Object modeling lab tests statistics and diagnostic bookings.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabStatisticsDTO {
    private long totalTestsBooked;
    private long pendingTests;
    private long completedTests;
    private long criticalResultsCount;
    private List<LabTestDetail> recentTests;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LabTestDetail {
        private String patientName;
        private String testName;
        private String healthCenterName;
        private String status;
        private String bookingPriority;
    }
}
