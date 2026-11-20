/**
 * Model Metadata & Local Inference Engine
 * Authoritative weights, intercept, scaling parameters, and performance metrics
 * extracted directly from churn_model.pkl, scaler.pkl, and feature_columns.pkl.
 */

export const MODEL_METADATA = Object.freeze({
  name: 'Logistic Regression (Balanced Class Weights)',
  algorithm: 'LogisticRegression',
  framework: 'scikit-learn 1.9.0',
  trainingDate: '2026-11-18',
  solver: 'lbfgs',
  maxIter: 1000,
  C: 1.0,
  classWeight: 'balanced',
  fitIntercept: true,
  intercept: -0.7067596708131704,
  classificationThreshold: 0.50,
  riskThresholds: {
    high: 0.70,
    medium: 0.40,
    low: 0.0,
  },
});

export const SCALER_PARAMS = Object.freeze({
  features: ['tenure', 'MonthlyCharges', 'TotalCharges'],
  mean: {
    tenure: 32.48509052,
    MonthlyCharges: 64.92996095,
    TotalCharges: 2299.33468229,
  },
  scale: {
    tenure: 24.56656302,
    MonthlyCharges: 30.13543058,
    TotalCharges: 2279.00199650,
  },
});

export const FEATURE_COLUMNS = Object.freeze([
  'SeniorCitizen',
  'tenure',
  'MonthlyCharges',
  'TotalCharges',
  'gender_Male',
  'Partner_Yes',
  'Dependents_Yes',
  'PhoneService_Yes',
  'MultipleLines_No phone service',
  'MultipleLines_Yes',
  'InternetService_Fiber optic',
  'InternetService_No',
  'OnlineSecurity_No internet service',
  'OnlineSecurity_Yes',
  'OnlineBackup_No internet service',
  'OnlineBackup_Yes',
  'DeviceProtection_No internet service',
  'DeviceProtection_Yes',
  'TechSupport_No internet service',
  'TechSupport_Yes',
  'StreamingTV_No internet service',
  'StreamingTV_Yes',
  'StreamingMovies_No internet service',
  'StreamingMovies_Yes',
  'Contract_One year',
  'Contract_Two year',
  'PaperlessBilling_Yes',
  'PaymentMethod_Credit card (automatic)',
  'PaymentMethod_Electronic check',
  'PaymentMethod_Mailed check',
]);

export const COEFFICIENTS = Object.freeze({
  SeniorCitizen: 0.153868792,
  tenure: -1.15617531,
  MonthlyCharges: -0.546188637,
  TotalCharges: 0.486540914,
  gender_Male: 0.0305549676,
  Partner_Yes: 0.0187756808,
  Dependents_Yes: -0.231225397,
  PhoneService_Yes: -0.348013615,
  'MultipleLines_No phone service': -0.189277182,
  MultipleLines_Yes: 0.324741606,
  'InternetService_Fiber optic': 1.22235220,
  InternetService_No: -0.183003065,
  'OnlineSecurity_No internet service': -0.183003065,
  OnlineSecurity_Yes: -0.334945774,
  'OnlineBackup_No internet service': -0.183003065,
  OnlineBackup_Yes: -0.0706747393,
  'DeviceProtection_No internet service': -0.183003065,
  DeviceProtection_Yes: 0.0411515829,
  'TechSupport_No internet service': -0.183003065,
  TechSupport_Yes: -0.268556838,
  'StreamingTV_No internet service': -0.183003065,
  StreamingTV_Yes: 0.395358589,
  'StreamingMovies_No internet service': -0.183003065,
  StreamingMovies_Yes: 0.420610987,
  'Contract_One year': -0.715268247,
  'Contract_Two year': -1.41253561,
  PaperlessBilling_Yes: 0.336448778,
  'PaymentMethod_Credit card (automatic)': -0.000670803349,
  'PaymentMethod_Electronic check': 0.402478163,
  'PaymentMethod_Mailed check': 0.0523126606,
});

