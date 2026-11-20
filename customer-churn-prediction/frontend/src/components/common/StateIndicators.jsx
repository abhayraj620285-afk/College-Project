import React from 'react'
import { AlertTriangle, RefreshCw, Inbox, CheckCircle2, X } from 'lucide-react'

/**
 * 1. LoadingSkeleton: Shimmering placeholder with accessible aria-busy attribute
 */
export function LoadingSkeleton({
  variant = 'text', // 'text' | 'card' | 'circle' | 'rect' | 'row'
  width,
  height,
  count = 1,
  className = '',
  style = {},
  ariaLabel = 'Loading content...',
}) {
  const getDefaultHeight = () => {
    switch (variant) {
      case 'circle':
        return width || '40px'
      case 'card':
        return '200px'
      case 'row':
        return '48px'
      case 'rect':
        return '120px'
      case 'text':
      default:
        return '16px'
    }
  }

  const getDefaultWidth = () => {
    switch (variant) {
      case 'circle':
        return height || '40px'
      case 'card':
      case 'row':
      case 'rect':
      case 'text':
      default:
        return '100%'
    }
  }

  const resolvedHeight = height || getDefaultHeight()
  const resolvedWidth = width || getDefaultWidth()
  const borderRadius =
    variant === 'circle'
      ? 'var(--radius-full)'
      : variant === 'card'
      ? 'var(--radius-lg)'
      : 'var(--radius-sm)'

  const items = Array.from({ length: Math.max(1, count) })

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={ariaLabel}
      className={`skeleton-group ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        width: resolvedWidth,
        ...style,
      }}
    >
      {items.map((_, i) => (
        <div
          key={i}
          className="skeleton-pulse"
          style={{
            width: '100%',
            height: resolvedHeight,
            borderRadius,
            backgroundColor: 'var(--color-surface-card)',
            backgroundImage:
              'linear-gradient(90deg, var(--color-surface-card) 0%, var(--color-surface-highlight) 50%, var(--color-surface-card) 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.8s infinite ease-in-out',
          }}
        />
      ))}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .skeleton-pulse {
            animation: none !important;
            background-image: none !important;
            background-color: var(--color-surface-highlight) !important;
          }
        }
      `}</style>
    </div>
  )
}

/**
 * 2. ErrorBanner: High-contrast error container with retry trigger
 */
export function ErrorBanner({
  title = 'An error occurred',
  message,
  error,
  onRetry,
  retryText = 'Retry Request',
  dismissible = false,
  onDismiss,
  variant = 'error', // 'error' | 'warning' | 'offline'
  className = '',
  style = {},
}) {
  const isWarning = variant === 'warning'

  const border = isWarning
    ? 'var(--color-risk-medium-border)'
    : 'var(--color-risk-high-border)'
  const bg = isWarning
    ? 'var(--color-risk-medium-subtle)'
    : 'var(--color-risk-high-subtle)'
  const iconColor = isWarning
    ? 'var(--color-risk-medium)'
    : 'var(--color-risk-high)'

  const displayMessage =
    message || (typeof error === 'string' ? error : error?.message)

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`error-banner ${className}`}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 'var(--space-3)',
        padding: 'var(--space-4)',
        backgroundColor: bg,
        border: `1px solid ${border}`,
        borderRadius: 'var(--radius-md)',
        color: 'var(--color-text-primary)',
        fontSize: 'var(--font-size-body)',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', flex: 1 }}>
        <AlertTriangle
          size={20}
          style={{ color: iconColor, flexShrink: 0, marginTop: '2px' }}
          aria-hidden="true"
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <strong style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {title}
          </strong>
          {displayMessage && (
            <p
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--font-size-body-sm)',
                lineHeight: 'var(--line-height-body-sm)',
                margin: 0,
              }}
            >
              {displayMessage}
            </p>
          )}
          {onRetry && (
            <div style={{ marginTop: 'var(--space-2)' }}>
              <button
                type="button"
                onClick={onRetry}
                className="btn-secondary"
                style={{
                  padding: '4px 10px',
                  fontSize: 'var(--font-size-body-sm)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <RefreshCw size={14} />
                <span>{retryText}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {dismissible && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="btn-ghost"
          aria-label="Dismiss error notification"
          style={{ padding: '4px', color: 'var(--color-text-secondary)', flexShrink: 0 }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}

/**
 * 3. EmptyState: Centered empty placeholder with graphite icon container and CTA
 */
export function EmptyState({
  icon: Icon = Inbox,
  title = 'No items found',
  description,
  actionLabel,
  onAction,
  actionIcon: ActionIcon,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
  style = {},
}) {
  return (
    <div
      role="status"
      className={`empty-state ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'var(--space-8) var(--space-4)',
        gap: 'var(--space-3)',
        width: '100%',
        ...style,
      }}
    >
      {/* Graphite circular container */}
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--color-surface-elevated)',
          border: '1px solid var(--color-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-secondary)',
          marginBottom: 'var(--space-1)',
        }}
        aria-hidden="true"
      >
        {React.isValidElement(Icon) ? Icon : <Icon size={24} />}
      </div>

      <div style={{ maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h4
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--font-size-h2)',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            margin: 0,
          }}
        >
          {title}
        </h4>
        {description && (
          <p
            style={{
              fontSize: 'var(--font-size-body)',
              color: 'var(--color-text-secondary)',
              lineHeight: 'var(--line-height-body)',
              margin: 0,
            }}
          >
            {description}
          </p>
        )}
      </div>

      {(actionLabel || secondaryActionLabel) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            marginTop: 'var(--space-2)',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {actionLabel && onAction && (
            <button
              type="button"
              className="btn-primary"
              onClick={onAction}
            >
              {ActionIcon && <ActionIcon size={16} />}
              <span>{actionLabel}</span>
            </button>
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <button
              type="button"
              className="btn-secondary"
              onClick={onSecondaryAction}
            >
              <span>{secondaryActionLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * 4. SuccessBanner: Operation confirmation feedback
 */
export function SuccessBanner({
  title = 'Success',
  message,
  onDismiss,
  className = '',
  style = {},
}) {
  return (
    <div
      role="status"
      className={`success-banner ${className}`}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 'var(--space-3)',
        padding: 'var(--space-4)',
        backgroundColor: 'var(--color-kiwi-subtle)',
        border: '1px solid var(--color-kiwi-border)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--color-text-primary)',
        fontSize: 'var(--font-size-body)',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', flex: 1 }}>
        <CheckCircle2
          size={20}
          style={{ color: 'var(--color-kiwi)', flexShrink: 0, marginTop: '2px' }}
          aria-hidden="true"
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <strong style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {title}
          </strong>
          {message && (
            <p
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--font-size-body-sm)',
                lineHeight: 'var(--line-height-body-sm)',
                margin: 0,
              }}
            >
              {message}
            </p>
          )}
        </div>
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="btn-ghost"
          aria-label="Dismiss success notification"
          style={{ padding: '4px', color: 'var(--color-text-secondary)', flexShrink: 0 }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}
