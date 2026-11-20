import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  CreditCard,
  Wifi,
  Phone,
  Server,
  User,
  Compass,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  ExternalLink,
  Check,
  Minus,
  RefreshCw,
  Inbox,
} from 'lucide-react'

// Reusable UI Components
import MetricCard from '../components/common/MetricCard'
import RiskBadge from '../components/common/RiskBadge'
import {
  LoadingSkeleton,
  ErrorBanner,
  EmptyState,
  SuccessBanner,
} from '../components/common/StateIndicators'

// Services
import { getCustomerById } from '../services/customerService'
import { predictChurn } from '../services/api'

export default function CustomerDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isScoring, setIsScoring] = useState(false)
  const [scoreSuccess, setScoreSuccess] = useState(null)
  const [scoreError, setScoreError] = useState(null)
  const [outreachLogged, setOutreachLogged] = useState(false)

  // 1. Fetch & Enrich Customer on Route Change
  useEffect(() => {
    setLoading(true)
    setScoreSuccess(null)
    setScoreError(null)
    setOutreachLogged(false)

    try {
      const data = getCustomerById(id)
      setCustomer(data)
    } catch (err) {
      console.error('Error fetching customer record:', err)
      setCustomer(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  // 2. Interactive Quick CTA: Live Re-Score against ML Model / Backend
  const handleRunPrediction = async () => {
    if (!customer) return
    setIsScoring(true)
    setScoreError(null)
    setScoreSuccess(null)

    try {
      const result = await predictChurn(customer)
      if (result) {
        setCustomer((prev) => ({
          ...prev,
          predictedProbability: result.churn_probability,
          churnProbability: result.churn_probability,
          predictedChurn: result.churn_prediction,
          riskLevel: result.risk_level,
          lastInferenceId: result.id,
          lastScoredAt: result.predicted_at || new Date().toISOString(),
          isFallbackScore: result.isFallback || result.offline,
        }))
        setScoreSuccess(
          `Inference evaluated successfully: ${(result.churn_probability * 100).toFixed(1)}% churn risk (${result.risk_level})`
        )
      }
    } catch (err) {
      setScoreError(err.message || 'Failed to execute model prediction.')
    } finally {
      setIsScoring(false)
    }
  }

  // 3. Loading State Skeleton
  if (loading) {
    return (
      <div className="page-container" aria-busy="true">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <LoadingSkeleton height="32px" width="240px" />
          <LoadingSkeleton height="48px" width="400px" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
            <LoadingSkeleton variant="card" height="110px" count={5} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)', marginTop: 'var(--space-4)' }}>
            <LoadingSkeleton variant="card" height="420px" />
            <LoadingSkeleton variant="card" height="420px" />
          </div>
        </div>
      </div>
    )
  }

  // 4. Accessible Empty State: Customer Not Found
  if (!customer) {
    return (
      <div className="page-container">
        <EmptyState
          icon={Inbox}
          title={`Customer Not Found: #${id || 'UNKNOWN'}`}
          description="The requested subscriber profile does not exist in the 7,043 record dataset. Please verify the customer ID or return to the directory."
          actionLabel="← Return to Customer Directory"
          onAction={() => navigate('/customers')}
          secondaryActionLabel="Open Churn Predictor"
          onSecondaryAction={() => navigate('/predict')}
        />
      </div>
    )
  }

  // Computed helper variables
  const probability = Number(customer.predictedProbability ?? customer.churnProbability ?? 0)
  const probabilityPct = (probability * 100).toFixed(1)
  const riskTier = String(customer.riskLevel || 'UNKNOWN').toUpperCase()
  const isActualChurn = customer.actualChurn === 'Yes' || customer.Churn === 'Yes'
  const isPredictedChurn = customer.predictedChurn === 'Yes' || probability >= 0.5

  const riskColor =
    riskTier === 'HIGH'
      ? 'var(--color-risk-high)'
      : riskTier === 'MEDIUM'
      ? 'var(--color-risk-medium)'
      : 'var(--color-kiwi)'

  // Tenure lifecycle tier
  const tenureText =
    customer.tenure <= 6
      ? 'New Subscriber (<6m)'
      : customer.tenure <= 24
      ? 'Adoption Phase'
      : customer.tenure <= 48
      ? 'Established'
      : 'Long-term Loyal (>4y)'

  // Estimated LTV / Revenue at Risk
  const isHighOrMedRisk = riskTier === 'HIGH' || riskTier === 'MEDIUM'
  const annualizedRevenueAtRisk = (Number(customer.MonthlyCharges || 0) * 12).toFixed(2)
  const estimated24mLtv = (
    Number(customer.TotalCharges || 0) +
    Number(customer.MonthlyCharges || 0) * 24
  ).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="page-container">
      <style>{`
        .customer-detail-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.8fr) minmax(0, 1.2fr);
          gap: var(--space-6);
          align-items: start;
        }
        @media (max-width: 960px) {
          .customer-detail-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* =========================================================================
          1. SEMANTIC PAGE HEADER BAR
          ========================================================================= */}
      <header className="page-header" role="region" aria-label="Customer Profile Header">
        <div style={{ marginBottom: 'var(--space-2)' }}>
          <Link
            to="/customers"
            className="btn-ghost"
            style={{
              padding: 0,
              color: 'var(--color-text-secondary)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: 'var(--font-size-body-sm)',
            }}
          >
            <ArrowLeft size={16} /> Back to Directory
          </Link>
        </div>

        <div className="page-header-top" style={{ flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div className="page-header-title-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <span className="eyebrow">Customer Risk Intelligence</span>
              {/* Ground Truth Status Badge */}
              <span
                className={`badge ${isActualChurn ? 'badge-risk-high' : 'badge-risk-low'}`}
                title="Ground-truth status recorded in telco_churn.csv dataset"
              >
                {isActualChurn ? 'CHURNED (GROUND TRUTH)' : 'ACTIVE SUBSCRIBER'}
              </span>
              {/* Risk Badge with Score */}
              <RiskBadge level={riskTier} score={probability} size="md" />
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--font-size-display-2)',
                marginTop: 'var(--space-1)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              Account <span style={{ color: 'var(--color-kiwi)' }}>#{customer.customerID}</span>
            </h1>

            <p className="page-header-description" style={{ maxWidth: '780px', margin: 0 }}>
              Subscriber profile, active service matrix, contract stability metrics, and side-by-side
              comparison of ML hazard score vs actual ground truth churn status.
            </p>
          </div>

          {/* Quick CTA Actions */}
          <div className="page-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={handleRunPrediction}
              disabled={isScoring}
              aria-label="Run real-time ML prediction on this customer"
            >
              {isScoring ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
              <span>{isScoring ? 'Evaluating Model...' : 'Run Prediction on Customer'}</span>
            </button>

            <Link
              to="/predict"
              state={{ customer, prefill: customer }}
              className="btn-secondary"
              title="Open full parameters in Churn Prediction Playground"
            >
              <ExternalLink size={16} />
              <span>Predict Sandbox</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Operation Feedback Notifications */}
      {scoreSuccess && (
        <SuccessBanner
          title="Model Prediction Complete"
          message={scoreSuccess}
          onDismiss={() => setScoreSuccess(null)}
        />
      )}
      {scoreError && (
        <ErrorBanner
          title="Inference Error"
          message={scoreError}
          onRetry={handleRunPrediction}
          onDismiss={() => setScoreError(null)}
          dismissible
        />
      )}
      {outreachLogged && (
        <SuccessBanner
          title="Retention Action Logged"
          message={`Prescriptive intervention protocol for Account #${customer.customerID} dispatched to customer success queue.`}
          onDismiss={() => setOutreachLogged(false)}
        />
      )}

      {/* =========================================================================
          2. TOP KPI RIBBON (5 Metric Cards)
          ========================================================================= */}
      <section
        aria-label="Key Subscriber Metrics"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        {/* Metric 1: Tenure */}
        <MetricCard
          label="Tenure"
          value={`${customer.tenure} mos`}
          subtext={tenureText}
          icon={Calendar}
          variant={customer.tenure <= 6 ? 'high-risk' : customer.tenure >= 36 ? 'kiwi' : 'default'}
        />

        {/* Metric 2: Contract Agreement */}
        <MetricCard
          label="Contract Type"
          value={customer.Contract}
          subtext={
            customer.Contract === 'Month-to-month'
              ? 'High hazard (no lock-in)'
              : customer.Contract === 'Two year'
              ? 'Long-term anchor'
              : 'Annual commitment'
          }
          icon={FileText}
          variant={
            customer.Contract === 'Month-to-month'
              ? 'high-risk'
              : customer.Contract === 'Two year'
              ? 'kiwi'
              : 'default'
          }
        />

        {/* Metric 3: Monthly Charges */}
        <MetricCard
          label="Monthly Charges"
          value={`$${Number(customer.MonthlyCharges || 0).toFixed(2)}`}
          subtext={
            customer.MonthlyCharges >= 64.76
              ? `+$${(customer.MonthlyCharges - 64.76).toFixed(2)} vs cohort avg`
              : `-$${(64.76 - customer.MonthlyCharges).toFixed(2)} vs cohort avg`
          }
          icon={CreditCard}
          variant={customer.MonthlyCharges > 85 ? 'high-risk' : 'default'}
        />

        {/* Metric 4: Total Lifetime Charges */}
        <MetricCard
          label="Total Charges"
          value={`$${Number(customer.TotalCharges || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          subtext={`Avg spend ~$${
            customer.tenure > 0
              ? (customer.TotalCharges / customer.tenure).toFixed(2)
              : customer.MonthlyCharges
          }/mo`}
          icon={DollarSign}
        />

        {/* Metric 5: Estimated LTV / Revenue at Risk */}
        <MetricCard
          label={isHighOrMedRisk ? 'Revenue at Risk (12m)' : 'Estimated 24m LTV'}
          value={isHighOrMedRisk ? `$${annualizedRevenueAtRisk}` : `$${estimated24mLtv}`}
          subtext={
            isHighOrMedRisk
              ? 'Annualized MRR loss exposure'
              : 'Projected 2-year retention spend'
          }
          icon={isHighOrMedRisk ? TrendingDown : TrendingUp}
          variant={riskTier === 'HIGH' ? 'high-risk' : riskTier === 'MEDIUM' ? 'medium-risk' : 'kiwi'}
        />
      </section>

      {/* =========================================================================
          3. CORE TWO-COLUMN GRID (Left Column, Right Column)
          ========================================================================= */}
      <div className="customer-detail-grid">
        {/* =======================================================================
            LEFT COLUMN: Service Matrix & Account Billing Profile
            ======================================================================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Card 1: 3-Column Service Subscription Matrix */}
          <section className="card" aria-labelledby="service-matrix-title">
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <span className="eyebrow">Service Catalog</span>
              <h3 id="service-matrix-title" style={{ fontSize: 'var(--font-size-h2)', margin: '4px 0 2px 0' }}>
                Service Subscription Matrix
              </h3>
              <p style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
                Inventory of voice lines, broadband infrastructure tier, and security/entertainment add-ons.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 'var(--space-5)',
              }}
            >
              {/* Column 1: Phone Services */}
              <div
                style={{
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-3)' }}>
                  <Phone size={18} style={{ color: 'var(--color-kiwi)' }} />
                  <h4 style={{ fontSize: 'var(--font-size-body-sm)', margin: 0, fontWeight: 600 }}>
                    Phone Services
                  </h4>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {/* Phone Service */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--font-size-body-sm)' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Primary Line:</span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: 600,
                        color: customer.PhoneService === 'Yes' ? 'var(--color-kiwi)' : 'var(--color-text-tertiary)',
                      }}
                    >
                      {customer.PhoneService === 'Yes' ? <Check size={14} /> : <Minus size={14} />}
                      {customer.PhoneService === 'Yes' ? 'Subscribed' : 'None'}
                    </span>
                  </div>

                  {/* Multiple Lines */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--font-size-body-sm)' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Multiple Lines:</span>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: customer.MultipleLines === 'Yes' ? 'var(--color-status-info-subtle)' : 'var(--color-surface-elevated)',
                        color: customer.MultipleLines === 'Yes' ? 'var(--color-status-info)' : 'var(--color-text-secondary)',
                        border: '1px solid var(--color-border-subtle)',
                      }}
                    >
                      {customer.MultipleLines}
                    </span>
                  </div>
                </div>
              </div>

              {/* Column 2: Internet Services */}
              <div
                style={{
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-3)' }}>
                  <Wifi size={18} style={{ color: 'var(--color-kiwi)' }} />
                  <h4 style={{ fontSize: 'var(--font-size-body-sm)', margin: 0, fontWeight: 600 }}>
                    Internet & Security
                  </h4>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {/* Internet Service Line */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--font-size-body-sm)' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Service Line:</span>
                    <span
                      style={{
                        fontWeight: 600,
                        color:
                          customer.InternetService === 'Fiber optic'
                            ? 'var(--color-risk-high)'
                            : customer.InternetService === 'DSL'
                            ? 'var(--color-status-info)'
                            : 'var(--color-text-tertiary)',
                      }}
                    >
                      {customer.InternetService}
                      {customer.InternetService === 'Fiber optic' && ' ⚠'}
                    </span>
                  </div>

                  {/* Online Security Suite */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--font-size-body-sm)' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Online Security:</span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: 600,
                        color:
                          customer.OnlineSecurity === 'Yes'
                            ? 'var(--color-kiwi)'
                            : 'var(--color-risk-medium)',
                      }}
                    >
                      {customer.OnlineSecurity === 'Yes' ? (
                        <>
                          <ShieldCheck size={14} /> Active
                        </>
                      ) : (
                        <>
                          <ShieldAlert size={14} /> {customer.OnlineSecurity}
                        </>
                      )}
                    </span>
                  </div>

                  {/* Online Cloud Backup */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--font-size-body-sm)' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Online Backup:</span>
                    <span
                      style={{
                        fontWeight: 500,
                        color: customer.OnlineBackup === 'Yes' ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                      }}
                    >
                      {customer.OnlineBackup}
                    </span>
                  </div>
                </div>
              </div>

              {/* Column 3: Add-on & Entertainment Suite */}
              <div
                style={{
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-3)' }}>
                  <Server size={18} style={{ color: 'var(--color-kiwi)' }} />
                  <h4 style={{ fontSize: 'var(--font-size-body-sm)', margin: 0, fontWeight: 600 }}>
                    Support & Add-ons
                  </h4>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {/* Device Protection */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--font-size-body-sm)' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Device Protection:</span>
                    <span style={{ fontWeight: 500, color: customer.DeviceProtection === 'Yes' ? 'var(--color-kiwi)' : 'var(--color-text-tertiary)' }}>
                      {customer.DeviceProtection}
                    </span>
                  </div>

                  {/* Tech Support */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--font-size-body-sm)' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Tech Support:</span>
                    <span style={{ fontWeight: 600, color: customer.TechSupport === 'Yes' ? 'var(--color-kiwi)' : 'var(--color-text-tertiary)' }}>
                      {customer.TechSupport === 'Yes' ? 'Active Anchor' : customer.TechSupport}
                    </span>
                  </div>

                  {/* Streaming TV */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--font-size-body-sm)' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Streaming TV:</span>
                    <span style={{ fontWeight: 500, color: customer.StreamingTV === 'Yes' ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)' }}>
                      {customer.StreamingTV}
                    </span>
                  </div>

                  {/* Streaming Movies */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--font-size-body-sm)' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Streaming Movies:</span>
                    <span style={{ fontWeight: 500, color: customer.StreamingMovies === 'Yes' ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)' }}>
                      {customer.StreamingMovies}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Card 2: Account & Billing Profile */}
          <section className="card" aria-labelledby="billing-profile-title">
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <span className="eyebrow">Account Architecture</span>
              <h3 id="billing-profile-title" style={{ fontSize: 'var(--font-size-h2)', margin: '4px 0 2px 0' }}>
                Account Demographics & Invoicing Profile
              </h3>
              <p style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
                Demographic segmentation, household composition, billing method friction, and paperless enrollment.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 'var(--space-5)',
              }}
            >
              {/* Sub-panel 1: Demographics & Household */}
              <div
                style={{
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-3)' }}>
                  <User size={18} style={{ color: 'var(--color-kiwi)' }} />
                  <h4 style={{ fontSize: 'var(--font-size-body-sm)', margin: 0, fontWeight: 600 }}>
                    Demographics & Household
                  </h4>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: 'var(--font-size-body-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Senior Citizen:</span>
                    <span style={{ fontWeight: 500 }}>
                      {customer.SeniorCitizen === 1 ? 'Yes (Senior 65+)' : 'No (<65)'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Partner:</span>
                    <span style={{ fontWeight: 500 }}>{customer.Partner}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Dependents:</span>
                    <span style={{ fontWeight: 500 }}>{customer.Dependents}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Gender:</span>
                    <span style={{ fontWeight: 500 }}>{customer.gender}</span>
                  </div>
                </div>
              </div>

              {/* Sub-panel 2: Invoicing & Payment Friction */}
              <div
                style={{
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-3)' }}>
                  <CreditCard size={18} style={{ color: 'var(--color-kiwi)' }} />
                  <h4 style={{ fontSize: 'var(--font-size-body-sm)', margin: 0, fontWeight: 600 }}>
                    Billing & Payment Setup
                  </h4>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: 'var(--font-size-body-sm)' }}>
                  {/* Paperless Billing */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Paperless Billing:</span>
                    <span
                      style={{
                        fontWeight: 600,
                        color: customer.PaperlessBilling === 'Yes' ? 'var(--color-kiwi)' : 'var(--color-text-secondary)',
                      }}
                    >
                      {customer.PaperlessBilling === 'Yes' ? 'Enrolled (Electronic)' : 'Paper Statements'}
                    </span>
                  </div>

                  {/* Payment Method & Friction Note */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Payment Method:</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {customer.PaymentMethod}
                    </span>
                  </div>

                  <div
                    style={{
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: customer.PaymentMethod === 'Electronic check'
                        ? 'var(--color-risk-high-subtle)'
                        : customer.PaymentMethod.includes('automatic')
                        ? 'var(--color-kiwi-subtle)'
                        : 'var(--color-surface-elevated)',
                      border: `1px solid ${
                        customer.PaymentMethod === 'Electronic check'
                          ? 'var(--color-risk-high-border)'
                          : customer.PaymentMethod.includes('automatic')
                          ? 'var(--color-kiwi-border)'
                          : 'var(--color-border-subtle)'
                      }`,
                      fontSize: 'var(--font-size-micro)',
                      color:
                        customer.PaymentMethod === 'Electronic check'
                          ? 'var(--color-risk-high)'
                          : customer.PaymentMethod.includes('automatic')
                          ? 'var(--color-kiwi)'
                          : 'var(--color-text-secondary)',
                    }}
                  >
                    {customer.PaymentMethod === 'Electronic check'
                      ? 'High friction payment method (strongest billing churn accelerant)'
                      : customer.PaymentMethod.includes('automatic')
                      ? 'Low payment friction (automated recurring payment anchor)'
                      : 'Manual payment processing'}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* =======================================================================
            RIGHT COLUMN: Risk Intelligence & Retention Playbook
            ======================================================================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Section 1: Churn Risk & Retention Intelligence Card */}
          <section
            className="card"
            style={{ borderLeft: `4px solid ${riskColor}` }}
            aria-labelledby="risk-intelligence-title"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
              <div>
                <span className="eyebrow">Model Inference</span>
                <h3 id="risk-intelligence-title" style={{ fontSize: 'var(--font-size-h2)', margin: 0 }}>
                  Churn Risk Assessment
                </h3>
              </div>
              <RiskBadge level={riskTier} size="md" />
            </div>

            {/* Probability Gauge & Zone Meter */}
            <div
              style={{
                padding: 'var(--space-4)',
                backgroundColor: 'var(--color-surface-subtle)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-4)',
                border: '1px solid var(--color-border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)' }}>
                  Estimated Churn Probability
                </span>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-tertiary)' }}>
                  Threshold: 50.0%
                </span>
              </div>

              <div style={{ margin: 'var(--space-2) 0' }}>
                <span
                  className="font-tabular"
                  style={{
                    fontSize: '2.75rem',
                    fontWeight: 700,
                    lineHeight: 1,
                    color: riskColor,
                  }}
                >
                  {probabilityPct}%
                </span>
              </div>

              {/* Calibrated 3-Zone Risk Meter (0 - 40% Low, 40 - 70% Med, 70 - 100% High) */}
              <div style={{ marginTop: 'var(--space-3)' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-text-tertiary)',
                    marginBottom: '4px',
                  }}
                >
                  <span>0% (Low)</span>
                  <span style={{ color: 'var(--color-kiwi)' }}>40%</span>
                  <span style={{ color: 'var(--color-risk-medium)' }}>70%</span>
                  <span>100% (High)</span>
                </div>

                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '8px',
                    backgroundColor: 'var(--color-surface-elevated)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden',
                    display: 'flex',
                  }}
                >
                  <div style={{ width: '40%', height: '100%', backgroundColor: 'rgba(137, 233, 1, 0.25)' }} />
                  <div style={{ width: '30%', height: '100%', backgroundColor: 'rgba(255, 190, 85, 0.25)' }} />
                  <div style={{ width: '30%', height: '100%', backgroundColor: 'rgba(255, 98, 98, 0.25)' }} />
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: 0,
                      width: `${Math.min(100, Math.max(0, probability * 100))}%`,
                      backgroundColor: riskColor,
                      boxShadow: `0 0 10px ${riskColor}`,
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.4s ease-in-out',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Side-by-Side: ML Prediction vs Ground Truth Status */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-4)',
              }}
            >
              {/* Predicted State */}
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <span className="eyebrow" style={{ fontSize: '10px' }}>Model Classification</span>
                <div style={{ marginTop: '4px', fontWeight: 700, fontSize: 'var(--font-size-body-sm)', color: isPredictedChurn ? 'var(--color-risk-high)' : 'var(--color-kiwi)' }}>
                  {isPredictedChurn ? 'CHURN RISK' : 'RETAINED'}
                </div>
              </div>

              {/* Ground Truth State */}
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <span className="eyebrow" style={{ fontSize: '10px' }}>Actual Ground Truth</span>
                <div style={{ marginTop: '4px', fontWeight: 700, fontSize: 'var(--font-size-body-sm)', color: isActualChurn ? 'var(--color-risk-high)' : 'var(--color-kiwi)' }}>
                  {isActualChurn ? 'CHURNED' : 'ACTIVE'}
                </div>
              </div>
            </div>

            {/* Model Confusion Analysis Note */}
            <div
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-surface-subtle)',
                fontSize: 'var(--font-size-micro)',
                color: 'var(--color-text-secondary)',
                marginBottom: 'var(--space-4)',
              }}
            >
              {isPredictedChurn && isActualChurn
                ? 'True Positive: Model accurately flagged high churn hazard matching actual termination.'
                : !isPredictedChurn && !isActualChurn
                ? 'True Negative: Model confirmed subscriber loyalty stability matching active retention.'
                : isPredictedChurn && !isActualChurn
                ? 'Retained Defier (False Positive): Subscriber active despite model churn indicators — ideal high-value retention study.'
                : 'Silent Churn (False Negative): Terminated without strong upfront risk triggers.'}
            </div>

            {/* Top Risk Drivers & Retention Anchors */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {/* Churn Accelerants */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <TrendingUp size={14} style={{ color: 'var(--color-risk-high)' }} />
                  <span style={{ fontSize: 'var(--font-size-micro)', fontWeight: 600, color: 'var(--color-risk-high)', textTransform: 'uppercase' }}>
                    Top Churn Accelerants
                  </span>
                </div>
                {customer.riskDrivers && customer.riskDrivers.length > 0 ? (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {customer.riskDrivers.map((driver, idx) => (
                      <li
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 'var(--font-size-micro)',
                          color: 'var(--color-text-primary)',
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-surface-subtle)',
                        }}
                      >
                        <span>{driver.name}</span>
                        <span style={{ color: 'var(--color-risk-high)', fontWeight: 600 }}>{driver.impact}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-tertiary)' }}>
                    No critical churn hazard drivers identified.
                  </span>
                )}
              </div>

              {/* Retention Anchors */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <TrendingDown size={14} style={{ color: 'var(--color-kiwi)' }} />
                  <span style={{ fontSize: 'var(--font-size-micro)', fontWeight: 600, color: 'var(--color-kiwi)', textTransform: 'uppercase' }}>
                    Top Retention Anchors
                  </span>
                </div>
                {customer.retentionAnchors && customer.retentionAnchors.length > 0 ? (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {customer.retentionAnchors.map((anchor, idx) => (
                      <li
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 'var(--font-size-micro)',
                          color: 'var(--color-text-primary)',
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-surface-subtle)',
                        }}
                      >
                        <span>{anchor.name}</span>
                        <span style={{ color: 'var(--color-kiwi)', fontWeight: 600 }}>{anchor.impact}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-tertiary)' }}>
                    No protective retention anchors present.
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* Section 2: Prescriptive Retention Playbook */}
          <section
            className="card"
            style={{
              borderLeft: `4px solid ${riskColor}`,
              backgroundColor: 'var(--color-surface-subtle)',
            }}
            aria-labelledby="retention-playbook-title"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-3)' }}>
              <Compass size={18} style={{ color: 'var(--color-kiwi)' }} />
              <div>
                <span className="eyebrow">Action Guidance</span>
                <h4 id="retention-playbook-title" style={{ fontSize: 'var(--font-size-body-sm)', margin: 0, color: 'var(--color-text-primary)' }}>
                  Retention Playbook — {riskTier} Protocol
                </h4>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              {riskTier === 'HIGH' ? (
                <>
                  <div style={{ display: 'flex', gap: '8px', fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)' }}>
                    <CheckCircle2 size={16} style={{ color: 'var(--color-risk-high)', flexShrink: 0, marginTop: '2px' }} />
                    <span><strong>1-Year Agreement Migration:</strong> Offer an immediate $15/month fee discount upon converting to a 12-month contract lock-in.</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)' }}>
                    <CheckCircle2 size={16} style={{ color: 'var(--color-risk-high)', flexShrink: 0, marginTop: '2px' }} />
                    <span><strong>Security & Support Bundle:</strong> Activate complimentary Online Security and Tech Support for 6 months.</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)' }}>
                    <CheckCircle2 size={16} style={{ color: 'var(--color-risk-high)', flexShrink: 0, marginTop: '2px' }} />
                    <span><strong>Auto-Pay Enrollment:</strong> Grant a $10 one-time credit to transition off Electronic Check.</span>
                  </div>
                </>
              ) : riskTier === 'MEDIUM' ? (
                <>
                  <div style={{ display: 'flex', gap: '8px', fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)' }}>
                    <CheckCircle2 size={16} style={{ color: 'var(--color-risk-medium)', flexShrink: 0, marginTop: '2px' }} />
                    <span><strong>Billing Friction Elimination:</strong> Offer a $10 credit to set up Automatic Credit Card billing.</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)' }}>
                    <CheckCircle2 size={16} style={{ color: 'var(--color-risk-medium)', flexShrink: 0, marginTop: '2px' }} />
                    <span><strong>Feature Optimization Check-in:</strong> Automated outreach guide to ensure broadband speed satisfaction.</span>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: '8px', fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)' }}>
                    <CheckCircle2 size={16} style={{ color: 'var(--color-kiwi)', flexShrink: 0, marginTop: '2px' }} />
                    <span><strong>Loyal Advocacy Program:</strong> Invite subscriber to VIP referral advocacy ($25 credit per friend).</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)' }}>
                    <CheckCircle2 size={16} style={{ color: 'var(--color-kiwi)', flexShrink: 0, marginTop: '2px' }} />
                    <span><strong>Entertainment Add-on Bundle:</strong> Curated streaming add-on discount with first month free.</span>
                  </div>
                </>
              )}
            </div>

            {/* Playbook Action Triggers */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setOutreachLogged(true)}
                style={{ width: '100%', fontSize: 'var(--font-size-body-sm)' }}
              >
                <CheckCircle2 size={16} /> Log Intervention Outreach
              </button>

              <Link
                to="/predict"
                state={{ customer, prefill: customer }}
                className="btn-secondary"
                style={{ width: '100%', fontSize: 'var(--font-size-body-sm)' }}
              >
                <ExternalLink size={16} /> Experiment with Parameters
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
