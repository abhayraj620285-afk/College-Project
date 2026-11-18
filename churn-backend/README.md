# Churn Backend (Spring Boot)

Optional Spring Boot API that validates prediction requests, forwards them to the FastAPI model service, and stores prediction history in an in-memory H2 database.

See the [repository README](../README.md) for prerequisites and Python environment setup.

## Run

Start FastAPI first from `customer-churn-prediction\api`:

```powershell
..\.venv\Scripts\python.exe -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Then, from `churn-backend`, start Spring Boot:

```powershell
mvn spring-boot:run
```

The backend listens on port `8080`. The Streamlit UI currently calls FastAPI directly; it is not routed through this service.

## Endpoints

- `POST /api/v1/predict` — validate and forward a prediction, then save and return the result
- `GET /api/v1/predictions` — latest saved predictions (`?limit=20`)
- `GET /api/v1/stats` — prediction totals and predicted churn rate
- `GET /api/v1/health` — backend and model-service status
