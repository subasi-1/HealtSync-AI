package com.healthsync.bed.dto;

import java.util.UUID;

/**
 * Data Transfer Object representing Bed response details.
 */
public record BedResponse(
    UUID id,
    String bedNumber,
    String bedType,
    String availabilityStatus,
    String cleaningStatus,
    String maintenanceStatus,
    UUID wardId,
    String wardName,
    String wardCode,
    UUID hospitalId
) {}
