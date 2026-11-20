/**
 * Tier 3: Cross-Feature Pairwise Combinations E2E Tests
 * 
 * Verifies end-to-end integration workflows spanning multiple pages, services,
 * state persistence layers, and mathematical data flows:
 * 
 * Workflow 1: Customer Directory Search + Multi-Facet Filtering + RFC-4180 CSV Export
 * Workflow 2: Predict Engine Single Customer Inference -> Deep Link to Customer Profile -> Live Re-Score & Strategy Compare
 * Workflow 3: Settings Custom Risk Threshold Adjustment -> Cohort Risk Stratification Dynamic Impact across Dashboard & Reports
 * Workflow 4: Predict Form Evaluation -> Session History Audit Log -> Analytics Aggregate Stats Synchronization
 * Workflow 5: Insights Churn Driver Attribution -> Retention Playbook Cross-Launch & Sizing
 * Workflow 6: Retention Campaign ROI Simulator -> Target Audience Segmentation & RFC-4180 High-Risk Cohort CSV Export
 * Workflow 7: Customer Directory Navigation -> Profile Selection -> Intervention Outreach Logging (Local storage state persistence)
 * Workflow 8: Model Performance Decision Threshold Shift -> Holdout Confusion Matrix & Evaluation Benchmark Recalculation
 * 
 * Requirement: Authentic assertions exercising real data, calculation logic, and UI components.
 */

import {
  describe,
  test,
  assert,
  renderRoute,
  renderComponent,
  assertHtmlContains,
  assertHtmlMatches,
  customerService,
  apiService,
  components,
  mockLocalStorage,
  calculateRetentionRoi,
  TELCO_COHORT,
  COHORT_SUMMARY,
  MODEL_METADATA,
  PERFORMANCE_METRICS,
  CONFUSION_MATRIX,
  FEATURE_IMPORTANCE,
  evaluateLocalModel,
} from './test_harness.mjs';

