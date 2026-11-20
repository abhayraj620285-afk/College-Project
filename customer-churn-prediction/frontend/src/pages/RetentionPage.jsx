import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  DollarSign,
  Calendar,
  TrendingDown,
  Target,
  Calculator,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Download,
  Sliders,
  RefreshCw,
  Sparkles,
  Info,
  Layers,
  ChevronRight,
  Zap,
} from 'lucide-react'
import MetricCard from '../components/common/MetricCard'
import ChartCard from '../components/common/ChartCard'
import RiskBadge from '../components/common/RiskBadge'
import { COHORT_SUMMARY, TELCO_COHORT } from '../data/telcoDataset'
import { exportCohortToCsv, getAtRiskCustomers } from '../services/customerService'

// Empirical Kaplan-Meier survival curves by contract tier over 72 months
export const SURVIVAL_DATA = {
  monthToMonth: [
    { m: 0, s: 100 },
    { m: 3, s: 78.5 },
    { m: 6, s: 68.2 },
    { m: 12, s: 54.8 },
    { m: 24, s: 42.1 },
    { m: 36, s: 33.4 },
    { m: 48, s: 26.5 },
    { m: 60, s: 21.0 },
    { m: 72, s: 17.6 },
  ],
  oneYear: [
    { m: 0, s: 100 },
    { m: 3, s: 98.2 },
    { m: 6, s: 96.5 },
    { m: 12, s: 88.7 },
    { m: 24, s: 76.4 },
    { m: 36, s: 66.8 },
    { m: 48, s: 58.1 },
    { m: 60, s: 51.5 },
    { m: 72, s: 46.8 },
  ],
  twoYear: [
    { m: 0, s: 100 },
    { m: 3, s: 99.5 },
    { m: 6, s: 99.1 },
    { m: 12, s: 98.2 },
    { m: 24, s: 94.8 },
    { m: 36, s: 90.2 },
    { m: 48, s: 85.6 },
    { m: 60, s: 81.3 },
    { m: 72, s: 76.5 },
  ],
}

/**
 * Accessible SVG Multi-line Survival Decay Chart.
 */
