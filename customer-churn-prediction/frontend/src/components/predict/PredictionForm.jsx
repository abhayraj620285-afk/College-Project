import React, { useState } from 'react'
import {
  Sliders,
  Send,
  RefreshCw,
  RotateCcw,
  AlertTriangle,
  Wifi,
  CreditCard,
  User,
} from 'lucide-react'

export const DEFAULT_CUSTOMER_REQUEST = {
  gender: 'Female',
  SeniorCitizen: 0,
  Partner: 'No',
  Dependents: 'No',
  tenure: 12,
  PhoneService: 'Yes',
  MultipleLines: 'No',
  InternetService: 'Fiber optic',
  OnlineSecurity: 'No',
  OnlineBackup: 'No',
  DeviceProtection: 'No',
  TechSupport: 'No',
  StreamingTV: 'No',
  StreamingMovies: 'No',
  Contract: 'Month-to-month',
  PaperlessBilling: 'Yes',
  PaymentMethod: 'Electronic check',
  MonthlyCharges: 70.0,
  TotalCharges: 840.0,
}

export const HIGH_RISK_PRESET = {
  gender: 'Female',
  SeniorCitizen: 0,
  Partner: 'No',
  Dependents: 'No',
  tenure: 2,
  PhoneService: 'Yes',
  MultipleLines: 'No',
  InternetService: 'Fiber optic',
  OnlineSecurity: 'No',
  OnlineBackup: 'No',
  DeviceProtection: 'No',
  TechSupport: 'No',
  StreamingTV: 'Yes',
  StreamingMovies: 'Yes',
  Contract: 'Month-to-month',
  PaperlessBilling: 'Yes',
  PaymentMethod: 'Electronic check',
  MonthlyCharges: 89.85,
  TotalCharges: 179.7,
}

export const LOW_RISK_PRESET = {
  gender: 'Male',
  SeniorCitizen: 0,
  Partner: 'Yes',
  Dependents: 'Yes',
  tenure: 65,
  PhoneService: 'Yes',
  MultipleLines: 'Yes',
  InternetService: 'DSL',
  OnlineSecurity: 'Yes',
  OnlineBackup: 'Yes',
  DeviceProtection: 'Yes',
  TechSupport: 'Yes',
  StreamingTV: 'No',
  StreamingMovies: 'No',
  Contract: 'Two year',
  PaperlessBilling: 'No',
  PaymentMethod: 'Credit card (automatic)',
  MonthlyCharges: 64.8,
  TotalCharges: 4212.0,
}

