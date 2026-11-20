import React, { useId } from 'react'
import { BarChart3 } from 'lucide-react'
import { LoadingSkeleton, ErrorBanner, EmptyState } from './StateIndicators'

export default function ChartCard({
  title,
  subtitle,
  action,
  loading = false,
  error = null,
  onRetry,
  empty = false,
  emptyMessage,
  emptyTitle = 'No Chart Data Available',
  minHeight = '320px',
  children,
  className = '',
  style = {},
}) {
  const headerId = useId()

  const errorMessage =
    typeof error === 'string'
      ? error
      : error?.message || 'Failed to render chart data.'

  return (
    <section
      className={`card ${className}`}
      aria-labelledby={headerId}
      aria-busy={loading ? 'true' : undefined}
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Header Slot */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-4)',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '180px' }}>
          <h3
            id={headerId}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--font-size-h2)',
              lineHeight: 'var(--line-height-h2)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
            }}
          >
            {title}
          </h3>
          {subtitle && (
            <p
              style={{
                fontSize: 'var(--font-size-body-sm)',
                lineHeight: 'var(--line-height-body-sm)',
                color: 'var(--color-text-secondary)',
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {action && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              flexShrink: 0,
            }}
          >
            {action}
          </div>
        )}
      </header>

      {/* Main Viewport */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          width: '100%',
          minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {loading ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              padding: 'var(--space-4)',
            }}
          >
            <LoadingSkeleton
              variant="card"
              height={minHeight}
              ariaLabel={`Loading ${typeof title === 'string' ? title : 'chart'}...`}
            />
          </div>
        ) : error ? (
          <div
            style={{
              padding: 'var(--space-4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            <ErrorBanner
              title="Chart Visualization Error"
              message={errorMessage}
              onRetry={onRetry}
              retryText="Reload Chart Data"
            />
          </div>
        ) : empty ? (
          <EmptyState
            icon={BarChart3}
            title={emptyTitle}
            description={emptyMessage || 'No visual metrics found for the selected timeframe or filter parameters.'}
          />
        ) : (
          children
        )}
      </div>
    </section>
  )
}
