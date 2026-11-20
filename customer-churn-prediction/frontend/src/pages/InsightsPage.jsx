import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Info,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  ExternalLink,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  Layers,
  ArrowRight,
  Shield,
  Activity,
} from 'lucide-react'
import MetricCard from '../components/common/MetricCard'
import ChartCard from '../components/common/ChartCard'
import RiskBadge from '../components/common/RiskBadge'
import { FEATURE_IMPORTANCE, MODEL_METADATA, PERFORMANCE_METRICS } from '../data/modelMeta'
import { COHORT_SUMMARY } from '../data/telcoDataset'

// Mitigation strategies mapping for feature categories and key drivers
const MITIGATION_PLAYBOOKS = {
  Contract_Two_year: {
    title: 'Multi-Year Retention Anchor',
    action: 'Preserve Two-Year Commitments with Proactive Renewal Windows',
    guidance: 'Subscribers on 2-year contracts exhibit a 0.24x odds ratio (76% lower churn probability). Target customers approaching month 20 with early-renewal rate guarantees before rollover into month-to-month.',
    recommendedRoute: '/campaigns',
  },
  InternetService_Fiber_optic: {
    title: 'Fiber Service Experience Stabilization',
    action: 'Deploy Proactive Quality of Service (QoS) & VIP Support',
    guidance: 'Fiber optic users carry the highest churn hazard (+1.2224 weight, OR 3.40x). Their churn is typically triggered by price sensitivity ($70+/mo) and bandwidth expectations. Offer complimentary TechSupport and proactive line diagnostics within 90 days of install.',
    recommendedRoute: '/campaigns',
  },
  tenure: {
    title: 'First-Year Onboarding Shield',
    action: 'Deliver Milestone Concierge Outreach at 30, 60, and 90 Days',
    guidance: 'Tenure exhibits a strong protective coefficient (-1.1562). The initial 90 days represent 52% of total lifetime churn hazard. Once accounts survive past 24 months, churn risk drops by 83%. Focus onboarding budgets on the first 90 days.',
    recommendedRoute: '/retention',
  },
  PaymentMethod_Electronic_check: {
    title: 'Payment Friction Elimination',
    action: 'Incentivize Credit Card / Bank Automated Billing',
    guidance: 'Electronic check billing correlates with a 1.50x higher churn rate (+0.4025 weight). Offer a one-time $10 billing credit to transition electronic check users onto automatic recurring credit card or ACH payment.',
    recommendedRoute: '/campaigns',
  },
  default: {
    title: 'Targeted Retention Intervention',
    action: 'Engage Targeted Retention Campaign Playbook',
    guidance: 'Analyze customer segment composition and configure automated engagement triggers based on model feature attribution.',
    recommendedRoute: '/campaigns',
  },
}