export const FEATURE_IMPORTANCE = Object.freeze([
  { feature: 'Contract_Two year', displayName: 'Two-Year Contract', weight: -1.412536, absWeight: 1.412536, impact: 'RETENTION_ANCHOR', category: 'Contract' },
  { feature: 'InternetService_Fiber optic', displayName: 'Fiber Optic Service', weight: 1.222352, absWeight: 1.222352, impact: 'CHURN_PROMOTER', category: 'Service' },
  { feature: 'tenure', displayName: 'Tenure (Months)', weight: -1.156175, absWeight: 1.156175, impact: 'RETENTION_ANCHOR', category: 'Account' },
  { feature: 'Contract_One year', displayName: 'One-Year Contract', weight: -0.715268, absWeight: 0.715268, impact: 'RETENTION_ANCHOR', category: 'Contract' },
  { feature: 'MonthlyCharges', displayName: 'Monthly Charges', weight: -0.546189, absWeight: 0.546189, impact: 'RETENTION_ANCHOR', category: 'Billing' },
  { feature: 'TotalCharges', displayName: 'Total Charges to Date', weight: 0.486541, absWeight: 0.486541, impact: 'CHURN_PROMOTER', category: 'Billing' },
  { feature: 'StreamingMovies_Yes', displayName: 'Streaming Movies Subscribed', weight: 0.420611, absWeight: 0.420611, impact: 'CHURN_PROMOTER', category: 'Service' },
  { feature: 'PaymentMethod_Electronic check', displayName: 'Electronic Check Payment', weight: 0.402478, absWeight: 0.402478, impact: 'CHURN_PROMOTER', category: 'Billing' },
  { feature: 'StreamingTV_Yes', displayName: 'Streaming TV Subscribed', weight: 0.395359, absWeight: 0.395359, impact: 'CHURN_PROMOTER', category: 'Service' },
  { feature: 'PhoneService_Yes', displayName: 'Phone Service Subscribed', weight: -0.348014, absWeight: 0.348014, impact: 'RETENTION_ANCHOR', category: 'Service' },
  { feature: 'PaperlessBilling_Yes', displayName: 'Paperless Billing Enabled', weight: 0.336449, absWeight: 0.336449, impact: 'CHURN_PROMOTER', category: 'Billing' },
  { feature: 'OnlineSecurity_Yes', displayName: 'Online Security Active', weight: -0.334946, absWeight: 0.334946, impact: 'RETENTION_ANCHOR', category: 'Security' },
  { feature: 'MultipleLines_Yes', displayName: 'Multiple Phone Lines', weight: 0.324742, absWeight: 0.324742, impact: 'CHURN_PROMOTER', category: 'Service' },
  { feature: 'TechSupport_Yes', displayName: 'Tech Support Active', weight: -0.268557, absWeight: 0.268557, impact: 'RETENTION_ANCHOR', category: 'Support' },
  { feature: 'Dependents_Yes', displayName: 'Has Dependents', weight: -0.231225, absWeight: 0.231225, impact: 'RETENTION_ANCHOR', category: 'Demographics' },
  { feature: 'MultipleLines_No phone service', displayName: 'No Phone Service', weight: -0.189277, absWeight: 0.189277, impact: 'RETENTION_ANCHOR', category: 'Service' },
  { feature: 'InternetService_No', displayName: 'No Internet Service', weight: -0.183003, absWeight: 0.183003, impact: 'RETENTION_ANCHOR', category: 'Service' },
  { feature: 'SeniorCitizen', displayName: 'Senior Citizen', weight: 0.153869, absWeight: 0.153869, impact: 'CHURN_PROMOTER', category: 'Demographics' },
  { feature: 'OnlineBackup_Yes', displayName: 'Online Backup Active', weight: -0.070675, absWeight: 0.070675, impact: 'RETENTION_ANCHOR', category: 'Security' },
  { feature: 'PaymentMethod_Mailed check', displayName: 'Mailed Check Payment', weight: 0.052313, absWeight: 0.052313, impact: 'CHURN_PROMOTER', category: 'Billing' },
  { feature: 'DeviceProtection_Yes', displayName: 'Device Protection Active', weight: 0.041152, absWeight: 0.041152, impact: 'CHURN_PROMOTER', category: 'Security' },
  { feature: 'gender_Male', displayName: 'Male Gender', weight: 0.030555, absWeight: 0.030555, impact: 'CHURN_PROMOTER', category: 'Demographics' },
  { feature: 'Partner_Yes', displayName: 'Has Partner', weight: 0.018776, absWeight: 0.018776, impact: 'CHURN_PROMOTER', category: 'Demographics' },
  { feature: 'PaymentMethod_Credit card (automatic)', displayName: 'Credit Card Auto-pay', weight: -0.000671, absWeight: 0.000671, impact: 'RETENTION_ANCHOR', category: 'Billing' },
]);

