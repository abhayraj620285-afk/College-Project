package com.churn.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;

public record HistoryItem(
        @JsonProperty("id") Long id,
        @JsonProperty("tenure") Integer tenure,
        @JsonProperty("contract") String contract,
        @JsonProperty("internet_service") String internetService,
        @JsonProperty("monthly_charges") Double monthlyCharges,
        @JsonProperty("churn_prediction") String churnPrediction,
        @JsonProperty("churn_probability") Double churnProbability,
        @JsonProperty("risk_level") String riskLevel,
        @JsonProperty("predicted_at") Instant predictedAt
) {}