function SurvivalDecayChart({ activeTiers, hoveredMonth, onHoverMonth }) {
  const width = 640
  const height = 260
  const padLeft = 45
  const padRight = 20
  const padTop = 20
  const padBottom = 35

  const chartW = width - padLeft - padRight
  const chartH = height - padTop - padBottom

  // Mapping coordinate functions
  const getX = (m) => padLeft + (m / 72) * chartW
  const getY = (s) => padTop + chartH - (s / 100) * chartH

  // Convert points array to SVG path string
  const toPath = (points) => {
    return points
      .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(pt.m).toFixed(1)} ${getY(pt.s).toFixed(1)}`)
      .join(' ')
  }

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        role="img"
        aria-label="Kaplan-Meier Survival Decay Curves (0 to 72 Months)"
        style={{ minWidth: '480px', overflow: 'visible' }}
      >
        <title>Customer Survival Decay by Contract Tier</title>

        {/* Horizontal Percentage Gridlines */}
        {[0, 25, 50, 75, 100].map((pct) => {
          const y = getY(pct)
          return (
            <g key={`y-grid-${pct}`}>
              <line
                x1={padLeft}
                y1={y}
                x2={width - padRight}
                y2={y}
                stroke="var(--color-border-subtle)"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={padLeft - 8}
                y={y + 3}
                textAnchor="end"
                fill="var(--color-text-secondary)"
                fontSize="10"
                fontFamily="var(--font-mono)"
              >
                {pct}%
              </text>
            </g>
          )
        })}

        {/* Vertical Month Gridlines */}
        {[0, 12, 24, 36, 48, 60, 72].map((m) => {
          const x = getX(m)
          return (
            <g key={`x-grid-${m}`}>
              <line
                x1={x}
                y1={padTop}
                x2={x}
                y2={padTop + chartH}
                stroke="var(--color-border-subtle)"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={x}
                y={padTop + chartH + 18}
                textAnchor="middle"
                fill="var(--color-text-secondary)"
                fontSize="10"
                fontFamily="var(--font-mono)"
              >
                {m}m
              </text>
            </g>
          )
        })}

        {/* Month-to-Month Curve (Coral) */}
        {activeTiers.monthToMonth && (
          <path
            d={toPath(SURVIVAL_DATA.monthToMonth)}
            fill="none"
            stroke="var(--color-risk-high)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        )}

        {/* One-Year Contract Curve (Amber) */}
        {activeTiers.oneYear && (
          <path
            d={toPath(SURVIVAL_DATA.oneYear)}
            fill="none"
            stroke="var(--color-risk-medium)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        )}

        {/* Two-Year Contract Curve (Kiwi) */}
        {activeTiers.twoYear && (
          <path
            d={toPath(SURVIVAL_DATA.twoYear)}
            fill="none"
            stroke="var(--color-kiwi)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        )}

        {/* Data points for Month-to-Month */}
        {activeTiers.monthToMonth &&
          SURVIVAL_DATA.monthToMonth.map((pt) => (
            <circle
              key={`m2m-${pt.m}`}
              cx={getX(pt.m)}
              cy={getY(pt.s)}
              r="4"
              fill="var(--color-risk-high)"
              stroke="var(--color-canvas-base)"
              strokeWidth="2"
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => onHoverMonth(pt.m)}
            />
          ))}

        {/* Data points for One-Year */}
        {activeTiers.oneYear &&
          SURVIVAL_DATA.oneYear.map((pt) => (
            <circle
              key={`1y-${pt.m}`}
              cx={getX(pt.m)}
              cy={getY(pt.s)}
              r="4"
              fill="var(--color-risk-medium)"
              stroke="var(--color-canvas-base)"
              strokeWidth="2"
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => onHoverMonth(pt.m)}
            />
          ))}

        {/* Data points for Two-Year */}
        {activeTiers.twoYear &&
          SURVIVAL_DATA.twoYear.map((pt) => (
            <circle
              key={`2y-${pt.m}`}
              cx={getX(pt.m)}
              cy={getY(pt.s)}
              r="4.5"
              fill="var(--color-kiwi)"
              stroke="var(--color-canvas-base)"
              strokeWidth="2"
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => onHoverMonth(pt.m)}
            />
          ))}

        {/* Hover Coordinate Cursor */}
        {hoveredMonth != null && (
          <line
            x1={getX(hoveredMonth)}
            y1={padTop}
            x2={getX(hoveredMonth)}
            y2={padTop + chartH}
            stroke="var(--color-text-primary)"
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />
        )}
      </svg>
    </div>
  )
}

/**
 * Retention Campaign Financial ROI Calculator.
 * Computes campaign expenditure, customer save volume, net ARR preserved,
 * ROI multiplier, and break-even save rate under variable parameters.
 */
export function calculateRetentionRoi({
  targetCount = 1248,
  concessionAmount = 15,
  concessionDuration = 6,
  outreachCost = 10,
  expectedSaveRate = 35,
  avgMonthlyRev = 74.44,
} = {}) {
  const annualRevPerUser = avgMonthlyRev * 12 // $893.28 ARR per subscriber
  const costPerAccount = concessionAmount * concessionDuration + outreachCost
  const totalCampaignCost = targetCount * costPerAccount

  const savedAccounts = Math.round(targetCount * (expectedSaveRate / 100))
  const grossSavedARR = savedAccounts * annualRevPerUser
  const netPreservedARR = grossSavedARR - totalCampaignCost
  const roiMultiplier = totalCampaignCost > 0 ? (grossSavedARR / totalCampaignCost).toFixed(2) : '0'
  const breakEvenRate =
    annualRevPerUser > 0 ? ((costPerAccount / annualRevPerUser) * 100).toFixed(1) : '0'

  return {
    totalCampaignCost,
    savedAccounts,
    grossSavedARR,
    netPreservedARR,
    roiMultiplier,
    breakEvenRate,
    costPerAccount,
    annualRevPerUser,
  }
}

export default function RetentionPage() {
  // Survival curves active toggles
  const [activeTiers, setActiveTiers] = useState({
    monthToMonth: true,
    oneYear: true,
    twoYear: true,
  })
  const [hoveredMonth, setHoveredMonth] = useState(12)

  // Retention ROI Simulator Configuration State
  const [targetCount, setTargetCount] = useState(1248) // Default: all high risk
  const [concessionAmount, setConcessionAmount] = useState(15) // $15/mo discount
  const [concessionDuration, setConcessionDuration] = useState(6) // 6 months duration
  const [outreachCost, setOutreachCost] = useState(10) // $10 per account outreach
  const [expectedSaveRate, setExpectedSaveRate] = useState(35) // 35% save rate benchmark

  // Quick preset targets
  const applyTargetPreset = (count) => {
    setTargetCount(count)
  }

  // Reactive Financial Formulas
  const simResults = useMemo(() => {
    return calculateRetentionRoi({
      targetCount,
      concessionAmount,
      concessionDuration,
      outreachCost,
      expectedSaveRate,
    })
  }, [targetCount, concessionAmount, concessionDuration, outreachCost, expectedSaveRate])

  // CSV Export for High-Risk Cohort
  const handleExportAtRisk = () => {
    const atRisk = getAtRiskCustomers(0.70)
    const csvData = exportCohortToCsv(atRisk)
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `at_risk_retention_cohort_${new Date().toISOString().slice(0, 10)}.csv`)
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
            <span className="eyebrow">Revenue Protection & Economic Simulation</span>
            <h1>Cohort Retention & MRR Exposure</h1>
            <p className="page-header-description">
              Analyze subscription survival decay across contract tenures, track monthly recurring revenue vulnerability, and simulate retention campaign return-on-investment.
            </p>
          </div>
          <div className="page-header-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleExportAtRisk}
              aria-label="Export At-Risk Cohort CSV"
            >
              <Download size={15} />
              <span>Export At-Risk CSV (1,248)</span>
            </button>
            <Link to="/customers?riskTier=HIGH" className="btn-primary">
              <span>Inspect High-Risk</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* Financial Exposure Highlights */}
      <section
        aria-label="Financial Exposure Key Performance Indicators"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        <MetricCard
          label="Monthly Revenue at Risk"
          value="$139,131"
          subtext="30.5% of total portfolio MRR"
          variant="high-risk"
          icon={DollarSign}
          trend="negative"
          trendValue="1,248 accounts"
          progress={30.5}
        />

        <MetricCard
          label="Annualized Exposure (ARR)"
          value="$1,669,570"
          subtext="Projected annual loss if unmitigated"
          variant="medium-risk"
          icon={TrendingDown}
          trend="negative"
          trendValue="ARR Vulnerability"
          progress={30.5}
        />

        <MetricCard
          label="Total Portfolio MRR"
          value="$456,117"
          subtext="Across 7,043 active Telco accounts"
          variant="default"
          icon={Calendar}
          progress={100}
        />

        <MetricCard
          label="Projected Saved ARR (35% Save)"
          value="$389,850"
          subtext="Net ARR preserved via active playbooks"
          variant="kiwi"
          icon={ShieldCheck}
          trend="positive"
          trendValue="ROI 3.8x"
          progress={75.4}
        />
      </section>

      {/* Multi-Line Cohort Retention Curves */}
      <ChartCard
        title="Survival Decay Curves by Contract Tier (Months 0–72)"
        subtitle="Empirical customer survival curves based on 7,043 Telco cohort accounts"
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <button
              type="button"
              onClick={() => setActiveTiers((t) => ({ ...t, monthToMonth: !t.monthToMonth }))}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--font-size-micro)',
                fontWeight: 600,
                backgroundColor: activeTiers.monthToMonth ? 'var(--color-risk-high-subtle)' : 'var(--color-surface-subtle)',
                color: activeTiers.monthToMonth ? 'var(--color-risk-high)' : 'var(--color-text-secondary)',
                border: `1px solid ${activeTiers.monthToMonth ? 'var(--color-risk-high-border)' : 'var(--color-border-subtle)'}`,
                cursor: 'pointer',
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-risk-high)' }} />
              <span>Month-to-Month</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTiers((t) => ({ ...t, oneYear: !t.oneYear }))}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--font-size-micro)',
                fontWeight: 600,
                backgroundColor: activeTiers.oneYear ? 'var(--color-risk-medium-subtle)' : 'var(--color-surface-subtle)',
                color: activeTiers.oneYear ? 'var(--color-risk-medium)' : 'var(--color-text-secondary)',
                border: `1px solid ${activeTiers.oneYear ? 'var(--color-risk-medium-border)' : 'var(--color-border-subtle)'}`,
                cursor: 'pointer',
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-risk-medium)' }} />
              <span>One-Year</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTiers((t) => ({ ...t, twoYear: !t.twoYear }))}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--font-size-micro)',
                fontWeight: 600,
                backgroundColor: activeTiers.twoYear ? 'var(--color-kiwi-subtle)' : 'var(--color-surface-subtle)',
                color: activeTiers.twoYear ? 'var(--color-kiwi)' : 'var(--color-text-secondary)',
                border: `1px solid ${activeTiers.twoYear ? 'var(--color-kiwi-border)' : 'var(--color-border-subtle)'}`,
                cursor: 'pointer',
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-kiwi)' }} />
              <span>Two-Year</span>
            </button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', width: '100%' }}>
          <SurvivalDecayChart
            activeTiers={activeTiers}
            hoveredMonth={hoveredMonth}
            onHoverMonth={setHoveredMonth}
          />

          {/* Interactive Coordinate Inspection Readout */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-3)',
              padding: 'var(--space-3) var(--space-4)',
              backgroundColor: 'var(--color-surface-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-subtle)',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Calendar size={16} style={{ color: 'var(--color-kiwi)' }} />
              <span style={{ fontSize: 'var(--font-size-body-sm)' }}>
                Lifecycle Milestone:{' '}
                <strong style={{ color: 'var(--color-text-primary)' }}>Month {hoveredMonth}</strong>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>M2M Survival:</span>
              <span className="font-tabular" style={{ fontWeight: 700, color: 'var(--color-risk-high)' }}>
                {SURVIVAL_DATA.monthToMonth.find((p) => p.m === hoveredMonth)?.s ?? '—'}%
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>1-Year Survival:</span>
              <span className="font-tabular" style={{ fontWeight: 700, color: 'var(--color-risk-medium)' }}>
                {SURVIVAL_DATA.oneYear.find((p) => p.m === hoveredMonth)?.s ?? '—'}%
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>2-Year Survival:</span>
              <span className="font-tabular" style={{ fontWeight: 700, color: 'var(--color-kiwi)' }}>
                {SURVIVAL_DATA.twoYear.find((p) => p.m === hoveredMonth)?.s ?? '—'}%
              </span>
            </div>
          </div>
        </div>
      </ChartCard>

      {/* MRR Exposure & LTV Analysis Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: 'var(--space-6)' }}>
        {/* Left: MRR Exposure Breakdown by Tier */}
        <ChartCard
          title="MRR Exposure by Risk Tier"
          subtitle="Portfolio revenue stratification across 7,043 accounts ($456,117 total MRR)"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', width: '100%' }}>
            {/* Stacked Horizontal Revenue Bar */}
            <div>
              <div
                style={{
                  display: 'flex',
                  width: '100%',
                  height: '24px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  marginBottom: 'var(--space-3)',
                }}
              >
                {/* High Risk Segment (30.5%) */}
                <div
                  style={{
                    width: '30.5%',
                    backgroundColor: 'var(--color-risk-high)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                  title="High Risk: $139,131 (30.5%)"
                >
                  30.5%
                </div>
                {/* Medium Risk Segment (23.4%) */}
                <div
                  style={{
                    width: '23.4%',
                    backgroundColor: 'var(--color-risk-medium)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#121212',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                  title="Medium Risk: $106,730 (23.4%)"
                >
                  23.4%
                </div>
                {/* Low Risk Segment (46.1%) */}
                <div
                  style={{
                    width: '46.1%',
                    backgroundColor: 'var(--color-kiwi)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-text-on-kiwi)',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                  title="Low Risk: $210,255 (46.1%)"
                >
                  46.1%
                </div>
              </div>
            </div>

            {/* Metric Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: 'var(--space-2) var(--space-3)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--font-size-body-sm)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-risk-high)' }} />
                  <span>High Risk Tier (1,248 accounts)</span>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                  <span className="font-tabular" style={{ color: 'var(--color-text-secondary)' }}>Avg $74.44/mo</span>
                  <span className="font-tabular" style={{ fontWeight: 700, color: 'var(--color-risk-high)' }}>$139,131 MRR</span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: 'var(--space-2) var(--space-3)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--font-size-body-sm)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-risk-medium)' }} />
                  <span>Medium Risk Tier (1,642 accounts)</span>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                  <span className="font-tabular" style={{ color: 'var(--color-text-secondary)' }}>Avg $65.00/mo</span>
                  <span className="font-tabular" style={{ fontWeight: 700, color: 'var(--color-risk-medium)' }}>$106,730 MRR</span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: 'var(--space-2) var(--space-3)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--font-size-body-sm)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-kiwi)' }} />
                  <span>Low Risk Tier (4,153 accounts)</span>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                  <span className="font-tabular" style={{ color: 'var(--color-text-secondary)' }}>Avg $50.63/mo</span>
                  <span className="font-tabular" style={{ fontWeight: 700, color: 'var(--color-kiwi)' }}>$210,255 MRR</span>
                </div>
              </div>
            </div>
          </div>
        </ChartCard>

        {/* Right: Customer Lifetime Value (LTV) Impact */}
        <ChartCard
          title="Customer Lifetime Value (LTV) Leverage"
          subtitle="Empirical subscriber tenure and realized LTV across contract commitments"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', width: '100%' }}>
            {/* Month-to-Month */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--space-3)',
                backgroundColor: 'var(--color-surface-subtle)',
                borderRadius: 'var(--radius-md)',
                borderLeft: '3px solid var(--color-risk-high)',
              }}
            >
              <div>
                <strong style={{ fontSize: 'var(--font-size-body)' }}>Month-to-Month</strong>
                <div style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>
                  18.0 months average realized tenure
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="font-tabular" style={{ fontSize: 'var(--font-size-h2)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  $1,195
                </div>
                <div style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>Baseline LTV</div>
              </div>
            </div>

            {/* One-Year */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--space-3)',
                backgroundColor: 'var(--color-surface-subtle)',
                borderRadius: 'var(--radius-md)',
                borderLeft: '3px solid var(--color-risk-medium)',
              }}
            >
              <div>
                <strong style={{ fontSize: 'var(--font-size-body)' }}>One-Year Contract</strong>
                <div style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>
                  42.0 months average realized tenure
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="font-tabular" style={{ fontSize: 'var(--font-size-h2)', fontWeight: 700, color: 'var(--color-risk-medium)' }}>
                  $2,732
                </div>
                <div style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-risk-medium)' }}>+128% LTV Expansion</div>
              </div>
            </div>

            {/* Two-Year */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--space-3)',
                backgroundColor: 'var(--color-surface-subtle)',
                borderRadius: 'var(--radius-md)',
                borderLeft: '3px solid var(--color-kiwi)',
              }}
            >
              <div>
                <strong style={{ fontSize: 'var(--font-size-body)' }}>Two-Year Contract</strong>
                <div style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>
                  57.0 months average realized tenure
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="font-tabular" style={{ fontSize: 'var(--font-size-h2)', fontWeight: 700, color: 'var(--color-kiwi)' }}>
                  $3,464
                </div>
                <div style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-kiwi)' }}>+190% LTV Expansion</div>
              </div>
            </div>

            {/* Leverage Formula Callout */}
            <div
              style={{
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface-subtle)',
                border: '1px solid var(--color-border-subtle)',
                fontSize: 'var(--font-size-body-sm)',
                lineHeight: 1.4,
              }}
            >
              <strong style={{ color: 'var(--color-text-primary)' }}>LTV Extension Leverage: </strong>
              <span style={{ color: 'var(--color-text-secondary)' }}>
                Each additional +3 months of subscriber tenure extension preserves <strong style={{ color: 'var(--color-kiwi)' }}>$223.32</strong> in gross revenue per account at average billing rates.
              </span>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Interactive Retention Campaign ROI Simulator */}
      <ChartCard
        title="Retention Campaign ROI Simulator"
        subtitle="Simulate budget expenditure, customer saves, and net ARR preserved under variable campaign parameters"
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'var(--space-6)',
            alignItems: 'flex-start',
          }}
        >
          {/* Left Column: Parameter Inputs Panel */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
              padding: 'var(--space-4)',
              backgroundColor: 'var(--color-surface-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="eyebrow" style={{ color: 'var(--color-kiwi)' }}>Campaign Configuration</span>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  setTargetCount(1248)
                  setConcessionAmount(15)
                  setConcessionDuration(6)
                  setOutreachCost(10)
                  setExpectedSaveRate(35)
                }}
                style={{ fontSize: 'var(--font-size-micro)', padding: '2px 8px' }}
              >
                Reset Defaults
              </button>
            </div>

            {/* Quick Cohort Target Presets */}
            <div>
              <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                TARGET AUDIENCE PRESETS:
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={targetCount === 250 ? 'btn-secondary' : 'btn-ghost'}
                  onClick={() => applyTargetPreset(250)}
                  style={{ fontSize: 'var(--font-size-micro)', padding: '4px 8px' }}
                >
                  Top 250 Critical
                </button>
                <button
                  type="button"
                  className={targetCount === 1248 ? 'btn-secondary' : 'btn-ghost'}
                  onClick={() => applyTargetPreset(1248)}
                  style={{ fontSize: 'var(--font-size-micro)', padding: '4px 8px' }}
                >
                  All High Risk (1,248)
                </button>
                <button
                  type="button"
                  className={targetCount === 2890 ? 'btn-secondary' : 'btn-ghost'}
                  onClick={() => applyTargetPreset(2890)}
                  style={{ fontSize: 'var(--font-size-micro)', padding: '4px 8px' }}
                >
                  High + Med (2,890)
                </button>
              </div>
            </div>

            {/* Slider 1: Target Accounts */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-body-sm)', marginBottom: '4px' }}>
                <span>Target Accounts:</span>
                <strong className="font-tabular" style={{ color: 'var(--color-kiwi)' }}>{targetCount.toLocaleString()}</strong>
              </div>
              <input
                type="range"
                min="50"
                max="3000"
                step="50"
                value={targetCount}
                onChange={(e) => setTargetCount(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-kiwi)', cursor: 'pointer' }}
                aria-label="Target customer accounts count"
              />
            </div>

            {/* Slider 2: Monthly Discount Concession */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-body-sm)', marginBottom: '4px' }}>
                <span>Monthly Concession Discount:</span>
                <strong className="font-tabular" style={{ color: 'var(--color-kiwi)' }}>${concessionAmount}/mo</strong>
              </div>
              <input
                type="range"
                min="5"
                max="35"
                step="5"
                value={concessionAmount}
                onChange={(e) => setConcessionAmount(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-kiwi)', cursor: 'pointer' }}
                aria-label="Monthly concession discount amount"
              />
            </div>

            {/* Slider 3: Concession Duration */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-body-sm)', marginBottom: '4px' }}>
                <span>Concession Duration:</span>
                <strong className="font-tabular" style={{ color: 'var(--color-kiwi)' }}>{concessionDuration} months</strong>
              </div>
              <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                {[3, 6, 9, 12].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    className={concessionDuration === dur ? 'btn-secondary' : 'btn-ghost'}
                    onClick={() => setConcessionDuration(dur)}
                    style={{ flex: 1, padding: '4px', fontSize: 'var(--font-size-micro)' }}
                  >
                    {dur} mo
                  </button>
                ))}
              </div>
            </div>

            {/* Slider 4: Campaign Outreach Cost */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-body-sm)', marginBottom: '4px' }}>
                <span>Outreach Overhead Cost:</span>
                <strong className="font-tabular" style={{ color: 'var(--color-kiwi)' }}>${outreachCost}/account</strong>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="5"
                value={outreachCost}
                onChange={(e) => setOutreachCost(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-kiwi)', cursor: 'pointer' }}
                aria-label="Campaign outreach overhead cost per customer"
              />
            </div>

            {/* Slider 5: Expected Save Rate */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-body-sm)', marginBottom: '4px' }}>
                <span>Expected Conversion / Save Rate:</span>
                <strong className="font-tabular" style={{ color: 'var(--color-kiwi)' }}>{expectedSaveRate}%</strong>
              </div>
              <input
                type="range"
                min="10"
                max="70"
                step="5"
                value={expectedSaveRate}
                onChange={(e) => setExpectedSaveRate(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-kiwi)', cursor: 'pointer' }}
                aria-label="Expected retention campaign save rate percentage"
              />
            </div>
          </div>

          {/* Right Column: Reactive Financial Cockpit */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Highlighted Net Preserved ARR Banner */}
            <div
              style={{
                padding: 'var(--space-5)',
                backgroundColor: 'var(--color-surface-subtle)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-kiwi-border)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <span className="eyebrow" style={{ color: 'var(--color-kiwi)' }}>
                Net Economic Value Generated
              </span>
              <div
                className="font-tabular"
                style={{
                  fontFamily: 'var(--font-kpi)',
                  fontSize: 'var(--font-size-display-1)',
                  fontWeight: 700,
                  color: simResults.netPreservedARR > 0 ? 'var(--color-kiwi)' : 'var(--color-risk-high)',
                  lineHeight: 1.1,
                  margin: 'var(--space-2) 0',
                }}
              >
                ${Math.max(0, Math.round(simResults.netPreservedARR)).toLocaleString()}
              </div>
              <p style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
                Net preserved Annual Recurring Revenue (ARR) after subtracting total concession and outreach overhead budgets.
              </p>
            </div>

            {/* Financial Decomposition Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 'var(--space-3)',
              }}
            >
              <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>ROI Multiplier:</span>
                <div className="font-tabular" style={{ fontSize: 'var(--font-size-h2)', fontWeight: 700, color: 'var(--color-kiwi)' }}>
                  {simResults.roiMultiplier}x
                </div>
                <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>Gross saved vs cost</span>
              </div>

              <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>Saved Subscribers:</span>
                <div className="font-tabular" style={{ fontSize: 'var(--font-size-h2)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {simResults.savedAccounts.toLocaleString()}
                </div>
                <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>Retained accounts</span>
              </div>

              <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>Total Campaign Budget:</span>
                <div className="font-tabular" style={{ fontSize: 'var(--font-size-h2)', fontWeight: 700, color: 'var(--color-risk-medium)' }}>
                  ${Math.round(simResults.totalCampaignCost).toLocaleString()}
                </div>
                <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>${simResults.costPerAccount}/target</span>
              </div>

              <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>Break-Even Save Rate:</span>
                <div className="font-tabular" style={{ fontSize: 'var(--font-size-h2)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {simResults.breakEvenRate}%
                </div>
                <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>Min required success</span>
              </div>
            </div>

            {/* Sensitivity Comparison Cards (3 Quick Scenarios) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 'var(--space-2)',
              }}
            >
              <div
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', display: 'block' }}>CONSERVATIVE</span>
                <span style={{ fontSize: 'var(--font-size-micro)', fontWeight: 600 }}>20% Save</span>
                <div className="font-tabular" style={{ fontSize: 'var(--font-size-body-sm)', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                  ${Math.round(Math.round(targetCount * 0.20) * 893.28 - simResults.totalCampaignCost).toLocaleString()}
                </div>
              </div>

              <div
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  backgroundColor: 'var(--color-kiwi-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-kiwi-border)',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: '10px', color: 'var(--color-kiwi)', display: 'block' }}>EXPECTED</span>
                <span style={{ fontSize: 'var(--font-size-micro)', fontWeight: 600, color: 'var(--color-kiwi)' }}>35% Save</span>
                <div className="font-tabular" style={{ fontSize: 'var(--font-size-body-sm)', fontWeight: 700, color: 'var(--color-kiwi)', marginTop: '2px' }}>
                  ${Math.round(simResults.netPreservedARR).toLocaleString()}
                </div>
              </div>

              <div
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', display: 'block' }}>OPTIMISTIC</span>
                <span style={{ fontSize: 'var(--font-size-micro)', fontWeight: 600 }}>50% Save</span>
                <div className="font-tabular" style={{ fontSize: 'var(--font-size-body-sm)', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                  ${Math.round(Math.round(targetCount * 0.50) * 893.28 - simResults.totalCampaignCost).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ChartCard>
    </div>
  )
}
