package com.churn.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;

/**
 * Response sent to clients. churn_prediction / churn_probability keep the same
 * names as the Python service, so the Streamlit UI works unchanged.
 */
public record PredictionResponse(
        @JsonProperty("id") Long id,
        @JsonProperty("churn_prediction") String churnPrediction,
        @JsonProperty("churn_probability") double churnProbability,
        @JsonProperty("risk_level") String riskLevel,
        @JsonProperty("predicted_at") Instant predictedAt
) {}
