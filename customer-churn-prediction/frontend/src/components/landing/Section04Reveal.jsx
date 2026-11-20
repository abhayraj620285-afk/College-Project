import React, { useEffect, useRef, useState, useId } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Compass,
  CheckCircle2,
  Sliders,
  Sparkles,
  ShieldAlert,
  Layers,
  Activity,
  Cpu,
  RefreshCw,
  ExternalLink,
} from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TELCO_COHORT } from '../../data/telcoDataset.js'
import { evaluateLocalModel, PERFORMANCE_METRICS } from '../../data/modelMeta.js'

// Register GSAP plugins in browser environment
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// Authentic highlighted subscriber from Telco cohort (TELCO_COHORT[0])
const HIGHLIGHTED_CUSTOMER = TELCO_COHORT[0] // #7590-VHVEG

// Ambient cohort signal nodes for Stage 1 & 2 network
const NETWORK_NODES = [
  { id: 'node-0', cx: 120, cy: 60, r: 6, risk: 'low', customerId: '5575-GNVDE' },
  { id: 'node-1', cx: 240, cy: 110, r: 7, risk: 'high', customerId: '9237-HQITU' },
  { id: 'node-2', cx: 360, cy: 50, r: 5, risk: 'low', customerId: '7795-CFOCW' },
  { id: 'node-target', cx: 500, cy: 130, r: 10, risk: 'target', customerId: '7590-VHVEG' }, // The focal node
  { id: 'node-4', cx: 640, cy: 70, r: 7, risk: 'med', customerId: '1452-KIOVK' },
  { id: 'node-5', cx: 780, cy: 120, r: 6, risk: 'low', customerId: '6713-OKOMC' },
  { id: 'node-6', cx: 900, cy: 55, r: 8, risk: 'high', customerId: '7892-POOKP' },
  { id: 'node-7', cx: 1020, cy: 100, r: 5, risk: 'low', customerId: '6388-TABGU' },
  { id: 'node-8', cx: 300, cy: 190, r: 6, risk: 'med', customerId: '9763-GRSKD' },
  { id: 'node-9', cx: 680, cy: 190, r: 6, risk: 'med', customerId: '7469-LKBCI' },
]

const NETWORK_LINKS = [
  { x1: 120, y1: 60, x2: 240, y2: 110 },
  { x1: 240, y1: 110, x2: 360, y2: 50 },
  { x1: 360, y1: 50, x2: 500, y2: 130, active: true },
  { x1: 240, y1: 110, x2: 500, y2: 130, active: true },
  { x1: 500, y1: 130, x2: 640, y2: 70, active: true },
  { x1: 640, y1: 70, x2: 780, y2: 120 },
  { x1: 780, y1: 120, x2: 900, y2: 55 },
  { x1: 900, y1: 55, x2: 1020, y2: 100 },
  { x1: 300, y1: 190, x2: 500, y2: 130, active: true },
  { x1: 500, y1: 130, x2: 680, y2: 190, active: true },
]

