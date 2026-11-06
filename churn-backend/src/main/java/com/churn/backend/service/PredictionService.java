package com.churn.backend.service;

import com.churn.backend.dto.CustomerRequest;
import com.churn.backend.dto.HistoryItem;
import com.churn.backend.dto.MlResponse;
import com.churn.backend.dto.PredictionResponse;
import com.churn.backend.entity.PredictionRecord;
import com.churn.backend.exception.MlServiceUnavailableException;
import com.churn.backend.repository.PredictionRepository;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Service
public class PredictionService {

    private final RestClient mlClient;
    private final PredictionRepository repository;

    public PredictionService(RestClient mlRestClient, PredictionRepository repository) {
        this.mlClient = mlRestClient;
        this.repository = repository;
    }

    /** Forwards the customer to the Python model, saves the result, returns it with a risk level. */
    public PredictionResponse predict(CustomerRequest request) {
        MlResponse ml = callModel(request);
        if (ml == null || ml.churnPrediction() == null) {
            throw new MlServiceUnavailableException("Model service returned an empty response", null);
        }

        String risk = riskLevel(ml.churnProbability());
        Instant now = Instant.now();

        PredictionRecord saved = repository.save(new PredictionRecord(
                request.tenure(), request.contract(), request.internetService(),
                request.monthlyCharges(), request.totalCharges(),
                ml.churnPrediction(), ml.churnProbability(), risk, now));

        return new PredictionResponse(saved.getId(), ml.churnPrediction(),
                ml.churnProbability(), risk, now);
    }

    public List<HistoryItem> history(int limit) {
        return repository
                .findAll(PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt")))
                .map(r -> new HistoryItem(r.getId(), r.getTenure(), r.getContract(),
                        r.getInternetService(), r.getMonthlyCharges(), r.getChurnPrediction(),
                        r.getChurnProbability(), r.getRiskLevel(), r.getCreatedAt()))
                .getContent();
    }

    public Map<String, Object> stats() {
        long total = repository.count();
        long churn = repository.countByChurnPrediction("Yes");
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("total_predictions", total);
        out.put("predicted_churn", churn);
        out.put("predicted_stay", total - churn);
        out.put("churn_rate", total == 0 ? 0.0 : Math.round(churn * 10000.0 / total) / 10000.0);
        return out;
    }

    public boolean isModelServiceUp() {
        try {
            mlClient.get().uri("/").retrieve().toBodilessEntity();
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private MlResponse callModel(CustomerRequest request) {
        try {
            return mlClient.post()
                    .uri("/predict")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(MlResponse.class);
        } catch (ResourceAccessException e) {
            throw new MlServiceUnavailableException(
                    "Cannot reach the model service. Is the FastAPI server running on port 8000?", e);
        } catch (RestClientResponseException e) {
            throw new MlServiceUnavailableException(
                    "Model service error (" + e.getStatusCode().value() + "): "
                            + e.getResponseBodyAsString(), e);
        }
    }

    static String riskLevel(double probability) {
        if (probability >= 0.70) return "HIGH";
        if (probability >= 0.40) return "MEDIUM";
        return "LOW";
    }
}
