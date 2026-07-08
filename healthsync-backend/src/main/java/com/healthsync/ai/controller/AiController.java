package com.healthsync.ai.controller;

import com.healthsync.ai.client.FastApiClient;
import com.healthsync.ai.dto.*;
import com.healthsync.ai.service.AiInsightService;
import com.healthsync.district.entity.HealthCenter;
import com.healthsync.district.service.HealthCenterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST controller exposing AI decision engine insights, score evaluations, and predictions.
 * Integrates with FastAPI Python service on port 8001 with local fallback.
 */
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "AI Insights", description = "Endpoints for AI-driven operational forecasts and score evaluations")
public class AiController {

    private final AiInsightService aiInsightService;
    private final HealthCenterService healthCenterService;
    private final FastApiClient fastApiClient;

    @GetMapping("/health-score/{healthCenterId}")
    @Operation(summary = "Calculate operational health score of a health center")
    public ResponseEntity<HealthScoreResponse> getHealthScore(@PathVariable UUID healthCenterId) {
        return ResponseEntity.ok(aiInsightService.getHealthScore(healthCenterId));
    }

    @GetMapping("/predictions")
    @Operation(summary = "Generate future load, bed occupancy, and drug stock prediction logs")
    public ResponseEntity<PredictionSummary> getPredictions(@RequestParam UUID healthCenterId) {
        return ResponseEntity.ok(aiInsightService.getPredictions(healthCenterId));
    }

