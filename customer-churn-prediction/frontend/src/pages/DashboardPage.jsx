import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Users,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Activity,
  RefreshCw,
  Zap,
  Target,
  BarChart2,
  Clock,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import MetricCard from '../components/common/MetricCard'
import ChartCard from '../components/common/ChartCard'
import RiskBadge from '../components/common/RiskBadge'
import { EmptyState } from '../components/common/StateIndicators'
import { COHORT_SUMMARY, TELCO_COHORT } from '../data/telcoDataset'
import { getCohortStats, getAtRiskCustomers } from '../services/customerService'
import { getStats, getPredictions, getHealth } from '../services/api'

/**
 * Accessible SVG Donut Chart for Cohort Risk Stratification.
 * Employs SVG circle stroke-dasharray and pure design tokens.
 */
function RiskDonutChart({ high = 1248, medium = 1642, low = 4153, onSelect, selected }) {
  const total = high + medium + low || 7043
  const radius = 70
  const strokeWidth = 24
  const circumference = 2 * Math.PI * radius

  const highRatio = high / total
  const medRatio = medium / total
  const lowRatio = low / total

  const highDash = highRatio * circumference
  const medDash = medRatio * circumference
  const lowDash = lowRatio * circumference

  const highOffset = 0
  const medOffset = -highDash
  const lowOffset = -(highDash + medDash)

  const selectedPct =
    selected === 'HIGH'
      ? (highRatio * 100).toFixed(1)
      : selected === 'MEDIUM'
      ? (medRatio * 100).toFixed(1)
      : selected === 'LOW'
      ? (lowRatio * 100).toFixed(1)
      : '7,043'

  const selectedLabel = selected ? `${selected} RISK` : 'TOTAL SUBSCRIBERS'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <svg
        viewBox="0 0 200 200"
        width="200"
        height="200"
        role="img"
        aria-label="Cohort Churn Risk Distribution Donut Chart"
        style={{ overflow: 'visible' }}
      >
        <title>Cohort Churn Risk Distribution</title>
        {/* Base Track */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="var(--color-surface-subtle)"
          strokeWidth={strokeWidth}
        />

        {/* Low Risk Segment (Kiwi) */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="var(--color-kiwi)"
          strokeWidth={selected === 'LOW' ? strokeWidth + 4 : strokeWidth}
          strokeDasharray={`${lowDash} ${circumference}`}
          strokeDashoffset={lowOffset}
          transform="rotate(-90 100 100)"
          style={{
            transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
            cursor: 'pointer',
            opacity: selected && selected !== 'LOW' ? 0.35 : 1,
          }}
          onClick={() => onSelect(selected === 'LOW' ? null : 'LOW')}
        />

        {/* Medium Risk Segment (Amber) */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="var(--color-risk-medium)"
          strokeWidth={selected === 'MEDIUM' ? strokeWidth + 4 : strokeWidth}
          strokeDasharray={`${medDash} ${circumference}`}
          strokeDashoffset={medOffset}
          transform="rotate(-90 100 100)"
          style={{
            transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
            cursor: 'pointer',
            opacity: selected && selected !== 'MEDIUM' ? 0.35 : 1,
          }}
          onClick={() => onSelect(selected === 'MEDIUM' ? null : 'MEDIUM')}
        />

        {/* High Risk Segment (Coral/Red) */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="var(--color-risk-high)"
          strokeWidth={selected === 'HIGH' ? strokeWidth + 4 : strokeWidth}
          strokeDasharray={`${highDash} ${circumference}`}
          strokeDashoffset={highOffset}
          transform="rotate(-90 100 100)"
          style={{
            transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
            cursor: 'pointer',
            opacity: selected && selected !== 'HIGH' ? 0.35 : 1,
          }}
          onClick={() => onSelect(selected === 'HIGH' ? null : 'HIGH')}
        />

        {/* Center Readout */}
        <text
          x="100"
          y="95"
          textAnchor="middle"
          fill="var(--color-text-primary)"
          fontSize="20"
          fontWeight="700"
          fontFamily="var(--font-kpi)"
        >
          {selected ? `${selectedPct}%` : '7,043'}
        </text>
        <text
          x="100"
          y="114"
          textAnchor="middle"
          fill="var(--color-text-secondary)"
          fontSize="9"
          letterSpacing="0.08em"
          fontWeight="600"
        >
          {selectedLabel}
        </text>
      </svg>

      {/* Interactive Legend & Details */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'var(--space-2)',
          width: '100%',
          marginTop: 'var(--space-4)',
        }}
      >
        <button
          type="button"
          onClick={() => onSelect(selected === 'HIGH' ? null : 'HIGH')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 'var(--space-2)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: selected === 'HIGH' ? 'var(--color-risk-high-subtle)' : 'var(--color-surface-subtle)',
            border: selected === 'HIGH' ? '1px solid var(--color-risk-high-border)' : '1px solid var(--color-border-subtle)',
            cursor: 'pointer',
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-risk-high)' }} />
            <span style={{ fontSize: 'var(--font-size-micro)', fontWeight: 600, color: 'var(--color-risk-high)' }}>HIGH</span>
          </div>
          <span className="font-tabular" style={{ fontSize: 'var(--font-size-body)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {high.toLocaleString()}
          </span>
          <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>
            {(highRatio * 100).toFixed(1)}% · $139.1k
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSelect(selected === 'MEDIUM' ? null : 'MEDIUM')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 'var(--space-2)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: selected === 'MEDIUM' ? 'var(--color-risk-medium-subtle)' : 'var(--color-surface-subtle)',
            border: selected === 'MEDIUM' ? '1px solid var(--color-risk-medium-border)' : '1px solid var(--color-border-subtle)',
            cursor: 'pointer',
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-risk-medium)' }} />
            <span style={{ fontSize: 'var(--font-size-micro)', fontWeight: 600, color: 'var(--color-risk-medium)' }}>MEDIUM</span>
          </div>
          <span className="font-tabular" style={{ fontSize: 'var(--font-size-body)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {medium.toLocaleString()}
          </span>
          <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>
            {(medRatio * 100).toFixed(1)}% · $106.7k
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSelect(selected === 'LOW' ? null : 'LOW')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 'var(--space-2)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: selected === 'LOW' ? 'var(--color-risk-low-subtle)' : 'var(--color-surface-subtle)',
            border: selected === 'LOW' ? '1px solid var(--color-risk-low-border)' : '1px solid var(--color-border-subtle)',
            cursor: 'pointer',
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-kiwi)' }} />
            <span style={{ fontSize: 'var(--font-size-micro)', fontWeight: 600, color: 'var(--color-kiwi)' }}>LOW</span>
          </div>
          <span className="font-tabular" style={{ fontSize: 'var(--font-size-body)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {low.toLocaleString()}
          </span>
          <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>
            {(lowRatio * 100).toFixed(1)}% · $210.3k
          </span>
        </button>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [selectedRiskTier, setSelectedRiskTier] = useState(null)
  const [sessionStats, setSessionStats] = useState(null)
  const [recentPredictions, setRecentPredictions] = useState([])
  const [healthStatus, setHealthStatus] = useState({ backend: 'UNKNOWN', model_service: 'UNKNOWN', offline: true })
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Top high-risk retention targets from real dataset
  const priorityTargets = useMemo(() => {
    return getAtRiskCustomers(0.70).slice(0, 5)
  }, [])

  // Macro cohort metrics
  const cohortStats = useMemo(() => {
    return getCohortStats()
  }, [])

  // Load telemetry data from Spring Boot API Gateway / session history
  const loadTelemetry = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const [statsRes, historyRes, healthRes] = await Promise.all([
        getStats().catch(() => null),
        getPredictions(5).catch(() => []),
        getHealth().catch(() => ({ backend: 'DOWN', model_service: 'DOWN', offline: true })),
      ])

      if (statsRes) setSessionStats(statsRes)
      if (Array.isArray(historyRes)) setRecentPredictions(historyRes)
      if (healthRes) setHealthStatus(healthRes)
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadTelemetry()
  }, [loadTelemetry])

  return (
    <div className="page-container">
      {/* Semantic Page Header */}
      <header className="page-header">
        <div className="page-header-top">
          <div className="page-header-title-group">
            <span className="eyebrow">Executive Overview</span>
            <h1>Retention Intelligence Dashboard</h1>
            <p className="page-header-description">
              Real-time telecom customer churn telemetry, MRR at risk, and predictive risk distribution across 7,043 enterprise accounts.
            </p>
          </div>
          <div className="page-header-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={loadTelemetry}
              disabled={isRefreshing}
              aria-label="Refresh telemetry"
            >
              <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <Link to="/reports" className="btn-secondary">
              <BarChart2 size={16} />
              <span>Reports</span>
            </Link>
            <Link to="/predict" className="btn-primary">
              <Sparkles size={16} />
              <span>Run Prediction</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Real-time Session Prediction Telemetry Bar */}
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
          borderLeft: '3px solid var(--color-kiwi)',
        }}
        aria-label="Live System Telemetry Status"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={16} style={{ color: 'var(--color-kiwi)' }} />
            <span style={{ fontSize: 'var(--font-size-body-sm)', fontWeight: 600 }}>System Telemetry:</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>Gateway:</span>
            <span
              className="badge"
              style={{
                backgroundColor: healthStatus.backend === 'UP' ? 'var(--color-kiwi-subtle)' : 'var(--color-risk-medium-subtle)',
                color: healthStatus.backend === 'UP' ? 'var(--color-kiwi)' : 'var(--color-risk-medium)',
                border: `1px solid ${healthStatus.backend === 'UP' ? 'var(--color-kiwi-border)' : 'var(--color-risk-medium-border)'}`,
              }}
            >
              {healthStatus.backend === 'UP' ? 'PORT 8080 UP' : 'CLIENT ENGINE (OFFLINE)'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>ML Model:</span>
            <span
              className="badge"
              style={{
                backgroundColor: healthStatus.model_service === 'UP' ? 'var(--color-kiwi-subtle)' : 'var(--color-status-info-subtle)',
                color: healthStatus.model_service === 'UP' ? 'var(--color-kiwi)' : 'var(--color-status-info)',
                border: `1px solid ${healthStatus.model_service === 'UP' ? 'var(--color-kiwi-border)' : 'var(--color-status-info-border)'}`,
              }}
            >
              {healthStatus.model_service === 'UP' ? 'FASTAPI UP' : 'LOCAL LOGISTIC REGRESSION'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', fontSize: 'var(--font-size-body-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Session Inferences:</span>
            <strong className="font-tabular" style={{ color: 'var(--color-text-primary)' }}>
              {sessionStats ? sessionStats.total_predictions : 0}
            </strong>
          </div>
          {sessionStats && sessionStats.total_predictions > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Session Churn Rate:</span>
              <strong className="font-tabular" style={{ color: 'var(--color-risk-high)' }}>
                {(sessionStats.churn_rate * 100).toFixed(1)}%
              </strong>
            </div>
          )}
          <Link to="/prediction-history" className="btn-ghost" style={{ padding: '2px 8px', fontSize: 'var(--font-size-micro)' }}>
            Audit Log <ChevronRight size={12} />
          </Link>
        </div>
      </section>

      {/* Executive KPI MetricCards Grid */}
      <section
        aria-label="Executive Key Performance Indicators"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        <MetricCard
          label="Total Subscribers"
          value="7,043"
          subtext="Active Telco accounts in cohort"
          variant="kiwi"
          icon={Users}
          progress={100}
        />

        <MetricCard
          label="Baseline Churn Rate"
          value="26.54%"
          subtext="1,869 customers classified churn"
          variant="high-risk"
          icon={AlertTriangle}
          trend="negative"
          trendValue="+2.1% YoY"
          progress={26.54}
        />

        <MetricCard
          label="Monthly Revenue at Risk"
          value="$139,131"
          subtext="Avg $74.44/mo among high-risk"
          variant="medium-risk"
          icon={DollarSign}
          trend="negative"
          trendValue="$1.67M ARR"
          progress={30.5}
        />

        <MetricCard
          label="Model ROC-AUC Score"
          value="0.8417"
          subtext="scikit-learn 1.9.0 holdout test"
          variant="default"
          icon={TrendingUp}
          trend="positive"
          trendValue="78.3% Recall"
          progress={84.17}
        />
      </section>

      {/* Cockpit Layout: Risk Stratification & Churn Velocity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: 'var(--space-6)' }}>
        {/* Left: Cohort Risk Stratification */}
        <ChartCard
          title="Cohort Risk Stratification"
          subtitle="Distribution of 7,043 subscribers across probability thresholds"
          action={
            <Link to="/customers?riskTier=HIGH" className="btn-ghost" style={{ fontSize: 'var(--font-size-body-sm)' }}>
              <span>High Risk Cohort</span>
              <ArrowRight size={14} />
            </Link>
          }
        >
          <RiskDonutChart
            high={cohortStats.cohortRiskDistribution.HIGH}
            medium={cohortStats.cohortRiskDistribution.MEDIUM}
            low={cohortStats.cohortRiskDistribution.LOW}
            selected={selectedRiskTier}
            onSelect={setSelectedRiskTier}
          />
        </ChartCard>

        {/* Right: Early Tenure Churn Velocity & Hazard Analysis */}
        <ChartCard
          title="Tenure Churn Velocity & Hazard"
          subtitle="Empirical hazard rate by customer lifecycle tenure buckets"
          action={
            <Link to="/insights" className="btn-ghost" style={{ fontSize: 'var(--font-size-body-sm)' }}>
              <span>Feature Drivers</span>
              <ArrowRight size={14} />
            </Link>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', width: '100%', padding: 'var(--space-2) 0' }}>
            {/* Visual Hazard Bar 1: 0 - 6 Months */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: 'var(--font-size-body-sm)' }}>
                <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-risk-high)' }} />
                  0 – 6 Months (Onboarding Cliff)
                </span>
                <span className="font-tabular" style={{ fontWeight: 700, color: 'var(--color-risk-high)' }}>
                  52.1% Hazard · 1,481 accounts
                </span>
              </div>
              <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ width: '52.1%', height: '100%', backgroundColor: 'var(--color-risk-high)', borderRadius: 'var(--radius-full)' }} />
              </div>
            </div>

            {/* Visual Hazard Bar 2: 7 - 12 Months */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: 'var(--font-size-body-sm)' }}>
                <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-risk-medium)' }} />
                  7 – 12 Months (Stabilization Phase)
                </span>
                <span className="font-tabular" style={{ fontWeight: 700, color: 'var(--color-risk-medium)' }}>
                  37.4% Hazard · 698 accounts
                </span>
              </div>
              <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ width: '37.4%', height: '100%', backgroundColor: 'var(--color-risk-medium)', borderRadius: 'var(--radius-full)' }} />
              </div>
            </div>

            {/* Visual Hazard Bar 3: 13 - 24 Months */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: 'var(--font-size-body-sm)' }}>
                <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-border-strong)' }} />
                  13 – 24 Months (Annual Renewal)
                </span>
                <span className="font-tabular" style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  28.6% Hazard · 1,024 accounts
                </span>
              </div>
              <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ width: '28.6%', height: '100%', backgroundColor: 'var(--color-border-strong)', borderRadius: 'var(--radius-full)' }} />
              </div>
            </div>

            {/* Visual Hazard Bar 4: 25+ Months */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: 'var(--font-size-body-sm)' }}>
                <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-kiwi)' }} />
                  25+ Months (Established Champions)
                </span>
                <span className="font-tabular" style={{ fontWeight: 700, color: 'var(--color-kiwi)' }}>
                  14.2% Hazard · 3,840 accounts
                </span>
              </div>
              <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ width: '14.2%', height: '100%', backgroundColor: 'var(--color-kiwi)', borderRadius: 'var(--radius-full)' }} />
              </div>
            </div>

            {/* Operational Velocity Callout */}
            <div
              style={{
                marginTop: 'var(--space-2)',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface-subtle)',
                border: '1px solid var(--color-border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
              }}
            >
              <Zap size={20} style={{ color: 'var(--color-kiwi)', flexShrink: 0 }} />
              <div style={{ fontSize: 'var(--font-size-body-sm)', lineHeight: 1.4 }}>
                <strong style={{ color: 'var(--color-text-primary)' }}>Velocity Vulnerability: </strong>
                <span style={{ color: 'var(--color-text-secondary)' }}>
                  58.3% of all gross subscriber churn takes place in the first 12 months. Proactive tenure stabilization in months 1–6 yields the highest retention ROI.
                </span>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Operational Workflows: Priority Retention Targets & Recent Inferences */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: 'var(--space-6)' }}>
        {/* Left: Priority Retention Targets */}
        <ChartCard
          title="Priority Retention Queue"
          subtitle="Top at-risk subscribers requiring immediate intervention"
          action={
            <Link to="/customers?riskTier=HIGH" className="btn-ghost" style={{ fontSize: 'var(--font-size-body-sm)' }}>
              <span>View All 1,248</span>
              <ArrowRight size={14} />
            </Link>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', width: '100%' }}>
            {priorityTargets.map((cust) => (
              <div
                key={cust.customerID}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-3)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-subtle)',
                  gap: 'var(--space-3)',
                  transition: 'border-color var(--transition-fast)',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '140px' }}>
                  <Link
                    to={`/customers/${cust.customerID}`}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                      fontSize: 'var(--font-size-body)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>#{cust.customerID}</span>
                    <ExternalLink size={12} style={{ color: 'var(--color-text-secondary)' }} />
                  </Link>
                  <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>
                    {cust.Contract} · {cust.InternetService} · {cust.tenure} mo tenure
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span
                    className="font-tabular"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--font-size-body-sm)',
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    ${Number(cust.MonthlyCharges).toFixed(2)}/mo
                  </span>
                  <RiskBadge level={cust.riskLevel} score={cust.churnProbability} size="sm" />
                  <Link
                    to={`/predict?id=${cust.customerID}`}
                    className="btn-ghost"
                    style={{
                      padding: '4px 8px',
                      fontSize: 'var(--font-size-micro)',
                      border: '1px solid var(--color-border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                    title="Simulate re-scoring for this subscriber"
                  >
                    Score
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Right: Recent Prediction Inferences */}
        <ChartCard
          title="Recent Prediction Activity"
          subtitle="Real-time inferences recorded in current session"
          action={
            <Link to="/prediction-history" className="btn-ghost" style={{ fontSize: 'var(--font-size-body-sm)' }}>
              <span>Audit Log</span>
              <ArrowRight size={14} />
            </Link>
          }
        >
          {recentPredictions.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No Predictions in Current Session"
              description="Execute real-time model scoring from the Churn Prediction engine to populate this activity feed."
              action={
                <Link to="/predict" className="btn-primary" style={{ marginTop: 'var(--space-2)' }}>
                  <Sparkles size={14} />
                  <span>Run First Prediction</span>
                </Link>
              }
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', width: '100%' }}>
              {recentPredictions.slice(0, 5).map((pred) => (
                <div
                  key={pred.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-3)',
                    backgroundColor: 'var(--color-surface-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border-subtle)',
                    gap: 'var(--space-3)',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-body-sm)', fontWeight: 600 }}>
                      Log #{String(pred.id).slice(-6)}
                    </span>
                    <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>
                      {pred.contract} · {pred.internet_service} · {pred.tenure} mo · ${Number(pred.monthly_charges || 0).toFixed(2)}/mo
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: pred.churn_prediction === 'Yes' ? 'var(--color-risk-high-subtle)' : 'var(--color-kiwi-subtle)',
                        color: pred.churn_prediction === 'Yes' ? 'var(--color-risk-high)' : 'var(--color-kiwi)',
                        border: `1px solid ${pred.churn_prediction === 'Yes' ? 'var(--color-risk-high-border)' : 'var(--color-kiwi-border)'}`,
                      }}
                    >
                      {pred.churn_prediction === 'Yes' ? 'CHURN' : 'RETAIN'}
                    </span>
                    <RiskBadge level={pred.risk_level} score={pred.churn_probability} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </ChartCard>
      </div>

      {/* Operational Quick Actions Strip */}
      <section
        className="card"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-3)',
          backgroundColor: 'var(--color-surface-subtle)',
          padding: 'var(--space-4)',
        }}
        aria-label="Operational Navigation Strip"
      >
        <Link
          to="/predict"
          className="btn-secondary"
          style={{
            justifyContent: 'flex-start',
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-surface-card)',
          }}
        >
          <Sparkles size={16} style={{ color: 'var(--color-kiwi)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <span style={{ fontWeight: 600, fontSize: 'var(--font-size-body-sm)' }}>Run Prediction</span>
            <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>Score customer profile</span>
          </div>
        </Link>

        <Link
          to="/customers?riskTier=HIGH"
          className="btn-secondary"
          style={{
            justifyContent: 'flex-start',
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-surface-card)',
          }}
        >
          <ShieldAlert size={16} style={{ color: 'var(--color-risk-high)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <span style={{ fontWeight: 600, fontSize: 'var(--font-size-body-sm)' }}>High-Risk Cohort (1,248)</span>
            <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>Inspect directory</span>
          </div>
        </Link>

        <Link
          to="/insights"
          className="btn-secondary"
          style={{
            justifyContent: 'flex-start',
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-surface-card)',
          }}
        >
          <BarChart2 size={16} style={{ color: 'var(--color-status-info)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <span style={{ fontWeight: 600, fontSize: 'var(--font-size-body-sm)' }}>Model Insights</span>
            <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>Global feature weights</span>
          </div>
        </Link>

        <Link
          to="/retention"
          className="btn-secondary"
          style={{
            justifyContent: 'flex-start',
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-surface-card)',
          }}
        >
          <Target size={16} style={{ color: 'var(--color-kiwi)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <span style={{ fontWeight: 600, fontSize: 'var(--font-size-body-sm)' }}>Retention ROI Simulator</span>
            <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>Preserve portfolio ARR</span>
          </div>
        </Link>
      </section>
    </div>
  )
}
