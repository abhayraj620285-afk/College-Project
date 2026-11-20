import React, { Component } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import AppShell from './components/shell/AppShell'

// 11 Core Application Route Pages
import DashboardPage from './pages/DashboardPage'
import CustomersPage from './pages/CustomersPage'
import CustomerDetailPage from './pages/CustomerDetailPage'
import PredictPage from './pages/PredictPage'
import InsightsPage from './pages/InsightsPage'
import RetentionPage from './pages/RetentionPage'
import CampaignsPage from './pages/CampaignsPage'
import ModelPerformancePage from './pages/ModelPerformancePage'
import PredictionHistoryPage from './pages/PredictionHistoryPage'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPage'

// Accessible Route Error Boundary
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled route exception caught by ErrorBoundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page-container" style={{ padding: 'var(--space-12) var(--space-6)', textAlign: 'center' }}>
          <div
            className="card"
            style={{
              maxWidth: '600px',
              margin: '0 auto',
              borderTop: '4px solid var(--color-risk-high)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
              alignItems: 'center',
            }}
          >
            <span className="badge badge-risk-high">Application Error</span>
            <h2>Something went wrong</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-body)' }}>
              An unexpected exception occurred while rendering this view.
            </p>
            {this.state.error && (
              <pre
                style={{
                  padding: 'var(--space-3)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-risk-high)',
                  fontSize: '0.75rem',
                  maxWidth: '100%',
                  overflowX: 'auto',
                  textAlign: 'left',
                }}
              >
                {this.state.error.message || String(this.state.error)}
              </pre>
            )}
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => window.location.reload()}
              >
                Reload View
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  this.setState({ hasError: false, error: null })
                  window.location.href = '/dashboard'
                }}
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// 404 Route Not Found Component
function NotFoundPage() {
  return (
    <div className="page-container" style={{ padding: 'var(--space-16) var(--space-6)', textAlign: 'center' }}>
      <div
        className="card"
        style={{
          maxWidth: '540px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-4)',
        }}
      >
        <span className="eyebrow">404 Error</span>
        <h2>Route Not Found</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          The requested page route does not exist in the Retention Studio intelligence suite.
        </p>
        <Link to="/dashboard" className="btn-primary">
          Return to Overview
        </Link>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AppShell>
          <Routes>
            {/* Default redirect to /dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* All 11 Application Routes */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customers/:id" element={<CustomerDetailPage />} />
            <Route path="/predict" element={<PredictPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/retention" element={<RetentionPage />} />
            <Route path="/campaigns" element={<CampaignsPage />} />
            <Route path="/model-performance" element={<ModelPerformancePage />} />
            <Route path="/prediction-history" element={<PredictionHistoryPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />

            {/* 404 Catch-All Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AppShell>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
