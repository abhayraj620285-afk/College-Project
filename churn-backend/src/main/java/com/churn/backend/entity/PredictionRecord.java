package com.churn.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

/** One saved prediction (key inputs + model output), used for the history endpoint. */
@Entity
@Table(name = "prediction_record")
public class PredictionRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer tenure;
    private String contract;
    private String internetService;
    private Double monthlyCharges;
    private Double totalCharges;

    @Column(nullable = false)
    private String churnPrediction;

    @Column(nullable = false)
    private Double churnProbability;

    @Column(nullable = false)
    private String riskLevel;

    @Column(nullable = false)
    private Instant createdAt;

    protected PredictionRecord() {}

    public PredictionRecord(Integer tenure, String contract, String internetService,
                            Double monthlyCharges, Double totalCharges,
                            String churnPrediction, Double churnProbability,
                            String riskLevel, Instant createdAt) {
        this.tenure = tenure;
        this.contract = contract;
        this.internetService = internetService;
        this.monthlyCharges = monthlyCharges;
        this.totalCharges = totalCharges;
        this.churnPrediction = churnPrediction;
        this.churnProbability = churnProbability;
        this.riskLevel = riskLevel;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public Integer getTenure() { return tenure; }
    public String getContract() { return contract; }
    public String getInternetService() { return internetService; }
    public Double getMonthlyCharges() { return monthlyCharges; }
    public Double getTotalCharges() { return totalCharges; }
    public String getChurnPrediction() { return churnPrediction; }
    public Double getChurnProbability() { return churnProbability; }
    public String getRiskLevel() { return riskLevel; }
    public Instant getCreatedAt() { return createdAt; }
}