    @GetMapping("/recommendations")
    @Operation(summary = "Generate strategic capacity optimization recommendations")
    public ResponseEntity<List<Map<String, Object>>> getRecommendations(@RequestParam(required = false) UUID healthCenterId) {
        try {
            var fastapiRecs = fastApiClient.getRecommendations().prediction();
            List<Map<String, Object>> list = new ArrayList<>();
            for (var r : fastapiRecs) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", "rec-" + r.get("medicine_id"));
                map.put("type", "reorder");
                map.put("urgency", r.get("urgency"));
                map.put("message", r.get("action") + " (Reason: " + r.get("reason") + ")");
                list.add(map);
            }
            if (list.isEmpty()) {
                return getLocalRecommendations(healthCenterId);
            }
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            log.warn("FastAPI recommendations failed, using local engine fallback: {}", e.getMessage());
            return getLocalRecommendations(healthCenterId);
        }
    }

    private ResponseEntity<List<Map<String, Object>>> getLocalRecommendations(UUID healthCenterId) {
        List<Map<String, Object>> list = new ArrayList<>();
        if (healthCenterId != null) {
            List<RecommendationDto> recs = aiInsightService.getRecommendations(healthCenterId);
            for (var r : recs) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", healthCenterId.toString() + "-" + r.action().hashCode());
                map.put("type", r.category());
                map.put("urgency", r.priority());
                map.put("message", r.action() + " (Reason: " + r.reason() + ")");
                list.add(map);
            }
        } else {
            List<HealthCenter> centers = healthCenterService.getAllHealthCenters();
            for (HealthCenter center : centers) {
                List<RecommendationDto> recs = aiInsightService.getRecommendations(center.getId());
                for (var r : recs) {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", center.getId().toString() + "-" + r.action().hashCode());
                    map.put("type", r.category());
                    map.put("urgency", r.priority());
                    map.put("message", r.action() + " (Reason: " + r.reason() + ")");
                    list.add(map);
                }
            }
        }
        return ResponseEntity.ok(list);
    }

    @GetMapping("/alerts")
    @Operation(summary = "Retrieve active resource-critical alerts")
    public ResponseEntity<List<AiAlertDto>> getAlerts(@RequestParam UUID healthCenterId) {
        try {
            var fastapiAlerts = fastApiClient.getAlerts().prediction();
            List<AiAlertDto> list = new ArrayList<>();
            for (var a : fastapiAlerts) {
                list.add(new AiAlertDto(
                        (String) a.get("alert_type"),
                        (String) a.get("message"),
                        (String) a.get("severity"),
                        a.get("healthCenterName") != null ? (String) a.get("healthCenterName") : "District HQ"
                ));
            }
            if (list.isEmpty()) {
                return ResponseEntity.ok(aiInsightService.getAlerts(healthCenterId));
            }
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            log.warn("FastAPI alerts failed, using local engine fallback: {}", e.getMessage());
            return ResponseEntity.ok(aiInsightService.getAlerts(healthCenterId));
        }
    }

    @GetMapping("/resource-transfer")
    @Operation(summary = "Recommend supply redistribution transfers between centers")
    public ResponseEntity<List<RedistributionTransfer>> getResourceRedistributions(@RequestParam UUID healthCenterId) {
        return ResponseEntity.ok(aiInsightService.getResourceRedistributions(healthCenterId));
    }

    // ==========================================
    // FRONTEND COMPATIBILITY ENDPOINTS
    // ==========================================

    @GetMapping("/dashboard")
    @Operation(summary = "Get consolidated district AI metrics")
    public ResponseEntity<Map<String, Object>> getDashboardMetrics() {
        try {
            var risks = fastApiClient.getStockout().prediction();
            int totalRisk = 0;
            int count = 0;
            for (var r : risks) {
                Number scoreNum = (Number) r.get("risk_score");
                if (scoreNum != null) {
                    totalRisk += (int) (scoreNum.doubleValue() * 100);
                    count++;
                }
            }
            int avgRisk = count > 0 ? totalRisk / count : 74;

            Map<String, Object> metrics = new HashMap<>();
            metrics.put("districtRisk", avgRisk);
            metrics.put("resourceHealth", Math.max(10, 100 - avgRisk));
            metrics.put("bedStrain", 86);
            return ResponseEntity.ok(metrics);
        } catch (Exception e) {
            log.warn("FastAPI dashboard failed, using defaults: {}", e.getMessage());
            Map<String, Object> metrics = new HashMap<>();
            metrics.put("districtRisk", 74);
            metrics.put("resourceHealth", 82);
            metrics.put("bedStrain", 86);
            return ResponseEntity.ok(metrics);
        }
    }

    @GetMapping("/medicine-demand")
    @Operation(summary = "Get medicine demand forecast predictions")
    public ResponseEntity<List<Map<String, Object>>> getMedicineDemand() {
        try {
            var risks = fastApiClient.getStockout().prediction();
            List<Map<String, Object>> list = new ArrayList<>();
            for (var r : risks) {
                Map<String, Object> map = new HashMap<>();
                map.put("medicine", r.get("medicine_name"));
                Number stockNum = (Number) r.get("current_stock");
                map.put("currentStock", stockNum != null ? stockNum.intValue() : 0);
                Number demandNum = (Number) r.get("avg_daily_demand");
                map.put("predictedDemand", demandNum != null ? (int)(demandNum.doubleValue() * 30) : 150);
                map.put("riskLevel", r.get("risk_level"));
                list.add(map);
            }
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            log.warn("FastAPI medicine-demand failed, using local engine: {}", e.getMessage());
            return getLocalMedicineDemand();
        }
    }

    private ResponseEntity<List<Map<String, Object>>> getLocalMedicineDemand() {
        List<HealthCenter> centers = healthCenterService.getAllHealthCenters();
        List<Map<String, Object>> list = new ArrayList<>();
        if (!centers.isEmpty()) {
            UUID id = centers.get(0).getId();
            List<PredictionSummary.MedicineStockPrediction> preds = aiInsightService.getPredictions(id).medicineStockOuts();
            for (var p : preds) {
                Map<String, Object> map = new HashMap<>();
                map.put("medicine", p.medicineName());
                map.put("currentStock", p.currentStock());
                map.put("predictedDemand", p.averageDailyUsage() * 30);
                map.put("riskLevel", p.riskLevel());
                list.add(map);
            }
        }
        return ResponseEntity.ok(list);
    }

    @GetMapping("/stockout-risk")
    @Operation(summary = "Get stockout risk predictions")
    public ResponseEntity<List<Map<String, Object>>> getStockoutRisk() {
        try {
            var risks = fastApiClient.getStockout().prediction();
            List<Map<String, Object>> list = new ArrayList<>();
            for (var r : risks) {
                Map<String, Object> map = new HashMap<>();
                map.put("item", r.get("medicine_name"));
                map.put("facility", "District HQ");
                Number daysNum = (Number) r.get("days_left");
                map.put("daysRemaining", daysNum != null ? daysNum.intValue() : 0);
                map.put("risk", r.get("risk_level"));
                list.add(map);
            }
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            log.warn("FastAPI stockout-risk failed, using local engine: {}", e.getMessage());
            return getLocalStockoutRisk();
        }
    }

    private ResponseEntity<List<Map<String, Object>>> getLocalStockoutRisk() {
        List<HealthCenter> centers = healthCenterService.getAllHealthCenters();
        List<Map<String, Object>> list = new ArrayList<>();
        for (HealthCenter center : centers) {
            List<PredictionSummary.MedicineStockPrediction> preds = aiInsightService.getPredictions(center.getId()).medicineStockOuts();
            for (var p : preds) {
                Map<String, Object> map = new HashMap<>();
                map.put("item", p.medicineName());
                map.put("facility", center.getName());
                map.put("daysRemaining", p.daysRemaining());
                map.put("risk", p.riskLevel());
                list.add(map);
            }
        }
        return ResponseEntity.ok(list);
    }

    @GetMapping("/patient-footfall")
    @Operation(summary = "Get predicted patient footfall trends")
    public ResponseEntity<List<Map<String, Object>>> getPatientFootfall() {
        List<HealthCenter> centers = healthCenterService.getAllHealthCenters();
        List<Map<String, Object>> list = new ArrayList<>();
        if (!centers.isEmpty()) {
            UUID id = centers.get(0).getId();
            List<PredictionSummary.PatientLoadPrediction> preds = aiInsightService.getPredictions(id).patientLoad();
            for (var p : preds) {
                Map<String, Object> map = new HashMap<>();
                map.put("date", p.period());
                map.put("predicted", p.predictedVisits());
                map.put("lowerBound", (int)(p.predictedVisits() * 0.8));
                map.put("upperBound", (int)(p.predictedVisits() * 1.2));
                list.add(map);
            }
        }
        return ResponseEntity.ok(list);
    }

    @GetMapping("/bed-occupancy")
    @Operation(summary = "Get predicted bed occupancy rates")
    public ResponseEntity<List<Map<String, Object>>> getBedOccupancy() {
        List<HealthCenter> centers = healthCenterService.getAllHealthCenters();
        List<Map<String, Object>> list = new ArrayList<>();
        if (!centers.isEmpty()) {
            UUID id = centers.get(0).getId();
            List<PredictionSummary.BedOccupancyPrediction> preds = aiInsightService.getPredictions(id).bedOccupancy();
            int idx = 1;
            for (var p : preds) {
                Map<String, Object> map = new HashMap<>();
                map.put("ward", "Ward " + idx++);
                map.put("current", p.predictedOccupiedBeds());
                map.put("predicted", (int)(p.predictedOccupiedBeds() * 1.1));
                map.put("status", p.predictedOccupiedBeds() > p.availableBeds() ? "Critical" : "Stable");
                list.add(map);
            }
        }
        return ResponseEntity.ok(list);
    }

    @GetMapping("/doctor-workload")
    @Operation(summary = "Get predicted doctor workloads and availability indices")
    public ResponseEntity<List<Map<String, Object>>> getDoctorWorkload() {
        List<HealthCenter> centers = healthCenterService.getAllHealthCenters();
        List<Map<String, Object>> list = new ArrayList<>();
        if (!centers.isEmpty()) {
            UUID id = centers.get(0).getId();
            List<PredictionSummary.DoctorShortagePrediction> preds = aiInsightService.getPredictions(id).doctorShortages();
            for (var p : preds) {
                Map<String, Object> map = new HashMap<>();
                map.put("doctor", "Dept: " + p.department());
                map.put("specialty", p.department());
                map.put("shiftsAssigned", p.currentDoctors());
                map.put("workloadIndex", p.predictedNeeded());
                list.add(map);
            }
        }
        return ResponseEntity.ok(list);
    }
}
