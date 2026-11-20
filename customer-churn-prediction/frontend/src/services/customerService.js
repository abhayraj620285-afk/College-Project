/**
 * Customer Query & Intelligence Service
 * Provides filtering, searching, sorting, pagination, and cohort metrics
 * over the ground-truth Telco subscriber cohort.
 */

import { TELCO_COHORT, COHORT_SUMMARY } from '../data/telcoDataset.js';

/**
 * Query customer directory with search, filtering, sorting, and pagination.
 */
export function getCustomers({
  page = 1,
  pageSize = 25,
  search = '',
  contract = 'ALL',
  internetService = 'ALL',
  riskTier = 'ALL',
  churnStatus = 'ALL',
  sortBy = 'customerID',
  sortDir = 'asc',
} = {}) {
  const cleanSearch = String(search || '').trim().toLowerCase();
  const cleanContract = String(contract || 'ALL').trim();
  const cleanInternet = String(internetService || 'ALL').trim();
  const cleanRisk = String(riskTier || 'ALL').trim().toUpperCase();
  const cleanChurn = String(churnStatus || 'ALL').trim();

  // 1. Filter pipeline
  let filtered = TELCO_COHORT.filter((c) => {
    // Contract filter
    if (cleanContract !== 'ALL' && c.Contract !== cleanContract) {
      return false;
    }

    // Internet service filter
    if (cleanInternet !== 'ALL' && c.InternetService !== cleanInternet) {
      return false;
    }

    // Risk tier filter
    if (cleanRisk !== 'ALL' && c.riskLevel !== cleanRisk) {
      return false;
    }

    // Ground truth churn filter (supports 'Active'/'No' and 'Churned'/'Yes')
    if (cleanChurn !== 'ALL') {
      const target = (cleanChurn === 'Churned' || cleanChurn === 'Yes')
        ? 'Yes'
        : (cleanChurn === 'Active' || cleanChurn === 'No')
        ? 'No'
        : cleanChurn;
      if (c.Churn !== target) return false;
    }

    // Search query across ID, Payment, Contract, Internet
    if (cleanSearch) {
      const matchId = c.customerID.toLowerCase().includes(cleanSearch);
      const matchContract = c.Contract.toLowerCase().includes(cleanSearch);
      const matchPayment = c.PaymentMethod.toLowerCase().includes(cleanSearch);
      const matchInternet = c.InternetService.toLowerCase().includes(cleanSearch);
      if (!matchId && !matchContract && !matchPayment && !matchInternet) {
        return false;
      }
    }

    return true;
  });

  // 2. Sorting pipeline
  const dir = sortDir === 'desc' ? -1 : 1;
  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'tenure':
        return (Number(a.tenure || 0) - Number(b.tenure || 0)) * dir;
      case 'MonthlyCharges':
      case 'monthlyCharges':
        return (Number(a.MonthlyCharges || 0) - Number(b.MonthlyCharges || 0)) * dir;
      case 'TotalCharges':
      case 'totalCharges':
        return (Number(a.TotalCharges || 0) - Number(b.TotalCharges || 0)) * dir;
      case 'churnProbability':
      case 'riskScore':
        return (Number(a.churnProbability || 0) - Number(b.churnProbability || 0)) * dir;
      case 'Contract':
      case 'contract':
        return String(a.Contract || '').localeCompare(String(b.Contract || '')) * dir;
      case 'Churn':
      case 'churn':
        return String(a.Churn || '').localeCompare(String(b.Churn || '')) * dir;
      case 'riskLevel': {
        const riskRank = { HIGH: 3, MEDIUM: 2, LOW: 1, UNKNOWN: 0 };
        const aRank = riskRank[String(a.riskLevel || '').toUpperCase()] || 0;
        const bRank = riskRank[String(b.riskLevel || '').toUpperCase()] || 0;
        const diff = aRank - bRank;
        if (diff !== 0) {
          return diff * dir;
        }
        return (Number(a.churnProbability || 0) - Number(b.churnProbability || 0)) * dir;
      }
      case 'customerID':
      default:
        return String(a.customerID || '').localeCompare(String(b.customerID || '')) * dir;
    }
  });

  // 3. Pagination calculation
  const total = filtered.length;
  const safePageSize = Math.max(5, Math.min(Number(pageSize) || 25, 100));
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const safePage = Math.max(1, Math.min(Number(page) || 1, totalPages));

  const startIndex = (safePage - 1) * safePageSize;
  const paginatedItems = filtered.slice(startIndex, startIndex + safePageSize);

  return {
    customers: paginatedItems,
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages,
  };
}

/**
 * Retrieve single customer profile by customerID with enriched attributes.
 */
