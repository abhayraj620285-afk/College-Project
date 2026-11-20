# Customer Churn Prediction

Predict telecom customer churn with a trained machine-learning model. The repository contains a FastAPI prediction API, a Streamlit form, a model-training notebook, and an optional Spring Boot service.

## Project layout

- `customer-churn-prediction/api/` — FastAPI prediction API
- `customer-churn-prediction/frontend/` — React web UI (`src/`) and existing Streamlit UI (`app.py`)
- `customer-churn-prediction/models/` — saved model, scaler, and feature columns used by the API
- `customer-churn-prediction/data/` — training data
- `customer-churn-prediction/01_train_model.ipynb` — model-training notebook
- `churn-backend/` — optional Spring Boot API and prediction history

## Prerequisites

- Python 3.10 or later
- Node.js 20.19 or later and npm, only if you want to run the React UI
- Java 17 or later and Apache Maven 3.9 or later, only if you want to run the Spring Boot service

The React UI sends requests through Vite to the Spring Boot service on port `8080`; Spring forwards predictions to FastAPI on port `8000` and stores prediction history. The existing Streamlit UI remains available and calls FastAPI directly.

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

**2. Spring Boot service (required by React)**

```powershell
cd .\churn-backend
mvn spring-boot:run
```

Spring listens on port `8080` and forwards predictions to FastAPI on port `8000`. It stores prediction history in an in-memory H2 database, which is cleared when the backend restarts.

**3. React UI**

```powershell
cd .\customer-churn-prediction\frontend
npm install
npm run dev
```

Open the local URL printed by Vite (typically <http://localhost:5173>).

**Alternative: Streamlit UI**

```powershell
cd .\customer-churn-prediction\frontend
..\.venv\Scripts\python.exe -m streamlit run app.py
```

Open the local URL printed by Streamlit (typically <http://localhost:8501>). This UI calls FastAPI directly and does not use Spring history or stats.

## Train the model

Open `customer-churn-prediction/01_train_model.ipynb` in VS Code, select the `.venv` Python interpreter as the notebook kernel, and run the cells. The notebook reads `data/telco_churn.csv` and writes the model artifacts to `models/`.

## Prediction API

- `GET /` — API status
- `POST /predict` — predict churn for a customer profile

The FastAPI interactive documentation at `/docs` shows the request schema.
