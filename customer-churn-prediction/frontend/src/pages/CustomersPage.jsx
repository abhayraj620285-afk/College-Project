import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Download,
  Sparkles,
  Users,
  UserCheck,
  UserX,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react'

// Common & Domain Components
import MetricCard from '../components/common/MetricCard'
import { EmptyState, SuccessBanner } from '../components/common/StateIndicators'
import CustomerFilters from '../components/customers/CustomerFilters'
import CustomerTable from '../components/customers/CustomerTable'

// Data & Query Service
import {
  getCustomers,
  getCohortStats,
  exportCohortToCsv,
} from '../services/customerService'

export default function CustomersPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Operational State
  const [isExporting, setIsExporting] = useState(false)
  const [exportNotice, setExportNotice] = useState(null)

  // 1. Synchronize Filter & Query State from URL search parameters
  const search = searchParams.get('search') || ''
  const contract = searchParams.get('contract') || 'ALL'
  const internetService = searchParams.get('internet') || searchParams.get('internetService') || 'ALL'
  const riskTier = searchParams.get('risk') || searchParams.get('riskTier') || 'ALL'
  const churnStatus = searchParams.get('status') || searchParams.get('churnStatus') || 'ALL'

  const page = parseInt(searchParams.get('page') || '1', 10) || 1
  const pageSize = parseInt(searchParams.get('pageSize') || '25', 10) || 25
  const sortBy = searchParams.get('sortBy') || 'customerID'
  const sortDir = searchParams.get('sortDir') || 'asc'

  // Memoized filter object passed to CustomerFilters
  const filters = useMemo(() => ({
    search,
    contract,
    internetService,
    riskTier,
    churnStatus,
  }), [search, contract, internetService, riskTier, churnStatus])

  // URL Query Parameter Updater: cleans default parameters to keep URLs concise
  const updateUrlParams = useCallback((updates) => {
    setSearchParams((prevParams) => {
      const next = new URLSearchParams(prevParams)
      Object.entries(updates).forEach(([key, val]) => {
        const isDefault =
          val === null ||
          val === undefined ||
          val === '' ||
          val === 'ALL' ||
          (key === 'page' && Number(val) === 1) ||
          (key === 'pageSize' && Number(val) === 25) ||
          (key === 'sortBy' && val === 'customerID') ||
          (key === 'sortDir' && val === 'asc')

        if (isDefault) {
          next.delete(key)
        } else {
          next.set(key, String(val))
        }
      })
      return next
    }, { replace: true })
  }, [setSearchParams])

  // 2. Fetch Cohort Summary Stats
  const cohortStats = useMemo(() => getCohortStats(), [])

  // 3. Query Customer Records via customerService
  const customerData = useMemo(() => {
    return getCustomers({
      page,
      pageSize,
      search: filters.search,
      contract: filters.contract,
      internetService: filters.internetService,
      riskTier: filters.riskTier,
      churnStatus: filters.churnStatus,
      sortBy,
      sortDir,
    })
  }, [page, pageSize, filters, sortBy, sortDir])

  // Guard: if current page exceeds totalPages due to filtering, adjust page
  useEffect(() => {
    if (page > customerData.totalPages && customerData.totalPages > 0) {
      updateUrlParams({ page: customerData.totalPages })
    }
  }, [page, customerData.totalPages, updateUrlParams])

  // 4. Filter, Pagination & Sorting Handlers
  const handleFiltersChange = useCallback((newFilters) => {
    setSearchParams((prevParams) => {
      const next = new URLSearchParams(prevParams)
      // Clean alias keys
      next.delete('internetService')
      next.delete('riskTier')
      next.delete('churnStatus')

      if (!newFilters.search) next.delete('search')
      else next.set('search', newFilters.search)

      if (!newFilters.contract || newFilters.contract === 'ALL') next.delete('contract')
      else next.set('contract', newFilters.contract)

      if (!newFilters.internetService || newFilters.internetService === 'ALL') next.delete('internet')
      else next.set('internet', newFilters.internetService)

      if (!newFilters.riskTier || newFilters.riskTier === 'ALL') next.delete('risk')
      else next.set('risk', newFilters.riskTier)

      if (!newFilters.churnStatus || newFilters.churnStatus === 'ALL') next.delete('status')
      else next.set('status', newFilters.churnStatus)

      next.delete('page') // Reset to page 1 on filter modification
      return next
    }, { replace: true })
  }, [setSearchParams])

  const handleResetFilters = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams()
      // Preserve user's sorting & page size preference if set
      if (sortBy !== 'customerID') next.set('sortBy', sortBy)
      if (sortDir !== 'asc') next.set('sortDir', sortDir)
      if (pageSize !== 25) next.set('pageSize', String(pageSize))
      return next
    }, { replace: true })
  }, [sortBy, sortDir, pageSize, setSearchParams])

  const handlePageChange = useCallback((newPage) => {
    updateUrlParams({ page: newPage })
  }, [updateUrlParams])

  const handlePageSizeChange = useCallback((newSize) => {
    updateUrlParams({ pageSize: newSize, page: 1 })
  }, [updateUrlParams])

  const handleSort = useCallback((colKey) => {
    if (sortBy === colKey) {
      updateUrlParams({ sortDir: sortDir === 'asc' ? 'desc' : 'asc' })
    } else {
      updateUrlParams({ sortBy: colKey, sortDir: 'asc' })
    }
  }, [sortBy, sortDir, updateUrlParams])

  // 5. CSV Cohort Export Action
  const handleExportCsv = useCallback(() => {
    try {
      setIsExporting(true)
      // Retrieve full matching cohort without pagination limit
      const fullCohortResult = getCustomers({
        page: 1,
        pageSize: 10000,
        search: filters.search,
        contract: filters.contract,
        internetService: filters.internetService,
        riskTier: filters.riskTier,
        churnStatus: filters.churnStatus,
        sortBy,
        sortDir,
      })

      const csvContent = exportCohortToCsv(fullCohortResult.customers)
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const dateStamp = new Date().toISOString().split('T')[0]
      link.setAttribute('download', `customer_cohort_${dateStamp}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setExportNotice(
        `Successfully exported ${fullCohortResult.customers.length.toLocaleString()} customer records to CSV.`
      )
    } catch (err) {
      console.error('Failed to export customer cohort:', err)
    } finally {
      setIsExporting(false)
    }
  }, [filters, sortBy, sortDir])

  return (
    <div className="page-container">
      {/* Semantic Page Header */}
      <header className="page-header">
        <div className="page-header-top">
          <div className="page-header-title-group">
            <span className="eyebrow">Cohort Intelligence</span>
            <h1>Customer Directory</h1>
            <p className="page-header-description">
              Browse, filter, and inspect {cohortStats.totalSubscribers.toLocaleString()} subscriber profiles across ground-truth Telco records. Evaluate real-time churn risk classifications, contract hazards, and customer lifetime value.
            </p>
          </div>
          <div className="page-header-actions">
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={isExporting}
              className="btn-secondary"
              aria-label="Export filtered customer cohort to CSV"
            >
              <Download size={16} />
              <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
            </button>
            <Link
              to="/predict"
              className="btn-primary"
              aria-label="Run Churn Prediction on Customer"
            >
              <Sparkles size={16} />
              <span>Predict Churn</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Ephemeral Feedback Banner */}
      {exportNotice && (
        <SuccessBanner
          title="Export Complete"
          message={exportNotice}
          onDismiss={() => setExportNotice(null)}
        />
      )}

      {/* Cohort Summary Metric Cards Grid */}
      <section
        aria-label="Cohort Summary Metrics"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        {/* Metric 1: Active Subscribers */}
        <MetricCard
          label="Active Subscribers"
          value={cohortStats.retainedSubscribers.toLocaleString()}
          subtext="73.5% ground-truth retention rate"
          icon={UserCheck}
          variant="kiwi"
          trend="positive"
          trendValue="73.5%"
        />

        {/* Metric 2: High Risk Accounts */}
        <MetricCard
          label="High Risk Subscribers"
          value={`${cohortStats.cohortRiskDistribution.HIGH} In Sample`}
          subtext="$139,130 MRR exposed at ≥ 70% risk"
          icon={AlertTriangle}
          variant="high-risk"
          trend="negative"
          trendValue="29.0%"
        />

        {/* Metric 3: Churned Accounts */}
        <MetricCard
          label="Churned Accounts"
          value={cohortStats.churnedSubscribers.toLocaleString()}
          subtext="26.54% historical baseline churn"
          icon={UserX}
          variant="medium-risk"
          trend="neutral"
          trendValue="1,869"
        />
      </section>

      {/* Multi-Facet Filter Bar */}
      <CustomerFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleResetFilters}
        totalCount={cohortStats.cohortSize}
        filteredCount={customerData.total}
      />

      {/* Customer Table or Authentic Empty State */}
      {customerData.total === 0 ? (
        <div className="card" style={{ padding: 'var(--space-8)' }}>
          <EmptyState
            icon={Users}
            title="No matching customers found"
            description="No subscriber records match your current filter parameters. Try broadening your search or resetting active filters."
            actionLabel="Clear Filters"
            actionIcon={RotateCcw}
            onAction={handleResetFilters}
          />
        </div>
      ) : (
        <CustomerTable
          customers={customerData.customers}
          loading={false}
          page={customerData.page}
          pageSize={customerData.pageSize}
          total={customerData.total}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
          emptyMessage="No customer records match your filter criteria."
        />
      )}
    </div>
  )
}
