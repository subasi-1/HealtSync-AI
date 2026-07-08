package com.healthsync.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * Data Transfer Object modeling doctor attendance percentages and active roster logs.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorAttendanceDTO {
    private long totalDoctors;
    private long presentDoctors;
    private long absentDoctors;
    private double attendanceRate;
    private List<DoctorAttendanceDetail> details;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DoctorAttendanceDetail {
        private String doctorName;
        private String specialty;
        private String healthCenterName;
        private String status;
    }
}
