# Churn Backend (Spring Boot)

Spring Boot gateway in front of the Python (FastAPI) churn model.

    Streamlit UI :8501  ->  Spring Boot :8080  ->  FastAPI model :8000

## Run
1. Start the model service:   cd api && uvicorn main:app --reload
2. Start this backend:        cd churn-backend && mvn spring-boot:run
3. (optional) UI:            set API_URL in frontend/app.py to http://127.0.0.1:8080/api/v1/predict

## Endpoints
- POST /api/v1/predict      validate + forward to model + save + return result
- GET  /api/v1/predictions  latest saved predictions (?limit=20)
- GET  /api/v1/stats        totals and predicted churn rate
- GET  /api/v1/health       backend + model service status
