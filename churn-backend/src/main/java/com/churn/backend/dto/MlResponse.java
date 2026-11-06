package com.churn.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/** Response shape returned by the Python model service. */
@JsonIgnoreProperties(ignoreUnknown = true)
public record MlResponse(
        @JsonProperty("churn_prediction") String churnPrediction,
        @JsonProperty("churn_probability") double churnProbability
) {}
