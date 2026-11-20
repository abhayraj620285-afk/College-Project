import React from 'react'

export default function RiskBadge({
  level = 'UNKNOWN',
  size = 'md',
  showDot = true,
  score,
  label,
  className = '',
  style = {},
}) {
  // Normalize level
  const normalizedLevel = String(level || 'UNKNOWN').toUpperCase().trim()

  // Strict token mappings based on DESIGN.md §2.3 and §5.4
  const configs = {
    HIGH: {
      text: 'var(--color-risk-high)', // #FF6262
      bg: 'var(--color-risk-high-subtle)', // rgba(255, 98, 98, 0.10) (max 12% tint guarantees >= 4.66:1 AA contrast against #FF6262 text)
      border: 'var(--color-risk-high-border)', // rgba(255, 98, 98, 0.40)
      dotColor: '#FF6262',
      defaultLabel: 'HIGH RISK',
    },
    MEDIUM: {
      text: 'var(--color-risk-medium)', // #FFBE55
      bg: 'var(--color-risk-medium-subtle)', // rgba(255, 190, 85, 0.15)
      border: 'var(--color-risk-medium-border)', // rgba(255, 190, 85, 0.40)
      dotColor: '#FFBE55',
      defaultLabel: 'MEDIUM RISK',
    },
    LOW: {
      text: 'var(--color-risk-low)', // #89E901
      bg: 'var(--color-risk-low-subtle)', // rgba(137, 233, 1, 0.12)
      border: 'var(--color-risk-low-border)', // rgba(137, 233, 1, 0.35)
      dotColor: '#89E901',
      defaultLabel: 'LOW RISK',
    },
    UNKNOWN: {
      text: 'var(--color-unscored)', // #A8A8A8
      bg: 'var(--color-unscored-subtle)', // rgba(168, 168, 168, 0.12)
      border: 'var(--color-unscored-border)', // #404040
      dotColor: '#A8A8A8',
      defaultLabel: 'UNSCORED',
    },
  }

  const current = configs[normalizedLevel] || configs.UNKNOWN
  const textLabel = label || current.defaultLabel

  // Format optional score (detect 0..1 decimal vs 0..100 percentage)
  let formattedScore = null
  if (score != null && !isNaN(Number(score))) {
    const num = Number(score)
    formattedScore = num <= 1.0 ? `${(num * 100).toFixed(1)}%` : `${num.toFixed(1)}%`
  }

  // Size dimensional tokens
  const isSm = size === 'sm'
  const height = isSm ? '22px' : '26px'
  const padding = isSm ? '2px 8px' : '4px 12px'
  const fontSize = isSm ? 'var(--font-size-micro)' : 'var(--font-size-body-sm)'
  const dotSize = isSm ? '6px' : '7px'
  const gap = isSm ? '5px' : '6px'

  return (
    <span
      className={`badge ${className}`}
      role="status"
      aria-label={`Risk classification: ${textLabel}${formattedScore ? `, Probability score: ${formattedScore}` : ''}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap,
        height,
        padding,
        backgroundColor: current.bg,
        color: current.text,
        border: `1px solid ${current.border}`,
        borderRadius: 'var(--radius-full)',
        fontSize,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        lineHeight: 1,
        whiteSpace: 'nowrap',
        userSelect: 'none',
        ...style,
      }}
    >
      {/* Physical Shape Anchor (Non-Reliance on Color Alone) */}
      {showDot && (
        <span
          aria-hidden="true"
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: 'var(--radius-full)',
            backgroundColor: current.dotColor,
            flexShrink: 0,
            boxShadow: `0 0 6px ${current.dotColor}88`,
          }}
        />
      )}

      <span>{textLabel}</span>

      {formattedScore && (
        <span
          className="font-tabular"
          style={{
            fontFamily: 'var(--font-kpi)',
            fontVariantNumeric: 'tabular-nums',
            opacity: 0.9,
          }}
        >
          · {formattedScore}
        </span>
      )}
    </span>
  )
}
