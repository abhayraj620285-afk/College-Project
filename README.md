# Customer Churn Prediction

Predict telecom customer churn with a trained machine-learning model. The repository contains a FastAPI prediction API, a Streamlit form, a model-training notebook, and an optional Spring Boot service.

## Project layout

- `customer-churn-prediction/api/` — FastAPI prediction API
- `customer-churn-prediction/frontend/` — Streamlit UI
- `customer-churn-prediction/models/` — saved model, scaler, and feature columns used by the API
- `customer-churn-prediction/data/` — training data
- `customer-churn-prediction/01_train_model.ipynb` — model-training notebook
- `churn-backend/` — optional Spring Boot API and prediction history

## Prerequisites

- Python 3.10 or later
- Java 17 or later and Apache Maven 3.9 or later, only if you want to run the Spring Boot service

The UI currently sends predictions directly to FastAPI on port `8000`. The Spring Boot service is optional and runs separately on port `8080`. Node.js/npm is not required.

## Install Python dependencies (Windows PowerShell)

From the repository root:

```powershell
cd .\customer-churn-prediction
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

The requirements cover the API, UI, and training notebook.

## Run the application

Open a terminal for each service. Start the model API first because the UI sends requests to it.

**1. FastAPI model API**

```powershell
cd .\customer-churn-prediction\api
..\.venv\Scripts\python.exe -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The saved model files are loaded relative to the `api` directory, so run this command from that directory. API documentation is available at <http://127.0.0.1:8000/docs>.

**2. Streamlit UI**

```powershell
cd .\customer-churn-prediction\frontend
..\.venv\Scripts\python.exe -m streamlit run app.py
```

Open the local URL printed by Streamlit (typically <http://localhost:8501>).

**Optional: Spring Boot service**

Install a JDK and Maven if they are not already available, then open a third terminal:

```powershell
cd .\churn-backend
mvn spring-boot:run
```

The service listens on port `8080` and forwards predictions to the FastAPI service on port `8000`. It also stores prediction history in an in-memory H2 database, which is cleared when the backend restarts.

## Train the model

Open `customer-churn-prediction/01_train_model.ipynb` in VS Code, select the `.venv` Python interpreter as the notebook kernel, and run the cells. The notebook reads `data/telco_churn.csv` and writes the model artifacts to `models/`.

## Prediction API

- `GET /` — API status
- `POST /predict` — predict churn for a customer profile

The FastAPI interactive documentation at `/docs` shows the request schema.
