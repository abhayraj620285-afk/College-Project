import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Cpu,
  Sliders,
  ArrowUpRight,
  BarChart3,
  Database,
  Layers,
  ExternalLink,
  Zap,
  Server,
  ArrowRight,
} from 'lucide-react'
import MetricCard from '../components/common/MetricCard'
import ChartCard from '../components/common/ChartCard'
import RiskBadge from '../components/common/RiskBadge'
import DataTable from '../components/common/DataTable'
import {
  MODEL_METADATA,
  PERFORMANCE_METRICS,
  CONFUSION_MATRIX,
  MODEL_BENCHMARKS,
  FEATURE_IMPORTANCE,
} from '../data/modelMeta'
import { getHealth } from '../services/api'

export default function ModelPerformancePage() {
  // Live health telemetry
  const [health, setHealth] = useState({ backend: 'UNKNOWN', model_service: 'UNKNOWN', offline: true })
  const [isPinging, setIsPinging] = useState(false)
  const [lastPingTime, setLastPingTime] = useState(null)
  const [latencyMs, setLatencyMs] = useState(null)

  // Interactive Decision Threshold Simulator State (0.30 to 0.70)
  const [decisionThreshold, setDecisionThreshold] = useState(0.50)

  // Feature Importance Filter State
  const [featureCategory, setFeatureCategory] = useState('ALL')
  const [sortFeatureBy, setSortFeatureBy] = useState('absWeight') // 'absWeight' | 'positive' | 'negative'

  // Probe live service health
  const pingHealth = useCallback(async () => {
    setIsPinging(true)
    const start = performance.now()
    try {
      const res = await getHealth()
      const end = performance.now()
      setLatencyMs(Math.round(end - start))
      setHealth(res)
      setLastPingTime(new Date().toLocaleTimeString())
    } catch {
      setLatencyMs(null)
      setHealth({ backend: 'DOWN', model_service: 'DOWN', offline: true })
      setLastPingTime(new Date().toLocaleTimeString())
    } finally {
      setIsPinging(false)
    }
  }, [])

  useEffect(() => {
    pingHealth()
  }, [pingHealth])

  // Simulated Confusion Matrix under variable decision threshold
  const thresholdSimulation = useMemo(() => {
    const total = CONFUSION_MATRIX.total // 1409
    const totalActualPos = CONFUSION_MATRIX.truePositive + CONFUSION_MATRIX.falseNegative // 374
    const totalActualNeg = CONFUSION_MATRIX.trueNegative + CONFUSION_MATRIX.falsePositive // 1035

    // Mathematical modeling of threshold shift around 0.50 baseline
    const delta = (0.50 - decisionThreshold) // e.g. at 0.40, delta = +0.10 (more positive calls)
    const simTP = Math.max(150, Math.min(365, Math.round(CONFUSION_MATRIX.truePositive + delta * 240)))
    const simFN = totalActualPos - simTP
    const simFP = Math.max(100, Math.min(500, Math.round(CONFUSION_MATRIX.falsePositive + delta * 320)))
    const simTN = totalActualNeg - simFP

    const recall = (simTP / totalActualPos) * 100
    const precision = simTP + simFP > 0 ? (simTP / (simTP + simFP)) * 100 : 0
    const accuracy = ((simTP + simTN) / total) * 100

    return {
      tp: simTP,
      fn: simFN,
      fp: simFP,
      tn: simTN,
      recall: recall.toFixed(1),
      precision: precision.toFixed(1),
      accuracy: accuracy.toFixed(1),
    }
  }, [decisionThreshold])

  // Filtered and sorted features
  const filteredFeatures = useMemo(() => {
    let list = FEATURE_IMPORTANCE.filter((f) => {
      if (featureCategory !== 'ALL' && f.category !== featureCategory) return false
      return true
    })

    if (sortFeatureBy === 'absWeight') list.sort((a, b) => b.absWeight - a.absWeight)
    else if (sortFeatureBy === 'positive') list.sort((a, b) => b.weight - a.weight)
    else if (sortFeatureBy === 'negative') list.sort((a, b) => a.weight - b.weight)

    return list
  }, [featureCategory, sortFeatureBy])

  return (
    <div className="page-container">
      {/* Semantic Page Header */}
      <header className="page-header">
        <div className="page-header-top">
          <div className="page-header-title-group">
            <span className="eyebrow">ML Observability & Telemetry</span>
            <h1>Model Health & Evaluation Benchmarks</h1>
            <p className="page-header-description">
              Production evaluation telemetry for the Logistic Regression classification pipeline evaluated on the 1,409 holdout customer test split.
            </p>
          </div>
          <div className="page-header-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={pingHealth}
              disabled={isPinging}
              aria-label="Ping service health telemetry"
            >
              <RefreshCw size={15} className={isPinging ? 'animate-spin' : ''} />
              <span>Ping Telemetry</span>
            </button>
            <Link to="/insights" className="btn-primary">
              <BarChart3 size={16} />
              <span>Global Feature Weights</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Live Service Health Telemetry Cockpit */}
      <section
        className="card"
        style={{
          padding: 'var(--space-3) var(--space-4)',
          backgroundColor: 'var(--color-surface-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
          borderLeft: `3px solid ${health.backend === 'UP' ? 'var(--color-kiwi)' : 'var(--color-risk-medium)'}`,
        }}
        aria-label="Service Health Cockpit"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={18} style={{ color: 'var(--color-kiwi)' }} />
            <strong style={{ fontSize: 'var(--font-size-body-sm)' }}>Telemetry Health:</strong>
          </div>

          {/* Spring Boot Gateway */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>Gateway (8080):</span>
            <span
              className="badge"
              style={{
                backgroundColor: health.backend === 'UP' ? 'var(--color-kiwi-subtle)' : 'var(--color-risk-high-subtle)',
                color: health.backend === 'UP' ? 'var(--color-kiwi)' : 'var(--color-risk-high)',
                border: `1px solid ${health.backend === 'UP' ? 'var(--color-kiwi-border)' : 'var(--color-risk-high-border)'}`,
              }}
            >
              {health.backend === 'UP' ? 'ONLINE (UP)' : 'UNREACHABLE'}
            </span>
          </div>

          {/* FastAPI Inference Service */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>Model Worker (8000):</span>
            <span
              className="badge"
              style={{
                backgroundColor: health.model_service === 'UP' ? 'var(--color-kiwi-subtle)' : 'var(--color-status-info-subtle)',
                color: health.model_service === 'UP' ? 'var(--color-kiwi)' : 'var(--color-status-info)',
                border: `1px solid ${health.model_service === 'UP' ? 'var(--color-kiwi-border)' : 'var(--color-status-info-border)'}`,
              }}
            >
              {health.model_service === 'UP' ? 'FASTAPI UP' : 'LOCAL ENGINE ACTIVE'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', fontSize: 'var(--font-size-body-sm)' }}>
          {latencyMs != null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Latency:</span>
              <strong className="font-tabular" style={{ color: 'var(--color-kiwi)' }}>{latencyMs}ms</strong>
            </div>
          )}
          {lastPingTime && (
            <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>
              Probed at {lastPingTime}
            </span>
          )}
        </div>
      </section>

      {/* ML Performance KPI Bar (6 MetricCards) */}
      <section
        aria-label="Core ML Metrics"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        <MetricCard
          label="ROC-AUC Score"
          value="0.8417"
          subtext="Holdout test discrimination"
          variant="kiwi"
          icon={Activity}
          progress={84.2}
        />

        <MetricCard
          label="Holdout Accuracy"
          value="73.81%"
          subtext="1,040 of 1,409 tests correct"
          variant="default"
          icon={ShieldCheck}
          progress={73.8}
        />

        <MetricCard
          label="Churn Recall (Sensitivity)"
          value="78.34%"
          subtext="293 of 374 actual churners caught"
          variant="kiwi"
          icon={Zap}
          trend="positive"
          trendValue="Primary KPI"
          progress={78.3}
        />

        <MetricCard
          label="Specificity (TNR)"
          value="72.17%"
          subtext="747 of 1,035 retained verified"
          variant="default"
          icon={ShieldCheck}
          progress={72.2}
        />

        <MetricCard
          label="Precision"
          value="50.43%"
          subtext="293 of 581 churn flags true"
          variant="medium-risk"
          icon={AlertTriangle}
          progress={50.4}
        />

        <MetricCard
          label="F1 Score"
          value="0.6136"
          subtext="Harmonic mean recall & precision"
          variant="default"
          icon={BarChart3}
          progress={61.4}
        />
      </section>

      {/* Two-Column Analytical Cockpit: Confusion Matrix & Rationale */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: 'var(--space-6)' }}>
        {/* Column A: 2x2 Confusion Matrix & Decision Threshold Simulator */}
        <ChartCard
          title="Holdout Confusion Matrix & Threshold Tuning"
          subtitle="Cross-tabulation of actual vs predicted churn with interactive classification threshold slider"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', width: '100%' }}>
            {/* Interactive Threshold Slider */}
            <div
              style={{
                padding: 'var(--space-3) var(--space-4)',
                backgroundColor: 'var(--color-surface-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sliders size={15} style={{ color: 'var(--color-kiwi)' }} />
                  <strong style={{ fontSize: 'var(--font-size-body-sm)' }}>Decision Threshold Simulator:</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span className="font-tabular" style={{ fontSize: 'var(--font-size-body)', fontWeight: 700, color: 'var(--color-kiwi)' }}>
                    {decisionThreshold.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => setDecisionThreshold(0.50)}
                    style={{ fontSize: 'var(--font-size-micro)', padding: '2px 6px' }}
                  >
                    Reset (0.50)
                  </button>
                </div>
              </div>

              <input
                type="range"
                min="0.30"
                max="0.70"
                step="0.05"
                value={decisionThreshold}
                onChange={(e) => setDecisionThreshold(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-kiwi)', cursor: 'pointer' }}
                aria-label="Classification decision threshold"
              />

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 'var(--font-size-micro)',
                  color: 'var(--color-text-secondary)',
                  marginTop: '4px',
                }}
              >
                <span>0.30 (Aggressive Recall)</span>
                <span>0.50 (Default Baseline)</span>
                <span>0.70 (Conservative Precision)</span>
              </div>
            </div>

            {/* Simulated Dynamic Metrics Bar */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 'var(--space-2)',
                textAlign: 'center',
              }}
            >
              <div style={{ padding: 'var(--space-2)', backgroundColor: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>Simulated Recall:</span>
                <div className="font-tabular" style={{ fontSize: 'var(--font-size-body)', fontWeight: 700, color: 'var(--color-kiwi)' }}>
                  {thresholdSimulation.recall}%
                </div>
              </div>
              <div style={{ padding: 'var(--space-2)', backgroundColor: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>Simulated Precision:</span>
                <div className="font-tabular" style={{ fontSize: 'var(--font-size-body)', fontWeight: 700, color: 'var(--color-risk-medium)' }}>
                  {thresholdSimulation.precision}%
                </div>
              </div>
              <div style={{ padding: 'var(--space-2)', backgroundColor: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>Holdout Accuracy:</span>
                <div className="font-tabular" style={{ fontSize: 'var(--font-size-body)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {thresholdSimulation.accuracy}%
                </div>
              </div>
            </div>

            {/* Visual 2x2 Confusion Matrix Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--space-3)',
                width: '100%',
              }}
            >
              {/* True Negative */}
              <div
                style={{
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-subtle)',
                  borderLeft: '4px solid var(--color-kiwi)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="eyebrow" style={{ color: 'var(--color-kiwi)' }}>True Negative (TN)</span>
                  <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>
                    {((thresholdSimulation.tn / 1409) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="font-tabular" style={{ fontSize: '1.75rem', fontWeight: 700, margin: '4px 0' }}>
                  {thresholdSimulation.tn}
                </div>
                <p style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)', margin: 0 }}>
                  Non-churners accurately classified as Retained
                </p>
              </div>

              {/* False Positive */}
              <div
                style={{
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-subtle)',
                  borderLeft: '4px solid var(--color-risk-medium)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="eyebrow" style={{ color: 'var(--color-risk-medium)' }}>False Positive (FP)</span>
                  <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>
                    {((thresholdSimulation.fp / 1409) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="font-tabular" style={{ fontSize: '1.75rem', fontWeight: 700, margin: '4px 0' }}>
                  {thresholdSimulation.fp}
                </div>
                <p style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)', margin: 0 }}>
                  Retained subscribers incorrectly flagged (False Alarms)
                </p>
              </div>

              {/* False Negative */}
              <div
                style={{
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-subtle)',
                  borderLeft: '4px solid var(--color-risk-high)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="eyebrow" style={{ color: 'var(--color-risk-high)' }}>False Negative (FN)</span>
                  <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>
                    {((thresholdSimulation.fn / 1409) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="font-tabular" style={{ fontSize: '1.75rem', fontWeight: 700, margin: '4px 0' }}>
                  {thresholdSimulation.fn}
                </div>
                <p style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)', margin: 0 }}>
                  Actual churners missed by model (Critical Hazard)
                </p>
              </div>

              {/* True Positive */}
              <div
                style={{
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-subtle)',
                  borderLeft: '4px solid var(--color-kiwi)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="eyebrow" style={{ color: 'var(--color-kiwi)' }}>True Positive (TP)</span>
                  <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>
                    {((thresholdSimulation.tp / 1409) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="font-tabular" style={{ fontSize: '1.75rem', fontWeight: 700, margin: '4px 0' }}>
                  {thresholdSimulation.tp}
                </div>
                <p style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)', margin: 0 }}>
                  Actual churners correctly captured for retention
                </p>
              </div>
            </div>
          </div>
        </ChartCard>

        {/* Column B: Model Architecture & Production Selection Rationale */}
        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <span className="eyebrow" style={{ color: 'var(--color-kiwi)' }}>Pipeline Specifications</span>
            <h3 style={{ marginTop: '2px' }}>Production Selection Rationale</h3>
            <p style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)' }}>
              Architecture decisions behind deploying balanced Logistic Regression into the Spring Boot and FastAPI pipeline.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-md)' }}>
              <strong style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-primary)', display: 'block', marginBottom: '2px' }}>
                1. Prioritizing Churn Recall (78.34%)
              </strong>
              <p style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
                In subscription telecom, the cost of losing an account ($893 ARR) vastly exceeds the cost of a retention outreach ($20-$50). Using <code style={{ color: 'var(--color-kiwi)' }}>class_weight='balanced'</code> maximizes recall to capture nearly 8 out of 10 at-risk customers.
              </p>
            </div>

            <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-md)' }}>
              <strong style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-primary)', display: 'block', marginBottom: '2px' }}>
                2. Full Algorithmic Explainability
              </strong>
              <p style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
                Unlike opaque black-box ensembles, logistic regression provides explicit odds ratios ($e^\beta$) for every feature. Operational teams can explain exactly why an account was flagged (e.g. Month-to-Month + Fiber Optic + 1 mo tenure).
              </p>
            </div>

            <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-md)' }}>
              <strong style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-primary)', display: 'block', marginBottom: '2px' }}>
                3. Sub-Millisecond & Zero-Dependency Portability
              </strong>
              <p style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
                With only 30 weights and 3 scalar features, the model evaluates in under 0.1ms in Python and can run identically in pure client-side JavaScript if backend workers drop offline.
              </p>
            </div>
          </div>

          {/* Hyperparameters Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: 'var(--space-2)',
              padding: 'var(--space-3)',
              backgroundColor: 'var(--color-surface-subtle)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-micro)',
            }}
          >
            <div>
              <span style={{ color: 'var(--color-text-secondary)' }}>Algorithm:</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>LogisticRegression</div>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-secondary)' }}>Regularization:</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>L2 (C = 1.0)</div>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-secondary)' }}>Optimization:</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>L-BFGS</div>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-secondary)' }}>Class Weights:</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>Balanced</div>
            </div>
          </div>
        </section>
      </div>

      {/* Benchmark Comparison Table against Baselines */}
      <ChartCard
        title="Benchmark Comparison Against Alternative Classifiers"
        subtitle="Empirical performance comparison across 1,409 holdout customer test records"
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
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>MODEL ARCHITECTURE</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>ROC-AUC</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>ACCURACY</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>RECALL</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>F1 SCORE</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>DEPLOYMENT STATUS</th>
              </tr>
            </thead>
            <tbody>
              {MODEL_BENCHMARKS.map((bm) => (
                <tr
                  key={bm.model}
                  style={{
                    borderBottom: '1px solid var(--color-border-subtle)',
                    backgroundColor: bm.isProduction ? 'var(--color-kiwi-subtle)' : 'transparent',
                    borderLeft: bm.isProduction ? '3px solid var(--color-kiwi)' : '3px solid transparent',
                  }}
                >
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                    {bm.model}
                  </td>
                  <td className="font-tabular" style={{ padding: '12px 16px', fontWeight: 700, color: bm.isProduction ? 'var(--color-kiwi)' : undefined }}>
                    {bm.rocAuc.toFixed(4)}
                  </td>
                  <td className="font-tabular" style={{ padding: '12px 16px' }}>
                    {(bm.accuracy * 100).toFixed(2)}%
                  </td>
                  <td className="font-tabular" style={{ padding: '12px 16px', fontWeight: 700, color: bm.isProduction ? 'var(--color-kiwi)' : undefined }}>
                    {(bm.recall * 100).toFixed(2)}%
                  </td>
                  <td className="font-tabular" style={{ padding: '12px 16px' }}>
                    {bm.f1.toFixed(4)}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {bm.isProduction ? (
                      <span className="badge" style={{ backgroundColor: 'var(--color-kiwi-subtle)', color: 'var(--color-kiwi)', border: '1px solid var(--color-kiwi-border)' }}>
                        ACTIVE PRODUCTION
                      </span>
                    ) : (
                      <span className="badge" style={{ backgroundColor: 'var(--color-surface-subtle)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border-subtle)' }}>
                        EVALUATED
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {/* Naive Baseline */}
              <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                <td style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>
                  Naive Majority Class (Always Non-Churn)
                </td>
                <td className="font-tabular" style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>0.5000</td>
                <td className="font-tabular" style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>73.46%</td>
                <td className="font-tabular" style={{ padding: '12px 16px', color: 'var(--color-risk-high)' }}>0.00%</td>
                <td className="font-tabular" style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>0.0000</td>
                <td style={{ padding: '12px 16px' }}>
                  <span className="badge" style={{ backgroundColor: 'var(--color-surface-subtle)', color: 'var(--color-text-tertiary)', border: '1px solid var(--color-border-subtle)' }}>
                    HEURISTIC BASELINE
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </ChartCard>

      {/* Global Feature Importance Ranking */}
      <ChartCard
        title="Global Feature Importance Rankings (24 Attributes)"
        subtitle="Standardized model beta coefficients categorized by operational domain"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', width: '100%' }}>
          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: 'var(--space-2)' }}>
            {['ALL', 'Contract', 'Service', 'Billing', 'Security', 'Support', 'Demographics'].map((cat) => (
              <button
                key={cat}
                type="button"
                className={featureCategory === cat ? 'btn-secondary' : 'btn-ghost'}
                onClick={() => setFeatureCategory(cat)}
                style={{
                  padding: '4px 8px',
                  fontSize: 'var(--font-size-micro)',
                  border: featureCategory === cat ? '1px solid var(--color-kiwi-border)' : '1px solid transparent',
                  color: featureCategory === cat ? 'var(--color-kiwi)' : undefined,
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* List of Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {filteredFeatures.map((feat) => {
              const isProtective = feat.weight < 0
              const absVal = Math.abs(feat.weight)
              const barWidth = Math.min(100, (absVal / 1.5) * 100)

              return (
                <div
                  key={feat.feature}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '180px 1fr 80px',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: '8px 12px',
                    backgroundColor: 'var(--color-surface-subtle)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 'var(--font-size-body-sm)', fontWeight: 600 }}>{feat.displayName}</div>
                    <span style={{ fontSize: '9px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                      {feat.category}
                    </span>
                  </div>

                  {/* Horizontal Bar */}
                  <div
                    style={{
                      height: '8px',
                      backgroundColor: 'var(--color-surface-card)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${barWidth}%`,
                        height: '100%',
                        backgroundColor: isProtective ? 'var(--color-kiwi)' : 'var(--color-risk-high)',
                        borderRadius: 'var(--radius-full)',
                      }}
                    />
                  </div>

                  {/* Weight readout */}
                  <div
                    className="font-tabular"
                    style={{
                      textAlign: 'right',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--font-size-body-sm)',
                      fontWeight: 700,
                      color: isProtective ? 'var(--color-kiwi)' : 'var(--color-risk-high)',
                    }}
                  >
                    {feat.weight > 0 ? `+${feat.weight.toFixed(3)}` : feat.weight.toFixed(3)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </ChartCard>
    </div>
  )
}
