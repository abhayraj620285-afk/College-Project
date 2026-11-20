# Customer Churn Prediction

A full-stack telecom customer churn intelligence platform combining a trained machine-learning model, a REST API gateway, and a React dashboard — built to predict, analyse, and act on customer attrition risk in real time.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [ML Model](#ml-model)
  - [Dataset](#dataset)
  - [Model Benchmarks](#model-benchmarks)
  - [Performance Metrics](#performance-metrics)
  - [Feature Importance](#feature-importance)
  - [Confusion Matrix](#confusion-matrix)
- [APIs](#apis)
  - [FastAPI — ML Model Service (Port 8000)](#fastapi--ml-model-service-port-8000)
  - [Spring Boot — API Gateway (Port 8080)](#spring-boot--api-gateway-port-8080)
- [Frontend — React Dashboard](#frontend--react-dashboard)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Training the Model](#training-the-model)

---

## Overview

This project predicts whether a telecom customer will churn, exposing a risk score and risk tier (HIGH / MEDIUM / LOW) for every customer profile. The system is built in three layers:

| Layer | Technology | Purpose |
|---|---|---|
| ML Service | Python · FastAPI | Loads trained model, scores customer profiles |
| API Gateway | Java · Spring Boot | Validates requests, persists history, exposes stats |
| Dashboard | React 19 · Vite | Visualises cohort risk, runs predictions, shows insights |

The dashboard also ships with an **offline inference engine** — a pure JavaScript port of the model weights — so the UI degrades gracefully when the backend services are not running.

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│              React Dashboard (Vite)              │
│          http://localhost:5173                   │
│                                                 │
│  Dashboard · Customers · Predict · Insights     │
│  Retention · Campaigns · Reports · History      │
└──────────────────────┬──────────────────────────┘
                       │ /api/v1/*  (port 8080)
                       ▼
┌─────────────────────────────────────────────────┐
│          Spring Boot API Gateway                │
│          http://localhost:8080                  │
│                                                 │
│  POST /api/v1/predict   → validates & forwards  │
│  GET  /api/v1/predictions → history (H2 DB)     │
│  GET  /api/v1/stats     → churn rate summary    │
│  GET  /api/v1/health    → service health check  │
└──────────────────────┬──────────────────────────┘
                       │ POST /predict  (port 8000)
                       ▼
┌─────────────────────────────────────────────────┐
│         FastAPI ML Model Service                │
│         http://localhost:8000                   │
│                                                 │
│  GET  /         → health ping                   │
│  POST /predict  → returns churn_probability     │
│                                                 │
│  Loads: churn_model.pkl · scaler.pkl            │
│         feature_columns.pkl                     │
└─────────────────────────────────────────────────┘
```

**Offline mode:** When the backend is unavailable, the React frontend falls back to a pure-JS logistic regression engine built from the extracted model weights — predictions are still computed in-browser with identical results.

---

## Tech Stack

| Component | Technology |
|---|---|
| ML training | Python · scikit-learn · XGBoost · pandas · NumPy |
| ML service | FastAPI · Uvicorn · joblib |
| API gateway | Java 17 · Spring Boot 3 · Spring Data JPA · H2 |
| Frontend | React 19 · React Router 7 · Vite 7 · Lucide React |
| Notebook | Jupyter · matplotlib · seaborn |
| Build | Maven 3.9 · npm |

---

## Project Structure

```
customer-churn-prediction/
│
├── customer-churn-prediction/        # Python monorepo
│   ├── api/
│   │   └── main.py                   # FastAPI ML service
│   ├── data/
│   │   └── telco_churn.csv           # IBM Telco dataset (7,043 rows)
│   ├── models/
│   │   ├── churn_model.pkl           # Trained Logistic Regression
│   │   ├── scaler.pkl                # Fitted StandardScaler
│   │   └── feature_columns.pkl       # Ordered feature list (30 features)
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── pages/                # 10 route pages
│   │   │   ├── components/           # Reusable UI components
│   │   │   ├── services/             # API + customer service layer
│   │   │   ├── data/                 # Model metadata & dataset
│   │   │   └── styles/               # CSS design tokens
│   │   ├── e2e/                      # E2E test harness (4 tiers)
│   │   ├── app.py                    # Streamlit UI (alternative)
│   │   └── vite.config.js
│   ├── 01_train_model.ipynb          # Training notebook
│   └── requirements.txt
│
└── churn-backend/                    # Spring Boot API gateway
    └── src/main/java/com/churn/backend/
        ├── controller/               # PredictionController
        ├── service/                  # PredictionService
        ├── dto/                      # CustomerRequest · PredictionResponse
        ├── entity/                   # PredictionRecord (JPA)
        ├── repository/               # PredictionRepository
        ├── config/                   # MlClientConfig (RestClient)
        └── exception/                # GlobalExceptionHandler
```

---

## ML Model

### Dataset

**IBM Telco Customer Churn** — `data/telco_churn.csv`

| Property | Value |
|---|---|
| Total records | 7,043 |
| Churn rate | 26.54% (1,869 customers) |
| Features used | 19 raw → 30 after one-hot encoding |
| Train / Test split | 5,634 / 1,409 (80 / 20) |

**Numeric features** (StandardScaler applied):

| Feature | Training Mean | Training Std Dev |
|---|---|---|
| `tenure` | 32.49 months | 24.57 |
| `MonthlyCharges` | \$64.93 | \$30.14 |
| `TotalCharges` | \$2,299.33 | \$2,279.00 |

**Categorical features** (one-hot encoded, `drop_first=True`):
`gender`, `Partner`, `Dependents`, `PhoneService`, `MultipleLines`, `InternetService`, `OnlineSecurity`, `OnlineBackup`, `DeviceProtection`, `TechSupport`, `StreamingTV`, `StreamingMovies`, `Contract`, `PaperlessBilling`, `PaymentMethod`

---

### Model Benchmarks

Three models were trained and evaluated. Logistic Regression with balanced class weights was selected for production because it achieves the highest ROC-AUC and the highest recall — minimising false negatives (missed churners) is the primary business objective.

| Model | ROC-AUC | Accuracy | Recall | F1 | Production |
|---|---|---|---|---|---|
| **Logistic Regression (Balanced)** | **0.8417** | 73.81% | **78.34%** | 0.6136 | ✅ |
| Random Forest (200 trees) | 0.8279 | 77.08% | 65.24% | 0.6010 | — |
| XGBoost (logloss) | 0.8185 | 75.87% | 66.84% | 0.5945 | — |

---

### Performance Metrics

Evaluated on the held-out test set (1,409 samples):

| Metric | Value |
|---|---|
| **ROC-AUC** | **0.8417** |
| Accuracy | 73.81% |
| Precision | 50.43% |
| **Recall** | **78.34%** |
| F1 Score | 0.6136 |
| Specificity | 72.17% |

**Classification report (macro avg):** Precision 0.7032 · Recall 0.7525 · F1 0.7078

---

### Confusion Matrix

```
                  Predicted: Stay    Predicted: Churn
Actual: Stay           747 (TN)           288 (FP)
Actual: Churn           81 (FN)           293 (TP)
```

The model is intentionally tuned towards high recall (78.3%): it is better to flag a loyal customer for retention outreach than to miss a churner.

---

### Feature Importance

Logistic regression coefficients extracted from `churn_model.pkl` (sorted by absolute weight):

| Rank | Feature | Coefficient | Direction |
|---|---|---|---|
| 1 | Two-Year Contract | −1.413 | 🟢 Retention anchor |
| 2 | Fiber Optic Internet | +1.222 | 🔴 Churn promoter |
| 3 | Tenure (months) | −1.156 | 🟢 Retention anchor |
| 4 | One-Year Contract | −0.715 | 🟢 Retention anchor |
| 5 | Monthly Charges | −0.546 | 🟢 Retention anchor |
| 6 | Total Charges | +0.487 | 🔴 Churn promoter |
| 7 | Streaming Movies | +0.421 | 🔴 Churn promoter |
| 8 | Electronic Check | +0.402 | 🔴 Churn promoter |
| 9 | Streaming TV | +0.395 | 🔴 Churn promoter |
| 10 | Phone Service | −0.348 | 🟢 Retention anchor |
| 11 | Paperless Billing | +0.336 | 🔴 Churn promoter |
| 12 | Online Security | −0.335 | 🟢 Retention anchor |

**Risk thresholds:**

| Level | Probability Range |
|---|---|
| 🔴 HIGH | ≥ 0.70 |
| 🟡 MEDIUM | 0.40 – 0.69 |
| 🟢 LOW | < 0.40 |

**Cohort distribution (7,043 subscribers):**

| Tier | Count | MRR at Risk |
|---|---|---|
| HIGH | 1,248 (17.7%) | \$139,131 / mo |
| MEDIUM | 1,642 (23.3%) | \$106,700 / mo |
| LOW | 4,153 (59.0%) | \$210,300 / mo |

**Tenure hazard analysis:**

| Tenure Band | Churn Hazard | Accounts |
|---|---|---|
| 0 – 6 months (Onboarding Cliff) | 52.1% | 1,481 |
| 7 – 12 months (Stabilisation) | 37.4% | 698 |
| 13 – 24 months (Annual Renewal) | 28.6% | 1,024 |
| 25+ months (Established Champions) | 14.2% | 3,840 |

> 58.3% of all gross subscriber churn occurs in the first 12 months. Retention ROI is highest in months 1 – 6.

---

## APIs

### FastAPI — ML Model Service (Port 8000)

**Base URL:** `http://127.0.0.1:8000`  
**Interactive docs:** `http://127.0.0.1:8000/docs`

#### `GET /`
Returns service health.

```json
{ "status": "ok", "message": "Customer Churn Prediction API is running" }
```

---

#### `POST /predict`

Scores a single customer profile and returns churn probability.

**Request body:**

```json
{
  "gender": "Female",
  "SeniorCitizen": 0,
  "Partner": "Yes",
  "Dependents": "No",
  "tenure": 1,
  "PhoneService": "No",
  "MultipleLines": "No phone service",
  "InternetService": "DSL",
  "OnlineSecurity": "No",
  "OnlineBackup": "Yes",
  "DeviceProtection": "No",
  "TechSupport": "No",
  "StreamingTV": "No",
  "StreamingMovies": "No",
  "Contract": "Month-to-month",
  "PaperlessBilling": "Yes",
  "PaymentMethod": "Electronic check",
  "MonthlyCharges": 29.85,
  "TotalCharges": 29.85
}
```

**Response:**

```json
{
  "churn_prediction": "Yes",
  "churn_probability": 0.6823
}
```

**Pipeline (server-side):**
1. Build single-row DataFrame from request
2. One-hot encode categorical columns (`drop_first=True`)
3. Align to training feature columns (fill missing with 0)
4. Scale `tenure`, `MonthlyCharges`, `TotalCharges` with fitted `StandardScaler`
5. `model.predict_proba()` → probability of class 1 (churn)

---

### Spring Boot — API Gateway (Port 8080)

**Base URL:** `http://localhost:8080/api/v1`

#### `POST /api/v1/predict`

Validates request, forwards to FastAPI, persists result to H2, returns enriched response with risk tier.

**Request body:** Same 19-field schema as FastAPI `/predict` above.

**Response:**

```json
{
  "id": 42,
  "churn_prediction": "Yes",
  "churn_probability": 0.6823,
  "risk_level": "MEDIUM",
  "created_at": "2026-11-20T03:30:00Z"
}
```

**Risk level logic:**

| `churn_probability` | `risk_level` |
|---|---|
| ≥ 0.70 | `HIGH` |
| 0.40 – 0.69 | `MEDIUM` |
| < 0.40 | `LOW` |

---

#### `GET /api/v1/predictions?limit=20`

Returns the most recent predictions from the in-session H2 database (max 100).

```json
[
  {
    "id": 42,
    "tenure": 1,
    "contract": "Month-to-month",
    "internet_service": "DSL",
    "monthly_charges": 29.85,
    "churn_prediction": "Yes",
    "churn_probability": 0.6823,
    "risk_level": "MEDIUM",
    "created_at": "2026-11-20T03:30:00Z"
  }
]
```

---

#### `GET /api/v1/stats`

Returns aggregate statistics for the current session.

```json
{
  "total_predictions": 15,
  "predicted_churn": 9,
  "predicted_stay": 6,
  "churn_rate": 0.6
}
```

---

#### `GET /api/v1/health`

Health check for both the Spring gateway and the FastAPI model service.

```json
{ "backend": "UP", "model_service": "UP" }
```

Returns HTTP 503 if the model service is unreachable.

---

**Validation rules** (enforced by Spring via Bean Validation):

| Field | Constraint |
|---|---|
| `gender`, `Partner`, `Dependents`, etc. | `@NotBlank` |
| `SeniorCitizen` | `@Min(0)` `@Max(1)` |
| `tenure` | `@Min(0)` `@Max(100)` |
| `MonthlyCharges`, `TotalCharges` | `@PositiveOrZero` |

**Database:** In-memory H2 (`jdbc:h2:mem:churndb`). Prediction history is cleared on service restart. H2 console available at `http://localhost:8080/h2-console`.

---

## Frontend — React Dashboard

**URL:** `http://localhost:5173`  
**Framework:** React 19 · React Router 7 · Vite 7

### Pages

| Route | Page | Description |
|---|---|---|
| `/` | **Dashboard** | Executive KPI cards, risk donut chart, tenure hazard chart, priority retention queue, recent predictions |
| `/customers` | **Customers** | Filterable/searchable table of all 7,043 subscribers with risk badges |
| `/customers/:id` | **Customer Detail** | Full profile, churn probability gauge, feature contributions |
| `/predict` | **Predict** | Real-time prediction form; calls Spring Boot API or falls back to offline JS model |
| `/prediction-history` | **History** | Audit log of session predictions from Spring Boot |
| `/insights` | **Insights** | Feature importance chart, model coefficient breakdown |
| `/model-performance` | **Model Performance** | ROC-AUC, confusion matrix, benchmark comparison table |
| `/retention` | **Retention** | Retention strategy recommendations by risk tier |
| `/campaigns` | **Campaigns** | Campaign planning for high-risk cohorts |
| `/reports` | **Reports** | Exportable summary reports |

### Key UI Components

| Component | Purpose |
|---|---|
| `RiskDonutChart` | Interactive SVG donut — click segments to drill into risk tiers |
| `MetricCard` | KPI card with trend indicator and progress bar |
| `ChartCard` | Wrapper card for all chart visualisations |
| `RiskBadge` | Colour-coded HIGH / MEDIUM / LOW badge with probability score |
| `DataTable` | Sortable, filterable data table |
| `PredictionForm` | 19-field customer profile form with validation |
| `StateIndicators` | Loading, empty, and error state components |

### Offline Inference Engine

The file [`src/data/modelMeta.js`](customer-churn-prediction/frontend/src/data/modelMeta.js) contains the complete extracted model:
- All 30 feature coefficients
- Intercept (`−0.7068`)
- StandardScaler means and standard deviations
- Risk thresholds and performance metrics

When Spring Boot / FastAPI are offline, the browser computes `σ(wᵀx + b)` directly — no server round-trip needed.

---

## Prerequisites

| Tool | Version | Required for |
|---|---|---|
| Python | ≥ 3.10 | FastAPI, Streamlit, training notebook |
| Node.js + npm | ≥ 20.19 | React frontend |
| Java JDK | ≥ 17 | Spring Boot gateway |
| Apache Maven | ≥ 3.9 | Spring Boot build |

---

## Quick Start

Open **three separate terminals** and start services in order.

### 1 — FastAPI ML Service

```powershell
cd customer-churn-prediction
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt

cd api
..\\.venv\Scripts\python.exe -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

API docs: http://127.0.0.1:8000/docs

### 2 — Spring Boot API Gateway

```powershell
cd churn-backend
mvn spring-boot:run
```

H2 console: http://localhost:8080/h2-console  
Health: http://localhost:8080/api/v1/health

### 3 — React Dashboard

```powershell
cd customer-churn-prediction/frontend
npm install
npm run dev
```

Dashboard: http://localhost:5173

### Alternative — Streamlit UI

Calls FastAPI directly (no Spring Boot required):

```powershell
cd customer-churn-prediction/frontend
..\.venv\Scripts\python.exe -m streamlit run app.py
```

Streamlit: http://localhost:8501

---

## Training the Model

1. Open `customer-churn-prediction/01_train_model.ipynb` in VS Code
2. Select `.venv` as the Python interpreter / notebook kernel
3. Run all cells

The notebook will:
- Load `data/telco_churn.csv`
- Preprocess and one-hot encode features
- Train Logistic Regression, Random Forest, and XGBoost
- Evaluate all three on the test split
- Save `churn_model.pkl`, `scaler.pkl`, and `feature_columns.pkl` to `models/`

**Python dependencies** (`requirements.txt`):

```
fastapi · uvicorn[standard] · pandas · numpy · joblib
scikit-learn · xgboost · streamlit · requests
matplotlib · seaborn · ipykernel
```