export default function InsightsPage() {
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState('abs') // 'abs' | 'churn' | 'retention'
  const [selectedFeature, setSelectedFeature] = useState(FEATURE_IMPORTANCE[0])

  // Categories list with counts
  const categories = useMemo(() => {
    const cats = ['ALL', 'Contract', 'Account', 'Service', 'Billing', 'Security', 'Support', 'Demographics']
    return cats.map((cat) => {
      const count =
        cat === 'ALL'
          ? FEATURE_IMPORTANCE.length
          : FEATURE_IMPORTANCE.filter((f) => f.category === cat).length
      return { id: cat, label: cat, count }
    })
  }, [])

  // Filtered and sorted features
  const filteredFeatures = useMemo(() => {
    let result = FEATURE_IMPORTANCE.filter((f) => {
      if (selectedCategory !== 'ALL' && f.category !== selectedCategory) {
        return false
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return f.displayName.toLowerCase().includes(q) || f.feature.toLowerCase().includes(q)
      }
      return true
    })

    result.sort((a, b) => {
      if (sortOrder === 'abs') return b.absWeight - a.absWeight
      if (sortOrder === 'churn') return b.weight - a.weight // positive first
      if (sortOrder === 'retention') return a.weight - b.weight // negative first
      return 0
    })

    return result
  }, [selectedCategory, searchQuery, sortOrder])

  // Get active mitigation strategy
  const activeMitigation = useMemo(() => {
    if (!selectedFeature) return MITIGATION_PLAYBOOKS.default
    const cleanKey = selectedFeature.feature.replace(/[^a-zA-Z0-9]/g, '_')
    return (
      MITIGATION_PLAYBOOKS[cleanKey] ||
      MITIGATION_PLAYBOOKS[selectedFeature.feature] ||
      MITIGATION_PLAYBOOKS.default
    )
  }, [selectedFeature])

  // Max absolute weight for relative bar width
  const maxAbsWeight = useMemo(() => {
    return Math.max(...FEATURE_IMPORTANCE.map((f) => f.absWeight), 1.5)
  }, [])

  return (
    <div className="page-container">
      {/* Semantic Page Header */}
      <header className="page-header">
        <div className="page-header-top">
          <div className="page-header-title-group">
            <span className="eyebrow">Model Explainability & Feature Intelligence</span>
            <h1>Churn Drivers & Global Feature Attribution</h1>
            <p className="page-header-description">
              Standardized linear weights from the production Logistic Regression model (scikit-learn 1.9.0). Quantifies how customer account features amplify or mitigate churn probability.
            </p>
          </div>
          <div className="page-header-actions">
            <div
              className="badge"
              style={{
                backgroundColor: 'var(--color-surface-subtle)',
                color: 'var(--color-kiwi)',
                border: '1px solid var(--color-kiwi-border)',
                padding: '6px 12px',
                fontSize: 'var(--font-size-body-sm)',
              }}
            >
              <span>30 Features · Standardized Beta Weights</span>
            </div>
            <Link to="/retention" className="btn-secondary">
              <span>Retention Analytics</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* Top-Level Attribution Highlights */}
      <section
        aria-label="Key Model Attribution Highlights"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        <MetricCard
          label="Top Churn Catalyst"
          value="Fiber Optic (+1.22)"
          subtext="3.40x odds ratio vs DSL/None"
          variant="high-risk"
          icon={AlertCircle}
          trend="negative"
          trendValue="Hazard +240%"
          progress={86.5}
        />

        <MetricCard
          label="Primary Retention Anchor"
          value="2-Year Contract (-1.41)"
          subtext="0.24x odds ratio (76% reduction)"
          variant="kiwi"
          icon={ShieldCheck}
          trend="positive"
          trendValue="Protective -76%"
          progress={100}
        />

        <MetricCard
          label="Tenure Longevity Shield"
          value="Tenure (-1.16)"
          subtext="83% risk drop after 24 months"
          variant="kiwi"
          icon={TrendingDown}
          trend="positive"
          trendValue="Protective"
          progress={82.0}
        />

        <MetricCard
          label="Payment Friction Factor"
          value="E-Check (+0.40)"
          subtext="1.50x odds ratio vs automated billing"
          variant="medium-risk"
          icon={TrendingUp}
          trend="negative"
          trendValue="Hazard +50%"
          progress={28.5}
        />
      </section>

      {/* Interactive Feature Attribution Explorer & Inspector */}
      <ChartCard
        title="Global Feature Attribution Explorer"
        subtitle="Standardized regression coefficients (β) and odds ratios (e^β) with zero center-line divergence"
      >
        {/* Toolbar Controls */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-4)',
          }}
        >
          {/* Top row: Search & Sort */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 'var(--space-3)',
            }}
          >
            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '260px', flex: '1 1 260px' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-secondary)',
                }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search features (e.g. Contract, Fiber, TechSupport)..."
                aria-label="Filter features by keyword"
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 34px',
                  backgroundColor: 'var(--color-surface-subtle)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--font-size-body-sm)',
                }}
              />
            </div>

            {/* Sort Order Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>SORT:</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  type="button"
                  className={sortOrder === 'abs' ? 'btn-secondary' : 'btn-ghost'}
                  onClick={() => setSortOrder('abs')}
                  style={{
                    padding: '4px 8px',
                    fontSize: 'var(--font-size-micro)',
                    border: sortOrder === 'abs' ? '1px solid var(--color-border-strong)' : '1px solid transparent',
                  }}
                >
                  Absolute Impact
                </button>
                <button
                  type="button"
                  className={sortOrder === 'churn' ? 'btn-secondary' : 'btn-ghost'}
                  onClick={() => setSortOrder('churn')}
                  style={{
                    padding: '4px 8px',
                    fontSize: 'var(--font-size-micro)',
                    border: sortOrder === 'churn' ? '1px solid var(--color-risk-high-border)' : '1px solid transparent',
                    color: sortOrder === 'churn' ? 'var(--color-risk-high)' : undefined,
                  }}
                >
                  Churn Drivers (+)
                </button>
                <button
                  type="button"
                  className={sortOrder === 'retention' ? 'btn-secondary' : 'btn-ghost'}
                  onClick={() => setSortOrder('retention')}
                  style={{
                    padding: '4px 8px',
                    fontSize: 'var(--font-size-micro)',
                    border: sortOrder === 'retention' ? '1px solid var(--color-kiwi-border)' : '1px solid transparent',
                    color: sortOrder === 'retention' ? 'var(--color-kiwi)' : undefined,
                  }}
                >
                  Retention Anchors (-)
                </button>
              </div>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
            }}
          >
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--font-size-micro)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor: isActive ? 'var(--color-surface-highlight)' : 'var(--color-surface-subtle)',
                    color: isActive ? 'var(--color-kiwi)' : 'var(--color-text-secondary)',
                    border: isActive ? '1px solid var(--color-kiwi-border)' : '1px solid var(--color-border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <span>{cat.label}</span>
                  <span
                    style={{
                      fontSize: '9px',
                      padding: '1px 5px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: isActive ? 'var(--color-kiwi-subtle)' : 'var(--color-surface-card)',
                      color: isActive ? 'var(--color-kiwi)' : 'var(--color-text-tertiary)',
                    }}
                  >
                    {cat.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Bi-Directional Feature Attribution Visualizer & Inspector Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: 'var(--space-6)',
            alignItems: 'flex-start',
          }}
        >
          {/* Left Column: Bi-Directional Diverging Bar Chart */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
              maxHeight: '520px',
              overflowY: 'auto',
              paddingRight: 'var(--space-2)',
            }}
          >
            {/* Chart Legend Header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '170px 1fr 65px 65px',
                padding: 'var(--space-2) var(--space-3)',
                fontSize: 'var(--font-size-micro)',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
                borderBottom: '1px solid var(--color-border-subtle)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              <span>Feature</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', textAlign: 'center' }}>
                <span style={{ color: 'var(--color-kiwi)' }}>← Protective</span>
                <span style={{ color: 'var(--color-risk-high)' }}>Hazard →</span>
              </div>
              <span style={{ textAlign: 'right' }}>Weight (β)</span>
              <span style={{ textAlign: 'right' }}>Odds (e^β)</span>
            </div>

            {/* Feature Bars List */}
            {filteredFeatures.map((feat) => {
              const isSelected = selectedFeature?.feature === feat.feature
              const isProtective = feat.weight < 0
              const absVal = Math.abs(feat.weight)
              const barWidthPct = Math.min(100, (absVal / maxAbsWeight) * 100)
              const oddsRatio = Math.exp(feat.weight).toFixed(2)

              return (
                <div
                  key={feat.feature}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedFeature(feat)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelectedFeature(feat)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '170px 1fr 65px 65px',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isSelected ? 'var(--color-surface-highlight)' : 'var(--color-surface-subtle)',
                    border: isSelected ? '1px solid var(--color-kiwi-border)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'background-color var(--transition-fast), border-color var(--transition-fast)',
                  }}
                  aria-label={`${feat.displayName}: beta weight ${feat.weight.toFixed(3)}, odds ratio ${oddsRatio}`}
                >
                  {/* Feature Label & Category */}
                  <div style={{ overflow: 'hidden' }}>
                    <div
                      style={{
                        fontSize: 'var(--font-size-body-sm)',
                        fontWeight: 600,
                        color: 'var(--color-text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={feat.displayName}
                    >
                      {feat.displayName}
                    </div>
                    <span style={{ fontSize: '9px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                      {feat.category}
                    </span>
                  </div>

                  {/* Bi-Directional Diverging Track */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '2px',
                      height: '12px',
                      backgroundColor: 'var(--color-surface-card)',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    {/* Left Side: Protective / Negative Weight */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', height: '100%' }}>
                      {isProtective && (
                        <div
                          style={{
                            width: `${barWidthPct}%`,
                            height: '100%',
                            backgroundColor: 'var(--color-kiwi)',
                            borderRadius: '2px 0 0 2px',
                          }}
                        />
                      )}
                    </div>

                    {/* Right Side: Churn Promoter / Positive Weight */}
                    <div style={{ display: 'flex', justifyContent: 'flex-start', height: '100%' }}>
                      {!isProtective && (
                        <div
                          style={{
                            width: `${barWidthPct}%`,
                            height: '100%',
                            backgroundColor: 'var(--color-risk-high)',
                            borderRadius: '0 2px 2px 0',
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Weight Readout */}
                  <span
                    className="font-tabular"
                    style={{
                      textAlign: 'right',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--font-size-body-sm)',
                      fontWeight: 600,
                      color: isProtective ? 'var(--color-kiwi)' : 'var(--color-risk-high)',
                    }}
                  >
                    {feat.weight > 0 ? `+${feat.weight.toFixed(2)}` : feat.weight.toFixed(2)}
                  </span>

                  {/* Odds Ratio Readout */}
                  <span
                    className="font-tabular"
                    style={{
                      textAlign: 'right',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--font-size-micro)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {oddsRatio}x
                  </span>
                </div>
              )
            })}
          </div>

          {/* Right Column: Feature Inspector & Mitigation Callout */}
          <div
            className="card"
            style={{
              backgroundColor: 'var(--color-surface-subtle)',
              border: '1px solid var(--color-border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
              position: 'sticky',
              top: 'var(--space-4)',
            }}
          >
            {selectedFeature ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span className="eyebrow" style={{ color: 'var(--color-kiwi)' }}>
                      {selectedFeature.category} Attribute
                    </span>
                    <h3 style={{ marginTop: '2px', fontSize: 'var(--font-size-h2)' }}>
                      {selectedFeature.displayName}
                    </h3>
                    <code style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>
                      {selectedFeature.feature}
                    </code>
                  </div>
                  <span
                    className="badge"
                    style={{
                      backgroundColor:
                        selectedFeature.weight < 0 ? 'var(--color-kiwi-subtle)' : 'var(--color-risk-high-subtle)',
                      color: selectedFeature.weight < 0 ? 'var(--color-kiwi)' : 'var(--color-risk-high)',
                      border: `1px solid ${
                        selectedFeature.weight < 0 ? 'var(--color-kiwi-border)' : 'var(--color-risk-high-border)'
                      }`,
                    }}
                  >
                    {selectedFeature.weight < 0 ? 'RETENTION ANCHOR' : 'CHURN PROMOTER'}
                  </span>
                </div>

                {/* Mathematical Impact Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-3)',
                    backgroundColor: 'var(--color-surface-card)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div>
                    <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>
                      Standardized Beta (β):
                    </span>
                    <div
                      className="font-tabular"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--font-size-body-lg)',
                        fontWeight: 700,
                        color: selectedFeature.weight < 0 ? 'var(--color-kiwi)' : 'var(--color-risk-high)',
                      }}
                    >
                      {selectedFeature.weight > 0 ? `+${selectedFeature.weight.toFixed(4)}` : selectedFeature.weight.toFixed(4)}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>
                      Calculated Odds Ratio (e^β):
                    </span>
                    <div
                      className="font-tabular"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--font-size-body-lg)',
                        fontWeight: 700,
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      {Math.exp(selectedFeature.weight).toFixed(3)}x
                    </div>
                  </div>
                </div>

                {/* Plain-Language Interpretation */}
                <div style={{ fontSize: 'var(--font-size-body-sm)', lineHeight: 1.5, color: 'var(--color-text-secondary)' }}>
                  <strong style={{ color: 'var(--color-text-primary)' }}>Statistical Interpretation: </strong>
                  {selectedFeature.weight < 0 ? (
                    <>
                      Holding other variables constant, this attribute reduces the log-odds of subscriber churn by{' '}
                      <strong style={{ color: 'var(--color-kiwi)' }}>{Math.abs(selectedFeature.weight).toFixed(2)}</strong>,
                      corresponding to a {( (1 - Math.exp(selectedFeature.weight)) * 100 ).toFixed(1)}% drop in churn hazard.
                    </>
                  ) : (
                    <>
                      Holding other variables constant, this attribute multiplies the subscriber's churn hazard by{' '}
                      <strong style={{ color: 'var(--color-risk-high)' }}>{Math.exp(selectedFeature.weight).toFixed(2)}x</strong>.
                    </>
                  )}
                </div>

                {/* Recommended Operational Mitigation */}
                <div
                  style={{
                    padding: 'var(--space-4)',
                    backgroundColor: 'var(--color-surface-card)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: `3px solid ${selectedFeature.weight < 0 ? 'var(--color-kiwi)' : 'var(--color-risk-high)'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-2)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Lightbulb size={16} style={{ color: selectedFeature.weight < 0 ? 'var(--color-kiwi)' : 'var(--color-risk-high)' }} />
                    <strong style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-primary)' }}>
                      {activeMitigation.title}
                    </strong>
                  </div>
                  <p style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
                    {activeMitigation.guidance}
                  </p>
                  <Link
                    to={activeMitigation.recommendedRoute}
                    className="btn-ghost"
                    style={{
                      alignSelf: 'flex-start',
                      padding: '4px 0',
                      fontSize: 'var(--font-size-micro)',
                      color: 'var(--color-kiwi)',
                    }}
                  >
                    <span>Execute Playbook in Campaigns</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </>
            ) : (
              <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                Select a feature from the list to inspect its regression weights and mitigation playbook.
              </div>
            )}
          </div>
        </div>
      </ChartCard>

      {/* Analytical Deep-Dives: Tenure Hazard & Contract Shield */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: 'var(--space-6)' }}>
        {/* Left: Lifecycle Tenure Hazard Decay Curve */}
        <ChartCard
          title="Lifecycle Tenure Hazard Decay Curve"
          subtitle="Empirical hazard rate by customer tenure bracket across 7,043 accounts"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', width: '100%', padding: 'var(--space-2) 0' }}>
            {/* SVG Tenure Area / Decay Curve */}
            <div style={{ width: '100%', height: '160px' }}>
              <svg viewBox="0 0 400 140" width="100%" height="100%" role="img" aria-label="Tenure Hazard Decay Curve">
                <title>Tenure Hazard Decay Curve</title>
                <defs>
                  <linearGradient id="tenureHazardGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-risk-high)" stopOpacity="0.4" />
                    <stop offset="60%" stopColor="var(--color-risk-medium)" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="var(--color-kiwi)" stopOpacity="0.05" />
                  </linearGradient>
                </defs>

                {/* Gridlines */}
                <line x1="40" y1="20" x2="380" y2="20" stroke="var(--color-border-subtle)" strokeDasharray="3 3" />
                <line x1="40" y1="60" x2="380" y2="60" stroke="var(--color-border-subtle)" strokeDasharray="3 3" />
                <line x1="40" y1="100" x2="380" y2="100" stroke="var(--color-border-subtle)" strokeDasharray="3 3" />

                {/* Y-Axis Labels */}
                <text x="32" y="24" textAnchor="end" fill="var(--color-text-secondary)" fontSize="9">60%</text>
                <text x="32" y="64" textAnchor="end" fill="var(--color-text-secondary)" fontSize="9">30%</text>
                <text x="32" y="104" textAnchor="end" fill="var(--color-text-secondary)" fontSize="9">0%</text>

                {/* Shaded Area under Curve */}
                <polygon
                  points="50,28 120,52 200,68 280,84 360,98 360,100 50,100"
                  fill="url(#tenureHazardGrad)"
                />

                {/* Hazard Line */}
                <polyline
                  points="50,28 120,52 200,68 280,84 360,98"
                  fill="none"
                  stroke="var(--color-kiwi)"
                  strokeWidth="2.5"
                />

                {/* Data Points */}
                <circle cx="50" cy="28" r="4" fill="var(--color-risk-high)" stroke="var(--color-canvas-base)" strokeWidth="1.5" />
                <circle cx="120" cy="52" r="4" fill="var(--color-risk-medium)" stroke="var(--color-canvas-base)" strokeWidth="1.5" />
                <circle cx="200" cy="68" r="4" fill="var(--color-risk-medium)" stroke="var(--color-canvas-base)" strokeWidth="1.5" />
                <circle cx="280" cy="84" r="4" fill="var(--color-kiwi)" stroke="var(--color-canvas-base)" strokeWidth="1.5" />
                <circle cx="360" cy="98" r="4" fill="var(--color-kiwi)" stroke="var(--color-canvas-base)" strokeWidth="1.5" />

                {/* Point Labels */}
                <text x="50" y="20" textAnchor="middle" fill="var(--color-risk-high)" fontSize="9" fontWeight="700">52.1%</text>
                <text x="120" y="44" textAnchor="middle" fill="var(--color-risk-medium)" fontSize="9" fontWeight="700">37.4%</text>
                <text x="200" y="60" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="9" fontWeight="700">28.6%</text>
                <text x="280" y="76" textAnchor="middle" fill="var(--color-kiwi)" fontSize="9" fontWeight="700">19.3%</text>
                <text x="360" y="90" textAnchor="middle" fill="var(--color-kiwi)" fontSize="9" fontWeight="700">8.8%</text>

                {/* X-Axis Labels */}
                <text x="50" y="118" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="9">1-6 mo</text>
                <text x="120" y="118" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="9">7-12 mo</text>
                <text x="200" y="118" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="9">13-24 mo</text>
                <text x="280" y="118" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="9">25-48 mo</text>
                <text x="360" y="118" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="9">49-72 mo</text>
              </svg>
            </div>

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
              <strong style={{ color: 'var(--color-text-primary)' }}>The 90-Day Hazard Cliff: </strong>
              <span style={{ color: 'var(--color-text-secondary)' }}>
                Churn risk peaks aggressively during the initial 6 months (52.1%) before decaying exponentially. Interventions delivered within the first 90 days capture the highest marginal reduction in gross churn.
              </span>
            </div>
          </div>
        </ChartCard>

        {/* Right: Contract Type Comparative Hazard Matrix */}
        <ChartCard
          title="Contract Type Comparative Hazard Matrix"
          subtitle="Churn distribution, subscriber volume, and MRR exposure across contract tiers"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', width: '100%' }}>
            {/* Month-to-Month */}
            <div
              style={{
                padding: 'var(--space-3)',
                backgroundColor: 'var(--color-surface-subtle)',
                borderRadius: 'var(--radius-md)',
                borderLeft: '3px solid var(--color-risk-high)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, fontSize: 'var(--font-size-body)' }}>Month-to-Month</span>
                <span className="badge badge-risk-high">42.7% CHURN RATE</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)' }}>
                <span>3,875 accounts (55.0% of cohort)</span>
                <span className="font-tabular" style={{ fontWeight: 600, color: 'var(--color-risk-high)' }}>
                  $109,870 MRR at risk
                </span>
              </div>
            </div>

            {/* One-Year */}
            <div
              style={{
                padding: 'var(--space-3)',
                backgroundColor: 'var(--color-surface-subtle)',
                borderRadius: 'var(--radius-md)',
                borderLeft: '3px solid var(--color-risk-medium)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, fontSize: 'var(--font-size-body)' }}>One-Year Contract</span>
                <span className="badge badge-risk-med">11.3% CHURN RATE</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)' }}>
                <span>1,473 accounts (20.9% of cohort)</span>
                <span className="font-tabular" style={{ fontWeight: 600, color: 'var(--color-risk-medium)' }}>
                  $10,820 MRR at risk
                </span>
              </div>
            </div>

            {/* Two-Year */}
            <div
              style={{
                padding: 'var(--space-3)',
                backgroundColor: 'var(--color-surface-subtle)',
                borderRadius: 'var(--radius-md)',
                borderLeft: '3px solid var(--color-kiwi)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, fontSize: 'var(--font-size-body)' }}>Two-Year Contract</span>
                <span className="badge badge-risk-low">2.8% CHURN RATE</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)' }}>
                <span>1,695 accounts (24.1% of cohort)</span>
                <span className="font-tabular" style={{ fontWeight: 600, color: 'var(--color-kiwi)' }}>
                  $2,860 MRR at risk
                </span>
              </div>
            </div>

            {/* Strategic Summary */}
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
              <strong style={{ color: 'var(--color-text-primary)' }}>Contract Migration Leverage: </strong>
              <span style={{ color: 'var(--color-text-secondary)' }}>
                Migrating a Month-to-Month customer to a 1-year contract eliminates 73.5% of their churn probability. Multi-year contract concessions generate the single highest retention ROI across the portfolio.
              </span>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  )
}
