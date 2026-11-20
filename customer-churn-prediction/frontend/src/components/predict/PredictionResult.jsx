import React from 'react'
import {
  Sparkles,
  AlertOctagon,
  ShieldCheck,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Compass,
  CheckCircle2,
  Clock,
  Cpu,
} from 'lucide-react'
import RiskBadge from '../common/RiskBadge'

function computeKeyDrivers(formData) {
  if (!formData) return { positiveDrivers: [], negativeDrivers: [] }
  const drivers = []

  if (formData.Contract === 'Two year') {
    drivers.push({ name: 'Two-year contract', impact: -1.4125, type: 'retention' })
  } else if (formData.Contract === 'One year') {
    drivers.push({ name: 'One-year contract', impact: -0.7153, type: 'retention' })
  } else if (formData.Contract === 'Month-to-month') {
    drivers.push({ name: 'Month-to-month contract', impact: 0.715, type: 'churn' })
  }

  if (formData.InternetService === 'Fiber optic') {
    drivers.push({ name: 'Fiber optic service tier', impact: 1.2224, type: 'churn' })
  } else if (formData.InternetService === 'No') {
    drivers.push({ name: 'No internet service', impact: -0.183, type: 'retention' })
  }

  if (formData.PaymentMethod === 'Electronic check') {
    drivers.push({ name: 'Electronic check payment', impact: 0.4025, type: 'churn' })
  } else if (
    formData.PaymentMethod === 'Credit card (automatic)' ||
    formData.PaymentMethod === 'Bank transfer (automatic)'
  ) {
    drivers.push({ name: 'Automated payment method', impact: -0.25, type: 'retention' })
  }

  if (Number(formData.tenure) >= 48) {
    drivers.push({ name: `Long loyalty tenure (${formData.tenure} mos)`, impact: -1.156, type: 'retention' })
  } else if (Number(formData.tenure) <= 6) {
    drivers.push({ name: `Early tenure stage (${formData.tenure} mos)`, impact: 0.85, type: 'churn' })
  }

  if (formData.OnlineSecurity === 'Yes') {
    drivers.push({ name: 'Active Online Security', impact: -0.3349, type: 'retention' })
  }
  if (formData.TechSupport === 'Yes') {
    drivers.push({ name: 'Premium Tech Support', impact: -0.2686, type: 'retention' })
  }
  if (formData.StreamingMovies === 'Yes') {
    drivers.push({ name: 'Streaming Movies user', impact: 0.4206, type: 'churn' })
  }
  if (formData.PaperlessBilling === 'Yes') {
    drivers.push({ name: 'Paperless billing enabled', impact: 0.3364, type: 'churn' })
  }

  const positiveDrivers = drivers
    .filter((d) => d.type === 'churn')
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 3)

  const negativeDrivers = drivers
    .filter((d) => d.type === 'retention')
    .sort((a, b) => a.impact - b.impact)
    .slice(0, 3)

  return { positiveDrivers, negativeDrivers }
}

