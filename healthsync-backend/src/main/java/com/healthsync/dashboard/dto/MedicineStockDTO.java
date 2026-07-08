package com.healthsync.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object modeling medicine stock thresholds and levels.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicineStockDTO {
    private String medicineName;
    private String genericName;
    private String healthCenterName;
    private int quantity;
    private int reorderLevel;
    private String status;
}
