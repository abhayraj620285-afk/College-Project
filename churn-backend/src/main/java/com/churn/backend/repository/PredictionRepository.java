package com.churn.backend.repository;

import com.churn.backend.entity.PredictionRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PredictionRepository extends JpaRepository<PredictionRecord, Long> {
    long countByChurnPrediction(String churnPrediction);
}
