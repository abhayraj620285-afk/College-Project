import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpDown, ArrowUp, ArrowDown, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import RiskBadge from '../common/RiskBadge'

export default function CustomerTable({
  customers = [],
  loading = false,
  page = 1,
  pageSize = 25,
  total = 0,
  onPageChange = () => {},
  onPageSizeChange,
  sortBy = 'customerID',
  sortDir = 'asc',
  onSort = () => {},
  emptyMessage = 'No customer records match your filter criteria.',
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const startIdx = total === 0 ? 0 : (page - 1) * pageSize + 1
  const endIdx = Math.min(total, page * pageSize)

  const columns = [
    { key: 'customerID', label: 'Customer ID', sortable: true },
    { key: 'tenure', label: 'Tenure', sortable: true },
    { key: 'Contract', label: 'Contract', sortable: true },
    { key: 'InternetService', label: 'Internet', sortable: true },
    { key: 'MonthlyCharges', label: 'Monthly', sortable: true },
    { key: 'TotalCharges', label: 'Total Charges', sortable: true },
    { key: 'riskLevel', label: 'Risk / Status', sortable: true },
    { key: 'action', label: 'Action', sortable: false, align: 'right' },
  ]

  function renderSortIcon(colKey) {
    if (sortBy !== colKey) {
      return <ArrowUpDown size={14} style={{ opacity: 0.35, marginLeft: '4px' }} />
    }
    return sortDir === 'asc' ? (
      <ArrowUp size={14} style={{ color: 'var(--color-kiwi)', marginLeft: '4px' }} />
    ) : (
      <ArrowDown size={14} style={{ color: 'var(--color-kiwi)', marginLeft: '4px' }} />
    )
  }

  function getContractStyle(contract) {
    if (contract === 'Two year') {
      return {
        background: 'var(--color-kiwi-subtle)',
        color: 'var(--color-kiwi)',
        border: '1px solid var(--color-kiwi-border)',
      }
    }
    if (contract === 'One year') {
      return {
        background: 'rgba(78, 205, 196, 0.12)',
        color: 'var(--color-status-info)',
        border: '1px solid var(--color-status-info-border)',
      }
    }
    return {
      background: 'var(--color-surface-highlight)',
      color: 'var(--color-text-secondary)',
      border: '1px solid var(--color-border-default)',
    }
  }

  return (
    <div className="card customer-table-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table
          className="customer-directory-table"
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: 'var(--font-size-body-sm)',
          }}
          aria-label="Customer Directory Records"
          aria-busy={loading}
        >
          <thead>
            <tr
              style={{
                borderBottom: '1px solid var(--color-border-subtle)',
                backgroundColor: 'var(--color-surface-subtle)',
              }}
            >
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    padding: '12px 16px',
                    fontWeight: 600,
                    color: 'var(--color-text-secondary)',
                    whiteSpace: 'nowrap',
                    textAlign: col.align || 'left',
                    cursor: col.sortable ? 'pointer' : 'default',
                    userSelect: 'none',
                  }}
                  onClick={() => col.sortable && onSort(col.key)}
                  aria-sort={sortBy === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: col.align === 'right' ? 'flex-end' : 'flex-start',
                      width: '100%',
                    }}
                  >
                    <span>{col.label}</span>
                    {col.sortable && renderSortIcon(col.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Shimmer Loading Skeleton Rows
              Array.from({ length: Math.min(pageSize, 8) }).map((_, rIdx) => (
                <tr key={`skel-${rIdx}`} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  {columns.map((c, cIdx) => (
                    <td key={`skel-td-${cIdx}`} style={{ padding: '14px 16px' }}>
                      <div
                        style={{
                          height: '16px',
                          backgroundColor: 'var(--color-surface-highlight)',
                          borderRadius: 'var(--radius-sm)',
                          animation: 'pulse 1.5s infinite ease-in-out',
                          width: cIdx === 0 ? '90px' : cIdx === columns.length - 1 ? '60px' : '75%',
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : customers.length === 0 ? (
              // Empty State Row
              <tr>
                <td colSpan={columns.length} style={{ padding: 'var(--space-12) var(--space-4)', textAlign: 'center' }}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 'var(--space-2)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-surface-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-text-tertiary)',
                      }}
                    >
                      <Users size={22} />
                    </div>
                    <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>No customers found</span>
                    <p style={{ maxWidth: '360px', margin: 0, fontSize: 'var(--font-size-body-sm)' }}>
                      {emptyMessage}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              // Real Customer Records
              customers.map((cust) => {
                const id = cust.customerID || cust.id
                return (
                  <tr
                    key={id}
                    className="customer-table-row"
                    style={{
                      borderBottom: '1px solid var(--color-border-subtle)',
                      transition: 'background-color var(--transition-fast)',
                    }}
                  >
                    {/* Customer ID */}
                    <td style={{ padding: '12px 16px' }}>
                      <Link
                        to={`/customers/${id}`}
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 600,
                          color: 'var(--color-kiwi)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px',
                        }}
                        aria-label={`View profile for customer ${id}`}
                      >
                        #{id}
                      </Link>
                    </td>

                    {/* Tenure */}
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-primary)' }}>
                      {cust.tenure} mos
                    </td>

                    {/* Contract */}
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 'var(--font-size-micro)',
                          fontWeight: 600,
                          ...getContractStyle(cust.Contract),
                        }}
                      >
                        {cust.Contract}
                      </span>
                    </td>

                    {/* Internet Service */}
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>
                      {cust.InternetService === 'Fiber optic' ? (
                        <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>Fiber optic</span>
                      ) : cust.InternetService === 'DSL' ? (
                        <span style={{ color: 'var(--color-text-secondary)' }}>DSL</span>
                      ) : (
                        <span style={{ color: 'var(--color-text-tertiary)' }}>None</span>
                      )}
                    </td>

                    {/* Monthly Charges */}
                    <td style={{ padding: '12px 16px' }} className="font-tabular">
                      ${Number(cust.MonthlyCharges || 0).toFixed(2)}
                    </td>

                    {/* Total Charges */}
                    <td style={{ padding: '12px 16px' }} className="font-tabular">
                      ${Number(cust.TotalCharges || 0).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    {/* Risk Classification & Ground Truth */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                        {RiskBadge ? (
                          <RiskBadge level={cust.riskLevel || (cust.risk ? cust.risk : 'UNKNOWN')} size="sm" />
                        ) : (
                          <span className={`badge badge-risk-${(cust.riskLevel || 'LOW').toLowerCase()}`}>
                            {cust.riskLevel || 'EVALUATING'}
                          </span>
                        )}

                        {cust.Churn && (
                          <span
                            title={cust.Churn === 'Yes' ? 'Actual historical churn' : 'Actual active subscriber'}
                            style={{
                              fontSize: '10px',
                              padding: '1px 6px',
                              borderRadius: 'var(--radius-xs)',
                              fontFamily: 'var(--font-mono)',
                              backgroundColor:
                                cust.Churn === 'Yes'
                                   ? 'rgba(255, 98, 98, 0.08)'
                                  : 'rgba(137, 233, 1, 0.08)',
                              color:
                                cust.Churn === 'Yes' ? 'var(--color-risk-high)' : 'var(--color-kiwi)',
                              border: `1px solid ${
                                cust.Churn === 'Yes'
                                  ? 'var(--color-risk-high-border)'
                                  : 'var(--color-kiwi-border)'
                              }`,
                            }}
                          >
                            {cust.Churn === 'Yes' ? 'Churned' : 'Active'}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Action */}
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <Link
                        to={`/customers/${id}`}
                        className="btn-ghost"
                        style={{
                          padding: '4px 8px',
                          fontSize: 'var(--font-size-micro)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        Profile <ArrowRight size={13} />
                      </Link>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <footer
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderTop: '1px solid var(--color-border-subtle)',
          backgroundColor: 'var(--color-surface-subtle)',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
        }}
      >
        <div style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)' }}>
          Showing <span className="font-tabular" style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{startIdx}</span> to{' '}
          <span className="font-tabular" style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{endIdx}</span> of{' '}
          <span className="font-tabular" style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{total.toLocaleString()}</span> customers
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {onPageSizeChange && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label htmlFor="customer-page-size-select" style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-tertiary)' }}>
                Rows:
              </label>
              <select
                id="customer-page-size-select"
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                style={{
                  padding: '4px 8px',
                  backgroundColor: 'var(--color-surface-input)',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--font-size-micro)',
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              className="btn-secondary"
              disabled={page <= 1 || loading}
              onClick={() => onPageChange(page - 1)}
              style={{ padding: '6px 10px', fontSize: 'var(--font-size-body-sm)' }}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <span style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)', padding: '0 4px' }}>
              Page <span className="font-tabular" style={{ color: 'var(--color-text-primary)' }}>{page}</span> of{' '}
              <span className="font-tabular" style={{ color: 'var(--color-text-primary)' }}>{totalPages}</span>
            </span>
            <button
              type="button"
              className="btn-secondary"
              disabled={page >= totalPages || loading}
              onClick={() => onPageChange(page + 1)}
              style={{ padding: '6px 10px', fontSize: 'var(--font-size-body-sm)' }}
              aria-label="Next page"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </footer>

      <style>{`
        .customer-table-row:hover {
          background-color: var(--color-surface-highlight) !important;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  )
}
