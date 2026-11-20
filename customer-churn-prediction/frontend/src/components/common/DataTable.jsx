import React, { useId } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Inbox,
} from 'lucide-react'
import { EmptyState } from './StateIndicators'

export default function DataTable({
  columns = [],
  data = [],
  page = 1,
  pageSize = 25,
  total = 0,
  onPageChange,
  onPageSizeChange,
  onSort,
  sortKey,
  sortDir = 'asc',
  loading = false,
  emptyMessage = 'No records match the active criteria.',
  emptyIcon = Inbox,
  rowKey = 'id',
  onRowClick,
  selectedRowKey,
  caption,
  className = '',
  style = {},
}) {
  const pageSizeId = useId()

  // Pagination bounds calculation
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1
  const endItem = Math.min(total, page * pageSize)

  // Get unique row key
  const getRowKey = (row, index) => {
    if (typeof rowKey === 'function') return rowKey(row)
    if (row && row[rowKey] != null) return row[rowKey]
    return index
  }

  // Handle header sorting click
  const handleSortClick = (col) => {
    if (!col.sortable || !onSort) return
    if (sortKey === col.key) {
      onSort(col.key, sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      onSort(col.key, 'asc')
    }
  }

  return (
    <div
      className={`card ${className}`}
      style={{
        padding: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      {/* Scrollable Table Viewport */}
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: 'var(--font-size-body-sm)',
          }}
        >
          {caption && <caption className="sr-only">{caption}</caption>}

          {/* Table Header */}
          <thead>
            <tr
              style={{
                borderBottom: '1px solid var(--color-border-subtle)',
                backgroundColor: 'var(--color-surface-subtle)',
              }}
            >
              {columns.map((col) => {
                const isSorted = sortKey === col.key
                const align = col.align || 'left'

                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={
                      col.sortable
                        ? isSorted
                          ? sortDir === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : 'none'
                        : undefined
                    }
                    style={{
                      padding: '12px 16px',
                      fontWeight: 600,
                      color: isSorted ? 'var(--color-kiwi)' : 'var(--color-text-secondary)',
                      whiteSpace: 'nowrap',
                      fontSize: 'var(--font-size-micro)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      textAlign: align,
                      width: col.width || 'auto',
                    }}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => handleSortClick(col)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          color: 'inherit',
                          font: 'inherit',
                          textTransform: 'inherit',
                          letterSpacing: 'inherit',
                          fontWeight: 'inherit',
                          textAlign: align,
                        }}
                        aria-label={`Sort by ${col.label} ${
                          isSorted && sortDir === 'asc' ? 'descending' : 'ascending'
                        }`}
                      >
                        <span>{col.label}</span>
                        {isSorted ? (
                          sortDir === 'asc' ? (
                            <ArrowUp size={14} style={{ color: 'var(--color-kiwi)' }} />
                          ) : (
                            <ArrowDown size={14} style={{ color: 'var(--color-kiwi)' }} />
                          )
                        ) : (
                          <ArrowUpDown size={14} style={{ opacity: 0.4 }} />
                        )}
                      </button>
                    ) : (
                      <span>{col.label}</span>
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody aria-busy={loading ? 'true' : 'false'}>
            {loading ? (
              // Shimmer loading placeholder rows
              Array.from({ length: Math.min(pageSize, 8) }).map((_, rIdx) => (
                <tr
                  key={`skeleton-${rIdx}`}
                  style={{
                    borderBottom: '1px solid var(--color-border-subtle)',
                    height: '52px',
                  }}
                >
                  {columns.map((col, cIdx) => (
                    <td key={`skeleton-cell-${cIdx}`} style={{ padding: '12px 16px' }}>
                      <div
                        style={{
                          height: '16px',
                          width: cIdx === 0 ? '60%' : '80%',
                          backgroundColor: 'var(--color-surface-highlight)',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty State Row
              <tr>
                <td
                  colSpan={columns.length}
                  style={{
                    padding: 'var(--space-8) var(--space-4)',
                    textAlign: 'center',
                  }}
                >
                  <EmptyState
                    icon={emptyIcon}
                    title="No Records Found"
                    description={emptyMessage}
                  />
                </td>
              </tr>
            ) : (
              // Render Data Rows
              data.map((row, index) => {
                const k = getRowKey(row, index)
                const isSelected = selectedRowKey != null && selectedRowKey === k

                return (
                  <tr
                    key={k}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    style={{
                      borderBottom: '1px solid var(--color-border-subtle)',
                      backgroundColor: isSelected ? 'rgba(137, 233, 1, 0.08)' : 'transparent',
                      borderLeft: isSelected ? '3px solid var(--color-kiwi)' : '3px solid transparent',
                      cursor: onRowClick ? 'pointer' : 'default',
                      transition: 'background-color var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'var(--color-surface-subtle)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }
                    }}
                  >
                    {columns.map((col) => {
                      const val = row ? row[col.key] : null
                      const align = col.align || 'left'

                      return (
                        <td
                          key={col.key}
                          style={{
                            padding: '12px 16px',
                            color: 'var(--color-text-primary)',
                            verticalAlign: 'middle',
                            textAlign: align,
                          }}
                        >
                          {col.render ? col.render(val, row, index) : val != null ? String(val) : '—'}
                        </td>
                      )
                    })}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Accessible Pagination Footer */}
      <footer
        style={{
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
          borderTop: '1px solid var(--color-border-subtle)',
          backgroundColor: 'var(--color-surface-subtle)',
          fontSize: 'var(--font-size-body-sm)',
        }}
      >
        {/* Left: Record Count Summary */}
        <div style={{ color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>Showing</span>
          <strong className="font-tabular" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>
            {startItem}
          </strong>
          <span>to</span>
          <strong className="font-tabular" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>
            {endItem}
          </strong>
          <span>of</span>
          <strong className="font-tabular" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>
            {total.toLocaleString()}
          </strong>
          <span>results</span>
        </div>

        {/* Center: Rows per Page Selector */}
        {onPageSizeChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <label
              htmlFor={pageSizeId}
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--font-size-body-sm)',
              }}
            >
              Rows per page:
            </label>
            <select
              id={pageSizeId}
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={{
                padding: '4px 8px',
                backgroundColor: 'var(--color-surface-input)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text-primary)',
                fontSize: 'var(--font-size-body-sm)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {[10, 25, 50, 100].map((sz) => (
                <option key={sz} value={sz}>
                  {sz}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Right: Page Navigation */}
        <nav
          aria-label="Table pagination"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}
        >
          <span
            style={{
              color: 'var(--color-text-secondary)',
              marginRight: 'var(--space-2)',
              fontSize: 'var(--font-size-body-sm)',
            }}
          >
            Page{' '}
            <strong className="font-tabular" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>
              {page}
            </strong>{' '}
            of{' '}
            <strong className="font-tabular" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>
              {totalPages}
            </strong>
          </span>

          <button
            type="button"
            className="btn-ghost"
            disabled={page <= 1 || loading}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
            style={{
              padding: '6px 10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <ChevronLeft size={16} />
            <span>Prev</span>
          </button>

          <button
            type="button"
            className="btn-ghost"
            disabled={page >= totalPages || loading}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
            style={{
              padding: '6px 10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </nav>
      </footer>
    </div>
  )
}
