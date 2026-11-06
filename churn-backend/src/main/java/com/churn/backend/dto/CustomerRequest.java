package com.churn.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

/**
 * Raw Telco customer fields. JSON names match exactly what the Python model
 * service (and the training CSV) expects, so the same object is forwarded as-is.
 */
public record CustomerRequest(
        @JsonProperty("gender") @NotBlank String gender,
        @JsonProperty("SeniorCitizen") @NotNull @Min(0) @Max(1) Integer seniorCitizen,
        @JsonProperty("Partner") @NotBlank String partner,
        @JsonProperty("Dependents") @NotBlank String dependents,
        @JsonProperty("tenure") @NotNull @Min(0) @Max(100) Integer tenure,
        @JsonProperty("PhoneService") @NotBlank String phoneService,
        @JsonProperty("MultipleLines") @NotBlank String multipleLines,
        @JsonProperty("InternetService") @NotBlank String internetService,
        @JsonProperty("OnlineSecurity") @NotBlank String onlineSecurity,
        @JsonProperty("OnlineBackup") @NotBlank String onlineBackup,
        @JsonProperty("DeviceProtection") @NotBlank String deviceProtection,
        @JsonProperty("TechSupport") @NotBlank String techSupport,
        @JsonProperty("StreamingTV") @NotBlank String streamingTV,
        @JsonProperty("StreamingMovies") @NotBlank String streamingMovies,
        @JsonProperty("Contract") @NotBlank String contract,
        @JsonProperty("PaperlessBilling") @NotBlank String paperlessBilling,
        @JsonProperty("PaymentMethod") @NotBlank String paymentMethod,
        @JsonProperty("MonthlyCharges") @NotNull @PositiveOrZero Double monthlyCharges,
        @JsonProperty("TotalCharges") @NotNull @PositiveOrZero Double totalCharges
) {}
