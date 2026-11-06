"""
Customer Churn Prediction — Streamlit UI (v2)
A polished form that collects customer details and calls the FastAPI /predict
endpoint to get a churn prediction, with a gauge-style visual result.
Run the FastAPI service first (uvicorn main:app --reload in api/), then run this app.
"""

import streamlit as st
import requests

API_URL = "http://127.0.0.1:8000/predict"

st.set_page_config(
    page_title="Customer Churn Predictor",
    page_icon="📉",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ---- Minimal custom styling ----
st.markdown("""
<style>
    .main-header {
        font-size: 2.2rem;
        font-weight: 700;
        margin-bottom: 0;
    }
    .subtext {
        color: #888;
        font-size: 1rem;
        margin-bottom: 1.5rem;
    }
    .result-card {
        padding: 1.5rem;
        border-radius: 12px;
        text-align: center;
        margin-top: 1rem;
    }
    .result-churn {
        background-color: rgba(255, 75, 75, 0.12);
        border: 1px solid rgba(255, 75, 75, 0.4);
    }
    .result-stay {
        background-color: rgba(60, 200, 120, 0.12);
        border: 1px solid rgba(60, 200, 120, 0.4);
    }
    .stButton>button {
        width: 100%;
        border-radius: 8px;
        font-weight: 600;
        height: 2.8rem;
    }
</style>
""", unsafe_allow_html=True)

# ---- Sidebar: about + quick presets ----
with st.sidebar:
    st.header("ℹ️ About")
    st.write(
        "This tool predicts whether a telecom customer is likely to churn, "
        "using a model trained on the Telco Customer Churn dataset "
        "(Logistic Regression / Random Forest / XGBoost, best model selected by ROC-AUC)."
    )
    st.divider()
    st.subheader("⚡ Quick Presets")
    preset = st.radio(
        "Load a sample customer",
        ["Custom", "High-risk example", "Low-risk example"],
        label_visibility="collapsed",
    )
    st.divider()
    st.caption("Backend: FastAPI · Model: scikit-learn / XGBoost")
    st.caption("Make sure the API is running at `127.0.0.1:8000`")

# ---- Preset values ----
presets = {
    "High-risk example": dict(
        gender="Female", senior=False, partner=False, dependents=False,
        tenure=2, phone=True, multiple="No", internet="Fiber optic",
        security="No", backup="No", protection="No", support="No",
        tv="Yes", movies="Yes", contract="Month-to-month",
        paperless=True, payment="Electronic check",
        monthly=95.0, total=190.0,
    ),
    "Low-risk example": dict(
        gender="Male", senior=False, partner=True, dependents=True,
        tenure=60, phone=True, multiple="Yes", internet="DSL",
        security="Yes", backup="Yes", protection="Yes", support="Yes",
        tv="No", movies="No", contract="Two year",
        paperless=False, payment="Bank transfer (automatic)",
        monthly=45.0, total=2700.0,
    ),
    "Custom": dict(
        gender="Female", senior=False, partner=False, dependents=False,
        tenure=12, phone=True, multiple="No", internet="Fiber optic",
        security="No", backup="No", protection="No", support="No",
        tv="No", movies="No", contract="Month-to-month",
        paperless=True, payment="Electronic check",
        monthly=70.0, total=840.0,
    ),
}
p = presets[preset]

# ---- Header ----
st.markdown('<div class="main-header">📉 Customer Churn Predictor</div>', unsafe_allow_html=True)
st.markdown('<div class="subtext">Enter a customer\'s profile to estimate their likelihood of churning.</div>', unsafe_allow_html=True)

form_col, result_col = st.columns([1.4, 1], gap="large")

with form_col:
    with st.form("churn_form"):
        tab1, tab2, tab3 = st.tabs(["👤 Demographics", "📄 Account", "📶 Services"])

        with tab1:
            c1, c2 = st.columns(2)
            with c1:
                gender = st.selectbox("Gender", ["Female", "Male"], index=["Female", "Male"].index(p["gender"]))
                senior_citizen = st.toggle("Senior Citizen", value=p["senior"])
            with c2:
                partner = st.toggle("Has Partner", value=p["partner"])
                dependents = st.toggle("Has Dependents", value=p["dependents"])

        with tab2:
            c3, c4 = st.columns(2)
            with c3:
                tenure = st.slider("Tenure (months)", 0, 72, p["tenure"])
                contract = st.selectbox(
                    "Contract", ["Month-to-month", "One year", "Two year"],
                    index=["Month-to-month", "One year", "Two year"].index(p["contract"])
                )
                paperless_billing = st.toggle("Paperless Billing", value=p["paperless"])
            with c4:
                monthly_charges = st.number_input("Monthly Charges ($)", min_value=0.0, value=p["monthly"], step=0.5)
                total_charges = st.number_input("Total Charges ($)", min_value=0.0, value=p["total"], step=1.0)
                payment_options = ["Electronic check", "Mailed check", "Bank transfer (automatic)", "Credit card (automatic)"]
                payment_method = st.selectbox("Payment Method", payment_options, index=payment_options.index(p["payment"]))

        with tab3:
            c5, c6 = st.columns(2)
            with c5:
                phone_service = st.toggle("Phone Service", value=p["phone"])
                multiple_lines = st.selectbox("Multiple Lines", ["No", "Yes", "No phone service"], index=["No", "Yes", "No phone service"].index(p["multiple"]))
                internet_service = st.selectbox("Internet Service", ["DSL", "Fiber optic", "No"], index=["DSL", "Fiber optic", "No"].index(p["internet"]))
                online_security = st.selectbox("Online Security", ["No", "Yes", "No internet service"], index=["No", "Yes", "No internet service"].index(p["security"]))
                online_backup = st.selectbox("Online Backup", ["No", "Yes", "No internet service"], index=["No", "Yes", "No internet service"].index(p["backup"]))
            with c6:
                device_protection = st.selectbox("Device Protection", ["No", "Yes", "No internet service"], index=["No", "Yes", "No internet service"].index(p["protection"]))
                tech_support = st.selectbox("Tech Support", ["No", "Yes", "No internet service"], index=["No", "Yes", "No internet service"].index(p["support"]))
                streaming_tv = st.selectbox("Streaming TV", ["No", "Yes", "No internet service"], index=["No", "Yes", "No internet service"].index(p["tv"]))
                streaming_movies = st.selectbox("Streaming Movies", ["No", "Yes", "No internet service"], index=["No", "Yes", "No internet service"].index(p["movies"]))

        submitted = st.form_submit_button("🔮 Predict Churn")

with result_col:
    st.subheader("Result")
    placeholder = st.empty()
    if not submitted:
        placeholder.info("Fill in the form and click **Predict Churn** to see the result here.")

if submitted:
    payload = {
        "gender": gender,
        "SeniorCitizen": 1 if senior_citizen else 0,
        "Partner": "Yes" if partner else "No",
        "Dependents": "Yes" if dependents else "No",
        "tenure": tenure,
        "PhoneService": "Yes" if phone_service else "No",
        "MultipleLines": multiple_lines,
        "InternetService": internet_service,
        "OnlineSecurity": online_security,
        "OnlineBackup": online_backup,
        "DeviceProtection": device_protection,
        "TechSupport": tech_support,
        "StreamingTV": streaming_tv,
        "StreamingMovies": streaming_movies,
        "Contract": contract,
        "PaperlessBilling": "Yes" if paperless_billing else "No",
        "PaymentMethod": payment_method,
        "MonthlyCharges": monthly_charges,
        "TotalCharges": total_charges,
    }

    with result_col:
        try:
            with st.spinner("Scoring customer..."):
                response = requests.post(API_URL, json=payload, timeout=10)
                response.raise_for_status()
                result = response.json()

            prediction = result["churn_prediction"]
            probability = result["churn_probability"]

            if prediction == "Yes":
                st.markdown(
                    f"""<div class="result-card result-churn">
                        <h2>⚠️ Likely to Churn</h2>
                        <h1 style="color:#ff4b4b;">{probability:.0%}</h1>
                        <p>estimated churn probability</p>
                    </div>""",
                    unsafe_allow_html=True,
                )
            else:
                st.markdown(
                    f"""<div class="result-card result-stay">
                        <h2>✅ Likely to Stay</h2>
                        <h1 style="color:#3cc878;">{probability:.0%}</h1>
                        <p>estimated churn probability</p>
                    </div>""",
                    unsafe_allow_html=True,
                )

            st.progress(probability)

            with st.expander("View raw API response"):
                st.json(result)

            with st.expander("Why this matters"):
                if contract == "Month-to-month":
                    st.write("• Month-to-month contracts have the highest churn risk of the three contract types.")
                if tenure < 12:
                    st.write("• Low tenure customers (under a year) churn at a much higher rate than long-tenured ones.")
                if internet_service == "Fiber optic" and online_security == "No":
                    st.write("• Fiber customers without add-on services like Online Security tend to churn more.")

        except requests.exceptions.ConnectionError:
            st.error(
                "Could not reach the prediction API.\n\n"
                "Make sure it's running:\n```\ncd api && uvicorn main:app --reload\n```"
            )
        except Exception as e:
            st.error(f"Something went wrong: {e}")
