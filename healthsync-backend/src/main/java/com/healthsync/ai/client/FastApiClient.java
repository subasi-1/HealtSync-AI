package com.healthsync.ai.client;

import com.healthsync.ai.dto.FastApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class FastApiClient {

    private final RestClient aiRestClient;

    public FastApiResponse<List<Map<String, Object>>> getForecast() {
        try {
            return aiRestClient.get()
                    .uri("/forecast")
                    .retrieve()
                    .body(new ParameterizedTypeReference<FastApiResponse<List<Map<String, Object>>>>() {});
        } catch (Exception e) {
            log.error("Failed to fetch forecast from FastAPI", e);
            throw new RuntimeException("AI forecast service unavailable. " + e.getMessage());
        }
    }

    public FastApiResponse<List<Map<String, Object>>> getForecastHistory() {
        try {
            return aiRestClient.get()
                    .uri("/forecast/history")
                    .retrieve()
                    .body(new ParameterizedTypeReference<FastApiResponse<List<Map<String, Object>>>>() {});
        } catch (Exception e) {
            log.error("Failed to fetch forecast history from FastAPI", e);
            throw new RuntimeException("AI forecast history service unavailable. " + e.getMessage());
        }
    }

    public FastApiResponse<List<Map<String, Object>>> getStockout() {
        try {
            return aiRestClient.get()
                    .uri("/stockout")
                    .retrieve()
                    .body(new ParameterizedTypeReference<FastApiResponse<List<Map<String, Object>>>>() {});
        } catch (Exception e) {
            log.error("Failed to fetch stockout predictions from FastAPI", e);
            throw new RuntimeException("AI stockout service unavailable. " + e.getMessage());
        }
    }

    public FastApiResponse<List<Map<String, Object>>> getAlerts() {
        try {
            return aiRestClient.get()
                    .uri("/alerts")
                    .retrieve()
                    .body(new ParameterizedTypeReference<FastApiResponse<List<Map<String, Object>>>>() {});
        } catch (Exception e) {
            log.error("Failed to fetch alerts from FastAPI", e);
            throw new RuntimeException("AI alerts service unavailable. " + e.getMessage());
        }
    }

    public FastApiResponse<List<Map<String, Object>>> getRecommendations() {
        try {
            return aiRestClient.get()
                    .uri("/recommendations")
                    .retrieve()
                    .body(new ParameterizedTypeReference<FastApiResponse<List<Map<String, Object>>>>() {});
        } catch (Exception e) {
            log.error("Failed to fetch recommendations from FastAPI", e);
            throw new RuntimeException("AI recommendations service unavailable. " + e.getMessage());
        }
    }

    public FastApiResponse<Map<String, Object>> runPipeline() {
        try {
            return aiRestClient.get()
                    .uri("/pipeline/run")
                    .retrieve()
                    .body(new ParameterizedTypeReference<FastApiResponse<Map<String, Object>>>() {});
        } catch (Exception e) {
            log.error("Failed to run pipeline in FastAPI", e);
            throw new RuntimeException("AI pipeline execution service unavailable. " + e.getMessage());
        }
    }
}
