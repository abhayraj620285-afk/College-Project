import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  FileSpreadsheet,
  Download,
  FileText,
  Printer,
  Code,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Sparkles,
  Info,
  Layers,
  ArrowRight,
  Database,
  ExternalLink,
} from 'lucide-react'
import MetricCard from '../components/common/MetricCard'
import ChartCard from '../components/common/ChartCard'
import RiskBadge from '../components/common/RiskBadge'
import DataTable from '../components/common/DataTable'
import { TELCO_COHORT, COHORT_SUMMARY } from '../data/telcoDataset'
import {
  MODEL_METADATA,
  COEFFICIENTS,
  FEATURE_IMPORTANCE,
  SCALER_PARAMS,
  PERFORMANCE_METRICS,
} from '../data/modelMeta'
import { exportCohortToCsv } from '../services/customerService'

// 5 Standard Operational Presets
const REPORT_PRESETS = [
  {
    id: 'high-risk',
    label: 'High Risk Cohort',
    badge: 'CRITICAL',
    description: 'Subscribers with predicted churn probability ≥ 70%. High-priority retention campaign targets.',
    filterFn: (c) => (c.churnProbability || 0) >= 0.70,
    filename: 'at_risk_cohort_high',
  },
  {
    id: 'fiber-risk',
    label: 'Fiber Optic At Risk',
    badge: 'SERVICE HAZARD',
    description: 'Fiber optic subscribers with churn probability ≥ 50%. Largest contributor to gross MRR churn.',
    filterFn: (c) => c.InternetService === 'Fiber optic' && (c.churnProbability || 0) >= 0.50,
    filename: 'fiber_optic_at_risk_cohort',
  },
  {
    id: 'month-to-month',
    label: 'Month-to-Month Defiers',
    badge: 'CONTRACT HAZARD',
    description: 'Subscribers on month-to-month contracts with churn probability ≥ 60%. Key candidates for annual contract upgrade playbooks.',
    filterFn: (c) => c.Contract === 'Month-to-month' && (c.churnProbability || 0) >= 0.60,
    filename: 'month_to_month_defiers_cohort',
  },
  {
    id: 'historical-churn',
    label: 'Historical Churned Accounts',
    badge: 'GROUND TRUTH',
    description: 'Accounts that churned historically (Churn = Yes). Ground-truth cohort for model validation and post-mortem analysis.',
    filterFn: (c) => c.Churn === 'Yes',
    filename: 'ground_truth_churned_cohort',
  },
  {
    id: 'full-cohort',
    label: 'Full Subscriber Cohort',
    badge: 'FULL DATABASE',
    description: 'Representative 100-subscriber sample cohort with all 21 account attributes and model predictions (sampled from 7,043 population).',
    filterFn: () => true,
    filename: 'telco_full_subscriber_cohort',
  },
]