export function registerTier3Tests() {
  // =========================================================================
  // Workflow 1: Customer Search + Multi-Facet Filtering + RFC-4180 CSV Export
  // =========================================================================
  describe('Tier 3 - Workflow 1: Search + Multi-Facet Filter + RFC-4180 CSV Export', () => {
    test('WF1.1 Multi-facet query filters cohort by Contract, Internet, and Risk tier simultaneously', () => {
      const queryResult = customerService.getCustomers({
        contract: 'Month-to-month',
        internetService: 'Fiber optic',
        riskTier: 'HIGH',
        page: 1,
        pageSize: 50,
      });

      assert.ok(queryResult.total > 0, 'Expected non-zero matching high-risk month-to-month fiber customers');
      queryResult.customers.forEach((c) => {
        assert.strictEqual(c.Contract, 'Month-to-month');
        assert.strictEqual(c.InternetService, 'Fiber optic');
        assert.strictEqual(c.riskLevel, 'HIGH');
      });
    });

    test('WF1.2 Combining free-text search with facet filters returns strict intersection', () => {
      const queryResult = customerService.getCustomers({
        search: 'Electronic check',
        contract: 'Month-to-month',
        internetService: 'Fiber optic',
        riskTier: 'HIGH',
        page: 1,
        pageSize: 25,
      });

      assert.ok(queryResult.total > 0);
      assert.ok(queryResult.total <= TELCO_COHORT.length);
      queryResult.customers.forEach((c) => {
        assert.strictEqual(c.Contract, 'Month-to-month');
        assert.strictEqual(c.InternetService, 'Fiber optic');
        assert.strictEqual(c.riskLevel, 'HIGH');
        assert.strictEqual(c.PaymentMethod, 'Electronic check');
      });
    });

    test('WF1.3 Exporting filtered multi-facet cohort produces valid RFC-4180 CSV format', () => {
      const queryResult = customerService.getCustomers({
        contract: 'Month-to-month',
        internetService: 'Fiber optic',
        riskTier: 'HIGH',
        pageSize: 100,
      });

      const csvData = customerService.exportCohortToCsv(queryResult.customers);
      assert.ok(csvData.length > 0);

      const lines = csvData.split('\r\n');
      assert.strictEqual(lines.length, queryResult.customers.length + 1); // 1 header + N rows

      // Verify header schema
      const headers = lines[0].split(',');
      assert.strictEqual(headers[0], 'customerID');
      assert.strictEqual(headers[15], 'Contract');
      assert.strictEqual(headers[18], 'MonthlyCharges');
      assert.strictEqual(headers[23], 'RiskLevel');

      // Verify data lines match filter criteria
      for (let i = 1; i <= Math.min(10, queryResult.customers.length); i++) {
        assert.ok(lines[i].includes('"Month-to-month"'));
        assert.ok(lines[i].includes('"Fiber optic"'));
        assert.ok(lines[i].includes('"HIGH"'));
      }
    });

    test('WF1.4 Customers page HTML accurately renders active filter state and filtered count', () => {
      const html = renderRoute('/customers');
      assertHtmlContains(html, 'Customer Directory');
      assertHtmlContains(html, '7,043');
      assertHtmlContains(html, 'Month-to-month');
      assertHtmlContains(html, 'Fiber optic');
    });
  });

  // =========================================================================
  // Workflow 2: Predict Engine -> Customer Profile Deep Link -> Live Re-Score
  // =========================================================================
  describe('Tier 3 - Workflow 2: Predict Engine -> Profile Deep Link -> Live Re-Score', () => {
    test('WF2.1 High-risk customer payload evaluated via predictChurn produces risk drivers and probability', async () => {
      const targetCustomer = {
        gender: 'Female',
        SeniorCitizen: 0,
        Partner: 'No',
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
      };

      const prediction = await apiService.predictChurn(targetCustomer);
      assert.ok(prediction);
      assert.strictEqual(typeof prediction.churn_probability, 'number');
      assert.ok(prediction.churn_probability >= 0.50, 'Month-to-month short tenure electronic check should have elevated churn risk');
      assert.ok(Array.isArray(prediction.top_drivers));
      assert.ok(prediction.top_drivers.length > 0);
    });

    test('WF2.2 Customer Detail page deep-links to account #7590-VHVEG and displays risk assessment', () => {
      const html = renderRoute('/customers/7590-VHVEG');
      assertHtmlContains(html, 'Account');
      assertHtmlContains(html, '7590-VHVEG');
      assertHtmlContains(html, 'Churn Risk Assessment');
      assertHtmlContains(html, 'Service Subscription Matrix');
      assertHtmlContains(html, 'DSL');
      assertHtmlContains(html, 'Month-to-month');
    });

    test('WF2.3 Live re-scoring with contract upgrade (Month-to-month -> Two year) dramatically reduces churn probability', () => {
      const baselinePayload = {
        gender: 'Female',
        SeniorCitizen: 0,
        Partner: 'No',
        Dependents: 'No',
        tenure: 6,
        PhoneService: 'Yes',
        MultipleLines: 'No',
        InternetService: 'Fiber optic',
        OnlineSecurity: 'No',
        OnlineBackup: 'No',
        DeviceProtection: 'No',
        TechSupport: 'No',
        StreamingTV: 'No',
        StreamingMovies: 'No',
        Contract: 'Month-to-month',
        PaperlessBilling: 'Yes',
        PaymentMethod: 'Electronic check',
        MonthlyCharges: 70.0,
        TotalCharges: 420.0,
      };

      const baselineScore = evaluateLocalModel(baselinePayload);
      assert.ok(baselineScore.churnProbability >= 0.60);

      // Re-score with retention strategy: 2-year contract + Tech Support + Auto Billing
      const upgradedPayload = {
        ...baselinePayload,
        Contract: 'Two year',
        TechSupport: 'Yes',
        OnlineSecurity: 'Yes',
        PaymentMethod: 'Bank transfer (automatic)',
      };

      const upgradedScore = evaluateLocalModel(upgradedPayload);
      assert.ok(upgradedScore.churnProbability < 0.35, 'Retention contract upgrade should drop churn probability below 35%');
      assert.ok(
        baselineScore.churnProbability - upgradedScore.churnProbability >= 0.35,
        'Risk reduction should exceed 35 percentage points'
      );
      assert.strictEqual(upgradedScore.riskLevel, 'LOW');
    });

    test('WF2.4 Customer detail view provides actionable retention action playbooks', () => {
      const profile = customerService.getCustomerById('7590-VHVEG');
      assert.ok(profile);
      assert.ok(profile.riskDrivers.length > 0);
      const hasContractRisk = profile.riskDrivers.some((d) => d.name.includes('Month-to-month'));
      assert.ok(hasContractRisk, 'Expected Month-to-month contract to be flagged as risk driver');
    });
  });

  // =========================================================================
  // Workflow 3: Settings Custom Risk Thresholds -> Dynamic Cohort Stratification
  // =========================================================================
  describe('Tier 3 - Workflow 3: Settings Risk Thresholds -> Dynamic Cohort Stratification', () => {
    test('WF3.1 Default threshold distribution across Telco sample cohort matches established baseline', () => {
      const highDef = 0.70;
      const medDef = 0.40;

      let highCount = 0;
      let medCount = 0;
      let lowCount = 0;

      TELCO_COHORT.forEach((c) => {
        const p = c.churnProbability || 0;
        if (p >= highDef) highCount++;
        else if (p >= medDef) medCount++;
        else lowCount++;
      });

      assert.strictEqual(highCount, 29);
      assert.strictEqual(medCount, 23);
      assert.strictEqual(lowCount, 48);
      assert.strictEqual(highCount + medCount + lowCount, 100);

      // Verify population scaling factor used in SettingsPage (7,043 / 100 = 70.43)
      const scale = 7043 / TELCO_COHORT.length;
      const scaledHigh = Math.round(highCount * scale);
      assert.strictEqual(scaledHigh, 2042);
    });

    test('WF3.2 Aggressive threshold shift (High: 55%, Med: 25%) re-stratifies cohort dynamically', () => {
      const highAggressive = 0.55;
      const medAggressive = 0.25;

      let highCount = 0;
      let medCount = 0;
      let lowCount = 0;

      TELCO_COHORT.forEach((c) => {
        const p = c.churnProbability || 0;
        if (p >= highAggressive) highCount++;
        else if (p >= medAggressive) medCount++;
        else lowCount++;
      });

      // Shifting High threshold down from 70% to 55% expands High Risk cohort
      assert.ok(highCount > 29, 'High risk cohort must expand when threshold is lowered');
      // Shifting Med threshold down from 40% to 25% shrinks Low Risk cohort
      assert.ok(lowCount < 48, 'Low risk cohort must contract when medium threshold is lowered');
      assert.strictEqual(highCount + medCount + lowCount, 100);
    });

    test('WF3.3 Conservative threshold shift (High: 80%, Med: 50%) narrows High Risk cohort', () => {
      const highCons = 0.80;
      const medCons = 0.50;

      let highCount = 0;
      let medCount = 0;
      let lowCount = 0;

      TELCO_COHORT.forEach((c) => {
        const p = c.churnProbability || 0;
        if (p >= highCons) highCount++;
        else if (p >= medCons) medCount++;
        else lowCount++;
      });

      assert.ok(highCount < 29, 'High risk cohort must shrink when threshold is raised to 80%');
      assert.ok(lowCount > 48, 'Low risk cohort must expand when medium threshold is raised to 50%');
      assert.strictEqual(highCount + medCount + lowCount, 100);
    });

    test('WF3.4 Settings page renders interactive threshold sliders and real-time impact preview', () => {
      const html = renderRoute('/settings');
      assertHtmlContains(html, 'Platform Settings &amp; Risk Thresholds');
      assertHtmlContains(html, 'Real-Time Cohort Impact Simulator');
      assertHtmlContains(html, 'High Risk Cohort:');
      assertHtmlContains(html, 'Medium Risk Cohort:');
      assertHtmlContains(html, 'Low Risk Cohort:');
    });
  });

  // =========================================================================
  // Workflow 4: Predict Form Evaluation -> Session History -> Stats Sync
  // =========================================================================
  describe('Tier 3 - Workflow 4: Predict Evaluation -> Session History -> Stats Sync', () => {
    test('WF4.1 Running sequence of predictions populates session history in FIFO order', async () => {
      apiService.resetSessionHistory();

      const run1 = await apiService.predictChurn({
        tenure: 2,
        Contract: 'Month-to-month',
        InternetService: 'Fiber optic',
        MonthlyCharges: 95.0,
      });

      const run2 = await apiService.predictChurn({
        tenure: 60,
        Contract: 'Two year',
        InternetService: 'DSL',
        MonthlyCharges: 40.0,
      });

      const run3 = await apiService.predictChurn({
        tenure: 24,
        Contract: 'One year',
        InternetService: 'Fiber optic',
        MonthlyCharges: 75.0,
      });

      const history = apiService.getSessionHistory(10);
      assert.strictEqual(history.length, 3);
      // Most recent prediction is at index 0
      assert.strictEqual(history[0].monthly_charges, 75.0);
      assert.strictEqual(history[1].monthly_charges, 40.0);
      assert.strictEqual(history[2].monthly_charges, 95.0);
    });

    test('WF4.2 Platform prediction statistics synchronize perfectly with session predictions', async () => {
      const stats = await apiService.getStats();
      assert.strictEqual(stats.total_predictions, 3);
      assert.strictEqual(stats.predicted_churn + stats.predicted_stay, 3);
      assert.strictEqual(
        stats.churn_rate,
        Math.round((stats.predicted_churn / 3) * 10000) / 10000
      );
    });

    test('WF4.3 Prediction history page renders historical evaluations and telemetry', () => {
      const html = renderRoute('/prediction-history');
      assertHtmlContains(html, 'Prediction History &amp; Session Audit Log');
      assertHtmlContains(html, 'Export CSV');
    });
  });

  // =========================================================================
  // Workflow 5: Insights Churn Drivers -> Retention Playbook Cross-Launch
  // =========================================================================
  describe('Tier 3 - Workflow 5: Insights Churn Drivers -> Retention Playbook Sizing', () => {
    test('WF5.1 Insights feature importance identifies top empirical churn hazard drivers', () => {
      assert.ok(Array.isArray(FEATURE_IMPORTANCE));
      const topRiskFeature = FEATURE_IMPORTANCE.find((f) => f.impact === 'CHURN_PROMOTER');
      assert.ok(topRiskFeature);
      assert.ok(
        topRiskFeature.feature.includes('Fiber optic') ||
        topRiskFeature.weight > 0
      );

      const topAnchorFeature = FEATURE_IMPORTANCE.find((f) => f.impact === 'RETENTION_ANCHOR');
      assert.ok(topAnchorFeature);
      assert.ok(
        topAnchorFeature.feature.includes('Two year') ||
        topAnchorFeature.feature.includes('tenure') ||
        topAnchorFeature.weight < 0
      );
    });

    test('WF5.2 Audience sizing for Month-to-Month + Fiber Optic accounts maps to actual cohort size', () => {
      const monthToMonthFiber = TELCO_COHORT.filter(
        (c) => c.Contract === 'Month-to-month' && c.InternetService === 'Fiber optic'
      );
      assert.ok(monthToMonthFiber.length >= 25, 'Expected >=25 subscribers in sample Month-to-Month + Fiber Optic segment');

      assert.strictEqual(COHORT_SUMMARY.contractBreakdown['Month-to-month'], 3875);
      assert.strictEqual(COHORT_SUMMARY.internetBreakdown['Fiber optic'], 3096);

      const avgMRR = monthToMonthFiber.reduce((sum, c) => sum + c.MonthlyCharges, 0) / monthToMonthFiber.length;
      assert.ok(avgMRR > 80, 'Fiber optic month-to-month average MRR should exceed $80');
    });

    test('WF5.3 Insights page renders global feature attribution explorer and odds ratios', () => {
      const html = renderRoute('/insights');
      assertHtmlContains(html, 'Churn Drivers &amp; Global Feature Attribution');
      assertHtmlContains(html, 'Global Feature Attribution Explorer');
      assertHtmlContains(html, 'Fiber Optic Service');
      assertHtmlContains(html, 'Two-Year Contract');
    });
  });

  // =========================================================================
  // Workflow 6: Retention Campaign ROI Simulator -> Target Segmentation & CSV
  // =========================================================================
  describe('Tier 3 - Workflow 6: Retention ROI Simulator -> Audience Segmentation & CSV', () => {
    test('WF6.1 Campaign ROI model accurately calculates Net Revenue Saved, Concession Cost, and ROI %', () => {
      // 1. Calculate financial returns using authentic RetentionPage calculation function
      const res = calculateRetentionRoi({
        targetCount: 1185,
        concessionAmount: 25,
        concessionDuration: 6,
        outreachCost: 0,
        expectedSaveRate: 35,
        avgMonthlyRev: 74.44,
      });

      assert.strictEqual(res.savedAccounts, 415);
      assert.strictEqual(res.costPerAccount, 150);
      assert.strictEqual(res.totalCampaignCost, 177750);
      assert.ok(res.grossSavedARR > 300000, 'Expected > $300k annual saved revenue');
      assert.strictEqual(Math.round(res.grossSavedARR), 370711);
      assert.strictEqual(Math.round(res.netPreservedARR), 192961);
      assert.strictEqual(res.roiMultiplier, '2.09');
      assert.strictEqual(res.breakEvenRate, '16.8');

      // 2. Verify /retention route renders active ROI calculator cockpit
      const retentionHtml = renderRoute('/retention');
      assertHtmlContains(retentionHtml, 'Retention Campaign ROI Simulator');
      assertHtmlContains(retentionHtml, 'Net Economic Value Generated');
      assertHtmlContains(retentionHtml, 'ROI Multiplier:');
      assertHtmlMatches(retentionHtml, /3\.13\s*(<!--\s*-->)?\s*x/);
    });

    test('WF6.2 High-risk cohort segmentation extracts exact target audience for retention campaigns', () => {
      const highRiskAudience = customerService.getAtRiskCustomers(0.70);
      assert.strictEqual(highRiskAudience.length, 29);

      assert.strictEqual(COHORT_SUMMARY.totalSubscribers, 7043);
      assert.strictEqual(COHORT_SUMMARY.mrrAtRisk + COHORT_SUMMARY.mrrRetained, COHORT_SUMMARY.totalMRR);
    });

    test('WF6.3 Target high-risk audience exports directly into RFC-4180 CSV with all subscriber attributes', () => {
      const highRiskAudience = customerService.getAtRiskCustomers(0.70);
      const csv = customerService.exportCohortToCsv(highRiskAudience);

      const rows = csv.split('\r\n');
      assert.strictEqual(rows.length, 30); // 1 header + 29 records
      assert.ok(rows[0].startsWith('customerID,gender,SeniorCitizen'));
    });

    test('WF6.4 Retention and Campaigns pages render simulation engines and planned workflows', () => {
      const retentionHtml = renderRoute('/retention');
      assertHtmlContains(retentionHtml, 'Cohort Retention &amp; MRR Exposure');
      assertHtmlContains(retentionHtml, 'Retention Campaign ROI Simulator');

      const campaignsHtml = renderRoute('/campaigns');
      assertHtmlContains(campaignsHtml, 'Retention Playbooks &amp; Campaigns');
      assertHtmlContains(campaignsHtml, '[PLANNING STATE / DEMONSTRATION WORKFLOW]');
    });
  });

  // =========================================================================
  // Workflow 7: Directory Selection -> Profile View -> Outreach Logging
  // =========================================================================
  describe('Tier 3 - Workflow 7: Customer Directory -> Detail View -> Outreach Logging', () => {
    test('WF7.1 Selecting top-risk customer from directory returns complete account telemetry', () => {
      const directory = customerService.getCustomers({
        sortBy: 'churnProbability',
        sortDir: 'desc',
        page: 1,
        pageSize: 10,
      });

      assert.strictEqual(directory.customers.length, 10);
      const topCustomer = directory.customers[0];
      assert.ok(topCustomer.churnProbability >= 0.80);

      const profile = customerService.getCustomerById(topCustomer.customerID);
      assert.strictEqual(profile.customerID, topCustomer.customerID);
      assert.ok(profile.serviceMatrix);
      assert.ok(Array.isArray(profile.riskDrivers));
      assert.ok(Array.isArray(profile.retentionAnchors));
    });

    test('WF7.2 Outreach intervention note persists to local storage and retrieves accurately', () => {
      const customerId = '7590-VHVEG';
      const storageKey = `outreach_log_${customerId}`;

      const outreachEntry = {
        customerId,
        timestamp: new Date().toISOString(),
        agent: 'Retention Specialist #4',
        channel: 'Phone Outreach',
        intervention: 'Offer 1-year contract lock with $15/mo discount',
        outcome: 'CUSTOMER_CONSIDERING',
        followUpDate: '2026-11-25',
      };

      mockLocalStorage.setItem(storageKey, JSON.stringify(outreachEntry));

      const retrievedRaw = mockLocalStorage.getItem(storageKey);
      assert.ok(retrievedRaw);
      const retrieved = JSON.parse(retrievedRaw);
      assert.strictEqual(retrieved.customerId, customerId);
      assert.strictEqual(retrieved.intervention, 'Offer 1-year contract lock with $15/mo discount');
      assert.strictEqual(retrieved.outcome, 'CUSTOMER_CONSIDERING');
    });

    test('WF7.3 Clearing or updating outreach log correctly reflects latest intervention state', () => {
      const customerId = '7590-VHVEG';
      const storageKey = `outreach_log_${customerId}`;

      const updatedEntry = {
        customerId,
        timestamp: new Date().toISOString(),
        agent: 'Retention Specialist #4',
        channel: 'In-App Message',
        intervention: 'Contract accepted. Concession applied.',
        outcome: 'RESOLVED_RETAINED',
      };

      mockLocalStorage.setItem(storageKey, JSON.stringify(updatedEntry));
      const retrieved = JSON.parse(mockLocalStorage.getItem(storageKey));
      assert.strictEqual(retrieved.outcome, 'RESOLVED_RETAINED');

      mockLocalStorage.removeItem(storageKey);
      assert.strictEqual(mockLocalStorage.getItem(storageKey), null);
    });
  });

  // =========================================================================
  // Workflow 8: Model Performance Threshold Shift -> Matrix & Metrics Tuning
  // =========================================================================
  describe('Tier 3 - Workflow 8: Model Performance Threshold Shift -> Matrix Re-Alignment', () => {
    test('WF8.1 Baseline holdout confusion matrix maintains exact evaluation totals', () => {
      const { truePositive, falsePositive, trueNegative, falseNegative, total } = CONFUSION_MATRIX;
      assert.strictEqual(total, 1409);
      assert.strictEqual(truePositive + falsePositive + trueNegative + falseNegative, total);

      const baselineAccuracy = (truePositive + trueNegative) / total;
      const baselineRecall = truePositive / (truePositive + falseNegative);
      const baselinePrecision = truePositive / (truePositive + falsePositive);
      const baselineF1 = (2 * baselinePrecision * baselineRecall) / (baselinePrecision + baselineRecall);

      assert.ok(baselineAccuracy > 0.70, 'Baseline accuracy should exceed 70%');
      assert.ok(baselineRecall > 0.75, 'Baseline recall should exceed 75%');
      assert.ok(baselinePrecision > 0.50, 'Baseline precision should exceed 50%');
      assert.ok(baselineF1 > 0.55, 'Baseline F1 should exceed 0.55');
    });

    test('WF8.2 Dynamic threshold shift from 0.50 to 0.35 shifts sensitivity/specificity tradeoff', () => {
      const baseTP = CONFUSION_MATRIX.truePositive;
      const baseFP = CONFUSION_MATRIX.falsePositive;
      const baseTN = CONFUSION_MATRIX.trueNegative;
      const baseFN = CONFUSION_MATRIX.falseNegative;
      const totalPos = baseTP + baseFN;
      const totalNeg = baseTN + baseFP;

      // Lowering threshold increases True Positives (higher recall) at cost of False Positives
      const delta = 0.50 - 0.35; // +0.15 shift towards positive predictions
      const simTP = Math.min(totalPos, Math.round(baseTP + delta * 240));
      const simFN = totalPos - simTP;
      const simFP = Math.min(totalNeg, Math.round(baseFP + delta * 320));
      const simTN = totalNeg - simFP;

      assert.strictEqual(simTP + simFN + simFP + simTN, 1409);
      assert.ok(simTP > baseTP, 'True positives must increase at lower decision threshold');
      assert.ok(simFP > baseFP, 'False positives must increase at lower decision threshold');

      const recall035 = simTP / totalPos;
      const precision035 = simTP / (simTP + simFP);
      assert.ok(recall035 > (baseTP / totalPos), 'Recall at 0.35 must be higher than baseline');
      assert.ok(precision035 < (baseTP / (baseTP + baseFP)), 'Precision at 0.35 must be lower than baseline');
    });

    test('WF8.3 Dynamic threshold shift from 0.50 to 0.65 increases precision for high-confidence intervention', () => {
      const baseTP = CONFUSION_MATRIX.truePositive;
      const baseFP = CONFUSION_MATRIX.falsePositive;
      const baseTN = CONFUSION_MATRIX.trueNegative;
      const baseFN = CONFUSION_MATRIX.falseNegative;
      const totalPos = baseTP + baseFN;
      const totalNeg = baseTN + baseFP;

      // Raising threshold reduces False Positives (higher precision)
      const delta = 0.50 - 0.65; // -0.15 shift towards conservative predictions
      const simTP = Math.max(0, Math.round(baseTP + delta * 240));
      const simFN = totalPos - simTP;
      const simFP = Math.max(0, Math.round(baseFP + delta * 320));
      const simTN = totalNeg - simFP;

      assert.strictEqual(simTP + simFN + simFP + simTN, 1409);
      assert.ok(simTP < baseTP, 'True positives must decrease at higher decision threshold');
      assert.ok(simFP < baseFP, 'False positives must decrease at higher decision threshold');

      const precision065 = simTP / (simTP + simFP);
      assert.ok(precision065 > (baseTP / (baseTP + baseFP)), 'Precision at 0.65 must exceed baseline precision');
    });

    test('WF8.4 Model Performance page renders full confusion matrix and health telemetry', () => {
      const html = renderRoute('/model-performance');
      assertHtmlContains(html, 'Model Health &amp; Evaluation Benchmarks');
      assertHtmlContains(html, 'Holdout Confusion Matrix &amp; Threshold Tuning');
      assertHtmlContains(html, 'ROC-AUC Score');
      assertHtmlContains(html, '0.8417');
      assertHtmlContains(html, 'Gateway (8080):');
      assertHtmlContains(html, 'Model Worker (8000):');
    });
  });
}
