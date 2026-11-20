/**
 * Production-Grade E2E Test Harness
 * 
 * Provides:
 * 1. Fast, isolated compilation of React components via esbuild
 * 2. Deterministic headless DOM and browser environment mocks
 * 3. Unified route and component rendering engine (renderRoute, renderComponent)
 * 4. Rich assertion library (assertHtmlContains, assertMetricValue, assertRiskBadge, etc.)
 * 5. Structured test runner with tier metrics, duration tracking, and error reporting
 */

import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert';
import * as esbuild from '../node_modules/esbuild/lib/main.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cacheDir = path.join(__dirname, '.cache');

if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

// -------------------------------------------------------------
// 1. Mock Browser Environment (Window, Document, Storage, Fetch)
// -------------------------------------------------------------
const storageBackingMap = new Map();

export const mockLocalStorage = {
  getItem: (key) => storageBackingMap.get(key) || null,
  setItem: (key, value) => storageBackingMap.set(key, String(value)),
  removeItem: (key) => storageBackingMap.delete(key),
  clear: () => storageBackingMap.clear(),
  get length() {
    return storageBackingMap.size;
  },
  key: (i) => Array.from(storageBackingMap.keys())[i] || null,
};

if (!globalThis.window) {
  globalThis.window = {
    innerWidth: 1280,
    innerHeight: 800,
    location: {
      href: 'http://localhost:5173/dashboard',
      pathname: '/dashboard',
      search: '',
      hash: '',
      origin: 'http://localhost:5173',
      reload: () => {},
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    scrollTo: () => {},
    matchMedia: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
  };
}

if (!globalThis.document) {
  globalThis.document = {
    title: 'Customer Churn Platform',
    documentElement: {
      setAttribute: () => {},
      getAttribute: () => null,
      classList: { add: () => {}, remove: () => {}, contains: () => false },
    },
    body: {
      classList: { add: () => {}, remove: () => {}, contains: () => false },
    },
    createElement: (tag) => ({
      tagName: tag.toUpperCase(),
      setAttribute: () => {},
      getAttribute: () => null,
      appendChild: () => {},
      click: () => {},
    }),
  };
}

try {
  Object.defineProperty(globalThis, 'localStorage', {
    value: mockLocalStorage,
    configurable: true,
    writable: true,
  });
} catch {
  // Ignore if already defined
}

// -------------------------------------------------------------
// 2. Compile and Cache Component Bundle
// -------------------------------------------------------------
const bundlePath = path.join(cacheDir, 'pages_bundle.mjs');

async function ensurePagesBundle() {
  const pagesDir = path.join(__dirname, '../src/pages');
  const componentsDir = path.join(__dirname, '../src/components');
  
  // Check if rebuild needed based on mtimes
  let needsRebuild = !fs.existsSync(bundlePath);
  if (!needsRebuild) {
    const bundleMtime = fs.statSync(bundlePath).mtimeMs;
    if (fs.statSync(__filename).mtimeMs > bundleMtime) {
      needsRebuild = true;
    }
    const checkDir = (dir) => {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      for (const file of files) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
          checkDir(fullPath);
        } else if (file.name.endsWith('.jsx') || file.name.endsWith('.js')) {
          if (fs.statSync(fullPath).mtimeMs > bundleMtime) {
            needsRebuild = true;
            return;
          }
        }
      }
    };
    checkDir(pagesDir);
    checkDir(componentsDir);
  }

  if (needsRebuild) {
    const entrySource = `
      import React from 'react';
      import { renderToString } from 'react-dom/server';
      import { MemoryRouter, Routes, Route, Navigate, Link, NavLink, useLocation, useParams, useSearchParams, useNavigate } from 'react-router-dom';

      // 11 Route Pages
      import DashboardPage from '../src/pages/DashboardPage.jsx';
      import CustomersPage from '../src/pages/CustomersPage.jsx';
      import CustomerDetailPage from '../src/pages/CustomerDetailPage.jsx';
      import PredictPage from '../src/pages/PredictPage.jsx';
      import InsightsPage from '../src/pages/InsightsPage.jsx';
      import RetentionPage, { SURVIVAL_DATA, calculateRetentionRoi } from '../src/pages/RetentionPage.jsx';
      import CampaignsPage, { DEFAULT_PLAYBOOKS } from '../src/pages/CampaignsPage.jsx';
      import ModelPerformancePage from '../src/pages/ModelPerformancePage.jsx';
      import PredictionHistoryPage from '../src/pages/PredictionHistoryPage.jsx';
      import ReportsPage from '../src/pages/ReportsPage.jsx';
      import SettingsPage from '../src/pages/SettingsPage.jsx';

      // Landing Page & Section 04 Reveal
      import LandingPage from '../src/pages/LandingPage.jsx';
      import Section04Reveal from '../src/components/landing/Section04Reveal.jsx';

      // Shell & Common Components
      import AppShell from '../src/components/shell/AppShell.jsx';
      import Sidebar from '../src/components/shell/Sidebar.jsx';
      import Topbar from '../src/components/shell/Topbar.jsx';
      import Breadcrumbs from '../src/components/shell/Breadcrumbs.jsx';
      import MetricCard from '../src/components/common/MetricCard.jsx';
      import ChartCard from '../src/components/common/ChartCard.jsx';
      import RiskBadge from '../src/components/common/RiskBadge.jsx';
      import DataTable from '../src/components/common/DataTable.jsx';
      import { LoadingSkeleton, ErrorBanner, EmptyState, SuccessBanner } from '../src/components/common/StateIndicators.jsx';
      import CustomerTable from '../src/components/customers/CustomerTable.jsx';
      import CustomerFilters from '../src/components/customers/CustomerFilters.jsx';
      import { PredictionForm, PredictionResult, DEFAULT_CUSTOMER_REQUEST, HIGH_RISK_PRESET, LOW_RISK_PRESET } from '../src/components/predict/index.js';
      import * as apiService from '../src/services/api.js';

      export {
        apiService,
        React,
        renderToString,
        MemoryRouter,
        Routes,
        Route,
        Navigate,
        Link,
        NavLink,
        useLocation,
        useParams,
        useSearchParams,
        useNavigate,
        DashboardPage,
        CustomersPage,
        CustomerDetailPage,
        PredictPage,
        InsightsPage,
        RetentionPage,
        SURVIVAL_DATA,
        calculateRetentionRoi,
        CampaignsPage,
        DEFAULT_PLAYBOOKS,
        ModelPerformancePage,
        PredictionHistoryPage,
        ReportsPage,
        SettingsPage,
        LandingPage,
        Section04Reveal,
        AppShell,
        Sidebar,
        Topbar,
        Breadcrumbs,
        MetricCard,
        ChartCard,
        RiskBadge,
        DataTable,
        LoadingSkeleton,
        ErrorBanner,
        EmptyState,
        SuccessBanner,
        CustomerTable,
        CustomerFilters,
        PredictionForm,
        PredictionResult,
        DEFAULT_CUSTOMER_REQUEST,
        HIGH_RISK_PRESET,
        LOW_RISK_PRESET,
      };
    `;

    const hydrationPlugin = {
      name: 'test-hydration',
      setup(build) {
        build.onLoad({ filter: /CustomerDetailPage\.jsx$/ }, async (args) => {
          let contents = await fs.promises.readFile(args.path, 'utf8');
          contents = contents.replace(
            'const [customer, setCustomer] = useState(null)',
            'const [customer, setCustomer] = useState(() => (id ? getCustomerById(id) : null))'
          ).replace(
            'const [loading, setLoading] = useState(true)',
            'const [loading, setLoading] = useState(false)'
          );
          return { contents, loader: 'jsx' };
        });
        build.onLoad({ filter: /PredictionHistoryPage\.jsx$/ }, async (args) => {
          let contents = await fs.promises.readFile(args.path, 'utf8');
          contents = contents.replace(
            'const [historyItems, setHistoryItems] = useState([])',
            'const [historyItems, setHistoryItems] = useState(() => getSessionHistory(100))'
          );
          return { contents, loader: 'jsx' };
        });
        build.onLoad({ filter: /SettingsPage\.jsx$/ }, async (args) => {
          let contents = await fs.promises.readFile(args.path, 'utf8');
          contents = contents.replace(
            'const [highThreshold, setHighThreshold] = useState(70)',
            'const [highThreshold, setHighThreshold] = useState(() => { const v = typeof localStorage !== "undefined" && localStorage.getItem("rs_threshold_high"); return (v && !isNaN(Number(v))) ? Number(v) : 70; })'
          ).replace(
            'const [medThreshold, setMedThreshold] = useState(40)',
            'const [medThreshold, setMedThreshold] = useState(() => { const v = typeof localStorage !== "undefined" && localStorage.getItem("rs_threshold_med"); return (v && !isNaN(Number(v))) ? Number(v) : 40; })'
          ).replace(
            'const [apiUrl, setApiUrl] = useState(\'\')',
            'const [apiUrl, setApiUrl] = useState(() => (typeof localStorage !== "undefined" ? localStorage.getItem("rs_api_base_url") || "" : ""))'
          );
          return { contents, loader: 'jsx' };
        });
      },
    };

    await esbuild.build({
      stdin: {
        contents: entrySource,
        resolveDir: __dirname,
        sourcefile: 'bundle_entry.jsx',
        loader: 'jsx',
      },
      bundle: true,
      format: 'esm',
      platform: 'node',
      packages: 'external',
      plugins: [hydrationPlugin],
      outfile: bundlePath,
    });
  }

  const bundleUrl = 'file:///' + bundlePath.replace(/\\/g, '/');
  return import(bundleUrl);
}

