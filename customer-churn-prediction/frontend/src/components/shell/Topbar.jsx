import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Menu,
  Search,
  Plus,
  Sparkles,
  Activity,
  ShieldCheck,
  User,
  ExternalLink,
} from 'lucide-react'
import Breadcrumbs from './Breadcrumbs'

export default function Topbar({ onToggleMobileNav }) {
  const navigate = useNavigate()
  const searchInputRef = useRef(null)
  const [searchValue, setSearchValue] = useState('')
  const [healthStatus, setHealthStatus] = useState('ONLINE')

  // Global Ctrl+K / Cmd+K shortcut listener
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  function handleSearchSubmit(e) {
    e.preventDefault()
    const trimmed = searchValue.trim()
    if (!trimmed) return

    // If matches customer ID format (e.g. 7590-VHVEG or 4+ digits/hyphen)
    if (trimmed.includes('-') || trimmed.length >= 8) {
      navigate(`/customers/${encodeURIComponent(trimmed)}`)
    } else {
      navigate(`/customers?search=${encodeURIComponent(trimmed)}`)
    }
  }

  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        backgroundColor: 'var(--color-surface-base)',
        borderBottom: '1px solid var(--color-border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-6)',
        position: 'sticky',
        top: 0,
        zIndex: 90,
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Left Slot: Mobile Hamburger + Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', minWidth: 0 }}>
        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={onToggleMobileNav}
          aria-label="Open navigation menu"
          className="mobile-nav-toggle"
          style={{
            padding: '8px',
            color: 'var(--color-text-secondary)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-surface-subtle)',
            border: '1px solid var(--color-border-subtle)',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Menu size={20} />
        </button>

        {/* Dynamic Breadcrumbs */}
        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <Breadcrumbs />
        </div>
      </div>

      {/* Center Slot: Quick Customer Search */}
      <div
        className="topbar-search-slot"
        style={{
          flex: '1',
          maxWidth: '420px',
          margin: '0 var(--space-4)',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '100%' }}>
          <Search
            size={16}
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-tertiary)',
              pointerEvents: 'none',
            }}
          />
          <input
            ref={searchInputRef}
            type="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Quick search customer ID (Ctrl + K)..."
            aria-label="Search customer ID or attributes"
            style={{
              width: '100%',
              padding: '7px 70px 7px 36px',
              backgroundColor: 'var(--color-surface-input)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--font-size-body-sm)',
              outline: 'none',
              transition: 'border-color var(--transition-fast)',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--color-kiwi)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--color-border-default)')}
          />
          <kbd
            aria-hidden="true"
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              padding: '2px 6px',
              backgroundColor: 'var(--color-surface-card)',
              border: '1px solid var(--color-border-strong)',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.6875rem',
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font-mono)',
              pointerEvents: 'none',
            }}
          >
            ⌘K
          </kbd>
        </form>
      </div>

      {/* Right Slot: Actions, Health, and User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexShrink: 0 }}>
        {/* Quick Action: New Prediction in Kiwi green */}
        <Link
          to="/predict"
          className="btn-primary"
          style={{
            height: '36px',
            padding: '0 var(--space-4)',
            fontSize: 'var(--font-size-body-sm)',
            boxShadow: '0 0 12px rgba(137, 233, 1, 0.20)',
          }}
        >
          <Sparkles size={16} aria-hidden="true" />
          <span>New Prediction</span>
        </Link>

        {/* Live System Indicator Pill */}
        <div
          title="Inference Engine Ready"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            backgroundColor: 'var(--color-surface-card)',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--font-size-micro)',
            color: 'var(--color-text-secondary)',
            fontWeight: 500,
          }}
          className="topbar-health-pill"
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-kiwi)',
              boxShadow: '0 0 6px var(--color-kiwi)',
            }}
          />
          <span style={{ fontFamily: 'var(--font-mono)' }}>ML Ready</span>
        </div>

        {/* User Profile Chip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: '4px 8px 4px 4px',
            backgroundColor: 'var(--color-surface-card)',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--radius-full)',
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-surface-elevated)',
              color: 'var(--color-kiwi)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.75rem',
              border: '1px solid var(--color-kiwi-border)',
            }}
          >
            RS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }} className="user-profile-text">
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Telco Ops
            </span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>
              Enterprise
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
