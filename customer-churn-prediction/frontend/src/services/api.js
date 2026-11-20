/**
 * Spring Boot API Gateway Client & Offline Inference Fallback
 * Connects to Spring Boot (/api/v1) and provides transparent client-side
 * offline evaluation using exact scikit-learn model parameters if backend is offline.
 */

import { evaluateLocalModel } from '../data/modelMeta.js';

// Configurable base URL: defaults to relative /api/v1 (proxied by Vite) or env override
const BASE_URL = typeof window !== 'undefined'
  ? (import.meta.env?.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '') : '')
  : (process.env?.API_BASE_URL || 'http://127.0.0.1:8080');

// In-memory session history storage for predictions executed during current session
let sessionHistory = [];

/**
 * Normalizes input customer payload into strict CustomerRequest casing & types.
 */
function normalizeCustomerRequest(data = {}) {
  const tenureVal = Math.max(0, Math.min(100, Math.round(Number(data.tenure || 0))));
  const monthlyVal = Math.max(0, parseFloat(Number(data.MonthlyCharges || data.monthlyCharges || 0).toFixed(2)));
  const totalVal = Math.max(
    0,
    parseFloat(
      Number(
        data.TotalCharges != null && !isNaN(Number(data.TotalCharges))
          ? data.TotalCharges
          : data.totalCharges != null && !isNaN(Number(data.totalCharges))
          ? data.totalCharges
          : tenureVal * monthlyVal
      ).toFixed(2)
    )
  );

  return {
    gender: data.gender === 'Male' ? 'Male' : 'Female',
    SeniorCitizen: data.SeniorCitizen || data.seniorCitizen ? 1 : 0,
    Partner: data.Partner === 'Yes' || data.partner === 'Yes' ? 'Yes' : 'No',
    Dependents: data.Dependents === 'Yes' || data.dependents === 'Yes' ? 'Yes' : 'No',
    tenure: tenureVal,
    PhoneService: data.PhoneService === 'No' || data.phoneService === 'No' ? 'No' : 'Yes',
    MultipleLines: data.MultipleLines || data.multipleLines || 'No',
    InternetService: data.InternetService || data.internetService || 'Fiber optic',
    OnlineSecurity: data.OnlineSecurity || data.onlineSecurity || 'No',
    OnlineBackup: data.OnlineBackup || data.onlineBackup || 'No',
    DeviceProtection: data.DeviceProtection || data.deviceProtection || 'No',
    TechSupport: data.TechSupport || data.techSupport || 'No',
    StreamingTV: data.StreamingTV || data.streamingTV || 'No',
    StreamingMovies: data.StreamingMovies || data.streamingMovies || 'No',
    Contract: data.Contract || data.contract || 'Month-to-month',
    PaperlessBilling: data.PaperlessBilling === 'No' || data.paperlessBilling === 'No' ? 'No' : 'Yes',
    PaymentMethod: data.PaymentMethod || data.paymentMethod || 'Electronic check',
    MonthlyCharges: monthlyVal,
    TotalCharges: totalVal,
  };
}

/**
 * Predict Churn for a Customer.
 * Sends POST /api/v1/predict to Spring Boot Gateway.
 * If Spring Boot or FastAPI is offline, gracefully evaluates client-side logistic regression.
 */
export async function predictChurn(customerData) {
  const payload = normalizeCustomerRequest(customerData);

  try {
    const response = await fetch(`${BASE_URL}/api/v1/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(3500),
    });

    if (response.ok) {
      const data = await response.json();
      const enrichedResult = {
        ...data,
        isFallback: false,
        offline: false,
      };

      // Record into session history
      saveToSessionHistory({
        id: data.id || Date.now(),
        tenure: payload.tenure,
        contract: payload.Contract,
        internet_service: payload.InternetService,
        monthly_charges: payload.MonthlyCharges,
        churn_prediction: data.churn_prediction,
        churn_probability: data.churn_probability,
        risk_level: data.risk_level,
        predicted_at: data.predicted_at || new Date().toISOString(),
      });

      return enrichedResult;
    }

    // Backend returned non-200 (e.g., 503 FastAPI unavailable)
    const errText = await response.text().catch(() => '');
    console.warn(`[API] Server returned ${response.status}: ${errText}. Using offline inference fallback.`);
  } catch (networkError) {
    console.warn('[API] Backend unreachable. Using offline client-side logistic regression evaluation:', networkError);
  }

  // Pure JavaScript Offline Inference Fallback
  const offlineResult = evaluateLocalModel(payload);
  const fallbackRecord = {
    id: Date.now(),
    churn_prediction: offlineResult.churnPrediction,
    churn_probability: offlineResult.churnProbability,
    risk_level: offlineResult.riskLevel,
    predicted_at: new Date().toISOString(),
    top_drivers: offlineResult.topDrivers,
    isFallback: true,
    offline: true,
  };

  saveToSessionHistory({
    id: fallbackRecord.id,
    tenure: payload.tenure,
    contract: payload.Contract,
    internet_service: payload.InternetService,
    monthly_charges: payload.MonthlyCharges,
    churn_prediction: fallbackRecord.churn_prediction,
    churn_probability: fallbackRecord.churn_probability,
    risk_level: fallbackRecord.risk_level,
    predicted_at: fallbackRecord.predicted_at,
  });

  return fallbackRecord;
}

/**
 * Fetch Past Predictions from Spring Boot Gateway (H2).
 * Returns array of HistoryItem.
 */
export async function getPredictions(limit = 20) {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 20, 100));

  try {
    const response = await fetch(`${BASE_URL}/api/v1/predictions?limit=${safeLimit}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(3000),
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        return data.map((item) => ({ ...item, isFallback: false }));
      }
    }
  } catch (err) {
    console.warn('[API] Unable to fetch history from backend. Using session history:', err);
  }

  // Offline / Cold-start fallback: return authentic in-memory session history
  return getSessionHistory(safeLimit);
}

/**
 * Fetch Session Prediction Statistics from Spring Boot Gateway.
 */
export async function getStats() {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/stats`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(3000),
    });

    if (response.ok) {
      const data = await response.json();
      return { ...data, isFallback: false };
    }
  } catch (err) {
    console.warn('[API] Unable to fetch stats from backend. Calculating from session:', err);
  }

  // Fallback: calculate stats from session history
  const total = sessionHistory.length;
  const churn = sessionHistory.filter((item) => item.churn_prediction === 'Yes').length;

  return {
    total_predictions: total,
    predicted_churn: churn,
    predicted_stay: total - churn,
    churn_rate: total === 0 ? 0.0 : Math.round((churn / total) * 10000) / 10000,
    isFallback: true,
    offline: true,
  };
}

/**
 * Check Backend & Model Service Health Status.
 */
export async function getHealth() {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/health`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(2000),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        backend: data.backend || 'UP',
        model_service: data.model_service || 'UP',
        offline: false,
      };
    } else if (response.status === 503) {
      const data = await response.json().catch(() => ({}));
      return {
        backend: 'UP',
        model_service: data.model_service || 'DOWN',
        offline: false,
      };
    }
  } catch (err) {
    // Backend completely unreachable
  }

  return {
    backend: 'DOWN',
    model_service: 'DOWN',
    offline: true,
  };
}

/**
 * Session history storage helpers
 */
function saveToSessionHistory(item) {
  sessionHistory.unshift(item);
  if (sessionHistory.length > 100) {
    sessionHistory.pop();
  }
}

export function getSessionHistory(limit = 20) {
  return sessionHistory.slice(0, limit);
}

export function resetSessionHistory() {
  sessionHistory = [];
}
