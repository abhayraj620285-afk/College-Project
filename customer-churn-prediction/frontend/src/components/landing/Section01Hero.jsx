import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Activity, ShieldCheck, Zap } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function Section01Hero() {
  const heroRef = useRef(null)
  const imageContainerRef = useRef(null)
  const imageRef = useRef(null)
  const beamOverlayRef = useRef(null)
  const textContentRef = useRef(null)
  const eyebrowRef = useRef(null)
  const headlineRef = useRef(null)
  const subheadRef = useRef(null)
  const ctaGroupRef = useRef(null)
  const telemetryRef = useRef(null)

  useEffect(() => {
    // Respect user's reduced motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        // Instant visual presentation for reduced motion
        gsap.set([imageRef.current, eyebrowRef.current, headlineRef.current, subheadRef.current, ctaGroupRef.current, telemetryRef.current], {
          opacity: 1,
          y: 0,
          scale: 1,
        })
        return
      }

      // Initial Entrance Timeline
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      // 1. Classical marble sculpture emerges from OLED black
      tl.fromTo(
        imageRef.current,
        { opacity: 0, scale: 1.06 },
        { opacity: 1, scale: 1, duration: 1.5 }
      )

      // 2. Horizontal lime scanning beam pulses across the eyes
      if (beamOverlayRef.current) {
        tl.fromTo(
          beamOverlayRef.current,
          { opacity: 0, scaleX: 0.3 },
          { opacity: 1, scaleX: 1, duration: 1.2, transformOrigin: 'left center' },
          '-=1.0'
        )
      }

      // 3. Staggered typography entrance in the negative space
      tl.fromTo(
        eyebrowRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.7 },
        '-=0.9'
      )

      tl.fromTo(
        headlineRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.9 },
        '-=0.7'
      )

      tl.fromTo(
        subheadRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8 },
        '-=0.6'
      )

      tl.fromTo(
        ctaGroupRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.7 },
        '-=0.5'
      )

      tl.fromTo(
        telemetryRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.7 },
        '-=0.4'
      )

      // Continuous subtle breathing pulse on the horizontal beam
      if (beamOverlayRef.current) {
        gsap.to(beamOverlayRef.current, {
          opacity: 0.75,
          repeat: -1,
          yoyo: true,
          duration: 2.2,
          ease: 'sine.inOut',
        })
      }

      // ScrollTrigger: subtle parallax on scroll through Section 01
      gsap.to(imageRef.current, {
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2,
        },
        yPercent: 8,
        ease: 'none',
      })

      gsap.to(textContentRef.current, {
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: '60% top',
          scrub: 1,
        },
        opacity: 0.2,
        y: -30,
        ease: 'none',
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="section-01"
      ref={heroRef}
      className="hero-monument"
      aria-label="Section 01: The Monument — Predictive Churn Intelligence"
    >
      {/* Background Subtle Ambience */}
      <div className="hero-ambient-glow" aria-hidden="true" />

      {/* Hero Visual Container: Firefly Classical Marble Sculpture */}
      <div ref={imageContainerRef} className="hero-sculpture-wrapper">
        <div className="hero-image-frame">
          <picture>
            <source srcSet="/hero-marble-sculpture.webp" type="image/webp" />
            <img
              ref={imageRef}
              src="/hero-marble-sculpture.png"
              alt="Classical marble sculpture illuminated by an electric-lime scanning beam across the eyes"
              className="hero-sculpture-image"
              width="1536"
              height="864"
              loading="eager"
              fetchPriority="high"
            />
          </picture>

          {/* Precision Horizontal Scanning Beam Alignment Layer */}
          <div
            ref={beamOverlayRef}
            className="hero-horizontal-beam"
            aria-hidden="true"
          />

          {/* Seamless Edge Gradient Blend into OLED Black */}
          <div className="hero-vignette-overlay" aria-hidden="true" />
        </div>
      </div>

      {/* Editorial Content Layer in Negative Space */}
      <div className="hero-content-container">
        <div ref={textContentRef} className="hero-editorial-column">
          {/* Section Marker */}
          <div ref={eyebrowRef} className="hero-eyebrow">
            <span className="hero-eyebrow-pip" />
            <span className="hero-eyebrow-text">01 // THE MONUMENT</span>
            <span className="hero-eyebrow-divider">—</span>
            <span className="hero-eyebrow-sub">PREDICTIVE INTELLIGENCE</span>
          </div>

          {/* Main Editorial Headline */}
          <h1 ref={headlineRef} className="hero-headline">
            KNOW WHO&apos;S <br />
            <span className="hero-headline-accent">AT RISK.</span>
          </h1>

          {/* Subheading */}
          <p ref={subheadRef} className="hero-subhead">
            See the signals. Understand the risk. Make your next move count.
            Retention Studio models 19 multi-dimensional subscriber behaviors to forecast attrition
            with audited statistical precision.
          </p>

          {/* Primary & Secondary Action CTAs */}
          <div ref={ctaGroupRef} className="hero-cta-group">
            <a href="#section-04" className="hero-btn-primary">
              <span>Explore predictions</span>
              <ArrowRight size={16} />
            </a>
            <Link to="/dashboard" className="hero-btn-secondary">
              <span>Launch Platform</span>
            </Link>
          </div>

          {/* Ground-Truth Telemetry Strip */}
          <div ref={telemetryRef} className="hero-telemetry-strip">
            <div className="telemetry-item">
              <span className="telemetry-label">COHORT BASE</span>
              <span className="telemetry-value">7,043</span>
              <span className="telemetry-sub">Verified Telco Dataset</span>
            </div>

            <div className="telemetry-item">
              <span className="telemetry-label">HOLDOUT ROC-AUC</span>
              <span className="telemetry-value accent">0.8417</span>
              <span className="telemetry-sub">Balanced Scikit-Learn Model</span>
            </div>

            <div className="telemetry-item">
              <span className="telemetry-label">INFERENCE ENGINE</span>
              <span className="telemetry-value">&lt; 5 ms</span>
              <span className="telemetry-sub">Local Sigmoid Evaluation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Scroll Cue */}
      <div className="hero-scroll-indicator" aria-hidden="true">
        <span className="scroll-text">CONTINUE TO 02 ANATOMY OF RISK</span>
        <span className="scroll-line" />
      </div>
    </section>
  )
}
