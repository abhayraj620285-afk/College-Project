import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  History,
  RefreshCw,
  Download,
  Trash2,
  Search,
  Filter,
  Eye,
  AlertCircle,
  Sparkles,
  Database,
  CheckCircle2,
  ArrowRight,
  X,
  Clock,
  ChevronRight,
  AlertTriangle,
  Layers,
} from 'lucide-react'
import MetricCard from '../components/common/MetricCard'
import ChartCard from '../components/common/ChartCard'
import RiskBadge from '../components/common/RiskBadge'
import DataTable from '../components/common/DataTable'
import { EmptyState, SuccessBanner } from '../components/common/StateIndicators'
import { getPredictions, getSessionHistory, resetSessionHistory } from '../services/api'

export default function PredictionHistoryPage() {
  const [historyItems, setHistoryItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState(null)

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRisk, setSelectedRisk] = useState('ALL')
  const [selectedOutcome, setSelectedOutcome] = useState('ALL') // 'ALL' | 'Yes' | 'No'

  // Inspection Drawer & Confirm Modal
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  // Authentic Data Fetching (Zero Mock Data)
  const fetchHistory = useCallback(async () => {
    setIsLoading(true)
    try {
      const records = await getPredictions(100)
      if (Array.isArray(records)) {
        setHistoryItems(records)
      } else {
        setHistoryItems(getSessionHistory(100))
      }
    } catch (err) {
      console.warn('[PredictionHistory] Error fetching predictions from backend:', err)
      // Fallback ONLY to real in-memory session history — NEVER inject mock records!
      setHistoryItems(getSessionHistory(100))
    } finally {
      setIsLoading(false)
      setLastRefreshed(new Date().toLocaleTimeString())
    }
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  // Clear Session History Action
  const handleClearHistory = () => {
    resetSessionHistory()
    setHistoryItems([])
    setIsConfirmClearOpen(false)
    setToastMessage('Session prediction history successfully cleared.')
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Filtered History Records
  const filteredRecords = useMemo(() => {
    return historyItems.filter((item) => {
      if (selectedRisk !== 'ALL' && item.risk_level !== selectedRisk) {
        return false
      }
      if (selectedOutcome !== 'ALL' && item.churn_prediction !== selectedOutcome) {
        return false
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const matchId = String(item.id || '').toLowerCase().includes(q)
        const matchContract = String(item.contract || '').toLowerCase().includes(q)
        const matchInternet = String(item.internet_service || '').toLowerCase().includes(q)
        return matchId || matchContract || matchInternet
      }
      return true
    })
  }, [historyItems, selectedRisk, selectedOutcome, searchQuery])

  // Summary Metrics
  const summary = useMemo(() => {
    const total = historyItems.length
    const churnCount = historyItems.filter((i) => i.churn_prediction === 'Yes').length
    const retainCount = total - churnCount
    const churnRate = total > 0 ? ((churnCount / total) * 100).toFixed(1) : '0.0'

    return {
      total,
      churnCount,
      retainCount,
      churnRate,
    }
  }, [historyItems])

  // Export Audit CSV Function
  const handleExportCSV = () => {
    if (historyItems.length === 0) return

    const headers = [
      'LogID',
      'Tenure',
      'Contract',
      'InternetService',
      'MonthlyCharges',
      'ChurnPrediction',
      'ChurnProbability',
      'RiskLevel',
      'InferenceTimestamp',
    ]

    const escapeCsv = (val) => {
      const str = String(val ?? '').replace(/"/g, '""')
      return `"${str}"`
    }

    const rows = historyItems.map((item) => [
      escapeCsv(item.id),
      item.tenure ?? '',
      escapeCsv(item.contract),
      escapeCsv(item.internet_service),
      item.monthly_charges ?? '',
      escapeCsv(item.churn_prediction),
      item.churn_probability ?? '',
      escapeCsv(item.risk_level),
      escapeCsv(item.predicted_at),
    ].join(','))

    const csvContent = [headers.join(','), ...rows].join('\r\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `churn_prediction_audit_log_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // DataTable Column Definitions
  const columns = [
    {
      key: 'id',
      label: 'Log ID',
      sortable: true,
      render: (val) => (
        <span
          className="font-tabular"
          style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-text-primary)' }}
        >
          #{String(val).slice(-8)}
        </span>
      ),
    },
    {
      key: 'tenure',
      label: 'Tenure',
      sortable: true,
      render: (val) => (
        <span className="font-tabular">{val != null ? `${val} mo` : '—'}</span>
      ),
    },
    {
      key: 'contract',
      label: 'Contract',
      sortable: true,
      render: (val) => <span>{val || '—'}</span>,
    },
    {
      key: 'internet_service',
      label: 'Internet',
      sortable: true,
      render: (val) => <span>{val || '—'}</span>,
    },
    {
      key: 'monthly_charges',
      label: 'Monthly Fee',
      sortable: true,
      render: (val) => (
        <span className="font-tabular" style={{ fontWeight: 600 }}>
          {val != null ? `$${Number(val).toFixed(2)}` : '—'}
        </span>
      ),
    },
    {
      key: 'churn_prediction',
      label: 'Outcome',
      sortable: true,
      render: (val) => (
        <span
          className="badge"
          style={{
            backgroundColor: val === 'Yes' ? 'var(--color-risk-high-subtle)' : 'var(--color-kiwi-subtle)',
            color: val === 'Yes' ? 'var(--color-risk-high)' : 'var(--color-kiwi)',
            border: `1px solid ${val === 'Yes' ? 'var(--color-risk-high-border)' : 'var(--color-kiwi-border)'}`,
          }}
        >
          {val === 'Yes' ? 'CHURN' : 'RETAIN'}
        </span>
      ),
    },
    {
      key: 'risk_level',
      label: 'Risk Tier',
      sortable: true,
      render: (val, row) => <RiskBadge level={val} score={row.churn_probability} size="sm" />,
    },
    {
      key: 'predicted_at',
      label: 'Inference Time',
      sortable: true,
      render: (val) => (
        <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>
          {val ? new Date(val).toLocaleTimeString() : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button
          type="button"
          className="btn-ghost"
          onClick={() => setSelectedRecord(row)}
          style={{ padding: '4px 8px', fontSize: 'var(--font-size-micro)' }}
          aria-label={`Inspect prediction details for log #${row.id}`}
        >
          <Eye size={14} />
          <span>Inspect</span>
        </button>
      ),
    },
  ]

  return (
    <div className="page-container">
      {/* Semantic Page Header */}
      <header className="page-header">
        <div className="page-header-top">
          <div className="page-header-title-group">
            <span className="eyebrow">Audit & Compliance</span>
            <h1>Prediction History & Session Audit Log</h1>
            <p className="page-header-description">
              Audit trail of real-time predictions executed during the active platform session with probabilistic risk classifications.
            </p>
          </div>
          <div className="page-header-actions">
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setIsConfirmClearOpen(true)}
              disabled={historyItems.length === 0}
              aria-label="Clear session history"
              style={{ color: historyItems.length > 0 ? 'var(--color-risk-high)' : undefined }}
            >
              <Trash2 size={15} />
              <span>Clear History</span>
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleExportCSV}
              disabled={historyItems.length === 0}
              aria-label="Export history to CSV"
            >
              <Download size={15} />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={fetchHistory}
              disabled={isLoading}
              aria-label="Refresh prediction history"
            >
              <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* MANDATORY EPHEMERAL IN-MEMORY STORAGE ADVISORY */}
      <div
        className="notice-banner info"
        role="region"
        aria-label="Ephemeral database storage advisory"
        style={{
          borderLeft: '4px solid var(--color-status-info)',
        }}
      >
        <Database size={24} style={{ color: 'var(--color-status-info)', flexShrink: 0 }} />
        <div>
          <strong style={{ display: 'block', color: 'var(--color-status-info)', marginBottom: '4px' }}>
            [EPHEMERAL DATABASE STORAGE ADVISORY]
          </strong>
          <span>
            Predictions executed during this session are stored in Spring Boot's in-memory H2 database (<code style={{ color: 'var(--color-text-primary)' }}>jdbc:h2:mem:churndb</code>) or browser session storage if running offline. Records are ephemeral and reset whenever the backend container restarts. Download audit CSVs before ending operational shifts.
          </span>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <SuccessBanner title="Action Completed" message={toastMessage} onDismiss={() => setToastMessage(null)} />
      )}

      {/* Summary KPI Bar */}
      <section
        aria-label="Session Prediction Metrics"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        <MetricCard
          label="Session Inferences"
          value={summary.total}
          subtext="Total queries recorded"
          variant="default"
          icon={History}
          progress={summary.total > 0 ? 100 : 0}
        />

        <MetricCard
          label="Predicted Churn"
          value={summary.churnCount}
          subtext="Flagged for retention intervention"
          variant="high-risk"
          icon={AlertCircle}
          progress={summary.total > 0 ? (summary.churnCount / summary.total) * 100 : 0}
        />

        <MetricCard
          label="Predicted Retained"
          value={summary.retainCount}
          subtext="Low churn hazard score"
          variant="kiwi"
          icon={CheckCircle2}
          progress={summary.total > 0 ? (summary.retainCount / summary.total) * 100 : 0}
        />

        <MetricCard
          label="Session Churn Rate"
          value={`${summary.churnRate}%`}
          subtext={lastRefreshed ? `Updated at ${lastRefreshed}` : 'Live session calculation'}
          variant="medium-risk"
          icon={Clock}
          progress={Number(summary.churnRate)}
        />
      </section>

      {/* Filter & Search Toolbar */}
      <div
        className="card"
        style={{
          padding: 'var(--space-3) var(--space-4)',
          backgroundColor: 'var(--color-surface-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '240px', flex: '1 1 240px' }}>
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
            placeholder="Search by log ID, contract, or internet service..."
            aria-label="Search prediction history"
            style={{
              width: '100%',
              padding: '8px 12px 8px 34px',
              backgroundColor: 'var(--color-surface-card)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--font-size-body-sm)',
            }}
          />
        </div>

        {/* Risk Level Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>RISK:</span>
          {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((tier) => (
            <button
              key={tier}
              type="button"
              className={selectedRisk === tier ? 'btn-secondary' : 'btn-ghost'}
              onClick={() => setSelectedRisk(tier)}
              style={{
                padding: '4px 8px',
                fontSize: 'var(--font-size-micro)',
                border: selectedRisk === tier ? '1px solid var(--color-border-strong)' : '1px solid transparent',
              }}
            >
              {tier}
            </button>
          ))}
        </div>

        {/* Prediction Outcome Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>OUTCOME:</span>
          {[
            { id: 'ALL', label: 'All' },
            { id: 'Yes', label: 'Churn' },
            { id: 'No', label: 'Stay' },
          ].map((out) => (
            <button
              key={out.id}
              type="button"
              className={selectedOutcome === out.id ? 'btn-secondary' : 'btn-ghost'}
              onClick={() => setSelectedOutcome(out.id)}
              style={{
                padding: '4px 8px',
                fontSize: 'var(--font-size-micro)',
                border: selectedOutcome === out.id ? '1px solid var(--color-border-strong)' : '1px solid transparent',
              }}
            >
              {out.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Viewport: EmptyState or DataTable */}
      {historyItems.length === 0 ? (
        <div className="card" style={{ padding: 'var(--space-12) var(--space-6)', textAlign: 'center' }}>
          <EmptyState
            icon={History}
            title="No Predictions In Current Session"
            description="The Spring Boot in-memory prediction log is empty. Score customer account parameters using the Churn Prediction Engine to populate this audit trail."
            action={
              <Link to="/predict" className="btn-primary" style={{ marginTop: 'var(--space-3)' }}>
                <Sparkles size={16} />
                <span>Launch Prediction Engine</span>
              </Link>
            }
          />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredRecords}
          total={filteredRecords.length}
          pageSize={25}
          loading={isLoading}
          emptyMessage="No prediction records match the active search or risk filters."
        />
      )}

      {/* Record Inspection Modal / Drawer */}
      {selectedRecord && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="audit-modal-title"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            justifyContent: 'flex-end',
            zIndex: 1000,
          }}
          onClick={() => setSelectedRecord(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '500px',
              height: '100%',
              backgroundColor: 'var(--color-surface-card)',
              borderLeft: '1px solid var(--color-border-default)',
              padding: 'var(--space-6)',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="eyebrow" style={{ color: 'var(--color-kiwi)' }}>Audit Inspection</span>
                <h2 id="audit-modal-title" style={{ fontSize: 'var(--font-size-h2)', marginTop: '2px' }}>
                  Log #{selectedRecord.id}
                </h2>
                <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>
                  Inference at {selectedRecord.predicted_at ? new Date(selectedRecord.predicted_at).toLocaleString() : 'Session Active'}
                </span>
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setSelectedRecord(null)}
                style={{ padding: '4px' }}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Outcome & Risk Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-4)',
                backgroundColor: 'var(--color-surface-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border-subtle)',
              }}
            >
              <div>
                <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>Classification:</span>
                <div style={{ fontSize: 'var(--font-size-h2)', fontWeight: 700, color: selectedRecord.churn_prediction === 'Yes' ? 'var(--color-risk-high)' : 'var(--color-kiwi)' }}>
                  {selectedRecord.churn_prediction === 'Yes' ? 'LIKELY TO CHURN' : 'RETAINED (LOW RISK)'}
                </div>
              </div>
              <RiskBadge level={selectedRecord.risk_level} score={selectedRecord.churn_probability} size="md" />
            </div>

            {/* Parameters Grid */}
            <div>
              <strong style={{ fontSize: 'var(--font-size-body-sm)', display: 'block', marginBottom: '8px' }}>
                Customer Account Attributes
              </strong>
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
                  <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>Tenure:</span>
                  <div className="font-tabular" style={{ fontWeight: 600 }}>{selectedRecord.tenure} months</div>
                </div>
                <div>
                  <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>Contract:</span>
                  <div style={{ fontWeight: 600 }}>{selectedRecord.contract}</div>
                </div>
                <div>
                  <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>Internet Service:</span>
                  <div style={{ fontWeight: 600 }}>{selectedRecord.internet_service}</div>
                </div>
                <div>
                  <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>Monthly Fee:</span>
                  <div className="font-tabular" style={{ fontWeight: 600 }}>${Number(selectedRecord.monthly_charges || 0).toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* Recommended Retention Playbook */}
            <div
              style={{
                padding: 'var(--space-3)',
                backgroundColor: 'var(--color-surface-subtle)',
                borderRadius: 'var(--radius-md)',
                borderLeft: '3px solid var(--color-kiwi)',
              }}
            >
              <strong style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-primary)', display: 'block', marginBottom: '2px' }}>
                Recommended Operational Action
              </strong>
              <p style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
                {selectedRecord.churn_prediction === 'Yes'
                  ? 'High churn probability detected. Dispatched retention playbook recommended: Annual Contract Upgrade Catalyst with $15/mo concession.'
                  : 'Subscriber stability score indicates low churn probability. Maintain standard service cadence.'}
              </p>
              <Link
                to="/campaigns"
                className="btn-ghost"
                style={{ padding: '4px 0', fontSize: 'var(--font-size-micro)', color: 'var(--color-kiwi)', marginTop: '4px' }}
              >
                <span>View Retention Campaigns</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            {/* Action Footer */}
            <div style={{ marginTop: 'auto', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border-subtle)' }}>
              <Link
                to="/predict"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Sparkles size={16} />
                <span>Re-score in Prediction Engine</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Clear Confirmation Dialog */}
      {isConfirmClearOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-modal-title"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-4)',
            zIndex: 1000,
          }}
          onClick={() => setIsConfirmClearOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              backgroundColor: 'var(--color-surface-card)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-6)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <AlertTriangle size={24} style={{ color: 'var(--color-risk-high)', flexShrink: 0 }} />
              <div>
                <h3 id="clear-modal-title" style={{ fontSize: 'var(--font-size-h2)', margin: 0 }}>
                  Clear Session Audit Log?
                </h3>
                <p style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
                  This will remove all {historyItems.length} prediction records recorded in the current session. This action cannot be undone.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
              <button type="button" className="btn-ghost" onClick={() => setIsConfirmClearOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleClearHistory}
                style={{
                  backgroundColor: 'var(--color-risk-high)',
                  color: '#ffffff',
                  borderColor: 'var(--color-risk-high)',
                }}
              >
                <Trash2 size={15} />
                <span>Confirm Clear</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
