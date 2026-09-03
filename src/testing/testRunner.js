/**
 * Module 9: Central Test Runner Engine
 * Executes deterministic test suites, streams live progress/logs, and persists run history
 */

import { TEST_DEFINITIONS, TEST_CATEGORIES } from './testRegistry.js';
import { FIXTURES } from './fixtures.js';
import { getApiMode } from '../api/apiClient.js';
import { saveStoredTestRun, getStoredTestRuns } from '../utils/storage.js';

export async function executeTest(testDef, onLog = null) {
  const start = performance.now();
  const timestamp = new Date().toISOString();
  
  if (onLog) {
    onLog(`[${new Date().toLocaleTimeString()}] RUNNING ${testDef.id}: ${testDef.name}...`);
  }

  try {
    const output = await testDef.run();
    const duration = Math.round(performance.now() - start);

    if (onLog) {
      onLog(`[${new Date().toLocaleTimeString()}] PASS ${testDef.id} (${duration}ms)`);
    }

    return {
      id: testDef.id,
      name: testDef.name,
      category: testDef.category,
      relatedModule: testDef.relatedModule || 'Core',
      severity: testDef.severity || 'MEDIUM',
      description: testDef.description,
      expected: testDef.expected,
      actual: output?.actual || 'Verified as expected',
      status: 'PASS',
      error: null,
      timestamp,
      duration
    };
  } catch (err) {
    const duration = Math.round(performance.now() - start);

    if (onLog) {
      onLog(`[${new Date().toLocaleTimeString()}] FAIL ${testDef.id}: ${err.message} (${duration}ms)`);
    }

    return {
      id: testDef.id,
      name: testDef.name,
      category: testDef.category,
      relatedModule: testDef.relatedModule || 'Core',
      severity: testDef.severity || 'MEDIUM',
      description: testDef.description,
      expected: testDef.expected,
      actual: err.actual !== undefined ? JSON.stringify(err.actual) : 'Failed execution',
      status: 'FAIL',
      error: err.message || String(err),
      possibleCause: err.name === 'AssertionError' ? 'Assertion value mismatch against expected contract.' : 'Runtime error or service exception during test execution.',
      suggestedInvestigation: 'Verify input payload schema and service dependency state in corresponding module.',
      timestamp,
      duration
    };
  }
}

export async function runTestSuite(testsToRun, onProgress = null, onLog = null) {
  const startedAt = new Date().toISOString();
  const logs = [];
  const results = [];

  const logHandler = (msg) => {
    logs.push(msg);
    if (onLog) onLog(msg);
  };

  logHandler(`[${new Date().toLocaleTimeString()}] === TEST RUN INITIALIZED (${testsToRun.length} TESTS) ===`);
  const startTime = performance.now();

  for (let i = 0; i < testsToRun.length; i++) {
    const testDef = testsToRun[i];
    if (onProgress) {
      onProgress({
        current: i + 1,
        total: testsToRun.length,
        currentTestName: testDef.name,
        percentage: Math.round(((i + 1) / testsToRun.length) * 100)
      });
    }

    const res = await executeTest(testDef, logHandler);
    results.push(res);
    // Yield brief 15ms breathing room for UI updates
    await new Promise(r => setTimeout(r, 15));
  }

  const duration = Math.round(performance.now() - startTime);
  const completedAt = new Date().toISOString();

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warnings = results.filter(r => r.status === 'WARNING').length;
  const blocked = results.filter(r => r.status === 'BLOCKED').length;
  const passRate = testsToRun.length > 0 ? ((passed / testsToRun.length) * 100).toFixed(1) : '100.0';

  logHandler(`[${new Date().toLocaleTimeString()}] === TEST RUN COMPLETED: ${passed} PASSED, ${failed} FAILED (${duration}ms) ===`);

  const runRecord = {
    runId: `RUN-${Date.now()}`,
    startedAt,
    completedAt,
    duration,
    environment: getApiMode().toUpperCase(),
    total: testsToRun.length,
    passed,
    failed,
    warnings,
    blocked,
    passRate,
    results,
    logs
  };

  saveStoredTestRun(runRecord);
  return runRecord;
}

export async function runAllTests(onProgress = null, onLog = null) {
  return runTestSuite(TEST_DEFINITIONS, onProgress, onLog);
}

export async function runCategoryTests(category, onProgress = null, onLog = null) {
  const filtered = TEST_DEFINITIONS.filter(t => t.category === category);
  return runTestSuite(filtered, onProgress, onLog);
}

export async function runRegressionTests(onProgress = null, onLog = null) {
  return runCategoryTests(TEST_CATEGORIES.REGRESSION, onProgress, onLog);
}

export async function runBusinessRuleTests(onProgress = null, onLog = null) {
  return runCategoryTests(TEST_CATEGORIES.BUSINESS_RULES, onProgress, onLog);
}

/**
 * Client-Side Exporters
 */
export function exportTestResultsCsv(results, filename = 'test_results.csv') {
  if (!results || results.length === 0) return false;
  const headers = ['id', 'name', 'category', 'module', 'status', 'severity', 'duration_ms', 'expected', 'actual', 'error'];
  const rows = results.map(r => [
    `"${r.id}"`,
    `"${(r.name || '').replace(/"/g, '""')}"`,
    `"${r.category}"`,
    `"${r.relatedModule || ''}"`,
    `"${r.status}"`,
    `"${r.severity}"`,
    r.duration || 0,
    `"${(r.expected || '').replace(/"/g, '""')}"`,
    `"${(r.actual || '').replace(/"/g, '""')}"`,
    `"${(r.error || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}

export function exportTestResultsJson(runRecord, filename = 'test_run.json') {
  if (!runRecord) return false;
  const blob = new Blob([JSON.stringify(runRecord, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}
