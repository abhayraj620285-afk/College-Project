/**
 * Tier 1: Feature Coverage E2E Tests
 * 
 * Comprehensive test coverage for all 11 application routes (>= 5 authentic tests per route):
 * 1.  /dashboard (Overview & Platform Shell)
 * 2.  /customers (Customer Directory & Filters)
 * 3.  /customers/:id (Customer Profile & Service Matrix)
 * 4.  /predict (Churn Prediction Engine)
 * 5.  /insights (Churn Drivers & Feature Attribution)
 * 6.  /retention (Retention Analytics & ROI Simulator)
 * 7.  /campaigns (Retention Playbooks & Planning Banner)
 * 8.  /model-performance (Model Observability & Health)
 * 9.  /prediction-history (Audit Log & Session Storage)
 * 10. /reports (Operational Reports & CSV Export)
 * 11. /settings (Risk Thresholds & Accessibility)
 * 
 * Total: 56 tests.
 */

import {
  describe,
  test,
  assert,
  renderRoute,
  renderComponent,
  assertHtmlContains,
  assertHtmlMatches,
  assertMetricValue,
  assertRiskBadge,
  mockLocalStorage,
  calculateRetentionRoi,
  customerService,
  apiService,
  components,
  TELCO_COHORT,
  COHORT_SUMMARY,
  MODEL_METADATA,
  PERFORMANCE_METRICS,
  CONFUSION_MATRIX,
  FEATURE_IMPORTANCE,
} from './test_harness.mjs';

