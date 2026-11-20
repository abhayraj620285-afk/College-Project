import React, { useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  Mail,
  Phone,
  Smartphone,
  Plus,
  Search,
  Filter,
  Play,
  CheckCircle2,
  Users,
  DollarSign,
  Target,
  ArrowRight,
  Eye,
  X,
  Send,
  Sparkles,
  LayoutGrid,
  Table as TableIcon,
  Zap,
  Clock,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react'
import MetricCard from '../components/common/MetricCard'
import ChartCard from '../components/common/ChartCard'
import RiskBadge from '../components/common/RiskBadge'
import DataTable from '../components/common/DataTable'
import { TELCO_COHORT } from '../data/telcoDataset'

// 6 Enterprise Retention Playbooks with dynamic audience matching criteria
export const DEFAULT_PLAYBOOKS = [
  {
    id: 'pb-01',
    name: 'Annual Contract Upgrade Catalyst',
    category: 'Contract Migration',
    targetDescription: 'Month-to-month subscribers with tenure > 6 mos & charges > $70/mo',
    targetRisk: 'HIGH',
    triggerCriteria: {
      contract: 'Month-to-month',
      minTenure: 7,
      minMonthlyCharges: 70,
    },
    filterFn: (c) => c.Contract === 'Month-to-month' && c.tenure > 6 && Number(c.MonthlyCharges) > 70,
    concession: '$15/mo discount voucher valid on 1-year contract commitment',
    channel: 'Email + In-App Portal',
    channelType: 'email',
    impact: 'Estimated 65% reduction in churn hazard',
    status: 'Ready to Deploy',
    concessionCostPerUser: 90, // $15 * 6 mos
  },
  {
    id: 'pb-02',
    name: 'Fiber Optic VIP Stabilization Pulse',
    category: 'Service Quality',
    targetDescription: 'Fiber optic subscribers in first 6 months tenure without TechSupport',
    targetRisk: 'HIGH',
    triggerCriteria: {
      internetService: 'Fiber optic',
      maxTenure: 6,
      techSupport: 'No',
    },
    filterFn: (c) => c.InternetService === 'Fiber optic' && c.tenure <= 6 && c.TechSupport === 'No',
    concession: 'Proactive tier-2 technician speed audit + 3 months free Tech Support',
    channel: 'Tier-2 Concierge Call + SMS',
    channelType: 'phone',
    impact: 'Mitigates 48% early fiber churn risk',
    status: 'Active Blueprint',
    concessionCostPerUser: 45,
  },
  {
    id: 'pb-03',
    name: 'Autopay & Security Suite Bundle',
    category: 'Billing & Security',
    targetDescription: 'Electronic check billing subscribers without Online Security',
    targetRisk: 'MEDIUM',
    triggerCriteria: {
      paymentMethod: 'Electronic check',
      onlineSecurity: 'No',
    },
    filterFn: (c) => c.PaymentMethod === 'Electronic check' && c.OnlineSecurity === 'No',
    concession: '3 months free Online Security & Device Protection upon enabling Auto-Pay',
    channel: 'Email + Billing Portal Notice',
    channelType: 'email',
    impact: 'Reduces payment friction, +28% retention stability',
    status: 'Drafting',
    concessionCostPerUser: 30,
  },
  {
    id: 'pb-04',
    name: 'Senior Citizen Dedicated Support Line',
    category: 'Customer Experience',
    targetDescription: 'Senior citizen accounts with tenure <= 12 months without TechSupport',
    targetRisk: 'MEDIUM',
    triggerCriteria: {
      seniorCitizen: 1,
      maxTenure: 12,
      techSupport: 'No',
    },
    filterFn: (c) => c.SeniorCitizen === 1 && c.tenure <= 12 && c.TechSupport === 'No',
    concession: 'Dedicated toll-free senior support line with zero automated IVR wait time',
    channel: 'Direct Mail + Dedicated Phone',
    channelType: 'phone',
    impact: 'Increases CSAT by 35%, lowers support-driven churn',
    status: 'Active Blueprint',
    concessionCostPerUser: 25,
  },
  {
    id: 'pb-05',
    name: 'Streaming Entertainment Retention Anchor',
    category: 'Ecosystem Expansion',
    targetDescription: 'Fiber optic subscribers with tenure > 12 without Streaming TV/Movies',
    targetRisk: 'LOW',
    triggerCriteria: {
      internetService: 'Fiber optic',
      minTenure: 13,
      streamingTV: 'No',
      streamingMovies: 'No',
    },
    filterFn: (c) =>
      c.InternetService === 'Fiber optic' &&
      c.tenure > 12 &&
      c.StreamingTV === 'No' &&
      c.StreamingMovies === 'No',
    concession: 'Complimentary 6-month Streaming TV & Movies bundle with 12-month extension',
    channel: 'In-App Modal + Email',
    channelType: 'mobile',
    impact: 'Deepens ecosystem lock-in; lowers churn hazard to < 5%',
    status: 'Drafting',
    concessionCostPerUser: 60,
  },
  {
    id: 'pb-06',
    name: 'Contract Renewal 60-Day Advance Lock',
    category: 'Renewal Defense',
    targetDescription: 'One-year contract accounts in months 10-12 approaching expiration',
    targetRisk: 'MEDIUM',
    triggerCriteria: {
      contract: 'One year',
      minTenure: 10,
      maxTenure: 12,
    },
    filterFn: (c) => c.Contract === 'One year' && c.tenure >= 10 && c.tenure <= 12,
    concession: 'Early renewal rate lock for 24 months + free WiFi 6 router upgrade',
    channel: 'Account Manager Concierge + SMS',
    channelType: 'phone',
    impact: 'Secures 82% 2-year renewal conversion before month-to-month rollover',
    status: 'Ready to Deploy',
    concessionCostPerUser: 50,
  },
]

export default function CampaignsPage() {
  const [playbooks, setPlaybooks] = useState(DEFAULT_PLAYBOOKS)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [selectedRisk, setSelectedRisk] = useState('ALL')
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'table'

  // Drawer & Modal State
  const [inspectedPlaybook, setInspectedPlaybook] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [simulationToast, setSimulationToast] = useState(null)
  const [isSimulatingAll, setIsSimulatingAll] = useState(false)

  // New Playbook Form State
  const [newPbName, setNewPbName] = useState('')
  const [newPbCategory, setNewPbCategory] = useState('Contract Migration')
  const [newPbTarget, setNewPbTarget] = useState('')
  const [newPbRisk, setNewPbRisk] = useState('HIGH')
  const [newPbConcession, setNewPbConcession] = useState('')
  const [newPbChannel, setNewPbChannel] = useState('Email + In-App Portal')
  const [newPbStatus, setNewPbStatus] = useState('Drafting')

  // Pre-calculate matched audience count and MRR for each playbook against TELCO_COHORT
  const playbookStats = useMemo(() => {
    const statsMap = {}
    playbooks.forEach((pb) => {
      let matched = []
      if (typeof pb.filterFn === 'function') {
        matched = TELCO_COHORT.filter(pb.filterFn)
      } else {
        matched = TELCO_COHORT.filter((c) => c.riskLevel === pb.targetRisk).slice(0, 500)
      }
      const count = matched.length
      const mrr = matched.reduce((acc, c) => acc + Number(c.MonthlyCharges || 0), 0)
      statsMap[pb.id] = { count, mrr, matched }
    })
    return statsMap
  }, [playbooks])

  // Macro Summary Telemetry across all active playbooks
  const macroStats = useMemo(() => {
    const uniqueAccountIds = new Set()
    let totalMRRMitigated = 0

    playbooks.forEach((pb) => {
      if (pb.status === 'Ready to Deploy' || pb.status === 'Active Blueprint') {
        const stats = playbookStats[pb.id]
        if (stats && stats.matched) {
          stats.matched.forEach((c) => {
            if (!uniqueAccountIds.has(c.customerID)) {
              uniqueAccountIds.add(c.customerID)
              totalMRRMitigated += Number(c.MonthlyCharges || 0)
            }
          })
        }
      }
    })

    return {
      totalPlaybooks: playbooks.length,
      audienceReached: uniqueAccountIds.size,
      mrrMitigated: totalMRRMitigated,
      projectedROI: '5.2x',
    }
  }, [playbooks, playbookStats])

  // Filtered Playbooks based on search, status, and risk tier
  const filteredPlaybooks = useMemo(() => {
    return playbooks.filter((pb) => {
      if (selectedStatus !== 'ALL' && pb.status !== selectedStatus) {
        return false
      }
      if (selectedRisk !== 'ALL' && pb.targetRisk !== selectedRisk) {
        return false
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (
          pb.name.toLowerCase().includes(q) ||
          pb.category.toLowerCase().includes(q) ||
          pb.targetDescription.toLowerCase().includes(q) ||
          pb.concession.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [playbooks, selectedStatus, selectedRisk, searchQuery])

  // Sandbox simulation trigger for an individual playbook
  const handleSimulatePlaybook = (pb) => {
    const stats = playbookStats[pb.id] || { count: 0, mrr: 0 }
    setSimulationToast({
      title: `Simulation Dispatched: ${pb.name}`,
      message: `Sandbox dry-run executed on ${stats.count} matched accounts ($${Math.round(stats.mrr).toLocaleString()} MRR). Zero external marketing webhooks triggered.`,
    })
    setTimeout(() => {
      setSimulationToast(null)
    }, 4500)
  }

  // Simulate all ready triggers
  const handleSimulateAll = () => {
    setIsSimulatingAll(true)
    setTimeout(() => {
      setIsSimulatingAll(false)
      setSimulationToast({
        title: 'Batch Sandbox Trigger Complete',
        message: `Evaluated ${macroStats.audienceReached.toLocaleString()} unique subscribers across ${playbooks.length} playbooks. Real-time conditions verified without external API errors.`,
      })
      setTimeout(() => setSimulationToast(null), 5000)
    }, 1200)
  }

  // Create new custom playbook
  const handleCreatePlaybook = (e) => {
    e.preventDefault()
    if (!newPbName.trim()) return

    const created = {
      id: `pb-${Date.now().toString().slice(-4)}`,
      name: newPbName.trim(),
      category: newPbCategory,
      targetDescription: newPbTarget || 'Custom retention rule cohort',
      targetRisk: newPbRisk,
      filterFn: (c) => c.riskLevel === newPbRisk,
      concession: newPbConcession || 'Custom retention concession voucher',
      channel: newPbChannel,
      channelType: 'email',
      impact: 'Estimated 35% reduction in churn hazard',
      status: newPbStatus,
      concessionCostPerUser: 40,
    }

    setPlaybooks([created, ...playbooks])
    setIsCreateModalOpen(false)
    setNewPbName('')
    setNewPbTarget('')
    setNewPbConcession('')

    setSimulationToast({
      title: 'Playbook Created',
      message: `"${created.name}" was successfully added to the campaign catalog.`,
    })
    setTimeout(() => setSimulationToast(null), 4000)
  }

  // Table Columns for DataTable view mode
  const tableColumns = [
    {
      key: 'name',
      label: 'Playbook',
      sortable: true,
      render: (_, row) => (
        <div>
          <strong style={{ color: 'var(--color-text-primary)', display: 'block' }}>{row.name}</strong>
          <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>
            {row.category}
          </span>
        </div>
      ),
    },
    {
      key: 'targetRisk',
      label: 'Risk Tier',
      sortable: true,
      render: (val) => <RiskBadge level={val} size="sm" />,
    },
    {
      key: 'channel',
      label: 'Channel',
      render: (val) => (
        <span style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)' }}>
          {val}
        </span>
      ),
    },
    {
      key: 'matched',
      label: 'Matched Audience',
      sortable: true,
      render: (_, row) => {
        const stats = playbookStats[row.id] || { count: 0, mrr: 0 }
        return (
          <div className="font-tabular">
            <strong style={{ color: 'var(--color-text-primary)' }}>{stats.count.toLocaleString()}</strong>
            <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)', display: 'block' }}>
              ${Math.round(stats.mrr).toLocaleString()} MRR
            </span>
          </div>
        )
      },
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => (
        <span
          className="badge"
          style={{
            backgroundColor:
              val === 'Ready to Deploy'
                ? 'var(--color-kiwi-subtle)'
                : val === 'Active Blueprint'
                ? 'var(--color-status-info-subtle)'
                : 'var(--color-surface-highlight)',
            color:
              val === 'Ready to Deploy'
                ? 'var(--color-kiwi)'
                : val === 'Active Blueprint'
                ? 'var(--color-status-info)'
                : 'var(--color-text-secondary)',
            border: `1px solid ${
              val === 'Ready to Deploy'
                ? 'var(--color-kiwi-border)'
                : val === 'Active Blueprint'
                ? 'var(--color-status-info-border)'
                : 'var(--color-border-subtle)'
            }`,
          }}
        >
          {val}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setInspectedPlaybook(row)}
            style={{ padding: '4px 8px', fontSize: 'var(--font-size-micro)' }}
          >
            <Eye size={14} />
            <span>Inspect</span>
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => handleSimulatePlaybook(row)}
            style={{ padding: '4px 8px', fontSize: 'var(--font-size-micro)' }}
          >
            <Play size={13} style={{ color: 'var(--color-kiwi)' }} />
            <span>Simulate</span>
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="page-container">
      {/* Semantic Page Header */}
      <header className="page-header">
        <div className="page-header-top">
          <div className="page-header-title-group">
            <span className="eyebrow">Retention Automation</span>
            <h1>Retention Playbooks & Campaigns</h1>
            <p className="page-header-description">
              Pre-built intervention workflows engineered to convert predicted high-risk churn indicators into loyal long-term renewals.
            </p>
          </div>
          <div className="page-header-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleSimulateAll}
              disabled={isSimulatingAll}
              aria-label="Simulate all retention triggers"
            >
              <Play size={15} className={isSimulatingAll ? 'animate-spin' : ''} style={{ color: 'var(--color-kiwi)' }} />
              <span>Simulate All Triggers</span>
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setIsCreateModalOpen(true)}
              aria-label="Create retention playbook"
            >
              <Plus size={16} />
              <span>Create Playbook</span>
            </button>
          </div>
        </div>
      </header>

      {/* MANDATORY PLANNING / DEMONSTRATION WORKFLOW BANNER (Requirement R3) */}
      <div
        className="notice-banner warning"
        role="region"
        aria-label="Planning and demonstration mode advisory"
        style={{
          borderLeft: '4px solid var(--color-risk-medium)',
        }}
      >
        <AlertTriangle size={24} style={{ color: 'var(--color-risk-medium)', flexShrink: 0 }} />
        <div>
          <strong style={{ display: 'block', color: 'var(--color-risk-medium)', marginBottom: '4px' }}>
            [PLANNING STATE / DEMONSTRATION WORKFLOW]
          </strong>
          <span>
            Automated campaign execution and SMS/email triggers are in architectural design. All playbooks and audience triggers below are evaluated in real time against the 7,043-subscriber Telco cohort without dispatching live external communications.
          </span>
        </div>
      </div>

      {/* Simulation Feedback Toast / Banner */}
      {simulationToast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: 'var(--color-kiwi-subtle)',
            border: '1px solid var(--color-kiwi-border)',
            borderRadius: 'var(--radius-md)',
            gap: 'var(--space-3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <CheckCircle2 size={18} style={{ color: 'var(--color-kiwi)', flexShrink: 0 }} />
            <div>
              <strong style={{ color: 'var(--color-kiwi)', fontSize: 'var(--font-size-body-sm)' }}>
                {simulationToast.title}:
              </strong>{' '}
              <span style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-primary)' }}>
                {simulationToast.message}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setSimulationToast(null)}
            style={{ padding: '2px', color: 'var(--color-text-secondary)' }}
            aria-label="Dismiss toast"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Summary KPI Grid */}
      <section
        aria-label="Retention Playbook Summary Indicators"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        <MetricCard
          label="Total Playbooks"
          value={macroStats.totalPlaybooks}
          subtext="Configured retention workflows"
          variant="default"
          icon={Target}
          progress={100}
        />

        <MetricCard
          label="Target Audience Reached"
          value={macroStats.audienceReached.toLocaleString()}
          subtext="Matched across active playbooks"
          variant="high-risk"
          icon={Users}
          trend="positive"
          trendValue="31.1% Cohort"
          progress={31.1}
        />

        <MetricCard
          label="MRR Exposure Mitigated"
          value={`$${Math.round(macroStats.mrrMitigated).toLocaleString()}`}
          subtext="Revenue protected by ready playbooks"
          variant="kiwi"
          icon={DollarSign}
          trend="positive"
          trendValue="Preserved MRR"
          progress={78.5}
        />

        <MetricCard
          label="Projected ROI Multiplier"
          value={macroStats.projectedROI}
          subtext="Gross ARR saved vs concession spend"
          variant="default"
          icon={Sparkles}
          trend="positive"
          trendValue="High Leverage"
          progress={85}
        />
      </section>

      {/* Control Toolbar: Search, Filters, View Mode */}
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
            placeholder="Search playbooks by name, channel, or concession..."
            aria-label="Search playbooks"
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

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
          {['ALL', 'Ready to Deploy', 'Active Blueprint', 'Drafting'].map((st) => (
            <button
              key={st}
              type="button"
              className={selectedStatus === st ? 'btn-secondary' : 'btn-ghost'}
              onClick={() => setSelectedStatus(st)}
              style={{
                padding: '4px 8px',
                fontSize: 'var(--font-size-micro)',
                border: selectedStatus === st ? '1px solid var(--color-border-strong)' : '1px solid transparent',
              }}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Risk Filter & View Mode */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>RISK:</span>
            {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((rk) => (
              <button
                key={rk}
                type="button"
                className={selectedRisk === rk ? 'btn-secondary' : 'btn-ghost'}
                onClick={() => setSelectedRisk(rk)}
                style={{
                  padding: '4px 6px',
                  fontSize: 'var(--font-size-micro)',
                  border: selectedRisk === rk ? '1px solid var(--color-border-strong)' : '1px solid transparent',
                }}
              >
                {rk}
              </button>
            ))}
          </div>

          {/* View Mode Switcher */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--color-surface-card)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border-subtle)',
              overflow: 'hidden',
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              style={{
                padding: '6px 8px',
                backgroundColor: viewMode === 'grid' ? 'var(--color-surface-highlight)' : 'transparent',
                color: viewMode === 'grid' ? 'var(--color-kiwi)' : 'var(--color-text-secondary)',
                cursor: 'pointer',
              }}
              aria-label="Grid Cards View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              style={{
                padding: '6px 8px',
                backgroundColor: viewMode === 'table' ? 'var(--color-surface-highlight)' : 'transparent',
                color: viewMode === 'table' ? 'var(--color-kiwi)' : 'var(--color-text-secondary)',
                cursor: 'pointer',
              }}
              aria-label="DataTable View"
            >
              <TableIcon size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Viewport: Mode A (Card Grid) vs Mode B (DataTable) */}
      {viewMode === 'table' ? (
        <DataTable
          columns={tableColumns}
          data={filteredPlaybooks}
          total={filteredPlaybooks.length}
          pageSize={10}
          emptyMessage="No retention playbooks match the selected filters."
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: 'var(--space-4)',
          }}
        >
          {filteredPlaybooks.map((pb) => {
            const stats = playbookStats[pb.id] || { count: 0, mrr: 0 }
            const channelIcon =
              pb.channelType === 'phone' ? (
                <Phone size={15} style={{ color: 'var(--color-status-info)' }} />
              ) : pb.channelType === 'mobile' ? (
                <Smartphone size={15} style={{ color: 'var(--color-kiwi)' }} />
              ) : (
                <Mail size={15} style={{ color: 'var(--color-text-secondary)' }} />
              )

            return (
              <section
                key={pb.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: `3px solid ${
                    pb.targetRisk === 'HIGH'
                      ? 'var(--color-risk-high)'
                      : pb.targetRisk === 'MEDIUM'
                      ? 'var(--color-risk-medium)'
                      : 'var(--color-kiwi)'
                  }`,
                  position: 'relative',
                }}
              >
                <div>
                  {/* Top Bar: Category & Status */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 'var(--space-2)',
                    }}
                  >
                    <span className="eyebrow" style={{ color: 'var(--color-text-secondary)' }}>
                      {pb.category}
                    </span>
                    <span
                      className="badge"
                      style={{
                        backgroundColor:
                          pb.status === 'Ready to Deploy'
                            ? 'var(--color-kiwi-subtle)'
                            : pb.status === 'Active Blueprint'
                            ? 'var(--color-status-info-subtle)'
                            : 'var(--color-surface-highlight)',
                        color:
                          pb.status === 'Ready to Deploy'
                            ? 'var(--color-kiwi)'
                            : pb.status === 'Active Blueprint'
                            ? 'var(--color-status-info)'
                            : 'var(--color-text-secondary)',
                        border: `1px solid ${
                          pb.status === 'Ready to Deploy'
                            ? 'var(--color-kiwi-border)'
                            : pb.status === 'Active Blueprint'
                            ? 'var(--color-status-info-border)'
                            : 'var(--color-border-subtle)'
                        }`,
                      }}
                    >
                      {pb.status}
                    </span>
                  </div>

                  {/* Playbook Title */}
                  <h3 style={{ fontSize: 'var(--font-size-h2)', marginBottom: 'var(--space-2)' }}>
                    {pb.name}
                  </h3>

                  {/* Target Audience Description */}
                  <div
                    style={{
                      fontSize: 'var(--font-size-body-sm)',
                      color: 'var(--color-text-secondary)',
                      marginBottom: 'var(--space-3)',
                    }}
                  >
                    <strong>Trigger Target: </strong>
                    {pb.targetDescription}
                  </div>

                  {/* Concession Offer Box */}
                  <div
                    style={{
                      padding: 'var(--space-3)',
                      backgroundColor: 'var(--color-surface-subtle)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: 'var(--space-3)',
                      border: '1px solid var(--color-border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <Sparkles size={14} style={{ color: 'var(--color-kiwi)' }} />
                      <span style={{ fontSize: 'var(--font-size-micro)', fontWeight: 600, color: 'var(--color-kiwi)' }}>
                        CONCESSION OFFER
                      </span>
                    </div>
                    <div style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-primary)' }}>
                      {pb.concession}
                    </div>
                  </div>

                  {/* Channel & Impact Row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: 'var(--font-size-micro)',
                      color: 'var(--color-text-secondary)',
                      marginBottom: 'var(--space-3)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {channelIcon}
                      <span>{pb.channel}</span>
                    </div>
                    <RiskBadge level={pb.targetRisk} size="sm" />
                  </div>
                </div>

                {/* Footer Telemetry & Actions */}
                <div
                  style={{
                    paddingTop: 'var(--space-3)',
                    borderTop: '1px solid var(--color-border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 'var(--space-2)',
                  }}
                >
                  <div>
                    <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>
                      Matched Audience:
                    </span>
                    <div className="font-tabular" style={{ fontSize: 'var(--font-size-body)', fontWeight: 700 }}>
                      {stats.count.toLocaleString()} accounts · ${Math.round(stats.mrr).toLocaleString()} MRR
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => setInspectedPlaybook(pb)}
                      style={{ padding: '6px 10px', fontSize: 'var(--font-size-body-sm)' }}
                      aria-label={`Inspect audience for ${pb.name}`}
                    >
                      <Eye size={14} />
                      <span>Inspect</span>
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => handleSimulatePlaybook(pb)}
                      style={{ padding: '6px 12px', fontSize: 'var(--font-size-body-sm)' }}
                      aria-label={`Simulate sandbox trigger for ${pb.name}`}
                    >
                      <Play size={13} style={{ color: 'var(--color-kiwi)' }} />
                      <span>Simulate</span>
                    </button>
                  </div>
                </div>
              </section>
            )
          })}
        </div>
      )}

      {/* Playbook Inspection Drawer / Modal */}
      {inspectedPlaybook && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="drawer-title"
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
          onClick={() => setInspectedPlaybook(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '540px',
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
                <span className="eyebrow" style={{ color: 'var(--color-kiwi)' }}>Playbook Inspection</span>
                <h2 id="drawer-title" style={{ fontSize: 'var(--font-size-h1)', marginTop: '2px' }}>
                  {inspectedPlaybook.name}
                </h2>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <RiskBadge level={inspectedPlaybook.targetRisk} size="sm" />
                  <span className="badge badge-info">{inspectedPlaybook.status}</span>
                </div>
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setInspectedPlaybook(null)}
                style={{ padding: '4px' }}
                aria-label="Close drawer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Audience Match Metrics */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 'var(--space-3)',
                padding: 'var(--space-3)',
                backgroundColor: 'var(--color-surface-subtle)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div>
                <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>
                  Matched Subscribers:
                </span>
                <div className="font-tabular" style={{ fontSize: 'var(--font-size-h2)', fontWeight: 700, color: 'var(--color-kiwi)' }}>
                  {playbookStats[inspectedPlaybook.id]?.count.toLocaleString() ?? 0}
                </div>
              </div>
              <div>
                <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>
                  Monthly Revenue Exposure:
                </span>
                <div className="font-tabular" style={{ fontSize: 'var(--font-size-h2)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  ${Math.round(playbookStats[inspectedPlaybook.id]?.mrr ?? 0).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Concession & Strategic Logic */}
            <div>
              <strong style={{ fontSize: 'var(--font-size-body-sm)', display: 'block', marginBottom: '4px' }}>
                Concession Strategy
              </strong>
              <p style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)' }}>
                {inspectedPlaybook.concession}
              </p>
            </div>

            <div>
              <strong style={{ fontSize: 'var(--font-size-body-sm)', display: 'block', marginBottom: '4px' }}>
                Expected Hazard Mitigation
              </strong>
              <p style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-kiwi)' }}>
                {inspectedPlaybook.impact}
              </p>
            </div>

            {/* Sample Matched Subscribers */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <strong style={{ fontSize: 'var(--font-size-body-sm)' }}>Sample Matched Subscribers</strong>
                <Link
                  to="/customers"
                  style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-kiwi)', display: 'flex', alignItems: 'center', gap: '2px' }}
                >
                  <span>Open Directory</span>
                  <ExternalLink size={11} />
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {playbookStats[inspectedPlaybook.id]?.matched.slice(0, 5).map((cust) => (
                  <div
                    key={cust.customerID}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      backgroundColor: 'var(--color-surface-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 'var(--font-size-body-sm)',
                    }}
                  >
                    <div>
                      <Link
                        to={`/customers/${cust.customerID}`}
                        style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-text-primary)' }}
                      >
                        #{cust.customerID}
                      </Link>
                      <div style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-secondary)' }}>
                        {cust.Contract} · {cust.InternetService} · {cust.tenure} mo
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="font-tabular" style={{ fontWeight: 600 }}>
                        ${Number(cust.MonthlyCharges).toFixed(2)}/mo
                      </span>
                      <RiskBadge level={cust.riskLevel} score={cust.churnProbability} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sandbox Simulation Trigger Button */}
            <div style={{ marginTop: 'auto', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border-subtle)' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  handleSimulatePlaybook(inspectedPlaybook)
                  setInspectedPlaybook(null)
                }}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Play size={16} />
                <span>Simulate Sandbox Dispatch Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Playbook Creator Modal */}
      {isCreateModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
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
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '520px',
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 id="modal-title" style={{ fontSize: 'var(--font-size-h2)' }}>
                Create Custom Retention Playbook
              </h2>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setIsCreateModalOpen(false)}
                style={{ padding: '4px' }}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePlaybook} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-size-body-sm)', marginBottom: '4px' }}>
                  Playbook Name
                </label>
                <input
                  type="text"
                  required
                  value={newPbName}
                  onChange={(e) => setNewPbName(e.target.value)}
                  placeholder="e.g. VIP Fiber Optic Proactive Rate-Lock"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: 'var(--color-surface-subtle)',
                    border: '1px solid var(--color-border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-text-primary)',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-size-body-sm)', marginBottom: '4px' }}>
                    Category
                  </label>
                  <select
                    value={newPbCategory}
                    onChange={(e) => setNewPbCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: 'var(--color-surface-subtle)',
                      border: '1px solid var(--color-border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    <option value="Contract Migration">Contract Migration</option>
                    <option value="Service Quality">Service Quality</option>
                    <option value="Billing & Security">Billing & Security</option>
                    <option value="Customer Experience">Customer Experience</option>
                    <option value="Ecosystem Expansion">Ecosystem Expansion</option>
                    <option value="Renewal Defense">Renewal Defense</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-size-body-sm)', marginBottom: '4px' }}>
                    Target Risk Tier
                  </label>
                  <select
                    value={newPbRisk}
                    onChange={(e) => setNewPbRisk(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: 'var(--color-surface-subtle)',
                      border: '1px solid var(--color-border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    <option value="HIGH">HIGH RISK</option>
                    <option value="MEDIUM">MEDIUM RISK</option>
                    <option value="LOW">LOW RISK</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-size-body-sm)', marginBottom: '4px' }}>
                  Target Audience Description
                </label>
                <input
                  type="text"
                  value={newPbTarget}
                  onChange={(e) => setNewPbTarget(e.target.value)}
                  placeholder="e.g. Fiber optic accounts with MonthlyCharges > $80"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: 'var(--color-surface-subtle)',
                    border: '1px solid var(--color-border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-text-primary)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-size-body-sm)', marginBottom: '4px' }}>
                  Concession Offer
                </label>
                <input
                  type="text"
                  value={newPbConcession}
                  onChange={(e) => setNewPbConcession(e.target.value)}
                  placeholder="e.g. Free speed boost + $10/mo discount for 6 months"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: 'var(--color-surface-subtle)',
                    border: '1px solid var(--color-border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-text-primary)',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-size-body-sm)', marginBottom: '4px' }}>
                    Delivery Channel
                  </label>
                  <select
                    value={newPbChannel}
                    onChange={(e) => setNewPbChannel(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: 'var(--color-surface-subtle)',
                      border: '1px solid var(--color-border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    <option value="Email + In-App Portal">Email + In-App Portal</option>
                    <option value="Concierge Call + SMS">Concierge Call + SMS</option>
                    <option value="In-App Modal Notification">In-App Modal Notification</option>
                    <option value="Direct Mail Voucher">Direct Mail Voucher</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-size-body-sm)', marginBottom: '4px' }}>
                    Status
                  </label>
                  <select
                    value={newPbStatus}
                    onChange={(e) => setNewPbStatus(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: 'var(--color-surface-subtle)',
                      border: '1px solid var(--color-border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    <option value="Drafting">Drafting</option>
                    <option value="Active Blueprint">Active Blueprint</option>
                    <option value="Ready to Deploy">Ready to Deploy</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                <button type="button" className="btn-ghost" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Plus size={16} />
                  <span>Save Playbook</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
