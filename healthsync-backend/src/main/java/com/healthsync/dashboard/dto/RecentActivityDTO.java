package com.healthsync.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object modeling live clinical activity logs and audit entries.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentActivityDTO {
    private String id;
    private String description;
    private String timestamp;
    private String category;
    private String actorName;
}
