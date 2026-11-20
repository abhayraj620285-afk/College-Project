import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useLocation, useNavigate, Link } from 'react-router-dom'
import {
  Sparkles,
  Zap,
  Sliders,
  RotateCcw,
  UserCheck,
  History,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react'

// Reusable Prediction Components
import {
  PredictionForm,
  PredictionResult,
  DEFAULT_CUSTOMER_REQUEST,
  HIGH_RISK_PRESET,
  LOW_RISK_PRESET,
} from '../components/predict'

// Services
import { predictChurn } from '../services/api'
import { getCustomerById } from '../services/customerService'

// State Indicators
import { ErrorBanner } from '../components/common/StateIndicators'

/**
 * Normalizes any Customer record into the strict 19-field CustomerRequest schema.
 */
function mapCustomerToFormData(customer) {
  if (!customer) return DEFAULT_CUSTOMER_REQUEST

  const tenureVal = Math.max(0, Math.min(100, Number(customer.tenure ?? 0)))
  const monthlyVal = Number(customer.MonthlyCharges ?? customer.monthlyCharges ?? 0)
  const totalVal = Number(
    customer.TotalCharges != null && !isNaN(Number(customer.TotalCharges))
      ? customer.TotalCharges
      : customer.totalCharges != null && !isNaN(Number(customer.totalCharges))
      ? customer.totalCharges
      : tenureVal * monthlyVal
  )

  return {
    gender: customer.gender === 'Male' ? 'Male' : 'Female',
    SeniorCitizen: Number(customer.SeniorCitizen ?? customer.seniorCitizen ?? 0),
    Partner: customer.Partner === 'Yes' || customer.partner === 'Yes' ? 'Yes' : 'No',
    Dependents: customer.Dependents === 'Yes' || customer.dependents === 'Yes' ? 'Yes' : 'No',
    tenure: tenureVal,
    PhoneService: customer.PhoneService === 'No' || customer.phoneService === 'No' ? 'No' : 'Yes',
    MultipleLines: customer.MultipleLines || customer.multipleLines || 'No',
    InternetService: customer.InternetService || customer.internetService || 'Fiber optic',
    OnlineSecurity: customer.OnlineSecurity || customer.onlineSecurity || 'No',
    OnlineBackup: customer.OnlineBackup || customer.onlineBackup || 'No',
    DeviceProtection: customer.DeviceProtection || customer.deviceProtection || 'No',
    TechSupport: customer.TechSupport || customer.techSupport || 'No',
    StreamingTV: customer.StreamingTV || customer.streamingTV || 'No',
    StreamingMovies: customer.StreamingMovies || customer.streamingMovies || 'No',
    Contract: customer.Contract || customer.contract || 'Month-to-month',
    PaperlessBilling: customer.PaperlessBilling === 'No' || customer.paperlessBilling === 'No' ? 'No' : 'Yes',
    PaymentMethod: customer.PaymentMethod || customer.paymentMethod || 'Electronic check',
    MonthlyCharges: monthlyVal,
    TotalCharges: totalVal,
  }
}

export default function PredictPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const prefillProcessedRef = useRef(null)

  // State Management
  const [initialFormData, setInitialFormData] = useState(DEFAULT_CUSTOMER_REQUEST)
  const [formKey, setFormKey] = useState(0) // Forces PredictionForm re-initialization when changed
  const [lastSubmittedData, setLastSubmittedData] = useState(null)
  const [predictionResult, setPredictionResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [prefilledCustomer, setPrefilledCustomer] = useState(null)

  // Primary prediction dispatcher
  const handlePredict = useCallback(async (formData) => {
    setIsLoading(true)
    setError(null)
    setLastSubmittedData(formData)

    try {
      const result = await predictChurn(formData)
      setPredictionResult(result)
    } catch (err) {
      console.error('[PredictPage] Inference error:', err)
      setError(err?.message || 'Failed to execute churn prediction. Please check inputs and retry.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Handle URL navigation & customer prefill (e.g. /customers/:id?predict=true or /predict?customerId=...)
  useEffect(() => {
    const customerIdParam =
      searchParams.get('customerId') ||
      searchParams.get('customerID') ||
      searchParams.get('id')
    const isPredictTrigger = searchParams.get('predict') === 'true' || searchParams.get('auto') === 'true'
    const stateCustomer = location.state?.customer || location.state?.customerData || location.state?.prefill

    const prefillKey = customerIdParam || (stateCustomer ? (stateCustomer.customerID || stateCustomer.id) : null)
    if (!prefillKey || prefillProcessedRef.current === prefillKey) {
      return
    }

    let matchedCustomer = stateCustomer
    if (!matchedCustomer && customerIdParam) {
      matchedCustomer = getCustomerById(customerIdParam)
    }

    if (matchedCustomer) {
      prefillProcessedRef.current = prefillKey
      const prefilledData = mapCustomerToFormData(matchedCustomer)
      setPrefilledCustomer(matchedCustomer)
      setInitialFormData(prefilledData)
      setFormKey((prev) => prev + 1)

      // Automatically evaluate prediction if navigated with predict=true flag
      if (isPredictTrigger) {
        handlePredict(prefilledData)
      }
    }
  }, [searchParams, location.state, handlePredict])

  // Reset handler
  const handleReset = useCallback(() => {
    setPredictionResult(null)
    setLastSubmittedData(null)
    setError(null)
  }, [])

  // Clear prefilled customer profile
  const handleClearPrefill = useCallback(() => {
    prefillProcessedRef.current = null
    setPrefilledCustomer(null)
    setInitialFormData(DEFAULT_CUSTOMER_REQUEST)
    setFormKey((prev) => prev + 1)
    setPredictionResult(null)
    setLastSubmittedData(null)
    setError(null)

    // Remove query params cleanly without page reload
    const newParams = new URLSearchParams(searchParams)
    newParams.delete('customerId')
    newParams.delete('customerID')
    newParams.delete('id')
    newParams.delete('predict')
    newParams.delete('auto')
    setSearchParams(newParams, { replace: true })
  }, [searchParams, setSearchParams])

  // Load Preset handler
  const handleLoadPreset = useCallback((preset) => {
    prefillProcessedRef.current = null
    setPrefilledCustomer(null)
    setInitialFormData(preset)
    setFormKey((prev) => prev + 1)
    setPredictionResult(null)
    setLastSubmittedData(null)
    setError(null)
  }, [])

  return (
    <div className="page-container predict-page-container">
      <style>{`
        .prediction-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
          gap: var(--space-6);
          align-items: start;
        }
        @media (max-width: 960px) {
          .prediction-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Semantic Page Header */}
      <header className="page-header">
        <div className="page-header-top">
          <div className="page-header-title-group">
            <span className="eyebrow">Intelligence Engine</span>
            <h1>Real-Time Churn Prediction Engine</h1>
            <p className="page-header-description">
              Simulate subscriber features and evaluate instantaneous churn probability and risk tier classification via the production scikit-learn Logistic Regression inference pipeline.
            </p>
          </div>

          <div className="page-header-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => handleLoadPreset(HIGH_RISK_PRESET)}
              aria-label="Load high churn risk preset parameters"
            >
              High-Risk Preset
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => handleLoadPreset(LOW_RISK_PRESET)}
              aria-label="Load low churn risk preset parameters"
            >
              Low-Risk Preset
            </button>
            <Link
              to="/prediction-history"
              className="btn-ghost"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              aria-label="View past predictions in audit log"
            >
              <History size={16} aria-hidden="true" />
              <span>Audit Log</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Prefilled Customer Notification Banner */}
      {prefilledCustomer && (
        <section
          role="region"
          aria-label="Loaded Customer Profile Notice"
          className="notice-banner info"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-3)',
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: 'var(--color-status-info-subtle)',
            border: '1px solid var(--color-status-info-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-primary)',
            fontSize: 'var(--font-size-body-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <UserCheck size={18} style={{ color: 'var(--color-info)', flexShrink: 0 }} aria-hidden="true" />
            <span>
              Loaded profile for Subscriber{' '}
              <strong style={{ fontFamily: 'var(--font-mono)' }}>
                #{prefilledCustomer.customerID || prefilledCustomer.id}
              </strong>{' '}
              ({prefilledCustomer.tenure} mos tenure, {prefilledCustomer.Contract} contract, ${Number(prefilledCustomer.MonthlyCharges).toFixed(2)}/mo).
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Link
              to={`/customers/${prefilledCustomer.customerID || prefilledCustomer.id}`}
              className="btn-ghost"
              style={{ fontSize: 'var(--font-size-micro)', padding: '4px 8px' }}
            >
              View Full Profile <ArrowRight size={12} style={{ marginLeft: '4px' }} />
            </Link>
            <button
              type="button"
              onClick={handleClearPrefill}
              className="btn-secondary"
              style={{ fontSize: 'var(--font-size-micro)', padding: '4px 8px' }}
            >
              Clear Prefill
            </button>
          </div>
        </section>
      )}

      {/* Transparent Offline Local Inference Warning Banner */}
      {predictionResult?.isFallback && (
        <div
          role="status"
          aria-live="polite"
          className="notice-banner warning"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: 'var(--color-risk-medium-subtle)',
            border: '1px solid var(--color-risk-medium-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-risk-medium)',
            fontSize: 'var(--font-size-body-sm)',
          }}
        >
          <Zap size={18} style={{ flexShrink: 0, color: 'var(--color-risk-medium)' }} aria-hidden="true" />
          <span>
            ⚡ <strong>Offline Local Inference Active:</strong> Prediction evaluated client-side using authentic scikit-learn model weights because Spring Boot / ML service is offline.
          </span>
        </div>
      )}

      {/* Global Error Banner with Retry Trigger */}
      {error && (
        <ErrorBanner
          title="Prediction Execution Failed"
          message={error}
          onRetry={lastSubmittedData ? () => handlePredict(lastSubmittedData) : undefined}
          retryText="Retry Inference"
          dismissible
          onDismiss={() => setError(null)}
        />
      )}

      {/* Dual-Column Responsive Grid Layout */}
      <div className="prediction-grid">
        {/* Left Column: 19-Feature Prediction Form */}
        <div className="prediction-form-column">
          <PredictionForm
            key={formKey}
            initialData={initialFormData}
            onSubmit={handlePredict}
            isLoading={isLoading}
            error={error}
          />
        </div>

        {/* Right Column: Interactive Prediction Result & Key Drivers */}
        <div
          className="prediction-result-column"
          style={{
            position: 'sticky',
            top: 'var(--space-4)',
          }}
        >
          <PredictionResult
            result={predictionResult}
            formData={lastSubmittedData}
            onReset={handleReset}
          />
        </div>
      </div>
    </div>
  )
}