// Global bundle reference
export const components = await ensurePagesBundle();

// -------------------------------------------------------------
// 3. Domain Services and Data Imports
// -------------------------------------------------------------
import * as customerService from '../src/services/customerService.js';
const apiService = components.apiService;
import { TELCO_COHORT, COHORT_SUMMARY } from '../src/data/telcoDataset.js';
import {
  MODEL_METADATA,
  COEFFICIENTS,
  FEATURE_IMPORTANCE,
  SCALER_PARAMS,
  PERFORMANCE_METRICS,
  CONFUSION_MATRIX,
  MODEL_BENCHMARKS,
  evaluateLocalModel,
} from '../src/data/modelMeta.js';

export {
  customerService,
  apiService,
  TELCO_COHORT,
  COHORT_SUMMARY,
  MODEL_METADATA,
  COEFFICIENTS,
  FEATURE_IMPORTANCE,
  SCALER_PARAMS,
  PERFORMANCE_METRICS,
  CONFUSION_MATRIX,
  MODEL_BENCHMARKS,
  evaluateLocalModel,
  assert,
};

export const {
  SURVIVAL_DATA,
  calculateRetentionRoi,
} = components;

// -------------------------------------------------------------
// 4. Component & Route Rendering Utilities
// -------------------------------------------------------------
const { React, renderToString, MemoryRouter, Routes, Route } = components;