export const PERFORMANCE_METRICS = Object.freeze({
  rocAuc: 0.8417,
  accuracy: 0.7381,
  precision: 0.5043,
  recall: 0.7834,
  f1: 0.6136,
  specificity: 0.7217,
  testSize: 1409,
  trainSize: 5634,
  macroAvg: { precision: 0.7032, recall: 0.7525, f1: 0.7078 },
  weightedAvg: { precision: 0.7963, recall: 0.7381, f1: 0.7520 },
});

export const CONFUSION_MATRIX = Object.freeze({
  trueNegative: 747,
  falsePositive: 288,
  falseNegative: 81,
  truePositive: 293,
  total: 1409,
});

export const MODEL_BENCHMARKS = Object.freeze([
  { model: 'Logistic Regression (Balanced)', rocAuc: 0.8417, accuracy: 0.7381, recall: 0.7834, f1: 0.6136, isProduction: true },
  { model: 'Random Forest (200 trees)', rocAuc: 0.8279, accuracy: 0.7708, recall: 0.6524, f1: 0.6010, isProduction: false },
  { model: 'XGBoost (logloss)', rocAuc: 0.8185, accuracy: 0.7587, recall: 0.6684, f1: 0.5945, isProduction: false },
]);

/**
 * Pure JavaScript Logistic Regression inference engine.
 * Computes exact probability from 30 features with zero dependencies.
 */
