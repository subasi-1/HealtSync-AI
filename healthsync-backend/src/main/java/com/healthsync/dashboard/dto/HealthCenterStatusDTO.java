package com.healthsync.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object modeling health center performance score indexes.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthCenterStatusDTO {
    private String id;
    private String name;
    private String type;
    private String districtName;
    private String medicineStatus;
    private String doctorAvailability;
    private String bedOccupancy;
    private long todayPatients;
    private int healthScore;
    private String status;
}