export default function PredictionResult({
  result = null,
  formData = null,
  onReset = () => {},
}) {
  if (!result) {
    return (
      <div
        className="card prediction-awaiting-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-12) var(--space-6)',
          textAlign: 'center',
          minHeight: '480px',
          border: '1px dashed var(--color-border-default)',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-surface-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 'var(--space-4)',
          }}
        >
          <Sparkles size={32} style={{ color: 'var(--color-kiwi)' }} />
        </div>
        <h3 style={{ fontSize: 'var(--font-size-h2)', marginBottom: '8px' }}>Awaiting Parameters</h3>
        <p style={{ maxWidth: '380px', fontSize: 'var(--font-size-body)', color: 'var(--color-text-secondary)', margin: 0 }}>
          Adjust the 19 subscriber features on the left or select a sample preset, then click <strong>Execute Real-Time Prediction</strong> to evaluate churn risk.
        </p>
      </div>
    )
  }

  // Derive risk level if missing (e.g. from Python direct API)
  const probability = Number(result.churn_probability || 0)
  const percentage = Math.round(probability * 1000) / 10
  const riskLevel =
    result.risk_level ||
    (probability >= 0.7 ? 'HIGH' : probability >= 0.4 ? 'MEDIUM' : 'LOW')
  const willChurn = result.churn_prediction === 'Yes' || probability >= 0.5

  const riskColor =
    riskLevel === 'HIGH'
      ? 'var(--color-risk-high)'
      : riskLevel === 'MEDIUM'
      ? 'var(--color-risk-medium)'
      : 'var(--color-kiwi)'

  // Compute key contributing drivers from real model weights
  const { positiveDrivers, negativeDrivers } = computeKeyDrivers(formData)

  return (
    <div
      className="card prediction-result-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-5)',
        padding: 'var(--space-5)',
      }}
      aria-live="polite"
      role="region"
      aria-label="Churn Prediction Outcome"
    >
      {/* Result Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
          paddingBottom: 'var(--space-3)',
          borderBottom: '1px solid var(--color-border-subtle)',
        }}
      >
        <div>
          <span className="eyebrow">Inference Assessment</span>
          <h2 style={{ fontSize: 'var(--font-size-h2)', margin: 0 }}>Prediction Analysis</h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {RiskBadge ? (
            <RiskBadge level={riskLevel} size="md" />
          ) : (
            <span className={`badge badge-risk-${riskLevel.toLowerCase()}`}>{riskLevel} RISK</span>
          )}

          <button
            type="button"
            className="btn-secondary"
            onClick={onReset}
            style={{ fontSize: 'var(--font-size-micro)', padding: '4px 8px' }}
            aria-label="Clear result and start new prediction"
          >
            <RotateCcw size={12} /> New Prediction
          </button>
        </div>
      </div>

      {/* Probability Gauge & Zone Meter */}
      <div
        style={{
          padding: 'var(--space-5)',
          backgroundColor: 'var(--color-surface-subtle)',
          borderRadius: 'var(--radius-lg)',
          border: `1px solid ${
            riskLevel === 'HIGH'
              ? 'var(--color-risk-high-border)'
              : riskLevel === 'MEDIUM'
              ? 'var(--color-risk-medium-border)'
              : 'var(--color-kiwi-border)'
          }`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
            Estimated Churn Probability
          </span>
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-text-tertiary)',
            }}
          >
            Model Threshold: 50.0%
          </span>
        </div>

        {/* Big Tabular KPI Score */}
        <div style={{ margin: 'var(--space-2) 0 var(--space-4) 0' }}>
          <span
            className="font-tabular"
            style={{
              fontSize: '3.25rem',
              fontWeight: 700,
              lineHeight: 1,
              color: riskColor,
            }}
          >
            {percentage.toFixed(1)}%
          </span>
        </div>

        {/* Calibrated Zone Meter (0 - 100%) */}
        <div>
          {/* Calibrated Threshold Labels */}
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
            <span>0% (Low Risk)</span>
            <span style={{ color: 'var(--color-kiwi)' }}>40%</span>
            <span style={{ color: 'var(--color-risk-medium)' }}>70%</span>
            <span>100% (High Risk)</span>
          </div>

          {/* Meter Track Container with 3 Risk Zones */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '10px',
              backgroundColor: 'var(--color-surface-elevated)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
              display: 'flex',
            }}
          >
            {/* Low Zone: 0 - 40% */}
            <div style={{ width: '40%', height: '100%', backgroundColor: 'rgba(137, 233, 1, 0.25)' }} />
            {/* Medium Zone: 40 - 70% */}
            <div style={{ width: '30%', height: '100%', backgroundColor: 'rgba(255, 190, 85, 0.25)' }} />
            {/* High Zone: 70 - 100% */}
            <div style={{ width: '30%', height: '100%', backgroundColor: 'rgba(255, 98, 98, 0.25)' }} />

            {/* Active Fill Bar */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                width: `${Math.min(100, Math.max(0, percentage))}%`,
                backgroundColor: riskColor,
                borderRadius: 'var(--radius-full)',
                transition: 'width var(--transition-slow)',
                boxShadow: `0 0 12px ${riskColor}`,
              }}
            />
          </div>
        </div>

        {/* Model Classification Result Pill */}
        <div
          style={{
            marginTop: 'var(--space-4)',
            paddingTop: 'var(--space-3)',
            borderTop: '1px solid var(--color-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {willChurn ? (
              <AlertOctagon size={18} style={{ color: 'var(--color-risk-high)' }} />
            ) : (
              <ShieldCheck size={18} style={{ color: 'var(--color-kiwi)' }} />
            )}
            <span style={{ fontWeight: 600, fontSize: 'var(--font-size-body-sm)' }}>
              Binary Classification:
            </span>
            <span
              style={{
                fontWeight: 700,
                color: willChurn ? 'var(--color-risk-high)' : 'var(--color-kiwi)',
              }}
            >
              {willChurn ? 'PREDICTED TO CHURN' : 'PREDICTED TO STAY (RETAINED)'}
            </span>
          </div>

          {result.id && (
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-tertiary)' }}>
              Inference #{result.id}
            </span>
          )}
        </div>
      </div>

      {/* Key Contributing Drivers (Grounded in Verified Model Weights) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-3)',
        }}
      >
        {/* Top Churn Drivers */}
        <div
          className="card"
          style={{
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: 'var(--color-surface-subtle)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <TrendingUp size={14} style={{ color: 'var(--color-risk-high)' }} />
            <span style={{ fontSize: 'var(--font-size-micro)', fontWeight: 600, color: 'var(--color-risk-high)', textTransform: 'uppercase' }}>
              Top Churn Drivers (Risk Factors)
            </span>
          </div>
          {positiveDrivers.length === 0 ? (
            <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-tertiary)' }}>No strong churn accelerants detected.</span>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {positiveDrivers.map((driver, idx) => (
                <li
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: 'var(--font-size-micro)',
                  }}
                >
                  <span style={{ color: 'var(--color-text-primary)' }}>{driver.name}</span>
                  <span className="font-tabular" style={{ color: 'var(--color-risk-high)', fontWeight: 600 }}>
                    +{driver.impact.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Top Retention Drivers */}
        <div
          className="card"
          style={{
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: 'var(--color-surface-subtle)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <TrendingDown size={14} style={{ color: 'var(--color-kiwi)' }} />
            <span style={{ fontSize: 'var(--font-size-micro)', fontWeight: 600, color: 'var(--color-kiwi)', textTransform: 'uppercase' }}>
              Top Retention Drivers (Protective)
            </span>
          </div>
          {negativeDrivers.length === 0 ? (
            <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-tertiary)' }}>No strong protective stabilizers detected.</span>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {negativeDrivers.map((driver, idx) => (
                <li
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: 'var(--font-size-micro)',
                  }}
                >
                  <span style={{ color: 'var(--color-text-primary)' }}>{driver.name}</span>
                  <span className="font-tabular" style={{ color: 'var(--color-kiwi)', fontWeight: 600 }}>
                    {driver.impact.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recommended Retention Playbook */}
      <div
        className="card"
        style={{
          padding: 'var(--space-4)',
          backgroundColor: 'var(--color-surface-subtle)',
          borderLeft: `4px solid ${riskColor}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Compass size={16} style={{ color: 'var(--color-kiwi)' }} />
          <h4 style={{ fontSize: 'var(--font-size-body-sm)', margin: 0, color: 'var(--color-text-primary)' }}>
            Retention Action Playbook — {riskLevel} RISK PROTOCOL
          </h4>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {riskLevel === 'HIGH' ? (
            <>
              <div style={{ display: 'flex', gap: '8px', fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--color-risk-high)', flexShrink: 0, marginTop: '2px' }} />
                <span><strong>Contract Extension Discount:</strong> Offer an immediate 1-year contract migration with a $15/month fee freeze.</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--color-risk-high)', flexShrink: 0, marginTop: '2px' }} />
                <span><strong>Service Upgrade:</strong> Include complimentary Online Security and Tech Support suite for 6 months.</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--color-risk-high)', flexShrink: 0, marginTop: '2px' }} />
                <span><strong>CSM Outreach:</strong> Escalate account to high-priority customer success queue within 24 hours.</span>
              </div>
            </>
          ) : riskLevel === 'MEDIUM' ? (
            <>
              <div style={{ display: 'flex', gap: '8px', fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--color-risk-medium)', flexShrink: 0, marginTop: '2px' }} />
                <span><strong>Billing Migration Incentive:</strong> Grant a $10 one-time credit to convert from Electronic Check to Automatic Credit Card.</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--color-risk-medium)', flexShrink: 0, marginTop: '2px' }} />
                <span><strong>Engagement Nurture:</strong> Dispatch targeted product satisfaction survey and feature tips.</span>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', gap: '8px', fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--color-kiwi)', flexShrink: 0, marginTop: '2px' }} />
                <span><strong>Account in Good Standing:</strong> High loyalty profile. Eligible for premium entertainment add-on bundles.</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--color-kiwi)', flexShrink: 0, marginTop: '2px' }} />
                <span><strong>Referral Advocacy:</strong> Invite subscriber into the VIP referral program ($25 credit per referral).</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Telemetry Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: 'var(--color-text-tertiary)',
          fontFamily: 'var(--font-mono)',
          paddingTop: 'var(--space-2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Cpu size={12} />
          <span>
            {result.is_offline_simulation || result.isFallback
              ? 'Local Model Weights Evaluator (Offline Fallback)'
              : 'Spring Boot Gateway (POST /api/v1/predict)'}
          </span>
        </div>

        {result.predicted_at && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} />
            <span>{new Date(result.predicted_at).toLocaleTimeString()}</span>
          </div>
        )}
      </div>
    </div>
  )
}
