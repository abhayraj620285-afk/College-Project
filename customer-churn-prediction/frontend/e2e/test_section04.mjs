/**
 * Dedicated Section 04 Cinematic Churn Prediction Reveal Verification Suite
 * 
 * Verifies:
 * 1. Editorial Copy & Typography (Exact Headline, Supporting Copy, CTA Text & Link)
 * 2. Design System Tokens & Scoped Palette (#080A08, #89E901, #E8F0E5, #899386, #141814, etc.)
 * 3. 6-Stage Visual Sequence (Signal Network, Convergence, Profile, Prediction, Drivers, Product Preview)
 * 4. Ground-Truth Data Integrity (Authentic Telco subscriber #7590-VHVEG, 80.6% probability, HIGH risk)
 * 5. Explanations & Metrics (Drivers: +0.72 contract, +0.40 payment, +0.85 tenure; ROC-AUC: 0.8417)
 * 6. Negative Forensics (Zero banking hallucinations: CreditScore, Balance, Geography, EstimatedSalary)
 * 7. Accessibility & Responsive Forensics (prefers-reduced-motion, GSAP ctx.revert(), mobile/tablet flow)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  runner,
  describe,
  test,
  assert,
  renderRoute,
  renderComponentWithRouter,
  assertHtmlContains,
  assertHtmlMatches,
  components,
  TELCO_COHORT,
  evaluateLocalModel,
  PERFORMANCE_METRICS,
} from './test_harness.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function registerSection04Tests() {
  const { LandingPage, Section04Reveal } = components;

  // ---------------------------------------------------------------------------
  // Suite 1: Editorial Copy & CTA Exact Matches
  // ---------------------------------------------------------------------------
  describe('Section 04 - Editorial Copy & CTA Verification', () => {
    test('1.1 Exact Headline "KNOW WHO\'S AT RISK." is rendered prominently', () => {
      const html = renderComponentWithRouter(Section04Reveal);
      assertHtmlContains(html, "KNOW WHO&#x27;S AT RISK.");
    });

    test('1.2 Exact Supporting Copy is rendered accurately', () => {
      const html = renderComponentWithRouter(Section04Reveal);
      assertHtmlContains(
        html,
        'See the signals. Understand the risk. Make your next move count.'
      );
    });

    test('1.3 Exact CTA "Explore predictions" links directly to /predict', () => {
      const html = renderComponentWithRouter(Section04Reveal);
      assertHtmlContains(html, 'Explore predictions');
      assertHtmlMatches(
        html,
        /<a[^>]+href="\/predict"[^>]*>[\s\S]*?Explore predictions[\s\S]*?<\/a>/
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Suite 2: Design System Tokens & CSS Palette Compliance
  // ---------------------------------------------------------------------------
  describe('Section 04 - Design System Tokens & Scoped Palette', () => {
    const landingCssPath = path.join(__dirname, '../src/styles/landing.css');
    const cssContent = fs.readFileSync(landingCssPath, 'utf8');

    test('2.1 Exact Background color #080A08 is defined in tokens', () => {
      assert.ok(
        cssContent.includes('#080A08'),
        'Expected #080A08 to be defined in landing.css'
      );
    });

    test('2.2 Exact Accent color #89E901 is defined in tokens', () => {
      assert.ok(
        cssContent.includes('#89E901'),
        'Expected #89E901 to be defined in landing.css'
      );
    });

    test('2.3 Exact Primary text color #E8F0E5 is defined in tokens', () => {
      assert.ok(
        cssContent.includes('#E8F0E5'),
        'Expected #E8F0E5 to be defined in landing.css'
      );
    });

    test('2.4 Exact Secondary text color #899386 is defined in tokens', () => {
      assert.ok(
        cssContent.includes('#899386'),
        'Expected #899386 to be defined in landing.css'
      );
    });

    test('2.5 Exact Surface colors #141814 and #111411 are defined in tokens', () => {
      assert.ok(
        cssContent.includes('#141814'),
        'Expected surface color #141814 in landing.css'
      );
      assert.ok(
        cssContent.includes('#111411'),
        'Expected surface card color #111411 in landing.css'
      );
    });

    test('2.6 Exact Border colors rgba(137, 147, 134, 0.2) and border accent are defined', () => {
      assert.ok(
        cssContent.includes('rgba(137, 147, 134, 0.2)'),
        'Expected border rgba(137, 147, 134, 0.2) in landing.css'
      );
      assert.ok(
        cssContent.includes('rgba(137, 233, 1, 0.35)'),
        'Expected border accent rgba(137, 233, 1, 0.35) in landing.css'
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Suite 3: 6-Stage Visual Sequence Markup & Presentation
  // ---------------------------------------------------------------------------
  describe('Section 04 - 6-Stage Visual Sequence Execution', () => {
    test('3.1 Stage 1: Connected signal network continued from Section 03 anchor', () => {
      const html = renderComponentWithRouter(Section04Reveal);
      assertHtmlContains(html, 'stage-network-viewport');
      assertHtmlContains(html, 'network-svg');
      assertHtmlContains(html, 'STAGE 01–02: SUBSCRIBER SIGNAL CONVERGENCE');
    });

    test('3.2 Stage 2: Network reduces/converges to highlighted customer #7590-VHVEG', () => {
      const html = renderComponentWithRouter(Section04Reveal);
      assertHtmlContains(html, 'Focal Target: #7590-VHVEG');
      assertHtmlContains(html, 'node-highlighted');
      assertHtmlContains(html, 'convergence-pulse');
    });

    test('3.3 Stage 3: Customer profile mask reveal with authentic Telco fields', () => {
      const html = renderComponentWithRouter(Section04Reveal);
      assertHtmlContains(html, 'stage-profile-mask');
      assertHtmlContains(html, 'Subscriber #7590-VHVEG');
      assertHtmlContains(html, '1 month');
      assertHtmlContains(html, 'Month-to-month');
      assertHtmlContains(html, 'DSL');
      assertHtmlContains(html, 'Electronic check');
      assertHtmlContains(html, '$29.85');
    });

    test('3.4 Stage 4: Churn prediction result reveal (80.6%, HIGH risk, PREDICTED TO CHURN)', () => {
      const html = renderComponentWithRouter(Section04Reveal);
      assertHtmlContains(html, 'stage-prediction-result');
      assertHtmlContains(html, '80.6%');
      assertHtmlContains(html, 'HIGH RISK');
      assertHtmlContains(html, 'PREDICTED TO CHURN');
      assertHtmlContains(html, 'score-meter-track');
    });

    test('3.5 Stage 5: Genuine supporting information (Drivers, ROC-AUC 0.8417, Retention Playbook)', () => {
      const html = renderComponentWithRouter(Section04Reveal);
      assertHtmlContains(html, 'stage-supporting-info');
      assertHtmlContains(html, '0.8417');
      assertHtmlContains(html, 'Month-to-month contract');
      assertHtmlContains(html, '+0.72');
      assertHtmlContains(html, 'Electronic check payment');
      assertHtmlContains(html, '+0.40');
      assertHtmlContains(html, 'Early tenure stage');
      assertHtmlContains(html, '+0.85');
      assertHtmlContains(html, 'HIGH-RISK RETENTION PLAYBOOK');
    });

    test('3.6 Stage 6: Functional product preview with interactive controls', () => {
      const html = renderComponentWithRouter(Section04Reveal);
      assertHtmlContains(html, 'stage-product-preview');
      assertHtmlContains(html, 'preview-browser-bar');
      assertHtmlContains(html, 'retention-studio.internal/predict');
      assertHtmlContains(html, 'tenure-slider');
      assertHtmlContains(html, 'contract-select');
    });
  });

  // ---------------------------------------------------------------------------
  // Suite 4: Data Integrity Forensics (Zero Mock, Zero Bank Hallucinations)
  // ---------------------------------------------------------------------------
  describe('Section 04 - Data Integrity Forensics', () => {
    test('4.1 Highlighted customer matches TELCO_COHORT[0] ground truth', () => {
      const cohortCustomer = TELCO_COHORT[0];
      assert.strictEqual(cohortCustomer.customerID, '7590-VHVEG');
      assert.strictEqual(cohortCustomer.tenure, 1);
      assert.strictEqual(cohortCustomer.Contract, 'Month-to-month');
      assert.strictEqual(cohortCustomer.InternetService, 'DSL');
      assert.strictEqual(cohortCustomer.PaymentMethod, 'Electronic check');
      assert.strictEqual(cohortCustomer.MonthlyCharges, 29.85);
      assert.strictEqual(cohortCustomer.TotalCharges, 29.85);
    });

    test('4.2 Evaluated model inference produces authentic 80.6% churn probability and HIGH risk tier', () => {
      const evalResult = evaluateLocalModel(TELCO_COHORT[0]);
      assert.strictEqual(evalResult.churnProbability, 0.806);
      assert.strictEqual(evalResult.riskLevel, 'HIGH');
      assert.strictEqual(evalResult.churnPrediction, 'Yes');
    });

    test('4.3 Performance metric ROC-AUC matches official benchmark 0.8417', () => {
      assert.strictEqual(PERFORMANCE_METRICS.rocAuc, 0.8417);
    });

    test('4.4 NEGATIVE ASSERTION: Forbidden banking fields NEVER appear in Section 04', () => {
      const section04Source = fs.readFileSync(
        path.join(__dirname, '../src/components/landing/Section04Reveal.jsx'),
        'utf8'
      );
      const landingPageSource = fs.readFileSync(
        path.join(__dirname, '../src/pages/LandingPage.jsx'),
        'utf8'
      );

      const forbiddenBankFields = [
        'CreditScore',
        'credit_score',
        'EstimatedSalary',
        'estimated_salary',
        'NumOfProducts',
        'HasCrCard',
        'IsActiveMember',
        'Balance',
        'Geography',
        'France',
        'Spain',
        'Germany',
      ];

      for (const field of forbiddenBankFields) {
        const wordRegex = new RegExp(`\\b${field}\\b`, 'i');
        assert.ok(
          !wordRegex.test(section04Source),
          `Data Integrity Violation: Section04Reveal must NOT contain bank field "${field}"`
        );
        assert.ok(
          !wordRegex.test(landingPageSource),
          `Data Integrity Violation: LandingPage must NOT contain bank field "${field}"`
        );
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Suite 5: Routing, Shell Separation & Accessibility Forensics
  // ---------------------------------------------------------------------------
  describe('Section 04 - Routing, Layout & Accessibility Forensics', () => {
    test('5.1 Route "/" renders LandingPage directly without internal Sidebar or Topbar framing', () => {
      const rootHtml = renderRoute('/');
      assertHtmlContains(rootHtml, 'landing-navbar');
      assertHtmlContains(rootHtml, "KNOW WHO&#x27;S AT RISK.");
      assert.ok(
        !rootHtml.includes('id="sidebar"'),
        'Landing page must NOT be framed by internal operational Sidebar'
      );
      assert.ok(
        !rootHtml.includes('class="topbar-search"'),
        'Landing page must NOT be framed by internal operational Topbar search'
      );
    });

    test('5.2 Route "/predict" remains accessible and renders full Prediction Engine', () => {
      const predictHtml = renderRoute('/predict');
      assertHtmlContains(predictHtml, 'Churn Prediction Engine');
      assertHtmlContains(predictHtml, 'Execute Real-Time Prediction');
    });

    test('5.3 CSS rules include prefers-reduced-motion: reduce reset', () => {
      const landingCssPath = path.join(__dirname, '../src/styles/landing.css');
      const cssContent = fs.readFileSync(landingCssPath, 'utf8');
      assert.ok(
        cssContent.includes('@media (prefers-reduced-motion: reduce)'),
        'Expected prefers-reduced-motion media query in landing.css'
      );
      assert.ok(
        cssContent.includes('animation-duration: 0.01ms !important'),
        'Expected zeroed animation duration for reduced motion'
      );
    });

    test('5.4 GSAP animation lifecycle implements context cleanup ctx.revert()', () => {
      const section04Source = fs.readFileSync(
        path.join(__dirname, '../src/components/landing/Section04Reveal.jsx'),
        'utf8'
      );
      assert.ok(
        section04Source.includes('gsap.context('),
        'Section04Reveal must use gsap.context()'
      );
      assert.ok(
        section04Source.includes('ctx.revert()'),
        'Section04Reveal must cleanly call ctx.revert() on unmount'
      );
    });

    test('5.5 Responsive layout rules present for desktop, tablet, and mobile', () => {
      const landingCssPath = path.join(__dirname, '../src/styles/landing.css');
      const cssContent = fs.readFileSync(landingCssPath, 'utf8');
      assert.ok(
        cssContent.includes('@media (max-width: 1024px)'),
        'Expected tablet breakpoint (max-width: 1024px) in landing.css'
      );
      assert.ok(
        cssContent.includes('@media (max-width: 768px)'),
        'Expected mobile breakpoint (max-width: 768px) in landing.css'
      );
      assert.ok(
        cssContent.includes('overflow-x: hidden'),
        'Expected overflow-x: hidden to prevent mobile horizontal scroll'
      );
    });
  });
}

// Standalone execution support
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  registerSection04Tests();
  runner.run().then((res) => {
    if (!res.success) {
      console.error(`\x1b[31mSection 04 Test Suite FAILED: ${res.stats.failed} test(s) failed.\x1b[0m`);
      process.exit(1);
    } else {
      console.log(`\x1b[32m✔ Section 04: All ${res.stats.total} tests PASSED.\x1b[0m`);
      process.exit(0);
    }
  });
}
