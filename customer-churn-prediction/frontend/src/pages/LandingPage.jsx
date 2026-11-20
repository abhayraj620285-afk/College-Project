import React from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  Activity,
  ArrowRight,
  Database,
  Cpu,
  BarChart3,
  Layers,
  Sparkles,
} from 'lucide-react'
import Section04Reveal from '../components/landing/Section04Reveal'
import Section01Hero from '../components/landing/Section01Hero'

export default function LandingPage() {
  return (
    <div className="landing-page landing-theme">
      {/* Editorial Navigation Bar */}
      <header className="landing-navbar">
        <div className="landing-container">
          <div className="landing-nav-inner">
            <Link to="/" className="landing-brand">
              <span className="landing-brand-dot" />
              <span>RETENTION STUDIO</span>
            </Link>

            <nav aria-label="Landing Page Navigation">
              <ul className="landing-nav-links">
                <li>
                  <a href="#section-01" className="landing-nav-link">
                    01 Overview
                  </a>
                </li>
                <li>
                  <a href="#section-02" className="landing-nav-link">
                    02 Cohorts
                  </a>
                </li>
                <li>
                  <a href="#section-03" className="landing-nav-link">
                    03 Signals
                  </a>
                </li>
                <li>
                  <a href="#section-04" className="landing-nav-link" style={{ color: 'var(--landing-accent)' }}>
                    04 Reveal
                  </a>
                </li>
                <li>
                  <a href="#section-05" className="landing-nav-link">
                    05 Action
                  </a>
                </li>
              </ul>
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link to="/predict" className="editorial-cta-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                Predictor
              </Link>
              <Link to="/dashboard" className="editorial-cta" style={{ padding: '0.5rem 1.15rem', fontSize: '0.85rem' }}>
                Launch Platform <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="landing-content">
        {/* ==================================================================
            SECTION 01 — The Monument (Hero Editorial Composition)
            ================================================================== */}
        <Section01Hero />

        <hr className="editorial-divider" />

        {/* ==================================================================
            SECTION 02 — Cohort Intelligence & Behavior Modeling
            ================================================================== */}
        <section id="section-02" className="landing-container" style={{ padding: '2rem 2rem 4rem 2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'center' }}>
            <div>
              <span className="technical-label">SECTION 02 / COHORT STRATIFICATION</span>
              <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 800, margin: '0.75rem 0 1rem 0', color: 'var(--landing-text-primary)' }}>
                DEEP BEHAVIORAL PROFILES ACROSS 7,043 SUBSCRIBERS.
              </h2>
              <p style={{ color: 'var(--landing-text-secondary)', fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>
                Every subscriber is evaluated across four core operational dimensions: Demographics, Account & Contract structure, Internet & Security Add-On services, and Financial trajectory.
              </p>
            </div>

            <div className="landing-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="technical-label-muted">Key Risk Indicators</span>
                <span className="technical-badge">COHORT DYNAMICS</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--landing-surface)', borderRadius: '6px', border: '1px solid var(--landing-border)' }}>
                  <strong style={{ color: 'var(--landing-risk-high)', fontSize: '0.9rem', display: 'block' }}>Month-to-Month Contracts</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--landing-text-secondary)' }}>Highest attrition volatility (+0.72 log-odds contribution)</span>
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--landing-surface)', borderRadius: '6px', border: '1px solid var(--landing-border)' }}>
                  <strong style={{ color: 'var(--landing-accent)', fontSize: '0.9rem', display: 'block' }}>Two-Year Commitments</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--landing-text-secondary)' }}>Strongest retention anchor (-1.41 log-odds stabilization)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <hr className="editorial-divider" />

        {/* ==================================================================
            SECTION 03 — Continuous Signal Detection & Network Continuity
            Seamless visual and narrative prelude to Section 04
            ================================================================== */}
        <section id="section-03" className="landing-container" style={{ padding: '2rem 2rem 4rem 2rem' }}>
          <div style={{ maxWidth: '780px', marginBottom: '2.5rem' }}>
            <span className="technical-label">SECTION 03 / EARLY SIGNAL DETECTION</span>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', fontWeight: 800, margin: '0.75rem 0 1rem 0', color: 'var(--landing-text-primary)' }}>
              CONNECTED SIGNAL NETWORK.
            </h2>
            <p style={{ color: 'var(--landing-text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, margin: 0 }}>
              Before a customer submits a cancellation notice, subtle signals propagate through payment habits, tenure thresholds, and support touchpoints. We capture and connect these signals in real time.
            </p>
          </div>

          <div
            style={{
              padding: '1.5rem',
              backgroundColor: 'var(--landing-surface)',
              border: '1px solid var(--landing-border)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Layers size={18} style={{ color: 'var(--landing-accent)' }} />
              <span style={{ fontSize: '0.9rem', color: 'var(--landing-text-primary)', fontWeight: 600 }}>
                Signal mesh active. Ready to isolate individual subscriber risk vectors below.
              </span>
            </div>
            <a href="#section-04" className="technical-label" style={{ textDecoration: 'none' }}>
              Proceed to reveal sequence <ArrowRight size={13} />
            </a>
          </div>
        </section>

        {/* ==================================================================
            SECTION 04 — CINEMATIC CHURN PREDICTION REVEAL
            ================================================================== */}
        <Section04Reveal />

        {/* ==================================================================
            SECTION 05 — Strategic Action & Intervention Governance
            Smooth exit continuity from Section 04
            ================================================================== */}
        <section id="section-05" className="landing-container" style={{ padding: '5rem 2rem 6rem 2rem' }}>
          <div style={{ maxWidth: '780px' }}>
            <span className="technical-label">SECTION 05 / STRATEGIC INTERVENTION</span>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, margin: '0.75rem 0 1rem 0', color: 'var(--landing-text-primary)' }}>
              FROM PREDICTION TO PRESERVATION.
            </h2>
            <p className="editorial-subhead" style={{ marginBottom: '2.5rem' }}>
              Knowing who is at risk is only the beginning. Retention Studio couples machine learning inferences with automated retention playbooks, targeted migration offers, and governance observability to safeguard customer lifetime value.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <Link to="/predict" className="editorial-cta">
                Explore predictions <ArrowRight size={16} />
              </Link>
              <Link to="/retention" className="editorial-cta-secondary">
                View Retention ROI Simulator
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Editorial Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--landing-border)',
          backgroundColor: '#060806',
          padding: '3rem 0',
          color: 'var(--landing-text-secondary)',
          fontSize: '0.85rem',
        }}
      >
        <div className="landing-container">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="landing-brand-dot" />
              <span style={{ fontWeight: 700, color: 'var(--landing-text-primary)', letterSpacing: '0.04em' }}>
                RETENTION STUDIO
              </span>
              <span>— Predictive Telecom Churn Intelligence</span>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <Link to="/dashboard" style={{ color: 'var(--landing-text-secondary)', textDecoration: 'none' }}>
                Dashboard
              </Link>
              <Link to="/customers" style={{ color: 'var(--landing-text-secondary)', textDecoration: 'none' }}>
                Customers
              </Link>
              <Link to="/predict" style={{ color: 'var(--landing-text-secondary)', textDecoration: 'none' }}>
                Predict
              </Link>
              <Link to="/insights" style={{ color: 'var(--landing-text-secondary)', textDecoration: 'none' }}>
                Insights
              </Link>
              <Link to="/model-performance" style={{ color: 'var(--landing-text-secondary)', textDecoration: 'none' }}>
                Model
              </Link>
            </div>
          </div>

          <div
            style={{
              marginTop: '2rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid rgba(137, 147, 134, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              fontSize: '0.75rem',
              fontFamily: 'var(--landing-font-mono)',
            }}
          >
            <span>IBM Telco Churn Intelligence Platform • ROC-AUC 0.8417</span>
            <span>Zero Mock Deception • Authentic 19-Feature Ground Truth</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