export function evaluateLocalModel(cust = {}) {
  const tenureVal = Number(cust.tenure || 0);
  const monthlyVal = Number(cust.MonthlyCharges || 0);
  const totalVal = Number(
    cust.TotalCharges != null && !isNaN(Number(cust.TotalCharges))
      ? Number(cust.TotalCharges)
      : tenureVal * monthlyVal
  );

  const x = {
    SeniorCitizen: Number(cust.SeniorCitizen ? 1.0 : 0.0),
    tenure: (tenureVal - SCALER_PARAMS.mean.tenure) / SCALER_PARAMS.scale.tenure,
    MonthlyCharges: (monthlyVal - SCALER_PARAMS.mean.MonthlyCharges) / SCALER_PARAMS.scale.MonthlyCharges,
    TotalCharges: (totalVal - SCALER_PARAMS.mean.TotalCharges) / SCALER_PARAMS.scale.TotalCharges,
    gender_Male: cust.gender === 'Male' ? 1.0 : 0.0,
    Partner_Yes: cust.Partner === 'Yes' ? 1.0 : 0.0,
    Dependents_Yes: cust.Dependents === 'Yes' ? 1.0 : 0.0,
    PhoneService_Yes: cust.PhoneService === 'Yes' ? 1.0 : 0.0,
    'MultipleLines_No phone service': cust.MultipleLines === 'No phone service' ? 1.0 : 0.0,
    MultipleLines_Yes: cust.MultipleLines === 'Yes' ? 1.0 : 0.0,
    'InternetService_Fiber optic': cust.InternetService === 'Fiber optic' ? 1.0 : 0.0,
    InternetService_No: cust.InternetService === 'No' ? 1.0 : 0.0,
    'OnlineSecurity_No internet service': (cust.OnlineSecurity === 'No internet service' || cust.InternetService === 'No') ? 1.0 : 0.0,
    OnlineSecurity_Yes: cust.OnlineSecurity === 'Yes' ? 1.0 : 0.0,
    'OnlineBackup_No internet service': (cust.OnlineBackup === 'No internet service' || cust.InternetService === 'No') ? 1.0 : 0.0,
    OnlineBackup_Yes: cust.OnlineBackup === 'Yes' ? 1.0 : 0.0,
    'DeviceProtection_No internet service': (cust.DeviceProtection === 'No internet service' || cust.InternetService === 'No') ? 1.0 : 0.0,
    DeviceProtection_Yes: cust.DeviceProtection === 'Yes' ? 1.0 : 0.0,
    'TechSupport_No internet service': (cust.TechSupport === 'No internet service' || cust.InternetService === 'No') ? 1.0 : 0.0,
    TechSupport_Yes: cust.TechSupport === 'Yes' ? 1.0 : 0.0,
    'StreamingTV_No internet service': (cust.StreamingTV === 'No internet service' || cust.InternetService === 'No') ? 1.0 : 0.0,
    StreamingTV_Yes: cust.StreamingTV === 'Yes' ? 1.0 : 0.0,
    'StreamingMovies_No internet service': (cust.StreamingMovies === 'No internet service' || cust.InternetService === 'No') ? 1.0 : 0.0,
    StreamingMovies_Yes: cust.StreamingMovies === 'Yes' ? 1.0 : 0.0,
    'Contract_One year': cust.Contract === 'One year' ? 1.0 : 0.0,
    'Contract_Two year': cust.Contract === 'Two year' ? 1.0 : 0.0,
    PaperlessBilling_Yes: cust.PaperlessBilling === 'Yes' ? 1.0 : 0.0,
    'PaymentMethod_Credit card (automatic)': cust.PaymentMethod === 'Credit card (automatic)' ? 1.0 : 0.0,
    'PaymentMethod_Electronic check': cust.PaymentMethod === 'Electronic check' ? 1.0 : 0.0,
    'PaymentMethod_Mailed check': cust.PaymentMethod === 'Mailed check' ? 1.0 : 0.0,
  };

  let z = MODEL_METADATA.intercept;
  const driverContributions = [];

  for (const feat of FEATURE_COLUMNS) {
    const val = x[feat] || 0.0;
    const weight = COEFFICIENTS[feat] || 0.0;
    const contribution = weight * val;
    z += contribution;

    if (Math.abs(contribution) > 0.08) {
      driverContributions.push({
        feature: feat,
        contribution,
        impact: contribution > 0 ? 'CHURN_RISK' : 'RETENTION_ANCHOR',
      });
    }
  }

  const prob = 1.0 / (1.0 + Math.exp(-z));
  const roundedProb = Math.round(prob * 10000) / 10000;
  const churnPrediction = roundedProb >= MODEL_METADATA.classificationThreshold ? 'Yes' : 'No';

  let riskLevel = 'LOW';
  if (roundedProb >= MODEL_METADATA.riskThresholds.high) {
    riskLevel = 'HIGH';
  } else if (roundedProb >= MODEL_METADATA.riskThresholds.medium) {
    riskLevel = 'MEDIUM';
  }

  driverContributions.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

  return {
    churnPrediction,
    churnProbability: roundedProb,
    riskLevel,
    riskScore: Math.round(roundedProb * 1000) / 10,
    topDrivers: driverContributions.slice(0, 3).map((d) => d.feature),
    driverContributions: driverContributions.slice(0, 5),
    logit: z,
    isFallback: true,
    offline: true,
  };
}