export default function PredictionForm({
  onSubmit,
  isLoading = false,
  error = null,
  initialData = DEFAULT_CUSTOMER_REQUEST,
}) {
  const [formData, setFormData] = useState({
    ...DEFAULT_CUSTOMER_REQUEST,
    ...initialData,
  })
  const [validationErrors, setValidationErrors] = useState({})

  function handleFieldChange(field, rawValue) {
    setFormData((prev) => {
      const next = { ...prev, [field]: rawValue }

      // Mutual Exclusion 1: PhoneService === 'No'
      if (field === 'PhoneService') {
        if (rawValue === 'No') {
          next.MultipleLines = 'No phone service'
        } else if (prev.MultipleLines === 'No phone service') {
          next.MultipleLines = 'No'
        }
      }

      // Mutual Exclusion 2: InternetService === 'No'
      if (field === 'InternetService') {
        if (rawValue === 'No') {
          next.OnlineSecurity = 'No internet service'
          next.OnlineBackup = 'No internet service'
          next.DeviceProtection = 'No internet service'
          next.TechSupport = 'No internet service'
          next.StreamingTV = 'No internet service'
          next.StreamingMovies = 'No internet service'
        } else {
          const addOns = [
            'OnlineSecurity',
            'OnlineBackup',
            'DeviceProtection',
            'TechSupport',
            'StreamingTV',
            'StreamingMovies',
          ]
          addOns.forEach((svc) => {
            if (prev[svc] === 'No internet service') {
              next[svc] = 'No'
            }
          })
        }
      }

      // Dynamic calculation of TotalCharges
      if (field === 'tenure' || field === 'MonthlyCharges') {
        const t = field === 'tenure' ? Number(rawValue) : Number(prev.tenure)
        const m = field === 'MonthlyCharges' ? Number(rawValue) : Number(prev.MonthlyCharges)
        if (!isNaN(t) && !isNaN(m) && t >= 0 && m >= 0) {
          next.TotalCharges = Math.round(t * m * 100) / 100
        }
      }

      return next
    })

    // Clear validation error on change
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const copy = { ...prev }
        delete copy[field]
        return copy
      })
    }
  }

  function validate() {
    const errors = {}
    if (formData.tenure < 0 || formData.tenure > 100 || isNaN(formData.tenure)) {
      errors.tenure = 'Tenure must be an integer between 0 and 100 months.'
    }
    if (formData.MonthlyCharges <= 0 || isNaN(formData.MonthlyCharges)) {
      errors.MonthlyCharges = 'Monthly Charges must be greater than $0.00.'
    }
    if (formData.TotalCharges < 0 || isNaN(formData.TotalCharges)) {
      errors.TotalCharges = 'Total Charges cannot be negative.'
    }
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    // Ensure numeric types match schema
    const payload = {
      ...formData,
      SeniorCitizen: Number(formData.SeniorCitizen),
      tenure: Number(formData.tenure),
      MonthlyCharges: Number(formData.MonthlyCharges),
      TotalCharges: Number(formData.TotalCharges),
    }
    if (onSubmit) {
      onSubmit(payload)
    }
  }

  const isPhoneDisabled = formData.PhoneService === 'No'
  const isInternetDisabled = formData.InternetService === 'No'

  return (
    <div className="card prediction-form-card" style={{ padding: 'var(--space-5)' }}>
      {/* Preset Action Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-5)',
          paddingBottom: 'var(--space-4)',
          borderBottom: '1px solid var(--color-border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={20} style={{ color: 'var(--color-kiwi)' }} aria-hidden="true" />
          <h2 style={{ fontSize: 'var(--font-size-h2)', margin: 0 }}>Model Feature Parameters (19 Features)</h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setFormData(HIGH_RISK_PRESET)}
            style={{ fontSize: 'var(--font-size-micro)', padding: '6px 10px' }}
          >
            Load High-Risk Example
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setFormData(LOW_RISK_PRESET)}
            style={{ fontSize: 'var(--font-size-micro)', padding: '6px 10px' }}
          >
            Load Low-Risk Example
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setFormData(DEFAULT_CUSTOMER_REQUEST)}
            style={{ fontSize: 'var(--font-size-micro)', padding: '6px 10px' }}
            title="Reset to default baseline"
          >
            <RotateCcw size={14} /> Reset Form
          </button>
        </div>
      </div>

      {/* Global Form Error Banner */}
      {error && (
        <div
          role="alert"
          style={{
            padding: 'var(--space-3) var(--space-4)',
            marginBottom: 'var(--space-4)',
            backgroundColor: 'var(--color-risk-high-subtle)',
            border: '1px solid var(--color-risk-high-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-risk-high)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: 'var(--font-size-body-sm)',
          }}
        >
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {/* Fieldset 1: Subscriber Demographics */}
        <fieldset
          style={{
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
            backgroundColor: 'var(--color-surface-subtle)',
          }}
        >
          <legend
            style={{
              padding: '0 8px',
              fontWeight: 600,
              fontSize: 'var(--font-size-body-sm)',
              color: 'var(--color-kiwi)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <User size={14} /> Subscriber Demographics
          </legend>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 'var(--space-3)',
              marginTop: 'var(--space-2)',
            }}
          >
            {/* gender */}
            <div>
              <label htmlFor="field-gender" style={{ display: 'block', fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Gender
              </label>
              <select
                id="field-gender"
                value={formData.gender}
                onChange={(e) => handleFieldChange('gender', e.target.value)}
                style={formSelectStyle}
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>

            {/* SeniorCitizen */}
            <div>
              <label htmlFor="field-SeniorCitizen" style={{ display: 'block', fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Senior Citizen (Age 65+)
              </label>
              <select
                id="field-SeniorCitizen"
                value={formData.SeniorCitizen}
                onChange={(e) => handleFieldChange('SeniorCitizen', Number(e.target.value))}
                style={formSelectStyle}
              >
                <option value={0}>No (Under 65)</option>
                <option value={1}>Yes (65 or older)</option>
              </select>
            </div>

            {/* Partner */}
            <div>
              <label htmlFor="field-Partner" style={{ display: 'block', fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Partner
              </label>
              <select
                id="field-Partner"
                value={formData.Partner}
                onChange={(e) => handleFieldChange('Partner', e.target.value)}
                style={formSelectStyle}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            {/* Dependents */}
            <div>
              <label htmlFor="field-Dependents" style={{ display: 'block', fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Dependents (Children)
              </label>
              <select
                id="field-Dependents"
                value={formData.Dependents}
                onChange={(e) => handleFieldChange('Dependents', e.target.value)}
                style={formSelectStyle}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>
        </fieldset>

        {/* Fieldset 2: Account & Contract Terms */}
        <fieldset
          style={{
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
            backgroundColor: 'var(--color-surface-subtle)',
          }}
        >
          <legend
            style={{
              padding: '0 8px',
              fontWeight: 600,
              fontSize: 'var(--font-size-body-sm)',
              color: 'var(--color-kiwi)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <CreditCard size={14} /> Account & Contract Structure
          </legend>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-3)',
              marginTop: 'var(--space-2)',
            }}
          >
            {/* Contract */}
            <div>
              <label htmlFor="field-Contract" style={{ display: 'block', fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Contract Duration
              </label>
              <select
                id="field-Contract"
                value={formData.Contract}
                onChange={(e) => handleFieldChange('Contract', e.target.value)}
                style={formSelectStyle}
              >
                <option value="Month-to-month">Month-to-month (High Risk)</option>
                <option value="One year">One year (Moderate)</option>
                <option value="Two year">Two year (Low Risk)</option>
              </select>
            </div>

            {/* tenure with slider and numeric box */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label htmlFor="field-tenure" style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>
                  Tenure: <span className="font-tabular" style={{ color: 'var(--color-kiwi)', fontWeight: 600 }}>{formData.tenure} mos</span>
                </label>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.tenure}
                  onChange={(e) => handleFieldChange('tenure', Number(e.target.value))}
                  style={{ flex: 1, accentColor: 'var(--color-kiwi)', cursor: 'pointer' }}
                />
                <input
                  id="field-tenure"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.tenure}
                  onChange={(e) => handleFieldChange('tenure', Number(e.target.value))}
                  style={{
                    width: '64px',
                    padding: '6px 8px',
                    backgroundColor: 'var(--color-surface-input)',
                    border: `1px solid ${validationErrors.tenure ? 'var(--color-risk-high)' : 'var(--color-border-default)'}`,
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-text-primary)',
                    textAlign: 'center',
                    fontSize: 'var(--font-size-body-sm)',
                  }}
                  aria-invalid={!!validationErrors.tenure}
                  aria-describedby={validationErrors.tenure ? 'error-tenure' : undefined}
                />
              </div>
              {validationErrors.tenure && (
                <span id="error-tenure" style={{ fontSize: '11px', color: 'var(--color-risk-high)', marginTop: '2px', display: 'block' }}>
                  {validationErrors.tenure}
                </span>
              )}
            </div>

            {/* PaperlessBilling */}
            <div>
              <label htmlFor="field-PaperlessBilling" style={{ display: 'block', fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Paperless Billing
              </label>
              <select
                id="field-PaperlessBilling"
                value={formData.PaperlessBilling}
                onChange={(e) => handleFieldChange('PaperlessBilling', e.target.value)}
                style={formSelectStyle}
              >
                <option value="Yes">Yes (e-Billing)</option>
                <option value="No">No (Paper Invoices)</option>
              </select>
            </div>

            {/* PaymentMethod */}
            <div>
              <label htmlFor="field-PaymentMethod" style={{ display: 'block', fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Payment Method
              </label>
              <select
                id="field-PaymentMethod"
                value={formData.PaymentMethod}
                onChange={(e) => handleFieldChange('PaymentMethod', e.target.value)}
                style={formSelectStyle}
              >
                <option value="Electronic check">Electronic check (Highest Risk)</option>
                <option value="Mailed check">Mailed check</option>
                <option value="Bank transfer (automatic)">Bank transfer (automatic)</option>
                <option value="Credit card (automatic)">Credit card (automatic)</option>
              </select>
            </div>
          </div>
        </fieldset>

        {/* Fieldset 3: Subscribed Services & Add-Ons */}
        <fieldset
          style={{
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
            backgroundColor: 'var(--color-surface-subtle)',
          }}
        >
          <legend
            style={{
              padding: '0 8px',
              fontWeight: 600,
              fontSize: 'var(--font-size-body-sm)',
              color: 'var(--color-kiwi)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Wifi size={14} /> Telecommunications & Add-On Services
          </legend>

          {/* Phone Services Section */}
          <div style={{ marginBottom: 'var(--space-3)' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>
              Phone Infrastructure
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginTop: '6px' }}>
              <div>
                <label htmlFor="field-PhoneService" style={{ display: 'block', fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Phone Line Service
                </label>
                <select
                  id="field-PhoneService"
                  value={formData.PhoneService}
                  onChange={(e) => handleFieldChange('PhoneService', e.target.value)}
                  style={formSelectStyle}
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div>
                <label htmlFor="field-MultipleLines" style={{ display: 'block', fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Multiple Lines {isPhoneDisabled && <span style={{ color: 'var(--color-text-tertiary)' }}>(Locked)</span>}
                </label>
                <select
                  id="field-MultipleLines"
                  disabled={isPhoneDisabled}
                  value={formData.MultipleLines}
                  onChange={(e) => handleFieldChange('MultipleLines', e.target.value)}
                  style={{
                    ...formSelectStyle,
                    opacity: isPhoneDisabled ? 0.45 : 1,
                    backgroundColor: isPhoneDisabled ? 'var(--color-surface-card)' : 'var(--color-surface-input)',
                  }}
                >
                  {isPhoneDisabled ? (
                    <option value="No phone service">No phone service</option>
                  ) : (
                    <>
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Internet Services & 6 Add-Ons */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>
                Internet & Cloud Security Suite
              </span>
              {isInternetDisabled && (
                <span style={{ fontSize: '11px', color: 'var(--color-risk-medium)' }}>
                  Add-on services locked (No Internet)
                </span>
              )}
            </div>

            <div style={{ marginTop: '6px', marginBottom: 'var(--space-3)' }}>
              <label htmlFor="field-InternetService" style={{ display: 'block', fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Internet Service Architecture
              </label>
              <select
                id="field-InternetService"
                value={formData.InternetService}
                onChange={(e) => handleFieldChange('InternetService', e.target.value)}
                style={formSelectStyle}
              >
                <option value="Fiber optic">Fiber optic (Higher Churn Risk)</option>
                <option value="DSL">DSL (Moderate Risk)</option>
                <option value="No">No internet service</option>
              </select>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 'var(--space-3)',
              }}
            >
              {[
                { key: 'OnlineSecurity', label: 'Online Security' },
                { key: 'OnlineBackup', label: 'Online Cloud Backup' },
                { key: 'DeviceProtection', label: 'Device Protection' },
                { key: 'TechSupport', label: 'Premium Tech Support' },
                { key: 'StreamingTV', label: 'Streaming TV' },
                { key: 'StreamingMovies', label: 'Streaming Movies' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label htmlFor={`field-${key}`} style={{ display: 'block', fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    {label}
                  </label>
                  <select
                    id={`field-${key}`}
                    disabled={isInternetDisabled}
                    value={formData[key]}
                    onChange={(e) => handleFieldChange(key, e.target.value)}
                    style={{
                      ...formSelectStyle,
                      opacity: isInternetDisabled ? 0.45 : 1,
                      backgroundColor: isInternetDisabled ? 'var(--color-surface-card)' : 'var(--color-surface-input)',
                    }}
                  >
                    {isInternetDisabled ? (
                      <option value="No internet service">No internet service</option>
                    ) : (
                      <>
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </>
                    )}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </fieldset>

        {/* Fieldset 4: Financial Billing & Charges */}
        <fieldset
          style={{
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
            backgroundColor: 'var(--color-surface-subtle)',
          }}
        >
          <legend
            style={{
              padding: '0 8px',
              fontWeight: 600,
              fontSize: 'var(--font-size-body-sm)',
              color: 'var(--color-kiwi)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <CreditCard size={14} /> Charges & Lifetime Financials
          </legend>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--space-4)',
              marginTop: 'var(--space-2)',
            }}
          >
            {/* MonthlyCharges */}
            <div>
              <label htmlFor="field-MonthlyCharges" style={{ display: 'block', fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Monthly Recurring Charge ($ USD)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }}>$</span>
                <input
                  id="field-MonthlyCharges"
                  type="number"
                  step="0.05"
                  min="1"
                  value={formData.MonthlyCharges}
                  onChange={(e) => handleFieldChange('MonthlyCharges', Number(e.target.value))}
                  style={{
                    ...formInputStyle,
                    paddingLeft: '24px',
                    borderColor: validationErrors.MonthlyCharges ? 'var(--color-risk-high)' : 'var(--color-border-default)',
                  }}
                  aria-invalid={!!validationErrors.MonthlyCharges}
                  aria-describedby={validationErrors.MonthlyCharges ? 'error-monthly' : undefined}
                />
              </div>
              {validationErrors.MonthlyCharges && (
                <span id="error-monthly" style={{ fontSize: '11px', color: 'var(--color-risk-high)', marginTop: '2px', display: 'block' }}>
                  {validationErrors.MonthlyCharges}
                </span>
              )}
            </div>

            {/* TotalCharges */}
            <div>
              <label htmlFor="field-TotalCharges" style={{ display: 'block', fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Cumulative Total Charges ($ USD)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }}>$</span>
                <input
                  id="field-TotalCharges"
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.TotalCharges}
                  onChange={(e) => handleFieldChange('TotalCharges', Number(e.target.value))}
                  style={{
                    ...formInputStyle,
                    paddingLeft: '24px',
                    borderColor: validationErrors.TotalCharges ? 'var(--color-risk-high)' : 'var(--color-border-default)',
                  }}
                  aria-invalid={!!validationErrors.TotalCharges}
                  aria-describedby={validationErrors.TotalCharges ? 'error-total' : undefined}
                />
              </div>
              {validationErrors.TotalCharges && (
                <span id="error-total" style={{ fontSize: '11px', color: 'var(--color-risk-high)', marginTop: '2px', display: 'block' }}>
                  {validationErrors.TotalCharges}
                </span>
              )}
            </div>
          </div>
        </fieldset>

        {/* Submit Execution Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary"
          style={{
            height: '46px',
            fontSize: 'var(--font-size-body)',
            width: '100%',
            fontWeight: 600,
          }}
          aria-label={isLoading ? 'Calculating model inference' : 'Execute churn prediction'}
        >
          {isLoading ? (
            <>
              <RefreshCw size={18} className="spin" aria-hidden="true" />
              Calculating Inference...
            </>
          ) : (
            <>
              <Send size={18} aria-hidden="true" />
              Execute Real-Time Prediction
            </>
          )}
        </button>
      </form>

      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

const formSelectStyle = {
  width: '100%',
  padding: '8px 10px',
  backgroundColor: 'var(--color-surface-input)',
  border: '1px solid var(--color-border-default)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--color-text-primary)',
  fontSize: 'var(--font-size-body-sm)',
}

const formInputStyle = {
  width: '100%',
  padding: '8px 10px',
  backgroundColor: 'var(--color-surface-input)',
  border: '1px solid var(--color-border-default)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--color-text-primary)',
  fontSize: 'var(--font-size-body-sm)',
}