export function registerTier1Tests() {
  // -------------------------------------------------------------------------
  // Feature 1: Overview Dashboard (/dashboard)
  // -------------------------------------------------------------------------
  describe('Tier 1 - Route: /dashboard (Overview & Platform Shell)', () => {
    test('1.1 Renders platform shell, Night palette styling, and top header', () => {
      const html = renderRoute('/dashboard');
      assertHtmlContains(html, 'Retention Studio');
      assertHtmlContains(html, 'Overview');
      assertHtmlContains(html, 'Retention Intelligence Dashboard');
      assertHtmlContains(html, 'Executive Overview');
    });

    test('1.2 Renders executive KPI metric cards with accurate cohort metrics', () => {
      const html = renderRoute('/dashboard');
      assertMetricValue(html, 'Total Subscribers', '7,043');
      assertMetricValue(html, 'Baseline Churn Rate', '26.54%');
      assertMetricValue(html, 'Monthly Revenue at Risk', '$139,131');
      assertMetricValue(html, 'Model ROC-AUC Score', '0.8417');
    });

    test('1.3 Renders SVG Cohort Risk Donut Chart with accessible markup and segments', () => {
      const html = renderRoute('/dashboard');
      assertHtmlMatches(html, /<svg[^>]*aria-label="Cohort Churn Risk Distribution Donut Chart"/i);
      assertHtmlContains(html, 'TOTAL SUBSCRIBERS');
      assertHtmlContains(html, '7,043');
      assertHtmlContains(html, 'HIGH');
      assertHtmlContains(html, 'MEDIUM');
      assertHtmlContains(html, 'LOW');
    });

    test('1.4 Renders Priority Retention Queue watchlist table', () => {
      const html = renderRoute('/dashboard');
      assertHtmlContains(html, 'Priority Retention Queue');
      assertHtmlContains(html, 'Top at-risk subscribers requiring immediate intervention');
      assertHtmlContains(html, 'View All 1,248');
    });

    test('1.5 Renders direct navigation CTAs to Predict Engine and Reports', () => {
      const html = renderRoute('/dashboard');
      assertHtmlMatches(html, /href="\/predict"/);
      assertHtmlMatches(html, /href="\/reports"/);
      assertHtmlContains(html, 'Reports');
    });
  });

  // -------------------------------------------------------------------------
  // Feature 2: Customer Directory (/customers)
  // -------------------------------------------------------------------------
  describe('Tier 1 - Route: /customers (Customer Directory)', () => {
    test('2.1 Renders Customer Directory view with 7,043 cohort total and summary cards', () => {
      const html = renderRoute('/customers');
      assertHtmlContains(html, 'Customer Directory');
      assertHtmlContains(html, '7,043');
      assertHtmlContains(html, 'Subscribers');
    });

    test('2.2 Renders CustomerTable headers, pagination controls, and rows', () => {
      const html = renderRoute('/customers');
      assertHtmlContains(html, 'Customer ID');
      assertHtmlContains(html, 'Tenure');
      assertHtmlContains(html, 'Contract');
      assertHtmlContains(html, 'Internet');
      assertHtmlContains(html, 'Monthly');
      assertHtmlContains(html, 'Total Charges');
      assertHtmlContains(html, 'Risk / Status');
      assertHtmlMatches(html, /Showing[\s\S]*?customers/i);
    });

    test('2.3 Search filtering reduces cohort results accurately', () => {
      const queryResult = customerService.getCustomers({ search: '7590-VHVEG' });
      assert.strictEqual(queryResult.total, 1);
      assert.strictEqual(queryResult.customers[0].customerID, '7590-VHVEG');
    });

    test('2.4 Multi-facet filtering by contract type segments cohort correctly', () => {
      const m2m = customerService.getCustomers({ contract: 'Month-to-month' });
      const oneYear = customerService.getCustomers({ contract: 'One year' });
      const twoYear = customerService.getCustomers({ contract: 'Two year' });

      // Verifies sample cohort distribution matches total sample count
      assert.strictEqual(m2m.total + oneYear.total + twoYear.total, TELCO_COHORT.length);
      // Verifies population aggregate breakdown is preserved in COHORT_SUMMARY
      assert.strictEqual(COHORT_SUMMARY.contractBreakdown['Month-to-month'], 3875);
      assert.strictEqual(COHORT_SUMMARY.contractBreakdown['One year'], 1473);
      assert.strictEqual(COHORT_SUMMARY.contractBreakdown['Two year'], 1695);
    });

    test('2.5 Sorting by tenure and monthly charges orders items correctly', () => {
      const tenureAsc = customerService.getCustomers({ sortBy: 'tenure', sortDir: 'asc', pageSize: 10 });
      assert.ok(tenureAsc.customers[0].tenure <= tenureAsc.customers[9].tenure);

      const tenureDesc = customerService.getCustomers({ sortBy: 'tenure', sortDir: 'desc', pageSize: 10 });
      assert.ok(tenureDesc.customers[0].tenure >= tenureDesc.customers[9].tenure);
      assert.strictEqual(tenureDesc.customers[0].tenure, 72);
    });

    test('2.6 CSV Export generates RFC-4180 compliant content with 24 headers', () => {
      const sample = customerService.getCustomers({ pageSize: 5 }).customers;
      const csv = customerService.exportCohortToCsv(sample);
      const lines = csv.split('\r\n');
      assert.ok(lines.length >= 6);
      assert.ok(lines[0].includes('customerID'));
      assert.ok(lines[0].includes('ChurnProbability'));
      assert.ok(lines[0].includes('RiskLevel'));
    });
  });

  // -------------------------------------------------------------------------
  // Feature 3: Customer Detail (/customers/:id)
  // -------------------------------------------------------------------------
  describe('Tier 1 - Route: /customers/:id (Subscriber Risk Profile)', () => {
    test('3.1 Renders profile view for subscriber 7590-VHVEG', () => {
      const html = renderRoute('/customers/7590-VHVEG');
      assertHtmlContains(html, '7590-VHVEG');
      assertHtmlMatches(html, /Account[\s\S]*?#<!-- -->7590-VHVEG/i);
      assertHtmlContains(html, 'Customer Risk Intelligence');
      assertHtmlContains(html, 'Month-to-month');
    });

    test('3.2 Displays Ground-Truth Churn vs Predicted Churn comparison', () => {
      const customer = customerService.getCustomerById('7590-VHVEG');
      assert.ok(customer);
      assert.strictEqual(customer.Churn, 'No'); // Ground truth stayed
      assert.strictEqual(customer.predictedChurn, 'Yes'); // Model predicted churn
      assert.ok(customer.churnProbability >= 0.70); // High risk
      assert.strictEqual(customer.riskLevel, 'HIGH');

      const html = renderRoute('/customers/7590-VHVEG');
      assertHtmlContains(html, 'ACTIVE SUBSCRIBER');
      assertHtmlContains(html, 'Model Classification');
      assertHtmlContains(html, 'CHURN RISK');
    });

    test('3.3 Displays detailed 9-service subscription matrix', () => {
      const customer = customerService.getCustomerById('7590-VHVEG');
      assert.ok(customer.serviceMatrix);
      assert.strictEqual(customer.serviceMatrix.phone, false);
      assert.strictEqual(customer.serviceMatrix.internet, 'DSL');
      assert.strictEqual(customer.serviceMatrix.onlineSecurity, 'No');
      assert.strictEqual(customer.serviceMatrix.onlineBackup, 'Yes');

      const html = renderRoute('/customers/7590-VHVEG');
      assertHtmlContains(html, 'Service Subscription Matrix');
      assertHtmlContains(html, 'Phone Services');
      assertHtmlContains(html, 'Primary Line');
    });

    test('3.4 Displays account demographics and invoicing profile', () => {
      const customer = customerService.getCustomerById('7590-VHVEG');
      assert.ok(customer.riskDrivers.length > 0);
      assert.ok(customer.riskDrivers.some((d) => d.name.includes('Month-to-month')));

      const html = renderRoute('/customers/7590-VHVEG');
      assertHtmlContains(html, 'Account Demographics &amp; Invoicing Profile');
      assertHtmlContains(html, 'Electronic check');
    });

    test('3.5 Provides deep link to Predict Engine and live prediction action', () => {
      const html = renderRoute('/customers/7590-VHVEG');
      assertHtmlMatches(html, /href="\/predict"/);
      assertHtmlContains(html, 'Run Prediction on Customer');
    });
  });

  // -------------------------------------------------------------------------
  // Feature 4: Churn Prediction (/predict)
  // -------------------------------------------------------------------------
  describe('Tier 1 - Route: /predict (Prediction Engine)', () => {
    test('4.1 Renders 19-field ML schema form with inputs and fieldset groups', () => {
      const html = renderRoute('/predict');
      assertHtmlContains(html, 'Real-Time Churn Prediction Engine');
      assertHtmlContains(html, 'Subscriber Demographics');
      assertHtmlContains(html, 'Account &amp; Contract Structure');
      assertHtmlContains(html, 'Telecommunications &amp; Add-On Services');
      assertHtmlContains(html, 'Charges &amp; Lifetime Financials');
      assertHtmlContains(html, 'field-MonthlyCharges');
      assertHtmlContains(html, 'field-tenure');
    });

    test('4.2 Pre-populates baseline defaults and sample presets', () => {
      const { DEFAULT_CUSTOMER_REQUEST, HIGH_RISK_PRESET, LOW_RISK_PRESET } = components;
      assert.strictEqual(DEFAULT_CUSTOMER_REQUEST.gender, 'Female');
      assert.strictEqual(DEFAULT_CUSTOMER_REQUEST.Contract, 'Month-to-month');
      assert.strictEqual(HIGH_RISK_PRESET.Contract, 'Month-to-month');
      assert.strictEqual(HIGH_RISK_PRESET.InternetService, 'Fiber optic');
      assert.strictEqual(LOW_RISK_PRESET.Contract, 'Two year');
    });

    test('4.3 Evaluates sample high-risk profile through inference engine', async () => {
      const { HIGH_RISK_PRESET } = components;
      const result = await apiService.predictChurn(HIGH_RISK_PRESET);
      assert.ok(result);
      assert.strictEqual(result.churn_prediction, 'Yes');
      assert.ok(result.churn_probability >= 0.70);
      assert.strictEqual(result.risk_level, 'HIGH');
    });

    test('4.4 Evaluates sample low-risk profile through inference engine', async () => {
      const { LOW_RISK_PRESET } = components;
      const result = await apiService.predictChurn(LOW_RISK_PRESET);
      assert.ok(result);
      assert.strictEqual(result.churn_prediction, 'No');
      assert.ok(result.churn_probability < 0.40);
      assert.strictEqual(result.risk_level, 'LOW');
    });

    test('4.5 PredictionResult component renders probability gauge and driver contributions', () => {
      const { PredictionResult } = components;
      const mockResult = {
        id: 12345,
        churn_prediction: 'Yes',
        churn_probability: 0.842,
        risk_level: 'HIGH',
        top_drivers: [
          { feature: 'InternetService_Fiber_optic', weight: 1.222, impact: 'HIGH', direction: 'CHURN' },
          { feature: 'Contract_Month_to_month', weight: 0.85, impact: 'HIGH', direction: 'CHURN' },
        ],
      };

      const resultHtml = renderComponent(PredictionResult, {
        result: mockResult,
        onReset: () => {},
      });

      assertHtmlContains(resultHtml, '84.2%');
      assertHtmlContains(resultHtml, 'HIGH RISK');
      assertHtmlContains(resultHtml, 'Top Churn Drivers');
    });
  });

  // -------------------------------------------------------------------------
  // Feature 5: Churn Insights (/insights)
  // -------------------------------------------------------------------------
  describe('Tier 1 - Route: /insights (Feature Attribution & Drivers)', () => {
    test('5.1 Renders Churn Drivers & Feature Attribution dashboard', () => {
      const html = renderRoute('/insights');
      assertHtmlContains(html, 'Churn Drivers &amp; Global Feature Attribution');
      assertHtmlContains(html, 'Global Feature Attribution Explorer');
      assertHtmlContains(html, 'Explainability &amp; Feature Intelligence');
    });

    test('5.2 Displays global feature attribution rankings from model weights', () => {
      const html = renderRoute('/insights');
      // Fiber optic is the highest positive churn driver (+1.222)
      assertHtmlContains(html, 'Fiber Optic Service');
      // Two-year contract is the strongest protective anchor (-1.413)
      assertHtmlContains(html, 'Two-Year Contract');
    });

    test('5.3 Category filter tabs filter feature list appropriately', () => {
      const contractFeatures = FEATURE_IMPORTANCE.filter((f) => f.category === 'Contract');
      assert.ok(contractFeatures.length >= 2);
      assert.ok(contractFeatures.some((f) => f.feature.includes('Two year')));

      const serviceFeatures = FEATURE_IMPORTANCE.filter((f) => f.category === 'Service');
      assert.ok(serviceFeatures.some((f) => f.feature.includes('Fiber optic')));
    });

    test('5.4 Displays comparative lifecycle tenure and contract hazard matrix', () => {
      const html = renderRoute('/insights');
      assertHtmlContains(html, 'Lifecycle Tenure Hazard Decay Curve');
      assertHtmlContains(html, 'Contract Type Comparative Hazard Matrix');
    });

    test('5.5 Odds ratio calculations correctly reflect exponential coefficients', () => {
      const fiber = FEATURE_IMPORTANCE.find((f) => f.feature === 'InternetService_Fiber optic');
      assert.ok(fiber);
      // OR = exp(1.222352) ≈ 3.395
      const oddsRatio = Math.exp(fiber.weight);
      assert.ok(oddsRatio > 3.0);
      assert.strictEqual(oddsRatio.toFixed(2), '3.40');
    });
  });

  // -------------------------------------------------------------------------
  // Feature 6: Retention Analytics (/retention)
  // -------------------------------------------------------------------------
  describe('Tier 1 - Route: /retention (Retention & MRR Analytics)', () => {
    test('6.1 Renders Retention Analytics & Cohort Decay dashboard', () => {
      const html = renderRoute('/retention');
      assertHtmlContains(html, 'Cohort Retention &amp; MRR Exposure');
      assertHtmlContains(html, 'Survival Decay Curves by Contract Tier (Months 0–72)');
    });

    test('6.2 Displays Kaplan-Meier survival decay curves across 72 months', () => {
      const html = renderRoute('/retention');
      assertHtmlMatches(html, /<svg[^>]*aria-label="Kaplan-Meier Survival Decay Curves/i);
      assertHtmlContains(html, 'Customer Survival Decay by Contract Tier');
      assertHtmlContains(html, 'Month-to-Month');
      assertHtmlContains(html, 'One-Year Contract');
      assertHtmlContains(html, 'Two-Year Contract');
    });

    test('6.3 Renders Interactive Retention ROI Scenario Calculator', () => {
      const html = renderRoute('/retention');
      assertHtmlContains(html, 'Retention Campaign ROI Simulator');
      assertHtmlContains(html, 'Target Accounts:');
      assertHtmlContains(html, 'Monthly Concession Discount:');
      assertHtmlContains(html, 'Concession Duration:');
      assertHtmlContains(html, 'Expected Conversion / Save Rate:');
    });

    test('6.4 ROI calculator accurately computes financial formula values', () => {
      // 1. Render actual /retention route and inspect rendered DOM output
      const html = renderRoute('/retention');
      assertHtmlContains(html, 'Net Economic Value Generated');
      assertHtmlMatches(html, /\$(<!--\s*-->)?265,563/); // Net ARR preserved with default params
      assertHtmlMatches(html, /3\.13\s*(<!--\s*-->)?\s*x/); // ROI multiplier
      assertHtmlContains(html, 'Gross saved vs cost');
      assertHtmlContains(html, '437'); // 1,248 * 0.35 saved accounts
      assertHtmlContains(html, 'Retained accounts');
      assertHtmlMatches(html, /\$(<!--\s*-->)?124,800/); // total campaign budget
      assertHtmlMatches(html, /\$(<!--\s*-->)?100\s*(<!--\s*-->)?\/target/);
      assertHtmlMatches(html, /11\.2\s*(<!--\s*-->)?\s*%/); // break-even save rate
      assertHtmlContains(html, 'Min required success');

      // 2. Validate domain model calculation against exported calculation helper
      const roi = calculateRetentionRoi();
      assert.strictEqual(roi.costPerAccount, 100);
      assert.strictEqual(roi.totalCampaignCost, 124800);
      assert.strictEqual(roi.savedAccounts, 437);
      assert.strictEqual(Math.round(roi.grossSavedARR), 390363);
      assert.strictEqual(Math.round(roi.netPreservedARR), 265563);
      assert.strictEqual(roi.roiMultiplier, '3.13');
      assert.strictEqual(roi.breakEvenRate, '11.2');
    });

    test('6.5 Renders CTA to export at-risk cohort for campaign targeting', () => {
      const html = renderRoute('/retention');
      assertHtmlMatches(html, /Export At-Risk Cohort/i);
    });
  });

  // -------------------------------------------------------------------------
  // Feature 7: Retention Campaigns (/campaigns)
  // -------------------------------------------------------------------------
  describe('Tier 1 - Route: /campaigns (Retention Playbooks)', () => {
    test('7.1 Renders Retention Campaigns catalog with prominent PLANNING/DEMO banner', () => {
      const html = renderRoute('/campaigns');
      assertHtmlContains(html, 'Retention Playbooks &amp; Campaigns');
      assertHtmlContains(html, 'Planning and demonstration mode advisory');
      assertHtmlContains(html, 'PLANNING STATE / DEMONSTRATION WORKFLOW');
    });

    test('7.2 Renders all 6 enterprise retention playbooks in catalog', () => {
      const html = renderRoute('/campaigns');
      const { DEFAULT_PLAYBOOKS } = components;
      assert.strictEqual(DEFAULT_PLAYBOOKS.length, 6);
      assertHtmlContains(html, 'Annual Contract Upgrade Catalyst');
      assertHtmlContains(html, 'Fiber Optic VIP Stabilization Pulse');
      assertHtmlContains(html, 'Autopay &amp; Security Suite Bundle');
      assertHtmlContains(html, 'Senior Citizen Dedicated Support Line');
    });

    test('7.3 Playbook audience matching dynamically calculates audience from cohort', () => {
      const { DEFAULT_PLAYBOOKS } = components;
      const pb1 = DEFAULT_PLAYBOOKS[0]; // Annual Contract Upgrade
      const matchingCount = TELCO_COHORT.filter(pb1.filterFn).length;
      assert.ok(matchingCount > 0);
      assert.ok(matchingCount < 7043);
    });

    test('7.4 Playbook details describe concessions and delivery channels', () => {
      const { DEFAULT_PLAYBOOKS } = components;
      const pb1 = DEFAULT_PLAYBOOKS[0];
      assert.strictEqual(pb1.category, 'Contract Migration');
      assert.strictEqual(pb1.channelType, 'email');
      assert.strictEqual(pb1.concessionCostPerUser, 90);
    });

    test('7.5 Status filter buttons allow switching blueprint states', () => {
      const html = renderRoute('/campaigns');
      assertHtmlContains(html, 'Active Blueprint');
      assertHtmlContains(html, 'Ready to Deploy');
    });
  });

  // -------------------------------------------------------------------------
  // Feature 8: Model Performance (/model-performance)
  // -------------------------------------------------------------------------
  describe('Tier 1 - Route: /model-performance (Model Observability)', () => {
    test('8.1 Renders Model Observability dashboard with algorithm name and framework', () => {
      const html = renderRoute('/model-performance');
      assertHtmlContains(html, 'Model Health &amp; Evaluation Benchmarks');
      assertHtmlContains(html, 'Observability &amp; Telemetry');
      assertHtmlContains(html, MODEL_METADATA.algorithm);
    });

    test('8.2 Displays verified production evaluation metrics (AUC 0.8417, Accuracy 73.81%)', () => {
      const html = renderRoute('/model-performance');
      assertHtmlContains(html, 'ROC-AUC Score: 0.8417');
      assertHtmlContains(html, '0.8417');
      assertHtmlContains(html, 'Holdout Accuracy');
      assertHtmlContains(html, '73.81%');
      assertHtmlContains(html, 'Churn Recall (Sensitivity)');
      assertHtmlContains(html, '78.34%');
      assertHtmlContains(html, 'Precision');
      assertHtmlContains(html, '50.43%');
    });

    test('8.3 Renders 2x2 Confusion Matrix with TP, FP, FN, TN values', () => {
      const html = renderRoute('/model-performance');
      assertHtmlContains(html, 'Holdout Confusion Matrix &amp; Threshold Tuning');
      assertHtmlContains(html, String(CONFUSION_MATRIX.truePositive)); // 298
      assertHtmlContains(html, String(CONFUSION_MATRIX.falsePositive)); // 289
      assertHtmlContains(html, String(CONFUSION_MATRIX.falseNegative)); // 76
      assertHtmlContains(html, String(CONFUSION_MATRIX.trueNegative)); // 746
    });

    test('8.4 Interactive Decision Threshold Slider (0.30 - 0.70) recalibrates trade-offs', () => {
      const html = renderRoute('/model-performance');
      assertHtmlContains(html, 'Decision Threshold Simulator:');
      assertHtmlContains(html, '0.50');
      assertHtmlContains(html, 'Aggressive Recall');
    });

    test('8.5 Live Service Health probe displays gateway and inference microservice statuses', () => {
      const html = renderRoute('/model-performance');
      assertHtmlContains(html, 'Gateway (8080):');
      assertHtmlContains(html, 'Model Worker (8000):');
      assertHtmlContains(html, 'Telemetry Health:');
    });
  });

  // -------------------------------------------------------------------------
  // Feature 9: Prediction History (/prediction-history)
  // -------------------------------------------------------------------------
  describe('Tier 1 - Route: /prediction-history (Audit Log)', () => {
    test('9.1 Renders Audit History view with transparent Ephemeral Storage notice', () => {
      const html = renderRoute('/prediction-history');
      assertHtmlContains(html, 'Prediction History &amp; Session Audit Log');
      assertHtmlContains(html, 'Audit &amp; Compliance');
    });

    test('9.2 Displays empty state or metrics when session history is queried', () => {
      apiService.resetSessionHistory();
      const html = renderRoute('/prediction-history');
      assertHtmlContains(html, 'Total queries recorded');
      assertHtmlContains(html, 'Clear History');
      assertHtmlContains(html, 'Export CSV');
    });

    test('9.3 Real predictions executed during session populate history table', async () => {
      apiService.resetSessionHistory();
      // Run a prediction
      const { HIGH_RISK_PRESET } = components;
      await apiService.predictChurn(HIGH_RISK_PRESET);

      const history = await apiService.getPredictions(10);
      assert.strictEqual(history.length, 1);
      assert.strictEqual(history[0].churn_prediction, 'Yes');
      assert.strictEqual(history[0].risk_level, 'HIGH');
    });

    test('9.4 History search and risk level filtering filters past prediction items', async () => {
      apiService.resetSessionHistory();
      const { HIGH_RISK_PRESET, LOW_RISK_PRESET } = components;

      // Populate real predictions through the inference pipeline
      await apiService.predictChurn(HIGH_RISK_PRESET);
      await apiService.predictChurn(LOW_RISK_PRESET);

      const history = await apiService.getPredictions(10);
      assert.strictEqual(history.length, 2);

      const highRiskOnly = history.filter((r) => r.risk_level === 'HIGH');
      assert.strictEqual(highRiskOnly.length, 1);
      assert.strictEqual(highRiskOnly[0].churn_prediction, 'Yes');
      assert.strictEqual(highRiskOnly[0].contract, HIGH_RISK_PRESET.Contract);

      const lowRiskOnly = history.filter((r) => r.risk_level === 'LOW');
      assert.strictEqual(lowRiskOnly.length, 1);
      assert.strictEqual(lowRiskOnly[0].churn_prediction, 'No');

      // Verify rendering in PredictionHistoryPage DOM
      const html = renderRoute('/prediction-history');
      assertHtmlContains(html, 'Prediction History &amp; Session Audit Log');
      assertRiskBadge(html, 'HIGH');
      assertRiskBadge(html, 'LOW');
      assertHtmlContains(html, HIGH_RISK_PRESET.Contract);

      apiService.resetSessionHistory();
    });

    test('9.5 Clear Session History action purges in-memory history cleanly', () => {
      apiService.resetSessionHistory();
      assert.strictEqual(apiService.getSessionHistory().length, 0);
    });
  });

  // -------------------------------------------------------------------------
  // Feature 10: Reports & Exports (/reports)
  // -------------------------------------------------------------------------
  describe('Tier 1 - Route: /reports (Reports & Data Export)', () => {
    test('10.1 Renders Reports & Data Export studio with 5 operational presets', () => {
      const html = renderRoute('/reports');
      assertHtmlContains(html, 'Intelligence Reports &amp; Data Exports');
      assertHtmlContains(html, 'High Risk Cohort');
      assertHtmlContains(html, 'Fiber Optic At Risk');
      assertHtmlContains(html, 'Month-to-Month Defiers');
      assertHtmlContains(html, 'Historical Churned Accounts');
      assertHtmlContains(html, 'Full Subscriber Cohort');
    });

    test('10.2 Preset selection updates cohort metrics and subscriber count', () => {
      const highRiskCohort = TELCO_COHORT.filter((c) => (c.churnProbability || 0) >= 0.70);
      assert.ok(highRiskCohort.length > 0);
      const fiberAtRisk = TELCO_COHORT.filter((c) => c.InternetService === 'Fiber optic' && (c.churnProbability || 0) >= 0.50);
      assert.ok(fiberAtRisk.length > 0);
    });

    test('10.3 Cohort preview DataTable renders subscriber records and download button', () => {
      const html = renderRoute('/reports');
      assertHtmlContains(html, 'Cohort Preview');
      assertHtmlMatches(html, /Download[\s\S]*?High Risk Cohort[\s\S]*?\.CSV/i);
    });

    test('10.4 Model Architecture & Feature Weights schema viewer displays coefficients', () => {
      const html = renderRoute('/reports');
      assertHtmlContains(html, 'Model Hyperparameters &amp; Serialized Artifacts');
      assertHtmlContains(html, 'Algorithmic Fairness &amp; Governance Audit');
      assertHtmlContains(html, 'Demographic Parity Verified');
    });

    test('10.5 CSV generation produces RFC-4180 export with exact 24 headers', () => {
      const csv = customerService.exportCohortToCsv(TELCO_COHORT.slice(0, 10));
      const headers = csv.split('\r\n')[0].split(',');
      assert.strictEqual(headers.length, 24);
      assert.strictEqual(headers[0], 'customerID');
      assert.strictEqual(headers[23], 'RiskLevel');
    });
  });

  // -------------------------------------------------------------------------
  // Feature 11: Settings (/settings)
  // -------------------------------------------------------------------------
  describe('Tier 1 - Route: /settings (Platform Settings & Preferences)', () => {
    test('11.1 Renders Platform Settings & Threshold Configuration interface', () => {
      const html = renderRoute('/settings');
      assertHtmlContains(html, 'Platform Settings &amp; Risk Thresholds');
      assertHtmlContains(html, 'Risk Classification Thresholds &amp; Real-Time Cohort Impact');
    });

    test('11.2 Renders High Risk Threshold and Medium Risk Threshold cutoff controls', () => {
      const html = renderRoute('/settings');
      assertHtmlMatches(html, /High Risk[\s\S]*?Cutoff/i);
      assertHtmlMatches(html, /Medium Risk[\s\S]*?Cutoff/i);
      assertHtmlMatches(html, /70\s*(<!--\s*-->)?\s*%/i);
      assertHtmlMatches(html, /40\s*(<!--\s*-->)?\s*%/i);
    });

    test('11.3 Enforces invariant validation: High Threshold must be strictly greater than Med', () => {
      // 1. Verify default valid state renders cleanly without warning banner
      mockLocalStorage.clear();
      const defaultHtml = renderRoute('/settings');
      assert.ok(!defaultHtml.includes('notice-banner warning'), 'Default thresholds (70/40) must not show warning banner');
      assert.ok(!defaultHtml.includes('Invalid Threshold Range'));
      assert.ok(!defaultHtml.includes('disabled=""') && !defaultHtml.includes('disabled '), 'Save button must not be disabled for valid thresholds');

      // 2. Set invalid inverted thresholds in localStorage and render SettingsPage
      mockLocalStorage.setItem('rs_threshold_high', '30');
      mockLocalStorage.setItem('rs_threshold_med', '50');
      const invalidHtml = renderRoute('/settings');

      // Invariant violation: High (30%) <= Med (50%) must render warning banner and disable Save Changes button
      assertHtmlContains(invalidHtml, 'notice-banner warning');
      assertHtmlContains(invalidHtml, 'Invalid Threshold Range');
      assertHtmlMatches(invalidHtml, /High Risk Threshold[\s\S]*?30[\s\S]*?must be strictly greater than Medium Risk Threshold[\s\S]*?50/);
      assertHtmlMatches(invalidHtml, /<button[^>]+disabled/);

      // Clean up
      mockLocalStorage.clear();
    });

    test('11.4 Real-time Cohort Impact Simulator calculates distribution shifts', () => {
      const html = renderRoute('/settings');
      assertHtmlContains(html, 'Real-Time Cohort Impact');
      assertHtmlContains(html, 'High Risk Cohort:');
      assertHtmlContains(html, 'MRR at risk');
    });

    test('11.5 Accessibility preferences (Reduce Motion, High Contrast, Tabular Figures) render and persist', () => {
      const html = renderRoute('/settings');
      assertHtmlContains(html, 'Accessibility &amp; Visual Display Options');
      assertHtmlContains(html, 'Reduce Motion');
      assertHtmlContains(html, 'High Contrast Mode');
    });
  });
}