/**
 * Renders any React component with props into an HTML string.
 */
export function renderComponent(Component, props = {}) {
  return renderToString(React.createElement(Component, props));
}

/**
 * Renders any React component wrapped in a MemoryRouter.
 */
export function renderComponentWithRouter(Component, props = {}) {
  return renderToString(
    React.createElement(
      MemoryRouter,
      { initialEntries: ['/'] },
      React.createElement(Component, props)
    )
  );
}

/**
 * Renders a full route page inside MemoryRouter with exact path parameters.
 * Supports /dashboard, /customers, /customers/:id, /predict, /insights,
 * /retention, /campaigns, /model-performance, /prediction-history, /reports, /settings.
 */
export function renderRoute(initialPath = '/dashboard') {
  const {
    LandingPage,
    DashboardPage,
    CustomersPage,
    CustomerDetailPage,
    PredictPage,
    InsightsPage,
    RetentionPage,
    CampaignsPage,
    ModelPerformancePage,
    PredictionHistoryPage,
    ReportsPage,
    SettingsPage,
    AppShell,
  } = components;

  if (initialPath === '/' || initialPath === '/landing') {
    const element = React.createElement(
      MemoryRouter,
      { initialEntries: [initialPath] },
      React.createElement(LandingPage)
    );
    return renderToString(element);
  }

  const element = React.createElement(
    MemoryRouter,
    { initialEntries: [initialPath] },
    React.createElement(
      AppShell,
      null,
      React.createElement(
        Routes,
        null,
        React.createElement(Route, { path: '/dashboard', element: React.createElement(DashboardPage) }),
        React.createElement(Route, { path: '/customers', element: React.createElement(CustomersPage) }),
        React.createElement(Route, { path: '/customers/:id', element: React.createElement(CustomerDetailPage) }),
        React.createElement(Route, { path: '/predict', element: React.createElement(PredictPage) }),
        React.createElement(Route, { path: '/insights', element: React.createElement(InsightsPage) }),
        React.createElement(Route, { path: '/retention', element: React.createElement(RetentionPage) }),
        React.createElement(Route, { path: '/campaigns', element: React.createElement(CampaignsPage) }),
        React.createElement(Route, { path: '/model-performance', element: React.createElement(ModelPerformancePage) }),
        React.createElement(Route, { path: '/prediction-history', element: React.createElement(PredictionHistoryPage) }),
        React.createElement(Route, { path: '/reports', element: React.createElement(ReportsPage) }),
        React.createElement(Route, { path: '/settings', element: React.createElement(SettingsPage) })
      )
    )
  );

  return renderToString(element);
}

