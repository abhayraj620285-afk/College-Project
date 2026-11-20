import React, { useState, useEffect, useRef } from 'react'
import { Search, X, RotateCcw } from 'lucide-react'

export const DEFAULT_FILTERS = {
  search: '',
  contract: 'ALL',
  internetService: 'ALL',
  riskTier: 'ALL',
  churnStatus: 'ALL',
}

export default function CustomerFilters({
  filters = DEFAULT_FILTERS,
  onFiltersChange = () => {},
  onReset,
  totalCount,
  filteredCount,
}) {
  const [localSearch, setLocalSearch] = useState(filters.search || '')
  const debounceTimerRef = useRef(null)

  // Sync external filter search reset back into local input state
  useEffect(() => {
    setLocalSearch(filters.search || '')
  }, [filters.search])

  // Debounced search handler: 250ms delay
  function handleSearchChange(e) {
    const value = e.target.value
    setLocalSearch(value)

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      onFiltersChange({
        ...filters,
        search: value,
      })
    }, 250)
  }

  function handleClearSearch() {
    setLocalSearch('')
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    onFiltersChange({
      ...filters,
      search: '',
    })
  }

  function handleFilterSelect(field, value) {
    onFiltersChange({
      ...filters,
      [field]: value,
    })
  }

  function handleResetAll() {
    setLocalSearch('')
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    onFiltersChange(DEFAULT_FILTERS)
    if (onReset) {
      onReset()
    }
  }

  // Normalize churn status to handle 'Active'/'Churned' as well as 'No'/'Yes'
  const normalizedChurn =
    filters.churnStatus === 'No'
      ? 'Active'
      : filters.churnStatus === 'Yes'
      ? 'Churned'
      : filters.churnStatus || 'ALL'

  // Count active non-default filters
  const activeCount = [
    localSearch.trim() !== '',
    filters.contract && filters.contract !== 'ALL',
    filters.internetService && filters.internetService !== 'ALL',
    filters.riskTier && filters.riskTier !== 'ALL',
    normalizedChurn !== 'ALL',
  ].filter(Boolean).length

  return (
    <div
      className="card customer-filters-bar"
      style={{
        padding: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
      role="search"
      aria-label="Customer directory filter bar"
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-3)',
        }}
      >
        {/* Search & Dropdown Controls */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 'var(--space-3)',
            flex: 1,
            minWidth: '280px',
          }}
        >
          {/* Search Input with Clear Button */}
          <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '220px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-tertiary)',
                pointerEvents: 'none',
              }}
              aria-hidden="true"
            />
            <input
              type="text"
              value={localSearch}
              onChange={handleSearchChange}
              onKeyDown={(e) => {
                if (e.key === 'Escape') handleClearSearch()
              }}
              placeholder="Search by ID (e.g. 7590-VHVEG)..."
              style={{
                width: '100%',
                padding: '8px 36px 8px 36px',
                backgroundColor: 'var(--color-surface-input)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-primary)',
                fontSize: 'var(--font-size-body-sm)',
              }}
              aria-label="Filter customers by ID"
            />
            {localSearch && (
              <button
                type="button"
                onClick={handleClearSearch}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-tertiary)',
                  padding: '4px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Clear search input"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Contract Filter */}
          <div style={{ minWidth: '150px' }}>
            <label htmlFor="customer-contract-filter" className="sr-only" style={{ display: 'none' }}>
              Contract Type
            </label>
            <select
              id="customer-contract-filter"
              value={filters.contract || 'ALL'}
              onChange={(e) => handleFilterSelect('contract', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: 'var(--color-surface-input)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-primary)',
                fontSize: 'var(--font-size-body-sm)',
              }}
              aria-label="Filter by Contract Type"
            >
              <option value="ALL">All Contracts</option>
              <option value="Month-to-month">Month-to-month</option>
              <option value="One year">One year</option>
              <option value="Two year">Two year</option>
            </select>
          </div>

          {/* Internet Service Filter */}
          <div style={{ minWidth: '150px' }}>
            <label htmlFor="customer-internet-filter" className="sr-only" style={{ display: 'none' }}>
              Internet Service
            </label>
            <select
              id="customer-internet-filter"
              value={filters.internetService || 'ALL'}
              onChange={(e) => handleFilterSelect('internetService', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: 'var(--color-surface-input)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-primary)',
                fontSize: 'var(--font-size-body-sm)',
              }}
              aria-label="Filter by Internet Service"
            >
              <option value="ALL">All Internet</option>
              <option value="Fiber optic">Fiber optic</option>
              <option value="DSL">DSL</option>
              <option value="No">No Internet Service</option>
            </select>
          </div>

          {/* Risk Tier Filter */}
          <div style={{ minWidth: '160px' }}>
            <label htmlFor="customer-risk-filter" className="sr-only" style={{ display: 'none' }}>
              Risk Tier
            </label>
            <select
              id="customer-risk-filter"
              value={filters.riskTier || 'ALL'}
              onChange={(e) => handleFilterSelect('riskTier', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: 'var(--color-surface-input)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-primary)',
                fontSize: 'var(--font-size-body-sm)',
              }}
              aria-label="Filter by Churn Risk Level"
            >
              <option value="ALL">All Risk Tiers</option>
              <option value="HIGH">High Risk (≥ 70%)</option>
              <option value="MEDIUM">Medium Risk (40–69%)</option>
              <option value="LOW">Low Risk (&lt; 40%)</option>
            </select>
          </div>

          {/* Churn Status Filter (Ground Truth) */}
          <div style={{ minWidth: '150px' }}>
            <label htmlFor="customer-churn-filter" className="sr-only" style={{ display: 'none' }}>
              Historical Churn Status
            </label>
            <select
              id="customer-churn-filter"
              value={normalizedChurn}
              onChange={(e) => handleFilterSelect('churnStatus', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: 'var(--color-surface-input)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-primary)',
                fontSize: 'var(--font-size-body-sm)',
              }}
              aria-label="Filter by Historical Churn Status"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active Subscribers</option>
              <option value="Churned">Churned Accounts</option>
            </select>
          </div>
        </div>

        {/* Active Pill Count & Reset Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {activeCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: 'var(--font-size-micro)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-kiwi-subtle)',
                  color: 'var(--color-kiwi)',
                  border: '1px solid var(--color-kiwi-border)',
                  fontWeight: 600,
                }}
              >
                {activeCount} active {activeCount === 1 ? 'filter' : 'filters'}
              </span>

              <button
                type="button"
                onClick={handleResetAll}
                className="btn-ghost"
                style={{
                  fontSize: 'var(--font-size-micro)',
                  padding: '4px 8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                aria-label="Reset all filters"
              >
                <RotateCcw size={12} /> Reset all
              </button>
            </div>
          )}

          {typeof filteredCount === 'number' && typeof totalCount === 'number' && (
            <div
              style={{
                fontSize: 'var(--font-size-micro)',
                color: 'var(--color-text-tertiary)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              Filtered: {filteredCount.toLocaleString()} / {totalCount.toLocaleString()}
            </div>
          )}
        </div>
      </div>

      {/* Active Filter Badges / Pills */}
      {activeCount > 0 && (
        <div
          className="customer-active-filter-badges"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 'var(--space-2)',
            paddingTop: 'var(--space-2)',
            borderTop: '1px solid var(--color-border-subtle)',
          }}
          aria-label="Active filter tags"
        >
          <span
            style={{
              fontSize: 'var(--font-size-micro)',
              color: 'var(--color-text-tertiary)',
            }}
          >
            Active filters:
          </span>

          {localSearch.trim() && (
            <span
              className="badge"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-surface-hover)',
                border: '1px solid var(--color-border-default)',
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--font-size-micro)',
              }}
            >
              Search: "{localSearch}"
              <button
                type="button"
                onClick={handleClearSearch}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  display: 'flex',
                  color: 'var(--color-text-tertiary)',
                }}
                aria-label="Remove search filter"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {filters.contract && filters.contract !== 'ALL' && (
            <span
              className="badge"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-surface-hover)',
                border: '1px solid var(--color-border-default)',
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--font-size-micro)',
              }}
            >
              Contract: {filters.contract}
              <button
                type="button"
                onClick={() => handleFilterSelect('contract', 'ALL')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  display: 'flex',
                  color: 'var(--color-text-tertiary)',
                }}
                aria-label="Remove contract filter"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {filters.internetService && filters.internetService !== 'ALL' && (
            <span
              className="badge"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-surface-hover)',
                border: '1px solid var(--color-border-default)',
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--font-size-micro)',
              }}
            >
              Internet: {filters.internetService}
              <button
                type="button"
                onClick={() => handleFilterSelect('internetService', 'ALL')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  display: 'flex',
                  color: 'var(--color-text-tertiary)',
                }}
                aria-label="Remove internet service filter"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {filters.riskTier && filters.riskTier !== 'ALL' && (
            <span
              className="badge"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-surface-hover)',
                border: '1px solid var(--color-border-default)',
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--font-size-micro)',
              }}
            >
              Risk: {filters.riskTier}
              <button
                type="button"
                onClick={() => handleFilterSelect('riskTier', 'ALL')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  display: 'flex',
                  color: 'var(--color-text-tertiary)',
                }}
                aria-label="Remove risk tier filter"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {normalizedChurn !== 'ALL' && (
            <span
              className="badge"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-surface-hover)',
                border: '1px solid var(--color-border-default)',
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--font-size-micro)',
              }}
            >
              Status: {normalizedChurn === 'Active' ? 'Active Subscribers' : 'Churned Accounts'}
              <button
                type="button"
                onClick={() => handleFilterSelect('churnStatus', 'ALL')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  display: 'flex',
                  color: 'var(--color-text-tertiary)',
                }}
                aria-label="Remove churn status filter"
              >
                <X size={12} />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={handleResetAll}
            className="btn-ghost"
            style={{
              fontSize: 'var(--font-size-micro)',
              padding: '2px 6px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--color-kiwi)',
            }}
            aria-label="Reset all filters"
          >
            <RotateCcw size={11} /> Reset all
          </button>
        </div>
      )}
    </div>
  )
}