export function getCustomerById(id) {
  if (!id) return null;
  const cleanId = String(id).trim().toUpperCase();

  const customer = TELCO_COHORT.find(
    (c) => c.customerID.toUpperCase() === cleanId
  );

  if (!customer) return null;

  // Enrich with service matrix breakdown
  const serviceMatrix = {
    phone: customer.PhoneService === 'Yes',
    multipleLines: customer.MultipleLines,
    internet: customer.InternetService,
    onlineSecurity: customer.OnlineSecurity,
    onlineBackup: customer.OnlineBackup,
    deviceProtection: customer.DeviceProtection,
    techSupport: customer.TechSupport,
    streamingTV: customer.StreamingTV,
    streamingMovies: customer.StreamingMovies,
  };

  // Derive top positive churn risk drivers and retention anchors
  const riskDrivers = [];
  const retentionAnchors = [];

  if (customer.Contract === 'Month-to-month') {
    riskDrivers.push({ name: 'Month-to-month contract', impact: 'HIGH', note: 'No contract lock-in' });
  } else if (customer.Contract === 'Two year') {
    retentionAnchors.push({ name: 'Two-year long-term agreement', impact: 'STRONG', note: 'Highest retention coefficient' });
  } else if (customer.Contract === 'One year') {
    retentionAnchors.push({ name: 'One-year annual contract', impact: 'MODERATE', note: 'Strong retention anchor' });
  }

  if (customer.InternetService === 'Fiber optic') {
    riskDrivers.push({ name: 'Fiber optic service line', impact: 'HIGH', note: 'Higher hazard category in cohort' });
  }

  if (customer.PaymentMethod === 'Electronic check') {
    riskDrivers.push({ name: 'Electronic check payment', impact: 'MEDIUM', note: 'High friction payment method' });
  } else if (customer.PaymentMethod.includes('automatic')) {
    retentionAnchors.push({ name: 'Automated recurring billing', impact: 'POSITIVE', note: 'Low payment friction' });
  }

  if (customer.tenure <= 6) {
    riskDrivers.push({ name: `Early lifecycle tenure (${customer.tenure} mo)`, impact: 'HIGH', note: 'Greatest churn susceptibility' });
  } else if (customer.tenure >= 36) {
    retentionAnchors.push({ name: `Established account tenure (${customer.tenure} mo)`, impact: 'STRONG', note: 'Deep account tenure loyalty' });
  }

  if (customer.OnlineSecurity === 'Yes') {
    retentionAnchors.push({ name: 'Active online security suite', impact: 'MODERATE', note: 'Reduces churn hazard by 28%' });
  }
  if (customer.TechSupport === 'Yes') {
    retentionAnchors.push({ name: 'Dedicated technical support', impact: 'MODERATE', note: 'Reduces service frustration' });
  }

  return {
    ...customer,
    serviceMatrix,
    riskDrivers,
    retentionAnchors,
    // Match CustomerDetailPage expected property names
    predictedProbability: customer.churnProbability,
    actualChurn: customer.Churn,
  };
}

/**
 * Return platform aggregate metrics and cohort distributions.
 */
export function getCohortStats() {
  const cohortHigh = TELCO_COHORT.filter((c) => c.riskLevel === 'HIGH').length;
  const cohortMedium = TELCO_COHORT.filter((c) => c.riskLevel === 'MEDIUM').length;
  const cohortLow = TELCO_COHORT.filter((c) => c.riskLevel === 'LOW').length;

  return {
    ...COHORT_SUMMARY,
    cohortSize: TELCO_COHORT.length,
    cohortRiskDistribution: {
      HIGH: cohortHigh,
      MEDIUM: cohortMedium,
      LOW: cohortLow,
    },
  };
}

/**
 * Returns customers with churn probability >= threshold (default 70%).
 */
export function getAtRiskCustomers(minProbability = 0.70) {
  return TELCO_COHORT.filter((c) => (c.churnProbability || 0) >= minProbability);
}

/**
 * Convert customer records array into an RFC 4180 compliant CSV string.
 */
export function exportCohortToCsv(customers = TELCO_COHORT) {
  if (!customers || customers.length === 0) return '';

  const headers = [
    'customerID',
    'gender',
    'SeniorCitizen',
    'Partner',
    'Dependents',
    'tenure',
    'PhoneService',
    'MultipleLines',
    'InternetService',
    'OnlineSecurity',
    'OnlineBackup',
    'DeviceProtection',
    'TechSupport',
    'StreamingTV',
    'StreamingMovies',
    'Contract',
    'PaperlessBilling',
    'PaymentMethod',
    'MonthlyCharges',
    'TotalCharges',
    'ActualChurn',
    'PredictedChurn',
    'ChurnProbability',
    'RiskLevel',
  ];

  const escapeCsv = (val) => {
    if (typeof val === 'number' && !Number.isNaN(val)) return val;
    const escaped = String(val ?? '').replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const rows = customers.map((c) => [
    escapeCsv(c.customerID),
    escapeCsv(c.gender),
    c.SeniorCitizen,
    escapeCsv(c.Partner),
    escapeCsv(c.Dependents),
    c.tenure,
    escapeCsv(c.PhoneService),
    escapeCsv(c.MultipleLines),
    escapeCsv(c.InternetService),
    escapeCsv(c.OnlineSecurity),
    escapeCsv(c.OnlineBackup),
    escapeCsv(c.DeviceProtection),
    escapeCsv(c.TechSupport),
    escapeCsv(c.StreamingTV),
    escapeCsv(c.StreamingMovies),
    escapeCsv(c.Contract),
    escapeCsv(c.PaperlessBilling),
    escapeCsv(c.PaymentMethod),
    c.MonthlyCharges,
    c.TotalCharges,
    escapeCsv(c.Churn),
    escapeCsv(c.predictedChurn),
    c.churnProbability,
    escapeCsv(c.riskLevel),
  ].join(','));

  return [headers.join(','), ...rows].join('\r\n');
}