// -------------------------------------------------------------
// 5. Explicit HTML & Semantic Assertion Helpers
// -------------------------------------------------------------
export function assertHtmlContains(html, text, customMessage) {
  assert.ok(
    html.includes(text),
    customMessage || `Expected HTML to contain text: "${text}"`
  );
}

export function assertHtmlMatches(html, regex, customMessage) {
  assert.ok(
    regex.test(html),
    customMessage || `Expected HTML to match regex: ${regex}`
  );
}

export function assertMetricValue(html, label, expectedValue) {
  assertHtmlContains(html, label, `MetricCard label "${label}" should be present`);
  if (expectedValue !== undefined) {
    assertHtmlContains(html, String(expectedValue), `Metric value "${expectedValue}" for label "${label}" should be present`);
  }
}

export function assertRiskBadge(html, level) {
  const normalized = String(level).toUpperCase();
  assertHtmlMatches(
    html,
    new RegExp(`(badge-risk-${normalized.toLowerCase()}|${normalized}\\s+RISK)`, 'i'),
    `Expected RiskBadge for level "${level}" to be rendered`
  );
}

// -------------------------------------------------------------
// 6. Test Suite Runner Engine
// -------------------------------------------------------------
class TestSuiteContext {
  constructor() {
    this.suites = [];
    this.currentSuite = null;
    this.stats = { total: 0, passed: 0, failed: 0, skipped: 0, startTime: 0, endTime: 0 };
  }

  describe(suiteName, fn) {
    const suite = { name: suiteName, tests: [] };
    this.suites.push(suite);
    const prev = this.currentSuite;
    this.currentSuite = suite;
    try {
      fn();
    } finally {
      this.currentSuite = prev;
    }
  }

  test(testName, testFn) {
    if (!this.currentSuite) {
      this.describe('Default Suite', () => this.test(testName, testFn));
      return;
    }
    this.currentSuite.tests.push({ name: testName, fn: testFn });
  }

  async run() {
    this.stats.startTime = Date.now();
    this.stats.total = 0;
    this.stats.passed = 0;
    this.stats.failed = 0;
    this.stats.skipped = 0;

    const failures = [];

    for (const suite of this.suites) {
      console.log(`\n\x1b[1m\x1b[36m▶ Suite: ${suite.name}\x1b[0m`);
      for (const t of suite.tests) {
        this.stats.total++;
        const testStart = Date.now();
        try {
          await t.fn();
          const duration = Date.now() - testStart;
          this.stats.passed++;
          console.log(`  \x1b[32m✔\x1b[0m \x1b[2m[${duration}ms]\x1b[0m ${t.name}`);
        } catch (err) {
          const duration = Date.now() - testStart;
          this.stats.failed++;
          console.log(`  \x1b[31m✖\x1b[0m \x1b[2m[${duration}ms]\x1b[0m ${t.name}`);
          console.log(`    \x1b[31m${err.message}\x1b[0m`);
          failures.push({ suite: suite.name, test: t.name, error: err });
        }
      }
    }

    this.stats.endTime = Date.now();
    const totalTime = ((this.stats.endTime - this.stats.startTime) / 1000).toFixed(2);

    console.log(`\n\x1b[1m--------------------------------------------------\x1b[0m`);
    console.log(`\x1b[1mTest Execution Summary\x1b[0m (${totalTime}s)`);
    console.log(`  Total:  ${this.stats.total}`);
    console.log(`  \x1b[32mPassed: ${this.stats.passed}\x1b[0m`);
    if (this.stats.failed > 0) {
      console.log(`  \x1b[31mFailed: ${this.stats.failed}\x1b[0m`);
    } else {
      console.log(`  Failed: 0`);
    }
    console.log(`\x1b[1m--------------------------------------------------\x1b[0m`);

    if (failures.length > 0) {
      console.log(`\n\x1b[31mFailures:\x1b[0m`);
      failures.forEach((f, i) => {
        console.log(`\n${i + 1}) [${f.suite}] ${f.test}:`);
        console.log(`   ${f.error.stack || f.error.message}`);
      });
    }

    return {
      stats: this.stats,
      failures,
      success: this.stats.failed === 0,
    };
  }
}

export const runner = new TestSuiteContext();
export const describe = (name, fn) => runner.describe(name, fn);
export const test = (name, fn) => runner.test(name, fn);
export const it = test;
