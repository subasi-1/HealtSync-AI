package com.healthsync.dashboard.controller;

import com.healthsync.dashboard.dto.*;
import com.healthsync.dashboard.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller exposing endpoints for District Monitoring and consolidations dashboards.
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Dashboard", description = "Endpoints for district monitoring and operational dashboards")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    @Operation(summary = "Get overall operational summary metrics")
    public ResponseEntity<DashboardSummaryDTO> getSummary() {
        log.info("Fetching central dashboard telemetry summary metrics");
        return ResponseEntity.ok(dashboardService.getDashboardSummary());
    }

    @GetMapping("/patient-trends")
    @Operation(summary = "Get daily aggregated patient admissions trends for the last 7 days")
    public ResponseEntity<List<PatientTrendDTO>> getPatientTrends() {
        log.info("Fetching aggregated patient footfall trends");
        return ResponseEntity.ok(dashboardService.getPatientTrends());
    }

    @GetMapping("/medicine-stock")
    @Operation(summary = "Get detailed medicine stocks and reorder status thresholds")
    public ResponseEntity<List<MedicineStockDTO>> getMedicineStock() {
        log.info("Fetching medicine stock and inventory lists");
        return ResponseEntity.ok(dashboardService.getMedicineStock());
    }

    @GetMapping("/bed-utilization")
    @Operation(summary = "Get active bed occupancy rates and ward capacity breakdowns")
    public ResponseEntity<BedUtilizationDTO> getBedUtilization() {
        log.info("Fetching bed occupancy rate indexes");
        return ResponseEntity.ok(dashboardService.getBedUtilization());
    }

    @GetMapping("/doctor-attendance")
    @Operation(summary = "Get daily doctor attendance turnout metrics")
    public ResponseEntity<DoctorAttendanceDTO> getDoctorAttendance() {
        log.info("Fetching doctor daily attendance logs");
        return ResponseEntity.ok(dashboardService.getDoctorAttendance());
    }

    @GetMapping("/lab-statistics")
    @Operation(summary = "Get laboratory diagnostics stats and test booking queues")
    public ResponseEntity<LabStatisticsDTO> getLabStatistics() {
        log.info("Fetching diagnostic test booking volumes");
        return ResponseEntity.ok(dashboardService.getLabStatistics());
    }

    @GetMapping("/ai-insights")
    @Operation(summary = "Get AI predictions, scores, and center warnings")
    public ResponseEntity<List<AiInsightDTO>> getAiInsights() {
        log.info("Fetching AI health score recommendations");
        return ResponseEntity.ok(dashboardService.getAiInsights());
    }

    @GetMapping("/recent-activities")
    @Operation(summary = "Get live activity logs and clinical audit records")
    public ResponseEntity<List<RecentActivityDTO>> getRecentActivities() {
        log.info("Fetching recent visit activity timelines");
        return ResponseEntity.ok(dashboardService.getRecentActivities());
    }

    @GetMapping("/notifications")
    @Operation(summary = "Get active system alerts and notifications logs")
    public ResponseEntity<List<NotificationDTO>> getNotifications() {
        log.info("Fetching system notification items");
        return ResponseEntity.ok(dashboardService.getNotifications());
    }

    @GetMapping("/health-centers")
    @Operation(summary = "Get operational status details of all registered health centers")
    public ResponseEntity<List<HealthCenterStatusDTO>> getHealthCenters() {
        log.info("Fetching detailed health center status maps");
        return ResponseEntity.ok(dashboardService.getHealthCentersList());
    }

    // ==========================================
    // BACKWARD COMPATIBLE PLACEHOLDER ENDPOINTS
    // ==========================================

    @GetMapping("/districts")
    @Operation(summary = "Get summary metrics grouped by district")
    public ResponseEntity<List<DistrictSummaryResponse>> getDistricts() {
        return ResponseEntity.ok(dashboardService.getDistricts());
    }

    @GetMapping("/alerts")
    @Operation(summary = "Get consolidated list of critical alerts across all clinics")
    public ResponseEntity<AlertResponse> getAlerts() {
        return ResponseEntity.ok(dashboardService.getAlerts());
    }

    @GetMapping("/analytics")
    @Operation(summary = "Get 7-day historical trends for resources and footfall")
    public ResponseEntity<AnalyticsResponse> getAnalytics() {
        return ResponseEntity.ok(dashboardService.getAnalytics());
    }

    @GetMapping("/map")
    @Operation(summary = "Get geographical positions, status flags, and health scores for maps")
    public ResponseEntity<List<MapLocationResponse>> getMapLocations() {
        return ResponseEntity.ok(dashboardService.getMapLocations());
    }
}
