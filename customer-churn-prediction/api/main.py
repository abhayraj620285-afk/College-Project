"""
Customer Churn Prediction API
Loads the trained model + scaler + feature columns saved from the notebook,
and exposes a /predict endpoint that returns churn probability for a customer.
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import joblib
import os

app = FastAPI(title="Customer Churn Prediction API")

# ---- Load artifacts saved from the training notebook ----
MODEL_PATH = os.path.join("..", "models", "churn_model.pkl")
SCALER_PATH = os.path.join("..", "models", "scaler.pkl")
COLUMNS_PATH = os.path.join("..", "models", "feature_columns.pkl")

model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)
feature_columns = joblib.load(COLUMNS_PATH)

NUMERIC_COLS = ["tenure", "MonthlyCharges", "TotalCharges"]


# ---- Request schema: raw Telco customer fields (same as the CSV, minus customerID/Churn) ----
class Customer(BaseModel):
    gender: str
    SeniorCitizen: int
    Partner: str
    Dependents: str
    tenure: int
    PhoneService: str
    MultipleLines: str
    InternetService: str
    OnlineSecurity: str
    OnlineBackup: str
    DeviceProtection: str
    TechSupport: str
    StreamingTV: str
    StreamingMovies: str
    Contract: str
    PaperlessBilling: str
    PaymentMethod: str
    MonthlyCharges: float
    TotalCharges: float


@app.get("/")
def root():
    return {"status": "ok", "message": "Customer Churn Prediction API is running"}


@app.post("/predict")
def predict(customer: Customer):
    try:
        # 1. Convert incoming customer to a single-row DataFrame
        df = pd.DataFrame([customer.dict()])

        # 2. One-hot encode categoricals the same way as training
        categorical_cols = df.select_dtypes(include="object").columns.tolist()
        df_encoded = pd.get_dummies(df, columns=categorical_cols, drop_first=True)

        # 3. Align columns with what the model was trained on
        #    (any column the model expects but this row doesn't have -> 0)
        df_encoded = df_encoded.reindex(columns=feature_columns, fill_value=0)

        # 4. Scale numeric columns using the SAME fitted scaler from training
        df_encoded[NUMERIC_COLS] = scaler.transform(df_encoded[NUMERIC_COLS])

        # 5. Predict
        probability = model.predict_proba(df_encoded)[0][1]
        prediction = int(probability >= 0.5)

        return {
            "churn_prediction": "Yes" if prediction == 1 else "No",
            "churn_probability": round(float(probability), 4),
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
