import React, { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Sparkles,
  TrendingUp,
  PieChart,
  Megaphone,
  Gauge,
  History,
  FileText,
  Settings,
  Activity,
  X,
  Radio,
} from 'lucide-react'

const NAV_ITEMS = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    path: '/customers',
    label: 'Customers',
    icon: Users,
    badge: '7,043',
  },
  {
    path: '/customers/7590-VHVEG',
    label: 'Risk Profile',
    icon: UserCheck,
    isDetail: true,
  },
  {
    path: '/predict',
    label: 'Predict Engine',
    icon: Sparkles,
    highlight: true,
  },
  {
    path: '/insights',
    label: 'Churn Drivers',
    icon: TrendingUp,
  },
  {
    path: '/retention',
    label: 'Retention & MRR',
    icon: PieChart,
  },
  {
    path: '/campaigns',
    label: 'Campaigns',
    icon: Megaphone,
    badge: 'PLAN',
  },
  {
    path: '/model-performance',
    label: 'Model Health',
    icon: Gauge,
  },
  {
    path: '/prediction-history',
    label: 'Audit History',
    icon: History,
  },
  {
    path: '/reports',
    label: 'Reports & Export',
    icon: FileText,
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: Settings,
  },
]

export default function Sidebar({ isOpen, onClose, isMobile }) {
  const location = useLocation()
  const [healthStatus, setHealthStatus] = useState('CHECKING') // 'UP' | 'DOWN' | 'CHECKING'
  const [healthLatency, setHealthLatency] = useState(null)

  // Poll backend health indicator
  useEffect(() => {
    let isMounted = true

    async function checkHealth() {
      const startTime = performance.now()
      try {
        const res = await fetch('/api/v1/health', {
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(3500),
        })
        const duration = Math.round(performance.now() - startTime)
        if (res.ok) {
          const data = await res.json().catch(() => ({}))
          if (isMounted) {
            setHealthStatus(data.status === 'UP' || data.status === 'ok' ? 'UP' : 'UP')
            setHealthLatency(duration)
          }
        } else {
          if (isMounted) {
            setHealthStatus('DOWN')
            setHealthLatency(null)
          }
        }
      } catch (err) {
        if (isMounted) {
          setHealthStatus('DOWN')
          setHealthLatency(null)
        }
      }
    }

    checkHealth()
    const timer = setInterval(checkHealth, 30000)
    return () => {
      isMounted = false
      clearInterval(timer)
    }
  }, [])

  return (
    <aside
      aria-label="Main Navigation"
      style={{
        width: isMobile ? '280px' : 'var(--sidebar-width-desktop)',
        minWidth: isMobile ? '280px' : 'var(--sidebar-width-desktop)',
        height: '100vh',
        backgroundColor: 'var(--color-surface-subtle)',
        borderRight: '1px solid var(--color-border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        position: isMobile ? 'fixed' : 'sticky',
        top: 0,
        left: 0,
        zIndex: isMobile ? 1050 : 100,
        transform: isMobile ? (isOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
        transition: 'transform var(--transition-base)',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: 'var(--space-5) var(--space-5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--color-border-subtle)',
          minHeight: 'var(--topbar-height)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {/* Kiwi Brand Indicator */}
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-kiwi)',
              boxShadow: '0 0 10px rgba(137, 233, 1, 0.65)',
              flexShrink: 0,
            }}
          />
          <div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '1.05rem',
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              Retention Studio
            </div>
            <div
              style={{
                fontSize: '0.6875rem',
                color: 'var(--color-text-secondary)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              Telecom Intelligence
            </div>
          </div>
        </div>

        {isMobile && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            style={{
              padding: '6px',
              color: 'var(--color-text-secondary)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation Links Group */}
      <nav style={{ flex: 1, padding: 'var(--space-3) 0' }}>
        <div
          style={{
            padding: 'var(--space-2) var(--space-5) var(--space-1)',
            fontSize: 'var(--font-size-micro)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--color-text-tertiary)',
            fontWeight: 600,
          }}
        >
          Intelligence Suite
        </div>

        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            // Custom active check for detail view
            const isDetailActive = item.isDetail && location.pathname.startsWith('/customers/')
            const isStandardActive = !item.isDetail && location.pathname === item.path

            const isActive = isDetailActive || isStandardActive

            return (
              <li key={item.path} style={{ marginBottom: '2px' }}>
                <NavLink
                  to={item.path}
                  onClick={isMobile ? onClose : undefined}
                  style={({ isActive: navLinkActive }) => {
                    const active = isActive || navLinkActive
                    return {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px var(--space-5)',
                      color: active ? 'var(--color-kiwi)' : 'var(--color-text-secondary)',
                      backgroundColor: active ? 'rgba(137, 233, 1, 0.08)' : 'transparent',
                      borderLeft: active ? '3px solid var(--color-kiwi)' : '3px solid transparent',
                      fontWeight: active ? 600 : 500,
                      fontSize: 'var(--font-size-body)',
                      textDecoration: 'none',
                      transition: 'all var(--transition-fast)',
                    }
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'var(--color-surface-highlight)'
                      e.currentTarget.style.color = 'var(--color-text-primary)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = 'var(--color-text-secondary)'
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <Icon size={18} aria-hidden="true" style={{ flexShrink: 0 }} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor:
                          item.badge === 'PLAN'
                            ? 'var(--color-status-info-subtle)'
                            : 'var(--color-surface-elevated)',
                        color:
                          item.badge === 'PLAN'
                            ? 'var(--color-status-info)'
                            : 'var(--color-text-secondary)',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 600,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* System Health Status Footer */}
      <div
        style={{
          padding: 'var(--space-4) var(--space-5)',
          borderTop: '1px solid var(--color-border-subtle)',
          backgroundColor: 'var(--color-surface-sink)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Radio size={14} style={{ color: 'var(--color-text-secondary)' }} />
            <span
              style={{
                fontSize: 'var(--font-size-micro)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--color-text-secondary)',
                fontWeight: 600,
              }}
            >
              Gateway API
            </span>
          </div>

          {/* Health status pill */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.6875rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              backgroundColor:
                healthStatus === 'UP'
                  ? 'var(--color-risk-low-subtle)'
                  : healthStatus === 'CHECKING'
                  ? 'rgba(168, 168, 168, 0.15)'
                  : 'var(--color-risk-high-subtle)',
              color:
                healthStatus === 'UP'
                  ? 'var(--color-kiwi)'
                  : healthStatus === 'CHECKING'
                  ? 'var(--color-text-secondary)'
                  : 'var(--color-risk-high)',
              border: `1px solid ${
                healthStatus === 'UP'
                  ? 'var(--color-risk-low-border)'
                  : healthStatus === 'CHECKING'
                  ? 'var(--color-border-subtle)'
                  : 'var(--color-risk-high-border)'
              }`,
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor:
                  healthStatus === 'UP'
                    ? 'var(--color-kiwi)'
                    : healthStatus === 'CHECKING'
                    ? 'var(--color-text-secondary)'
                    : 'var(--color-risk-high)',
              }}
            />
            {healthStatus}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.6875rem',
            color: 'var(--color-text-tertiary)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <span>v1.0.0-prod</span>
          {healthLatency ? <span>{healthLatency}ms</span> : <span>offline-ready</span>}
        </div>
      </div>
    </aside>
  )
}
