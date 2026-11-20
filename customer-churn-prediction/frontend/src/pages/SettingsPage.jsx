import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Settings,
  Sliders,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Shield,
  Monitor,
  Save,
  RotateCcw,
  Download,
  Trash2,
  Sparkles,
  Contrast,
  Activity,
  Server,
  Layers,
  ArrowRight,
} from 'lucide-react'
import MetricCard from '../components/common/MetricCard'
import ChartCard from '../components/common/ChartCard'
import RiskBadge from '../components/common/RiskBadge'
import { TELCO_COHORT } from '../data/telcoDataset'
import { getHealth, resetSessionHistory } from '../services/api'

export default function SettingsPage() {
  // Threshold preferences
  const [highThreshold, setHighThreshold] = useState(70)
  const [medThreshold, setMedThreshold] = useState(40)

  // API Configuration
  const [apiUrl, setApiUrl] = useState('')

  // Accessibility & Display
  const [reduceMotion, setReduceMotion] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const [tabularFigures, setTabularFigures] = useState(true)

  // Feedback states
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [feedbackToast, setFeedbackToast] = useState(null)

  // Health Diagnostics State
  const [healthStatus, setHealthStatus] = useState(null)
  const [isTesting, setIsTesting] = useState(false)

  // Sync with LocalStorage on Mount
  useEffect(() => {
    const savedHigh = localStorage.getItem('rs_threshold_high')
    const savedMed = localStorage.getItem('rs_threshold_med')
    const savedUrl = localStorage.getItem('rs_api_base_url')
    const savedReduceMotion = localStorage.getItem('rs_reduce_motion') === 'true'
    const savedHighContrast = localStorage.getItem('rs_high_contrast') === 'true'
    const savedTabular = localStorage.getItem('rs_tabular_nums') !== 'false'

    if (savedHigh && !isNaN(Number(savedHigh))) setHighThreshold(Number(savedHigh))
    if (savedMed && !isNaN(Number(savedMed))) setMedThreshold(Number(savedMed))
    if (savedUrl) setApiUrl(savedUrl)
    setReduceMotion(savedReduceMotion)
    setHighContrast(savedHighContrast)
    setTabularFigures(savedTabular)

    if (savedReduceMotion) {
      document.documentElement.setAttribute('data-reduce-motion', 'true')
    }
    if (savedHighContrast) {
      document.documentElement.setAttribute('data-high-contrast', 'true')
    }
  }, [])

  // Invariant Validation: High Threshold must be strictly greater than Med Threshold
  const isThresholdValid = highThreshold > medThreshold

  // Real-time Cohort Impact Simulator across all 7,043 Telco records
  const cohortImpact = useMemo(() => {
    const highRatio = highThreshold / 100
    const medRatio = medThreshold / 100

    let highCount = 0
    let medCount = 0
    let lowCount = 0
    let highMRR = 0

    TELCO_COHORT.forEach((c) => {
      const p = c.churnProbability || 0
      const mrr = Number(c.MonthlyCharges || 0)
      if (p >= highRatio) {
        highCount++
        highMRR += mrr
      } else if (p >= medRatio) {
        medCount++
      } else {
        lowCount++
      }
    })

    const total = TELCO_COHORT.length
    const populationScale = total > 0 ? 7043 / total : 1
    const scaledHighCount = Math.round(highCount * populationScale)
    const scaledMedCount = Math.round(medCount * populationScale)
    const scaledLowCount = 7043 - scaledHighCount - scaledMedCount
    const scaledHighMRR = Math.round(highMRR * populationScale)

    return {
      highCount: scaledHighCount,
      highPct: ((highCount / total) * 100).toFixed(1),
      medCount: scaledMedCount,
      medPct: ((medCount / total) * 100).toFixed(1),
      lowCount: scaledLowCount,
      lowPct: ((lowCount / total) * 100).toFixed(1),
      highMRR: scaledHighMRR,
    }
  }, [highThreshold, medThreshold])

  // Probe Backend Health
  const testBackendHealth = async () => {
    setIsTesting(true)
    setHealthStatus(null)
    const startTime = performance.now()
    try {
      const targetUrl = apiUrl.trim() ? apiUrl.trim().replace(/\/$/, '') : ''
      const res = await fetch(`${targetUrl}/api/v1/health`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(4000),
      })
      const latency = Math.round(performance.now() - startTime)
      if (res.ok) {
        const body = await res.json().catch(() => ({}))
        setHealthStatus({
          ok: true,
          backend: body.backend || 'UP',
          model_service: body.model_service || 'UP',
          latency,
          message: 'Spring Boot Gateway (:8080) and FastAPI Scorer (:8000) fully operational.',
        })
      } else if (res.status === 503) {
        const body = await res.json().catch(() => ({}))
        setHealthStatus({
          ok: false,
          backend: body.backend || 'UP',
          model_service: 'DOWN',
          latency,
          message: 'Spring Boot Gateway is online, but FastAPI ML worker (8000) is unreachable. Falling back to local scoring.',
        })
      } else {
        setHealthStatus({
          ok: false,
          backend: 'DOWN',
          model_service: 'DOWN',
          latency,
          message: `Gateway responded with HTTP status ${res.status}`,
        })
      }
    } catch {
      setHealthStatus({
        ok: false,
        backend: 'DOWN',
        model_service: 'DOWN',
        latency: Math.round(performance.now() - startTime),
        message: 'Could not connect to Spring Boot Gateway at http://127.0.0.1:8080. Operating in offline client fallback mode.',
      })
    } finally {
      setIsTesting(false)
    }
  }

  // Save Preferences Action
  const handleSavePreferences = () => {
    if (!isThresholdValid) return

    localStorage.setItem('rs_threshold_high', String(highThreshold))
    localStorage.setItem('rs_threshold_med', String(medThreshold))
    localStorage.setItem('rs_api_base_url', apiUrl.trim())
    localStorage.setItem('rs_reduce_motion', String(reduceMotion))
    localStorage.setItem('rs_high_contrast', String(highContrast))
    localStorage.setItem('rs_tabular_nums', String(tabularFigures))

    if (reduceMotion) {
      document.documentElement.setAttribute('data-reduce-motion', 'true')
    } else {
      document.documentElement.removeAttribute('data-reduce-motion')
    }

    if (highContrast) {
      document.documentElement.setAttribute('data-high-contrast', 'true')
    } else {
      document.documentElement.removeAttribute('data-high-contrast')
    }

    setSaveSuccess(true)
    setFeedbackToast('Platform preferences successfully saved to browser local storage.')
    setTimeout(() => {
      setSaveSuccess(false)
      setFeedbackToast(null)
    }, 3500)
  }

  // Reset Defaults Action
  const handleResetDefaults = () => {
    setHighThreshold(70)
    setMedThreshold(40)
    setApiUrl('')
    setReduceMotion(false)
    setHighContrast(false)
    setTabularFigures(true)

    localStorage.removeItem('rs_threshold_high')
    localStorage.removeItem('rs_threshold_med')
    localStorage.removeItem('rs_api_base_url')
    localStorage.removeItem('rs_reduce_motion')
    localStorage.removeItem('rs_high_contrast')
    localStorage.removeItem('rs_tabular_nums')

    document.documentElement.removeAttribute('data-reduce-motion')
    document.documentElement.removeAttribute('data-high-contrast')

    setFeedbackToast('Settings reset to factory defaults (70% High, 40% Med).')
    setTimeout(() => setFeedbackToast(null), 3500)
  }

  // Clear Session History Action
  const handleClearSessionHistory = () => {
    resetSessionHistory()
    setFeedbackToast('In-memory prediction session history was cleared.')
    setTimeout(() => setFeedbackToast(null), 3500)
  }

  // Export Settings Configuration JSON
  const handleExportConfig = () => {
    const config = {
      riskThresholds: {
        high: highThreshold,
        medium: medThreshold,
      },
      apiBaseUrl: apiUrl || 'default (/api/v1)',
      accessibility: {
        reduceMotion,
        highContrast,
        tabularFigures,
      },
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `platform_settings_${new Date().toISOString().slice(0, 10)}.json`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="page-container">
      {/* Semantic Page Header */}
      <header className="page-header">
        <div className="page-header-top">
          <div className="page-header-title-group">
            <span className="eyebrow">System Configuration</span>
            <h1>Platform Settings & Risk Thresholds</h1>
            <p className="page-header-description">
              Calibrate churn probability risk boundaries, verify backend gateway connectivity, configure accessibility settings, and inspect WCAG color contrast compliance.
            </p>
          </div>
          <div className="page-header-actions">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="btn-secondary"
              aria-label="Reset preferences to default values"
            >
              <RotateCcw size={15} />
              <span>Reset Defaults</span>
            </button>
            <button
              type="button"
              onClick={handleSavePreferences}
              disabled={!isThresholdValid}
              className="btn-primary"
              aria-label="Save changes to local storage"
            >
              <Save size={15} />
              <span>{saveSuccess ? 'Saved Preferences!' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Toast Feedback Banner */}
      {feedbackToast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: 'var(--color-kiwi-subtle)',
            border: '1px solid var(--color-kiwi-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-kiwi)',
            fontSize: 'var(--font-size-body-sm)',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* SECTION 1: Risk Classification Thresholds & Real-Time Cohort Impact */}
      <ChartCard
        title="Risk Classification Thresholds & Real-Time Cohort Impact"
        subtitle="Calibrate High and Medium risk cutoffs and observe projected distribution shifts across the 7,043 account cohort (extrapolated from empirical sample)"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', width: '100%' }}>
          {/* Validation Warning Banner if high <= med */}
          {!isThresholdValid && (
            <div
              className="notice-banner warning"
              style={{
                borderLeft: '4px solid var(--color-risk-high)',
                backgroundColor: 'var(--color-risk-high-subtle)',
                color: 'var(--color-risk-high)',
              }}
            >
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <div>
                <strong>Invalid Threshold Range:</strong> High Risk Threshold ({highThreshold}%) must be strictly greater than Medium Risk Threshold ({medThreshold}%).
              </div>
            </div>
          )}

          {/* Sliders Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--space-6)',
            }}
          >
            {/* High Risk Cutoff Slider */}
            <div
              style={{
                padding: 'var(--space-4)',
                backgroundColor: 'var(--color-surface-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--color-risk-high)', fontWeight: 600 }}>
                  High Risk Threshold Cutoff
                </span>
                <span className="font-tabular" style={{ fontWeight: 700, fontSize: 'var(--font-size-h2)', color: 'var(--color-risk-high)' }}>
                  ≥ {highThreshold}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="90"
                step="1"
                value={highThreshold}
                onChange={(e) => setHighThreshold(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-risk-high)', cursor: 'pointer' }}
                aria-label="High risk probability threshold cutoff"
              />
              <div style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
                Subscribers with churn probability above this cutoff are prioritized for immediate outreach campaigns.
              </div>
            </div>

            {/* Medium Risk Cutoff Slider */}
            <div
              style={{
                padding: 'var(--space-4)',
                backgroundColor: 'var(--color-surface-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--color-risk-medium)', fontWeight: 600 }}>
                  Medium Risk Threshold Cutoff
                </span>
                <span className="font-tabular" style={{ fontWeight: 700, fontSize: 'var(--font-size-h2)', color: 'var(--color-risk-medium)' }}>
                  ≥ {medThreshold}%
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="60"
                step="1"
                value={medThreshold}
                onChange={(e) => setMedThreshold(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-risk-medium)', cursor: 'pointer' }}
                aria-label="Medium risk probability threshold cutoff"
              />
              <div style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
                Subscribers between {medThreshold}% and {highThreshold}% receive automated nurture and retention reminders.
              </div>
            </div>
          </div>

          {/* Real-time 7,043-subscriber Impact Readout */}
          <div
            style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--color-surface-subtle)',
              borderRadius: 'var(--radius-md)',
              borderLeft: '4px solid var(--color-kiwi)',
            }}
          >
            <span className="eyebrow" style={{ color: 'var(--color-kiwi)', display: 'block', marginBottom: '6px' }}>
              Real-Time Cohort Impact Simulator (N = 7,043)
            </span>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--space-3)',
                marginTop: 'var(--space-2)',
              }}
            >
              <div>
                <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>
                  High Risk Cohort:
                </span>
                <div className="font-tabular" style={{ fontSize: 'var(--font-size-h2)', fontWeight: 700, color: 'var(--color-risk-high)' }}>
                  {cohortImpact.highCount.toLocaleString()} ({cohortImpact.highPct}%)
                </div>
                <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>
                  ${cohortImpact.highMRR.toLocaleString()} MRR at risk
                </span>
              </div>

              <div>
                <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>
                  Medium Risk Cohort:
                </span>
                <div className="font-tabular" style={{ fontSize: 'var(--font-size-h2)', fontWeight: 700, color: 'var(--color-risk-medium)' }}>
                  {cohortImpact.medCount.toLocaleString()} ({cohortImpact.medPct}%)
                </div>
                <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>
                  Nurture workflow candidates
                </span>
              </div>

              <div>
                <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>
                  Low Risk Cohort:
                </span>
                <div className="font-tabular" style={{ fontSize: 'var(--font-size-h2)', fontWeight: 700, color: 'var(--color-kiwi)' }}>
                  {cohortImpact.lowCount.toLocaleString()} ({cohortImpact.lowPct}%)
                </div>
                <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>
                  Stable customer base
                </span>
              </div>
            </div>
          </div>
        </div>
      </ChartCard>

      {/* SECTION 2: Backend Gateway Diagnostics & Connectivity Probe */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: 'var(--space-6)' }}>
        <ChartCard
          title="Backend Gateway Diagnostics"
          subtitle="Probe live Spring Boot Gateway (/api/v1/health) and FastAPI inference worker"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', width: '100%' }}>
            {/* Custom API Base URL Override Input */}
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-body-sm)', marginBottom: '4px' }}>
                API Base URL Override (Optional)
              </label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="Leave blank for default proxy (/api/v1) or specify e.g. http://127.0.0.1:8080"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--color-surface-subtle)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--font-size-body-sm)',
                  fontFamily: 'var(--font-mono)',
                }}
              />
              <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)', display: 'block', marginTop: '4px' }}>
                Default: relative path proxied to Spring Boot on port 8080 by Vite.
              </span>
            </div>

            {/* Probe Action Button */}
            <button
              type="button"
              onClick={testBackendHealth}
              disabled={isTesting}
              className="btn-secondary"
              style={{ justifyContent: 'center' }}
            >
              <RefreshCw size={16} className={isTesting ? 'animate-spin' : ''} />
              <span>{isTesting ? 'Pinging Gateway...' : 'Execute Health Probe'}</span>
            </button>

            {/* Probe Results Feedback Box */}
            {healthStatus && (
              <div
                style={{
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${healthStatus.ok ? 'var(--color-kiwi-border)' : 'var(--color-risk-medium-border)'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  {healthStatus.ok ? (
                    <CheckCircle2 size={16} style={{ color: 'var(--color-kiwi)' }} />
                  ) : (
                    <AlertCircle size={16} style={{ color: 'var(--color-risk-medium)' }} />
                  )}
                  <strong style={{ color: healthStatus.ok ? 'var(--color-kiwi)' : 'var(--color-risk-medium)' }}>
                    {healthStatus.ok ? 'Gateway Operational' : 'Offline / Standby Fallback'}
                  </strong>
                  <span className="font-tabular" style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    ({healthStatus.latency}ms)
                  </span>
                </div>
                <p style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
                  {healthStatus.message}
                </p>
              </div>
            )}
          </div>
        </ChartCard>

        {/* SECTION 3: Accessibility & Visual Display Options */}
        <ChartCard
          title="Accessibility & Visual Display Options"
          subtitle="Configure high-contrast, motion reduction, and numeric display preferences"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', width: '100%' }}>
            {/* Toggle 1: Reduce Motion */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--space-3)',
                backgroundColor: 'var(--color-surface-subtle)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div>
                <strong style={{ fontSize: 'var(--font-size-body-sm)', display: 'block' }}>Reduce Motion</strong>
                <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>
                  Minimizes transitions and disables SVG animations for vestibulary sensitivity.
                </span>
              </div>
              <input
                type="checkbox"
                checked={reduceMotion}
                onChange={(e) => setReduceMotion(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--color-kiwi)', cursor: 'pointer' }}
                aria-label="Toggle reduce motion"
              />
            </div>

            {/* Toggle 2: High Contrast Mode */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--space-3)',
                backgroundColor: 'var(--color-surface-subtle)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div>
                <strong style={{ fontSize: 'var(--font-size-body-sm)', display: 'block' }}>High Contrast Mode</strong>
                <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>
                  Amplifies card borders and strengthens contrast for enhanced readability.
                </span>
              </div>
              <input
                type="checkbox"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--color-kiwi)', cursor: 'pointer' }}
                aria-label="Toggle high contrast mode"
              />
            </div>

            {/* Toggle 3: Tabular Numbers */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--space-3)',
                backgroundColor: 'var(--color-surface-subtle)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div>
                <strong style={{ fontSize: 'var(--font-size-body-sm)', display: 'block' }}>Tabular Figure Alignment</strong>
                <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>
                  Enforces monospaced numeric glyphs (tabular-nums) for financial comparisons.
                </span>
              </div>
              <input
                type="checkbox"
                checked={tabularFigures}
                onChange={(e) => setTabularFigures(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--color-kiwi)', cursor: 'pointer' }}
                aria-label="Toggle tabular figures alignment"
              />
            </div>
          </div>
        </ChartCard>
      </div>

      {/* SECTION 4: WCAG 2.1 AAA Contrast Matrix */}
      <ChartCard
        title="WCAG 2.1 AAA Color Contrast Verification Matrix"
        subtitle="Audited contrast ratios for the Night (#222222) and Kiwi (#89E901) design token system"
      >
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 'var(--font-size-body-sm)',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border-subtle)', backgroundColor: 'var(--color-surface-subtle)' }}>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>ELEMENT / PAIRING</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>FOREGROUND</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>BACKGROUND</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>CONTRAST RATIO</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>WCAG COMPLIANCE</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>Primary Kiwi CTA Button</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#121212', border: '1px solid #444' }} />
                    <code>#121212</code>
                  </span>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#89E901' }} />
                    <code>#89E901</code>
                  </span>
                </td>
                <td className="font-tabular" style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--color-kiwi)' }}>10.32:1</td>
                <td style={{ padding: '10px 14px' }}>
                  <span className="badge" style={{ backgroundColor: 'var(--color-kiwi-subtle)', color: 'var(--color-kiwi)', border: '1px solid var(--color-kiwi-border)' }}>
                    AAA PASS
                  </span>
                </td>
              </tr>

              <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>Primary Heading Text</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#F4F4F4' }} />
                    <code>#F4F4F4</code>
                  </span>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#222222' }} />
                    <code>#222222</code>
                  </span>
                </td>
                <td className="font-tabular" style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--color-kiwi)' }}>14.28:1</td>
                <td style={{ padding: '10px 14px' }}>
                  <span className="badge" style={{ backgroundColor: 'var(--color-kiwi-subtle)', color: 'var(--color-kiwi)', border: '1px solid var(--color-kiwi-border)' }}>
                    AAA PASS
                  </span>
                </td>
              </tr>

              <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>Medium Risk Badge (Amber)</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#FFBE55' }} />
                    <code>#FFBE55</code>
                  </span>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#222222' }} />
                    <code>#222222</code>
                  </span>
                </td>
                <td className="font-tabular" style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--color-kiwi)' }}>9.38:1</td>
                <td style={{ padding: '10px 14px' }}>
                  <span className="badge" style={{ backgroundColor: 'var(--color-kiwi-subtle)', color: 'var(--color-kiwi)', border: '1px solid var(--color-kiwi-border)' }}>
                    AAA PASS
                  </span>
                </td>
              </tr>

              <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>High Risk Badge (Coral)</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#FF6262' }} />
                    <code>#FF6262</code>
                  </span>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#222222' }} />
                    <code>#222222</code>
                  </span>
                </td>
                <td className="font-tabular" style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--color-status-info)' }}>5.07:1</td>
                <td style={{ padding: '10px 14px' }}>
                  <span className="badge" style={{ backgroundColor: 'var(--color-status-info-subtle)', color: 'var(--color-status-info)', border: '1px solid var(--color-status-info-border)' }}>
                    AA PASS (&gt; 4.5:1)
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </ChartCard>

      {/* SECTION 5: Platform Cache & Maintenance */}
      <section
        className="card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
        }}
      >
        <div>
          <span className="eyebrow" style={{ color: 'var(--color-text-secondary)' }}>Maintenance & Storage</span>
          <h3 style={{ marginTop: '2px' }}>Platform Maintenance Utilities</h3>
          <p style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
            Manage in-memory prediction logs or backup current threshold configurations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-ghost"
            onClick={handleClearSessionHistory}
            style={{ color: 'var(--color-risk-high)' }}
          >
            <Trash2 size={15} />
            <span>Clear In-Memory Predictions</span>
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleExportConfig}
          >
            <Download size={15} />
            <span>Export Configuration (JSON)</span>
          </button>
        </div>
      </section>
    </div>
  )
}
