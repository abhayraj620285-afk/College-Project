import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function MetricCard({
  label,
  value,
  subtext,
  trend,
  trendValue,
  icon: Icon,
  variant = 'default',
  progress,
  loading = false,
  onClick,
  className = '',
  style = {},
}) {
  // Border accent mapping by variant
  const borderTopColor = {
    'kiwi': 'var(--color-kiwi)',
    'high-risk': 'var(--color-risk-high)',
    'medium-risk': 'var(--color-risk-medium)',
    'default': 'var(--color-border-subtle)',
  }[variant] || 'var(--color-border-subtle)'

  // Value color tone
  const valueColor = {
    'kiwi': 'var(--color-kiwi)',
    'high-risk': 'var(--color-risk-high)',
    'medium-risk': 'var(--color-risk-medium)',
    'default': 'var(--color-text-primary)',
  }[variant] || 'var(--color-text-primary)'

  // Icon color tone
  const iconColor = {
    'kiwi': 'var(--color-kiwi)',
    'high-risk': 'var(--color-risk-high)',
    'medium-risk': 'var(--color-risk-medium)',
    'default': 'var(--color-text-secondary)',
  }[variant] || 'var(--color-text-secondary)'

  // Progress fill color
  const progressColor = {
    'kiwi': 'var(--color-kiwi)',
    'high-risk': 'var(--color-risk-high)',
    'medium-risk': 'var(--color-risk-medium)',
    'default': 'var(--color-kiwi)',
  }[variant] || 'var(--color-kiwi)'

  // Clamped progress (0 to 100)
  const clampedProgress = progress != null ? Math.max(0, Math.min(100, Number(progress))) : null

  // Interactive keyboard handler
  const handleKeyDown = (e) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      onClick(e)
    }
  }

  // Loading skeleton placeholder
  if (loading) {
    return (
      <article
        className={`card ${className}`}
        style={{
          borderTop: `3px solid ${borderTopColor}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
          ...style,
        }}
        aria-busy="true"
        aria-label={`Loading ${label || 'metric'}...`}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ width: '40%', height: '14px', backgroundColor: 'var(--color-surface-highlight)', borderRadius: 'var(--radius-sm)' }} />
          <div style={{ width: '20px', height: '20px', backgroundColor: 'var(--color-surface-highlight)', borderRadius: 'var(--radius-full)' }} />
        </div>
        <div style={{ width: '60%', height: '36px', backgroundColor: 'var(--color-surface-highlight)', borderRadius: 'var(--radius-sm)' }} />
        <div style={{ width: '75%', height: '14px', backgroundColor: 'var(--color-surface-highlight)', borderRadius: 'var(--radius-sm)' }} />
      </article>
    )
  }

  return (
    <article
      className={`card ${className}`}
      role={onClick ? 'button' : 'region'}
      tabIndex={onClick ? 0 : undefined}
      aria-label={`${label}: ${value != null ? value : 'Not available'}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      style={{
        borderTop: `3px solid ${borderTopColor}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      <div>
        {/* Header: Label & Top-Right Icon */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 'var(--space-2)',
            gap: 'var(--space-2)',
          }}
        >
          <span
            className="eyebrow"
            style={{
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--font-size-micro)',
              letterSpacing: '0.08em',
            }}
          >
            {label}
          </span>
          {Icon && (
            <div style={{ color: iconColor, flexShrink: 0 }}>
              {React.isValidElement(Icon) ? Icon : <Icon size={18} />}
            </div>
          )}
        </div>

        {/* Large Tabular Value */}
        <div
          className="font-tabular"
          style={{
            fontFamily: 'var(--font-kpi)',
            fontSize: 'var(--font-size-kpi-lg)',
            lineHeight: 'var(--line-height-kpi-lg)',
            fontWeight: 700,
            color: valueColor,
            fontVariantNumeric: 'tabular-nums lining-nums',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={typeof value === 'string' || typeof value === 'number' ? String(value) : undefined}
        >
          {value != null ? value : '—'}
        </div>
      </div>

      {/* Footer: Trend Pill & Subtext */}
      {(trend || trendValue || subtext) && (
        <div
          style={{
            marginTop: 'var(--space-3)',
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--space-2)',
            fontSize: 'var(--font-size-body-sm)',
          }}
        >
          {trend && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--font-size-micro)',
                fontWeight: 600,
                fontFamily: 'var(--font-kpi)',
                fontVariantNumeric: 'tabular-nums',
                backgroundColor:
                  trend === 'positive'
                    ? 'var(--color-kiwi-subtle)'
                    : trend === 'negative'
                    ? 'var(--color-risk-high-subtle)'
                    : 'var(--color-surface-elevated)',
                color:
                  trend === 'positive'
                    ? 'var(--color-kiwi)'
                    : trend === 'negative'
                    ? 'var(--color-risk-high)'
                    : 'var(--color-text-secondary)',
                border: `1px solid ${
                  trend === 'positive'
                    ? 'var(--color-kiwi-border)'
                    : trend === 'negative'
                    ? 'var(--color-risk-high-border)'
                    : 'var(--color-border-subtle)'
                }`,
              }}
              aria-label={`Trend: ${trendValue || trend}`}
            >
              {trend === 'positive' && <TrendingUp size={12} aria-hidden="true" />}
              {trend === 'negative' && <TrendingDown size={12} aria-hidden="true" />}
              {trend === 'neutral' && <Minus size={12} aria-hidden="true" />}
              {trendValue && <span>{trendValue}</span>}
            </span>
          )}

          {subtext && (
            <span
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--font-size-body-sm)',
                lineHeight: 'var(--line-height-body-sm)',
              }}
            >
              {subtext}
            </span>
          )}
        </div>
      )}

      {/* Progress Bar Meter */}
      {clampedProgress != null && (
        <div
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label} progress: ${clampedProgress}%`}
          style={{
            marginTop: 'var(--space-3)',
            width: '100%',
            height: '4px',
            backgroundColor: 'var(--color-surface-highlight)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${clampedProgress}%`,
              height: '100%',
              backgroundColor: progressColor,
              borderRadius: 'var(--radius-full)',
              transition: 'width var(--transition-base)',
            }}
          />
        </div>
      )}
    </article>
  )
}
