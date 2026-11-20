import React from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

const ROUTE_CONFIG = {
  '/dashboard': { section: 'Platform', title: 'Executive Overview' },
  '/customers': { section: 'Platform', title: 'Customer Directory' },
  '/predict': { section: 'Intelligence', title: 'Prediction Engine' },
  '/insights': { section: 'Intelligence', title: 'Churn Drivers & Insights' },
  '/retention': { section: 'Retention', title: 'Cohort Analytics' },
  '/campaigns': { section: 'Retention', title: 'Playbooks & Campaigns' },
  '/model-performance': { section: 'Observability', title: 'Model Performance' },
  '/prediction-history': { section: 'Observability', title: 'Prediction Audit Log' },
  '/reports': { section: 'Governance', title: 'Intelligence Reports' },
  '/settings': { section: 'System', title: 'Settings & Thresholds' },
}

export default function Breadcrumbs() {
  const location = useLocation()
  const { pathname } = location

  // Handle customer detail route /customers/:id
  const customerDetailMatch = pathname.match(/^\/customers\/([^/]+)$/)

  let crumbs = []

  if (customerDetailMatch) {
    const customerId = customerDetailMatch[1]
    crumbs = [
      { label: 'Platform', to: '/dashboard' },
      { label: 'Customers', to: '/customers' },
      { label: `#${customerId}`, to: null, active: true },
    ]
  } else if (ROUTE_CONFIG[pathname]) {
    const conf = ROUTE_CONFIG[pathname]
    crumbs = [
      { label: conf.section, to: '/dashboard' },
      { label: conf.title, to: null, active: true },
    ]
  } else {
    // Fallback parser
    const segments = pathname.split('/').filter(Boolean)
    crumbs = [
      { label: 'Platform', to: '/dashboard' },
      ...segments.map((seg, idx) => {
        const isLast = idx === segments.length - 1
        const to = '/' + segments.slice(0, idx + 1).join('/')
        return {
          label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
          to: isLast ? null : to,
          active: isLast,
        }
      }),
    ]
  }

  return (
    <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', fontSize: 'var(--font-size-body-sm)' }}>
      <ol style={{ display: 'flex', alignItems: 'center', listStyle: 'none', margin: 0, padding: 0, gap: '6px' }}>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1
          return (
            <li key={index} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              {index > 0 && (
                <ChevronRight
                  size={14}
                  aria-hidden="true"
                  style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }}
                />
              )}
              {crumb.active || !crumb.to ? (
                <span
                  aria-current="page"
                  style={{
                    color: 'var(--color-text-primary)',
                    fontWeight: 500,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.to}
                  style={{
                    color: 'var(--color-text-secondary)',
                    transition: 'color var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text-primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