export default function Section04Reveal() {
  const sectionRef = useRef(null)
  const networkRef = useRef(null)
  const profileCardRef = useRef(null)
  const predictionCardRef = useRef(null)
  const productPreviewRef = useRef(null)

  // Interactive playground state in Stage 6 (prefilled with genuine #7590-VHVEG features)
  const [interactiveCustomer, setInteractiveCustomer] = useState({
    gender: 'Female',
    SeniorCitizen: 0,
    Partner: 'Yes',
    Dependents: 'No',
    tenure: 1,
    PhoneService: 'No',
    MultipleLines: 'No phone service',
    InternetService: 'DSL',
    OnlineSecurity: 'No',
    OnlineBackup: 'Yes',
    DeviceProtection: 'No',
    TechSupport: 'No',
    StreamingTV: 'No',
    StreamingMovies: 'No',
    Contract: 'Month-to-month',
    PaperlessBilling: 'Yes',
    PaymentMethod: 'Electronic check',
    MonthlyCharges: 29.85,
    TotalCharges: 29.85,
  })

  // Live model inference output for preview playground
  const [livePrediction, setLivePrediction] = useState(() => {
    return evaluateLocalModel(HIGHLIGHTED_CUSTOMER)
  })

  // Re-run authentic local inference whenever playground controls change
  const handleInteractiveChange = (field, value) => {
    setInteractiveCustomer((prev) => {
      const updated = { ...prev, [field]: value }
      if (field === 'tenure' || field === 'MonthlyCharges') {
        const tenureNum = Number(field === 'tenure' ? value : updated.tenure)
        const monthlyNum = Number(field === 'MonthlyCharges' ? value : updated.MonthlyCharges)
        updated.TotalCharges = Math.round(tenureNum * monthlyNum * 100) / 100
      }
      const evalRes = evaluateLocalModel(updated)
      setLivePrediction(evalRes)
      return updated
    })
  }

  // Reset interactive playground back to authentic customer baseline
  const handleResetInteractive = () => {
    const base = {
      gender: 'Female',
      SeniorCitizen: 0,
      Partner: 'Yes',
      Dependents: 'No',
      tenure: 1,
      PhoneService: 'No',
      MultipleLines: 'No phone service',
      InternetService: 'DSL',
      OnlineSecurity: 'No',
      OnlineBackup: 'Yes',
      DeviceProtection: 'No',
      TechSupport: 'No',
      StreamingTV: 'No',
      StreamingMovies: 'No',
      Contract: 'Month-to-month',
      PaperlessBilling: 'Yes',
      PaymentMethod: 'Electronic check',
      MonthlyCharges: 29.85,
      TotalCharges: 29.85,
    }
    setInteractiveCustomer(base)
    setLivePrediction(evaluateLocalModel(base))
  }

  // GSAP ScrollTrigger timeline management
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Accessibility check: respects reduced motion preference
    const prefersReducedMotion =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      // Keep everything in fully revealed static position without animation
      return
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          end: 'bottom 85%',
          toggleActions: 'play none none none',
        },
      })

      // Stage 1 & 2: Convergence sequence
      tl.fromTo(
        '.network-node:not(.node-highlighted)',
        { opacity: 0.85, scale: 1 },
        { opacity: 0.2, duration: 0.7, ease: 'power2.out' }
      )
        .fromTo(
          '.network-connection-line:not(.network-connection-active)',
          { opacity: 0.6 },
          { opacity: 0.1, duration: 0.6 },
          '-=0.5'
        )
        .fromTo(
          '.convergence-pulse-ring',
          { scale: 0.4, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(2)' },
          '-=0.4'
        )

        // Stage 3: Customer profile mask reveal
        .fromTo(
          profileCardRef.current,
          { opacity: 0, y: 30, clipPath: 'inset(0% 0% 100% 0%)' },
          { opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.75, ease: 'power3.out' },
          '-=0.3'
        )

        // Stage 4: Churn prediction result reveal
        .fromTo(
          predictionCardRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
          '-=0.3'
        )

        // Stage 5: Supporting drivers stagger
        .fromTo(
          '.driver-stagger-item',
          { opacity: 0, x: -16 },
          { opacity: 1, x: 0, stagger: 0.12, duration: 0.45, ease: 'power2.out' },
          '-=0.2'
        )

        // Stage 6: Functional product preview reveal
        .fromTo(
          productPreviewRef.current,
          { opacity: 0, y: 35 },
          { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out' },
          '-=0.2'
        )
    }, sectionRef)

    return () => {
      ctx.revert()
    }
  }, [])

  return (
    <section
      id="section-04"
      ref={sectionRef}
      className="section04-wrapper"
      aria-label="Section 04: Cinematic Churn Prediction Reveal"
    >
      <div className="landing-container">
        {/* Section Header with Exact Mandated Headline & Supporting Copy */}
        <header className="section04-header">
          <div className="section04-intro-grid">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span className="technical-label">
                  <Activity size={14} style={{ color: 'var(--landing-accent)' }} />
                  SECTION 04 / SIGNAL TO PREDICTION
                </span>
                <span className="technical-badge">PRODUCTION MODEL</span>
              </div>

              <h2 className="editorial-headline">KNOW WHO'S AT RISK.</h2>
            </div>

            <div>
              <p className="editorial-subhead">
                See the signals. Understand the risk. Make your next move count.
              </p>
            </div>
          </div>
        </header>

        {/* ====================================================================
            STAGE 1 & 2: Connected Signal Network & Convergence Node
            Continuity anchor connecting from Section 03
            ==================================================================== */}
        <div
          ref={networkRef}
          className="stage-network-viewport"
          aria-label="Signal Network Continuity from Section 03"
          data-testid="stage-signal-network"
        >
          {/* Subtle Stage Identifier Header */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '16px',
              right: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 2,
            }}
          >
            <span className="technical-label-muted">
              STAGE 01–02: SUBSCRIBER SIGNAL CONVERGENCE
            </span>
            <span
              className="technical-badge"
              style={{ backgroundColor: 'rgba(8, 10, 8, 0.7)', backdropFilter: 'blur(4px)' }}
            >
              {`Focal Target: #${HIGHLIGHTED_CUSTOMER.customerID}`}
            </span>
          </div>

          <svg
            className="network-svg"
            viewBox="0 0 1140 260"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="Subscriber Cohort Signal Network Graph"
          >
            <defs>
              <radialGradient id="target-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#89E901" stopOpacity="0.8" />
                <stop offset="60%" stopColor="#FF6262" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#080A08" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Connecting lines */}
            {NETWORK_LINKS.map((link, idx) => (
              <line
                key={`link-${idx}`}
                x1={link.x1}
                y1={link.y1}
                x2={link.x2}
                y2={link.y2}
                className={
                  link.active
                    ? 'network-connection-line network-connection-active'
                    : 'network-connection-line'
                }
              />
            ))}

            {/* Network Nodes */}
            {NETWORK_NODES.map((node) => {
              const isTarget = node.id === 'node-target'
              const fill =
                node.risk === 'high' || isTarget
                  ? '#FF6262'
                  : node.risk === 'med'
                  ? '#FFBE55'
                  : '#89E901'

              return (
                <g key={node.id} className={isTarget ? 'node-highlighted' : 'network-node'}>
                  {isTarget && (
                    <>
                      {/* Convergence animated pulse rings */}
                      <circle
                        cx={node.cx}
                        cy={node.cy}
                        r={24}
                        fill="none"
                        stroke="#89E901"
                        strokeWidth="1.5"
                        className="convergence-pulse convergence-pulse-ring"
                      />
                      <circle
                        cx={node.cx}
                        cy={node.cy}
                        r={34}
                        fill="none"
                        stroke="#FF6262"
                        strokeWidth="1"
                        opacity="0.3"
                      />
                    </>
                  )}

                  <circle
                    cx={node.cx}
                    cy={node.cy}
                    r={node.r}
                    fill={fill}
                    stroke="#080A08"
                    strokeWidth="2"
                  />

                  {/* Node label */}
                  <text
                    x={node.cx}
                    y={node.cy + (isTarget ? 22 : 16)}
                    textAnchor="middle"
                    fill={isTarget ? '#E8F0E5' : '#899386'}
                    fontSize={isTarget ? '11px' : '9px'}
                    fontFamily="var(--landing-font-mono)"
                    fontWeight={isTarget ? '700' : '500'}
                  >
                    {`#${node.customerId}`}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* ====================================================================
            STAGES 3, 4, 5: Customer Profile, Churn Prediction, & Explainability
            ==================================================================== */}
        <div className="stages-dashboard-grid">
          {/* Stage 3: Customer Profile Mask Reveal */}
          <div
            ref={profileCardRef}
            className="landing-card stage-profile-mask"
            data-testid="stage-customer-profile"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="technical-label">STAGE 03: VERIFIED SUBSCRIBER PROFILE</span>
              <span className="technical-badge">COHORT GROUND TRUTH</span>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--landing-text-primary)' }}>
                {`Subscriber #${HIGHLIGHTED_CUSTOMER.customerID}`}
              </h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--landing-text-secondary)', fontFamily: 'var(--landing-font-mono)' }}>
                DSL / Single Line
              </span>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--landing-text-secondary)', margin: '0.5rem 0 1rem 0' }}>
              Identified through early tenure retention monitoring. Account profile exhibits critical churn promoter patterns.
            </p>

            {/* Authentic Telco Fields Grid (Strictly Telco, zero banking hallucination) */}
            <div className="telco-fields-grid">
              <div className="telco-field-cell">
                <span className="telco-field-label">Account Tenure</span>
                <span className="telco-field-value telco-field-value-accent">
                  {`${HIGHLIGHTED_CUSTOMER.tenure} month`}
                </span>
              </div>

              <div className="telco-field-cell">
                <span className="telco-field-label">Contract Type</span>
                <span className="telco-field-value" style={{ color: 'var(--landing-risk-high)' }}>
                  {HIGHLIGHTED_CUSTOMER.Contract}
                </span>
              </div>

              <div className="telco-field-cell">
                <span className="telco-field-label">Internet Service</span>
                <span className="telco-field-value">{HIGHLIGHTED_CUSTOMER.InternetService}</span>
              </div>

              <div className="telco-field-cell">
                <span className="telco-field-label">Payment Method</span>
                <span className="telco-field-value">{HIGHLIGHTED_CUSTOMER.PaymentMethod}</span>
              </div>

              <div className="telco-field-cell">
                <span className="telco-field-label">Monthly Charges</span>
                <span className="telco-field-value">{`$${HIGHLIGHTED_CUSTOMER.MonthlyCharges.toFixed(2)}`}</span>
              </div>

              <div className="telco-field-cell">
                <span className="telco-field-label">Total Charges</span>
                <span className="telco-field-value">{`$${HIGHLIGHTED_CUSTOMER.TotalCharges.toFixed(2)}`}</span>
              </div>

              <div className="telco-field-cell">
                <span className="telco-field-label">Paperless Billing</span>
                <span className="telco-field-value">{HIGHLIGHTED_CUSTOMER.PaperlessBilling}</span>
              </div>

              <div className="telco-field-cell">
                <span className="telco-field-label">Add-On Security</span>
                <span className="telco-field-value">
                  {`OnlineBackup: ${HIGHLIGHTED_CUSTOMER.OnlineBackup}`}
                </span>
              </div>
            </div>
          </div>

          {/* Stage 4: Churn Prediction Result Reveal */}
          <div
            ref={predictionCardRef}
            className="landing-card stage-prediction-result"
            data-testid="stage-prediction-result"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="technical-label">STAGE 04: MODEL INFERENCE RESULT</span>
              <span className="technical-badge technical-badge-high">HIGH RISK</span>
            </div>

            <div className="score-display-wrapper">
              <span className="score-number font-tabular">80.6%</span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.8rem', fontFamily: 'var(--landing-font-mono)', color: 'var(--landing-risk-high)', fontWeight: 700 }}>
                  CHURN PROBABILITY
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--landing-text-secondary)' }}>
                  Decision Threshold: 50.0%
                </span>
              </div>
            </div>

            {/* Calibrated 3-Zone Meter */}
            <div className="score-meter-track" role="progressbar" aria-valuenow={80.6} aria-valuemin={0} aria-valuemax={100}>
              <div className="meter-zone-low" title="0-40% Low Risk" />
              <div className="meter-zone-med" title="40-70% Medium Risk" />
              <div className="meter-zone-high" title="70-100% High Risk" />
              <div className="meter-indicator-fill" style={{ width: '80.6%' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontFamily: 'var(--landing-font-mono)', color: 'var(--landing-text-secondary)', marginBottom: '1.25rem' }}>
              <span>0% LOW</span>
              <span>40% MED</span>
              <span>70% HIGH</span>
              <span>100%</span>
            </div>

            {/* Binary Classification Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(255, 98, 98, 0.08)',
                border: '1px solid var(--landing-risk-high-border)',
                borderRadius: '6px',
              }}
            >
              <AlertTriangle size={18} style={{ color: 'var(--landing-risk-high)', flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--landing-text-secondary)', display: 'block' }}>
                  Model Classification
                </span>
                <strong style={{ fontSize: '0.9rem', color: 'var(--landing-risk-high)', letterSpacing: '0.04em' }}>
                  PREDICTED TO CHURN
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================================
            STAGE 5: Genuine Supporting Information (Drivers, ROC-AUC, Playbook)
            ==================================================================== */}
        <div
          className="landing-card-elevated"
          data-testid="stage-supporting-info"
          style={{ marginBottom: '2.5rem' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="technical-label">STAGE 05: GENUINE MODEL EXPLANATIONS</span>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.35rem 0 0 0', color: 'var(--landing-text-primary)' }}>
                Top Churn Drivers & Holdout Performance
              </h4>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.68rem', fontFamily: 'var(--landing-font-mono)', color: 'var(--landing-text-secondary)', display: 'block' }}>
                  HOLDOUT ROC-AUC
                </span>
                <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--landing-accent)', fontFamily: 'var(--landing-font-display)' }}>
                  0.8417
                </span>
              </div>
              <div style={{ height: '32px', width: '1px', backgroundColor: 'var(--landing-border)' }} />
              <div>
                <span style={{ fontSize: '0.68rem', fontFamily: 'var(--landing-font-mono)', color: 'var(--landing-text-secondary)', display: 'block' }}>
                  TEST SAMPLES
                </span>
                <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--landing-text-primary)', fontFamily: 'var(--landing-font-display)' }}>
                  1,409
                </span>
              </div>
            </div>
          </div>

          <hr className="editorial-divider-subtle" />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.75rem' }}>
            {/* Top 3 Verified Feature Drivers */}
            <div>
              <span className="technical-label-muted">Key Contributing Risk Factors</span>
              <ul className="drivers-list">
                <li className="driver-item driver-stagger-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <TrendingUp size={16} style={{ color: 'var(--landing-risk-high)' }} />
                    <span className="driver-name">Month-to-month contract</span>
                  </div>
                  <span className="driver-impact">+0.72</span>
                </li>

                <li className="driver-item driver-stagger-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <TrendingUp size={16} style={{ color: 'var(--landing-risk-high)' }} />
                    <span className="driver-name">Electronic check payment</span>
                  </div>
                  <span className="driver-impact">+0.40</span>
                </li>

                <li className="driver-item driver-stagger-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <TrendingUp size={16} style={{ color: 'var(--landing-risk-high)' }} />
                    <span className="driver-name">Early tenure stage</span>
                  </div>
                  <span className="driver-impact">+0.85</span>
                </li>
              </ul>
            </div>

            {/* Retention Action Playbook Recommendation */}
            <div
              style={{
                backgroundColor: 'rgba(20, 24, 20, 0.4)',
                border: '1px solid var(--landing-border)',
                borderLeft: '4px solid var(--landing-risk-high)',
                borderRadius: '6px',
                padding: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Compass size={16} style={{ color: 'var(--landing-accent)' }} />
                <strong style={{ fontSize: '0.85rem', color: 'var(--landing-text-primary)', letterSpacing: '0.04em' }}>
                  HIGH-RISK RETENTION PLAYBOOK
                </strong>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.825rem', color: 'var(--landing-text-secondary)' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <CheckCircle2 size={15} style={{ color: 'var(--landing-risk-high)', flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Contract Migration:</strong> Offer 1-year contract with $15/mo fee freeze to eliminate month-to-month flight risk.</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <CheckCircle2 size={15} style={{ color: 'var(--landing-risk-high)', flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Payment Transition:</strong> Grant $10 statement credit to transition from Electronic Check to Automatic Credit Card.</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <CheckCircle2 size={15} style={{ color: 'var(--landing-risk-high)', flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>CSM Outreach:</strong> Dispatch high-priority onboarding check-in within 24 hours.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================================
            STAGE 6: Functional Live Product Preview & Call-to-Action
            ==================================================================== */}
        <div
          ref={productPreviewRef}
          className="product-preview-frame"
          data-testid="stage-product-preview"
        >
          {/* Mock Browser Title Bar */}
          <div className="preview-browser-bar">
            <div className="browser-dots">
              <div className="browser-dot" />
              <div className="browser-dot" />
              <div className="browser-dot" />
            </div>

            <div className="browser-address">
              retention-studio.internal/predict?customerID=7590-VHVEG
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="technical-badge" style={{ fontSize: '0.65rem' }}>LIVE PREVIEW</span>
            </div>
          </div>

          {/* Interactive Preview Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <span className="technical-label">STAGE 06: FUNCTIONAL RETENTION STUDIO ENGINE</span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0.25rem 0 0 0', color: 'var(--landing-text-primary)' }}>
                Real-Time Inference Playground
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--landing-text-secondary)', margin: '0.25rem 0 0 0' }}>
                Simulate contract migrations and loyalty extensions. Evaluated via scikit-learn model parameters in real time.
              </p>
            </div>

            <button
              type="button"
              className="editorial-cta-secondary"
              onClick={handleResetInteractive}
              style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
            >
              <RefreshCw size={13} /> Reset Baseline (#7590-VHVEG)
            </button>
          </div>

          {/* Live Interactive Split View */}
          <div className="preview-controls-grid">
            {/* Left Column: Interactive Simulation Inputs */}
            <div
              style={{
                backgroundColor: 'rgba(20, 24, 20, 0.6)',
                border: '1px solid var(--landing-border)',
                borderRadius: '8px',
                padding: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <Sliders size={16} style={{ color: 'var(--landing-accent)' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--landing-text-primary)' }}>
                  Interactive Feature Adjustment
                </span>
              </div>

              {/* Tenure Slider */}
              <div className="interactive-control-group">
                <label className="interactive-label" htmlFor="tenure-slider">
                  <span>Tenure Duration</span>
                  <strong style={{ color: 'var(--landing-accent)', fontFamily: 'var(--landing-font-mono)' }}>
                    {interactiveCustomer.tenure} months
                  </strong>
                </label>
                <input
                  id="tenure-slider"
                  type="range"
                  min="1"
                  max="72"
                  value={interactiveCustomer.tenure}
                  onChange={(e) => handleInteractiveChange('tenure', Number(e.target.value))}
                  className="interactive-slider"
                />
              </div>

              {/* Contract Selection */}
              <div className="interactive-control-group">
                <label className="interactive-label" htmlFor="contract-select">
                  <span>Contract Agreement</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--landing-text-secondary)' }}>
                    Weight: {interactiveCustomer.Contract === 'Two year' ? '-1.41' : interactiveCustomer.Contract === 'One year' ? '-0.72' : '+0.72'}
                  </span>
                </label>
                <select
                  id="contract-select"
                  value={interactiveCustomer.Contract}
                  onChange={(e) => handleInteractiveChange('Contract', e.target.value)}
                  className="interactive-select"
                >
                  <option value="Month-to-month">Month-to-month (High Risk)</option>
                  <option value="One year">One year (Stabilized)</option>
                  <option value="Two year">Two year (Retention Anchor)</option>
                </select>
              </div>

              {/* Payment Method Selection */}
              <div className="interactive-control-group">
                <label className="interactive-label" htmlFor="payment-select">
                  <span>Payment Channel</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--landing-text-secondary)' }}>
                    {interactiveCustomer.PaymentMethod === 'Electronic check' ? 'Risk Factor (+0.40)' : 'Automated (-0.25)'}
                  </span>
                </label>
                <select
                  id="payment-select"
                  value={interactiveCustomer.PaymentMethod}
                  onChange={(e) => handleInteractiveChange('PaymentMethod', e.target.value)}
                  className="interactive-select"
                >
                  <option value="Electronic check">Electronic check (Manual / Flight Risk)</option>
                  <option value="Credit card (automatic)">Credit card (automatic)</option>
                  <option value="Bank transfer (automatic)">Bank transfer (automatic)</option>
                  <option value="Mailed check">Mailed check</option>
                </select>
              </div>

              {/* Internet Service Tier */}
              <div className="interactive-control-group" style={{ marginBottom: 0 }}>
                <label className="interactive-label" htmlFor="internet-select">
                  <span>Internet Service Tier</span>
                </label>
                <select
                  id="internet-select"
                  value={interactiveCustomer.InternetService}
                  onChange={(e) => handleInteractiveChange('InternetService', e.target.value)}
                  className="interactive-select"
                >
                  <option value="DSL">DSL (Baseline: $29.85/mo)</option>
                  <option value="Fiber optic">Fiber optic (Premium / High Churn Tier)</option>
                  <option value="No">No Internet (Landline Only)</option>
                </select>
              </div>
            </div>

            {/* Right Column: Dynamic Live Inference Card */}
            <div
              style={{
                backgroundColor: 'rgba(20, 24, 20, 0.6)',
                border: '1px solid var(--landing-border)',
                borderRadius: '8px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span className="technical-label">DYNAMIC EVALUATION</span>
                  <span
                    className="technical-badge"
                    style={{
                      backgroundColor:
                        livePrediction.riskLevel === 'HIGH'
                          ? 'var(--landing-risk-high-subtle)'
                          : livePrediction.riskLevel === 'MEDIUM'
                          ? 'var(--landing-risk-med-subtle)'
                          : 'rgba(137, 233, 1, 0.1)',
                      color:
                        livePrediction.riskLevel === 'HIGH'
                          ? 'var(--landing-risk-high)'
                          : livePrediction.riskLevel === 'MEDIUM'
                          ? 'var(--landing-risk-med)'
                          : 'var(--landing-accent)',
                      border: `1px solid ${
                        livePrediction.riskLevel === 'HIGH'
                          ? 'var(--landing-risk-high-border)'
                          : livePrediction.riskLevel === 'MEDIUM'
                          ? 'var(--landing-risk-med-border)'
                          : 'var(--landing-border-accent)'
                      }`,
                    }}
                  >
                    {livePrediction.riskLevel} RISK TIER
                  </span>
                </div>

                <div style={{ margin: '1rem 0' }}>
                  <span
                    className="font-tabular"
                    style={{
                      fontSize: '3.5rem',
                      fontWeight: 800,
                      lineHeight: 1,
                      color:
                        livePrediction.riskLevel === 'HIGH'
                          ? 'var(--landing-risk-high)'
                          : livePrediction.riskLevel === 'MEDIUM'
                          ? 'var(--landing-risk-med)'
                          : 'var(--landing-accent)',
                    }}
                  >
                    {(livePrediction.churnProbability * 100).toFixed(1)}%
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--landing-text-secondary)', display: 'block', marginTop: '4px' }}>
                    Calculated Churn Probability
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--landing-text-secondary)', lineHeight: 1.5 }}>
                  Status:{' '}
                  <strong
                    style={{
                      color:
                        livePrediction.churnPrediction === 'Yes'
                          ? 'var(--landing-risk-high)'
                          : 'var(--landing-accent)',
                    }}
                  >
                    {livePrediction.churnPrediction === 'Yes'
                      ? 'PREDICTED TO CHURN'
                      : 'PREDICTED TO STAY (RETAINED)'}
                  </strong>
                </div>
              </div>

              {/* Exact CTA: Explore predictions */}
              <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--landing-border)' }}>
                <Link to="/predict" className="editorial-cta" style={{ width: '100%' }}>
                  Explore predictions <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
