package com.healthsync.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object modeling patient visit trends.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientTrendDTO {
    private String date;
    private long visitCount;
    private long emergencyCount;
    private long outpatientCount;
}