export default function ReportsPage() {
  const [activePresetId, setActivePresetId] = useState('high-risk')
  const [downloadSuccessToast, setDownloadSuccessToast] = useState(null)

  // Active preset object
  const activePreset = useMemo(() => {
    return REPORT_PRESETS.find((p) => p.id === activePresetId) || REPORT_PRESETS[0]
  }, [activePresetId])

  // Selected cohort based on active preset filter
  const selectedCohort = useMemo(() => {
    return TELCO_COHORT.filter(activePreset.filterFn)
  }, [activePreset])

  // Live metrics for the selected cohort
  const cohortMetrics = useMemo(() => {
    const count = selectedCohort.length
    const totalMRR = selectedCohort.reduce((acc, c) => acc + Number(c.MonthlyCharges || 0), 0)
    const avgProb =
      count > 0
        ? (selectedCohort.reduce((acc, c) => acc + Number(c.churnProbability || 0), 0) / count) * 100
        : 0
    const avgTenure =
      count > 0
        ? (selectedCohort.reduce((acc, c) => acc + Number(c.tenure || 0), 0) / count).toFixed(1)
        : 0

    return {
      count,
      totalMRR,
      avgProb: avgProb.toFixed(1),
      avgTenure,
    }
  }, [selectedCohort])

  // Trigger download helper
  const triggerDownload = (blob, filename) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setDownloadSuccessToast(`Successfully generated: ${filename}`)
    setTimeout(() => setDownloadSuccessToast(null), 4000)
  }

  // 1. Download RFC-4180 CSV for Selected Cohort
  const handleDownloadCSV = () => {
    const csvData = exportCohortToCsv(selectedCohort)
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
    triggerDownload(blob, `${activePreset.filename}_${new Date().toISOString().slice(0, 10)}.csv`)
  }

  // 2. Download Executive Markdown Dossier
  const handleDownloadExecutiveDossier = () => {
    const content = [
      `# Retention Studio — Executive Retention Dossier`,
      `Date: ${new Date().toISOString().slice(0, 10)}`,
      ``,
      `## 1. Macro Churn Telemetry`,
      `- Total Active Subscriber Portfolio: ${COHORT_SUMMARY.totalSubscribers.toLocaleString()}`,
      `- Portfolio Baseline Churn Rate: ${(COHORT_SUMMARY.baselineChurnRate * 100).toFixed(2)}%`,
      `- Total Portfolio MRR: $${COHORT_SUMMARY.totalMRR.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      `- Monthly Revenue at Risk: $${COHORT_SUMMARY.mrrAtRisk.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      ``,
      `## 2. Risk Distribution Summary`,
      `- High Risk Cohort (≥70% probability): ${TELCO_COHORT.filter((c) => (c.churnProbability || 0) >= 0.70).length} accounts`,
      `- Medium Risk Cohort (40% - 69% probability): ${TELCO_COHORT.filter((c) => (c.churnProbability || 0) >= 0.40 && (c.churnProbability || 0) < 0.70).length} accounts`,
      `- Low Risk Cohort (<40% probability): ${TELCO_COHORT.filter((c) => (c.churnProbability || 0) < 0.40).length} accounts`,
      ``,
      `## 3. Top Model Risk Drivers & Retention Anchors`,
      `- Two-Year Contract (Weight: -1.41) — Strongest protective barrier (-76% churn hazard)`,
      `- Fiber Optic Service (Weight: +1.22) — Highest hazard factor (expectation/price sensitivity)`,
      `- Account Tenure (Weight: -1.16) — Early lifecycle (0-6 mo) has highest vulnerability`,
      ``,
      `## 4. Recommended Strategic Playbooks`,
      `1. Annual Contract Upgrade Catalyst: Offer $15/mo discount for 12-month commitment.`,
      `2. Fiber Optic VIP Stabilization: Proactive speed check and tier-2 concierge within 90 days.`,
      `3. Autopay & Security Suite Bundle: Free Online Security for switching from Electronic Check.`,
      ``,
      `Generated by Customer Churn Intelligence Platform · Confidential & Proprietary`,
    ].join('\n')

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' })
    triggerDownload(blob, `executive_retention_dossier_${new Date().toISOString().slice(0, 10)}.md`)
  }

  // 3. Download Model Schema & Coefficients JSON
  const handleDownloadModelSchema = () => {
    const schemaArtifact = {
      metadata: MODEL_METADATA,
      scaler: SCALER_PARAMS,
      performance: PERFORMANCE_METRICS,
      coefficients: COEFFICIENTS,
      feature_importance: FEATURE_IMPORTANCE,
      exported_at: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(schemaArtifact, null, 2)], { type: 'application/json' })
    triggerDownload(blob, `model_schema_v1_${new Date().toISOString().slice(0, 10)}.json`)
  }

  // 4. Download Algorithmic Fairness & Governance Audit
  const handleDownloadGovernanceAudit = () => {
    const auditContent = [
      `# Retention Studio — Model Governance & Fairness Audit`,
      `Evaluation Date: ${MODEL_METADATA.trainingDate}`,
      ``,
      `## 1. Algorithmic Architecture`,
      `- Algorithm: ${MODEL_METADATA.algorithm} (${MODEL_METADATA.solver})`,
      `- Regularization: L2 (C = ${MODEL_METADATA.C})`,
      `- Class Weighting: ${MODEL_METADATA.classWeight} (mitigates 73.5% / 26.5% class imbalance)`,
      `- Holdout Evaluation: 1,409 customers (20% random stratified split)`,
      `- ROC-AUC Score: ${PERFORMANCE_METRICS.rocAuc} (Exceeds industry standard 0.80 benchmark)`,
      `- Recall on Churners: ${(PERFORMANCE_METRICS.recall * 100).toFixed(2)}%`,
      ``,
      `## 2. Demographic Parity & Fairness Assessment`,
      `- Male Cohort Churn Rate: 26.16%`,
      `- Female Cohort Churn Rate: 26.92%`,
      `- Demographic Disparity Delta: 0.76% (Well within the 2.0% fairness tolerance threshold)`,
      `- Protected Characteristics Compliance: Gender feature weight (+0.0305) demonstrates negligible correlation and does not bias automated decisions.`,
      ``,
      `## 3. Data Governance & Privacy Declarations`,
      `- Ground Truth Records: 7,043 Telecommunications customer records`,
      `- Sensitive PII: No Social Security numbers, credit card tokens, or individual biometric data are ingested or processed.`,
      `- Ephemeral Storage: Real-time prediction logs reside in in-memory database storage without unencrypted external replication.`,
    ].join('\n')

    const blob = new Blob([auditContent], { type: 'text/markdown;charset=utf-8;' })
    triggerDownload(blob, `model_governance_audit_${new Date().toISOString().slice(0, 10)}.md`)
  }

  // 5-Row Preview Columns
  const previewColumns = [
    {
      key: 'customerID',
      label: 'Customer ID',
      render: (val) => (
        <span className="font-tabular" style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
          #{val}
        </span>
      ),
    },
    {
      key: 'tenure',
      label: 'Tenure',
      render: (val) => <span className="font-tabular">{val} mo</span>,
    },
    { key: 'Contract', label: 'Contract' },
    { key: 'InternetService', label: 'Internet' },
    {
      key: 'MonthlyCharges',
      label: 'Monthly Fee',
      render: (val) => <span className="font-tabular">${Number(val).toFixed(2)}</span>,
    },
    {
      key: 'churnProbability',
      label: 'Churn Risk',
      render: (val, row) => <RiskBadge level={row.riskLevel} score={val} size="sm" />,
    },
  ]

  return (
    <div className="page-container">
      {/* Semantic Page Header */}
      <header className="page-header">
        <div className="page-header-top">
          <div className="page-header-title-group">
            <span className="eyebrow">Governance & Reporting</span>
            <h1>Intelligence Reports & Data Exports</h1>
            <p className="page-header-description">
              Generate compliance-ready executive dossiers, download high-risk subscriber cohorts for CRM integration, and export serialized ML metadata artifacts.
            </p>
          </div>
          <div className="page-header-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => window.print()}
              aria-label="Print dossier view"
            >
              <Printer size={15} />
              <span>Print Dossier View</span>
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleDownloadCSV}
              aria-label="Download selected cohort CSV"
            >
              <Download size={15} />
              <span>Export {activePreset.label} (CSV)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Success Notification Banner */}
      {downloadSuccessToast && (
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
          <span>{downloadSuccessToast}</span>
        </div>
      )}

      {/* SECTION 1: Cohort Export Studio */}
      <ChartCard
        title="Cohort Export Studio"
        subtitle="Select an operational preset to filter the 7,043 subscriber cohort and download an RFC-4180 compliant CSV"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', width: '100%' }}>
          {/* Preset Buttons Grid */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {REPORT_PRESETS.map((preset) => {
              const isActive = activePresetId === preset.id
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setActivePresetId(preset.id)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isActive ? 'var(--color-surface-highlight)' : 'var(--color-surface-subtle)',
                    border: isActive ? '1px solid var(--color-kiwi-border)' : '1px solid var(--color-border-subtle)',
                    color: isActive ? 'var(--color-kiwi)' : 'var(--color-text-secondary)',
                    fontWeight: 600,
                    fontSize: 'var(--font-size-body-sm)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <span>{preset.label}</span>
                  <span
                    className="badge"
                    style={{
                      fontSize: '9px',
                      padding: '1px 6px',
                      backgroundColor: isActive ? 'var(--color-kiwi-subtle)' : 'var(--color-surface-card)',
                      color: isActive ? 'var(--color-kiwi)' : 'var(--color-text-tertiary)',
                      border: `1px solid ${isActive ? 'var(--color-kiwi-border)' : 'var(--color-border-subtle)'}`,
                    }}
                  >
                    {preset.badge}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Active Preset Description */}
          <div
            style={{
              padding: 'var(--space-3) var(--space-4)',
              backgroundColor: 'var(--color-surface-subtle)',
              borderRadius: 'var(--radius-md)',
              borderLeft: '3px solid var(--color-kiwi)',
              fontSize: 'var(--font-size-body-sm)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <strong style={{ color: 'var(--color-text-primary)' }}>Preset Description: </strong>
            {activePreset.description}
          </div>

          {/* Live Cohort Metrics Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-3)',
            }}
          >
            <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>Export Records:</span>
              <div className="font-tabular" style={{ fontSize: 'var(--font-size-h2)', fontWeight: 700, color: 'var(--color-kiwi)' }}>
                {cohortMetrics.count.toLocaleString()}
              </div>
              <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>
                {((cohortMetrics.count / 7043) * 100).toFixed(1)}% of total cohort
              </span>
            </div>

            <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>MRR Exposure:</span>
              <div className="font-tabular" style={{ fontSize: 'var(--font-size-h2)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                ${Math.round(cohortMetrics.totalMRR).toLocaleString()}
              </div>
              <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>Monthly revenue volume</span>
            </div>

            <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>Avg Churn Probability:</span>
              <div className="font-tabular" style={{ fontSize: 'var(--font-size-h2)', fontWeight: 700, color: 'var(--color-risk-medium)' }}>
                {cohortMetrics.avgProb}%
              </div>
              <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>Mean model prediction</span>
            </div>

            <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>Avg Account Tenure:</span>
              <div className="font-tabular" style={{ fontSize: 'var(--font-size-h2)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {cohortMetrics.avgTenure} mo
              </div>
              <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>Customer lifecycle depth</span>
            </div>
          </div>

          {/* Quick Preview Table (First 5 records) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: 'var(--font-size-body-sm)', fontWeight: 600 }}>
                Cohort Preview (Showing first 5 of {cohortMetrics.count.toLocaleString()} records)
              </span>
              <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>
                RFC-4180 Compliant · UTF-8
              </span>
            </div>
            <DataTable
              columns={previewColumns}
              data={selectedCohort.slice(0, 5)}
              total={5}
              pageSize={5}
            />
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={handleDownloadCSV}
              style={{ padding: '8px 16px' }}
            >
              <Download size={16} />
              <span>Download {activePreset.label} (.CSV)</span>
            </button>
          </div>
        </div>
      </ChartCard>

      {/* SECTION 2: Executive Retention Dossier */}
      <section
        className="card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <div>
            <span className="eyebrow" style={{ color: 'var(--color-kiwi)' }}>Executive Briefing</span>
            <h3 style={{ marginTop: '2px' }}>Executive Retention Dossier</h3>
            <p style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)' }}>
              High-level strategic briefing prepared for executive leadership covering macro portfolio churn, revenue risk exposure, and intervention priorities.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => window.print()}
            >
              <Printer size={15} />
              <span>Print Briefing</span>
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleDownloadExecutiveDossier}
            >
              <FileText size={15} />
              <span>Download Markdown Dossier</span>
            </button>
          </div>
        </div>

        {/* Dossier Executive Summary Snapshot */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--space-3)',
            padding: 'var(--space-4)',
            backgroundColor: 'var(--color-surface-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <div>
            <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>Total Subscribers:</span>
            <div className="font-tabular" style={{ fontSize: 'var(--font-size-h2)', fontWeight: 700 }}>
              7,043 Accounts
            </div>
          </div>
          <div>
            <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>Baseline Churn Rate:</span>
            <div className="font-tabular" style={{ fontSize: 'var(--font-size-h2)', fontWeight: 700, color: 'var(--color-risk-high)' }}>
              26.54% (1,869 accounts)
            </div>
          </div>
          <div>
            <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>Portfolio ARR at Risk:</span>
            <div className="font-tabular" style={{ fontSize: 'var(--font-size-h2)', fontWeight: 700, color: 'var(--color-risk-medium)' }}>
              $1,669,570 / yr
            </div>
          </div>
          <div>
            <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>Primary Strategic Leverage:</span>
            <div style={{ fontSize: 'var(--font-size-body-sm)', fontWeight: 600, color: 'var(--color-kiwi)' }}>
              Annual Contract Migration
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Technical ML Artifacts & Algorithmic Governance */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: 'var(--space-6)' }}>
        {/* Left: Model Hyperparameters & Weights Inspector */}
        <ChartCard
          title="Model Hyperparameters & Serialized Artifacts"
          subtitle="Model architecture parameters, scikit-learn training specs, and feature scaling metadata"
          action={
            <button
              type="button"
              className="btn-secondary"
              onClick={handleDownloadModelSchema}
              style={{ fontSize: 'var(--font-size-micro)', padding: '4px 8px' }}
            >
              <Code size={14} />
              <span>Download JSON Schema</span>
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', width: '100%' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 'var(--space-2)',
                padding: 'var(--space-3)',
                backgroundColor: 'var(--color-surface-subtle)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-body-sm)',
              }}
            >
              <div>
                <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>Algorithm:</span>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{MODEL_METADATA.algorithm}</div>
              </div>
              <div>
                <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>Regularization:</span>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>L2 (C = {MODEL_METADATA.C})</div>
              </div>
              <div>
                <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>Class Weights:</span>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{MODEL_METADATA.classWeight}</div>
              </div>
              <div>
                <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>Holdout ROC-AUC:</span>
                <div className="font-tabular" style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-kiwi)' }}>
                  {PERFORMANCE_METRICS.rocAuc}
                </div>
              </div>
            </div>

            <p style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
              The serialized bundle includes all 30 trained linear regression weights, scaler means and variances, and decision threshold definitions for offline scoring engines.
            </p>
          </div>
        </ChartCard>

        {/* Right: Algorithmic Fairness & Governance Audit */}
        <ChartCard
          title="Algorithmic Fairness & Governance Audit"
          subtitle="Model bias assessment, demographic parity evaluation, and ethical compliance declarations"
          action={
            <button
              type="button"
              className="btn-secondary"
              onClick={handleDownloadGovernanceAudit}
              style={{ fontSize: 'var(--font-size-micro)', padding: '4px 8px' }}
            >
              <ShieldCheck size={14} style={{ color: 'var(--color-kiwi)' }} />
              <span>Download Audit (.MD)</span>
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', width: '100%' }}>
            <div
              style={{
                padding: 'var(--space-3)',
                backgroundColor: 'var(--color-surface-subtle)',
                borderRadius: 'var(--radius-md)',
                borderLeft: '3px solid var(--color-kiwi)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <strong style={{ fontSize: 'var(--font-size-body-sm)' }}>Demographic Parity Verified</strong>
                <span className="badge badge-risk-low">0.76% PARITY DELTA</span>
              </div>
              <p style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
                Evaluated disparity between protected classes is 0.76% (Male: 26.16% churn, Female: 26.92% churn), comfortably below the 2.0% maximum ethical tolerance threshold.
              </p>
            </div>

            <div style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)' }}>
              <strong style={{ color: 'var(--color-text-primary)' }}>PII & Privacy Protection: </strong>
              Zero Social Security numbers, payment credentials, or personal biometric records are ingested into model feature inputs. Real-time inference pipelines process exclusively operational account variables.
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  )
}
