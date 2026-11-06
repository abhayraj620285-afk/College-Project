package com.churn.backend.controller;

import com.churn.backend.dto.CustomerRequest;
import com.churn.backend.dto.HistoryItem;
import com.churn.backend.dto.PredictionResponse;
import com.churn.backend.service.PredictionService;
import jakarta.validation.Valid;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class PredictionController {

    private final PredictionService service;

    public PredictionController(PredictionService service) {
        this.service = service;
    }

    @PostMapping("/predict")
    public ResponseEntity<PredictionResponse> predict(@Valid @RequestBody CustomerRequest request) {
        return ResponseEntity.ok(service.predict(request));
    }

    @GetMapping("/predictions")
    public List<HistoryItem> history(@RequestParam(defaultValue = "20") int limit) {
        return service.history(Math.max(1, Math.min(limit, 100)));
    }

    @GetMapping("/stats")
    public Map<String, Object> stats() {
        return service.stats();
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        boolean modelUp = service.isModelServiceUp();
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("backend", "UP");
        body.put("model_service", modelUp ? "UP" : "DOWN");
        return modelUp ? ResponseEntity.ok(body) : ResponseEntity.status(503).body(body);
    }
}
