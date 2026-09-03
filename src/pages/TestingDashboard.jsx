import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Play, 
  RefreshCw, 
  RotateCcw, 
  FileText, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronRight, 
  Layers, 
  ShieldAlert, 
  Terminal, 
  Sliders, 
  Activity, 
  Check, 
  Zap, 
  Sparkles,
  Download
} from 'lucide-react';

import { 
  runAllTests, 
  runCategoryTests, 
  runRegressionTests, 
  exportTestResultsCsv, 
  exportTestResultsJson 
} from '../testing/testRunner.js';
import { TEST_CATEGORIES, TEST_DEFINITIONS } from '../testing/testRegistry.js';
import { checkSystemHealth } from '../testing/systemHealth.js';
import { getStoredTestRuns, clearStoredTestRuns } from '../utils/storage.js';
import { getApiMode } from '../api/apiClient.js';

export default function TestingDashboard({
  onNavigateEndToEnd,
  onNavigateEdgeCases,
  onNavigateDataQuality,
  onNavigateConsistency,
  onNavigatePermissions,
  onNavigateRegression,
  onNavigateReport
}) {
  const [latestRun, setLatestRun] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(null);
  const [liveLogs, setLiveLogs] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRowId, setExpandedRowId] = useState(null);

  // Load previous run from storage on mount
  useEffect(() => {
    const runs = getStoredTestRuns();
    if (runs && runs.length > 0) {
      setLatestRun(runs[0]);
    }
    loadHealth();
  }, []);

  const loadHealth = async () => {
    const health = await checkSystemHealth();
    setSystemHealth(health);
  };

  const handleRunFullTest = async () => {
    setIsRunning(true);
    setLiveLogs([]);
    setProgress({ current: 0, total: TEST_DEFINITIONS.length, currentTestName: 'Initializing...', percentage: 0 });

    try {
      const runRecord = await runAllTests(
        (p) => setProgress(p),
        (log) => setLiveLogs(prev => [...prev.slice(-40), log])
      );
      setLatestRun(runRecord);
      await loadHealth();
    } catch (e) {
      console.error('Test run failed:', e);
    } finally {
      setIsRunning(false);
      setProgress(null);
    }
  };

  const handleRunRegression = async () => {
    setIsRunning(true);
    setLiveLogs([]);
    try {
      const runRecord = await runRegressionTests(
        (p) => setProgress(p),
        (log) => setLiveLogs(prev => [...prev.slice(-40), log])
      );
      setLatestRun(runRecord);
    } catch (e) {
      console.error('Regression run failed:', e);
    } finally {
      setIsRunning(false);
      setProgress(null);
    }
  };

  const handleClearResults = () => {
    if (window.confirm('Are you sure you want to clear all stored test run records?')) {
      clearStoredTestRuns();
      setLatestRun(null);
    }
  };

  const results = latestRun?.results || [];

  const filteredResults = results.filter(r => {
    const matchesCategory = selectedCategory === 'ALL' || r.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || r.status === selectedStatus;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
      r.id.toLowerCase().includes(q) || 
      r.name.toLowerCase().includes(q) || 
      r.description.toLowerCase().includes(q);
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const env = getApiMode().toUpperCase();

  return (
    <div className="page-wrapper testing-dashboard-page">
      {/* Sub-Navigation Bar */}
      <div className="metrics-subnav-bar flex items-center justify-between flex-wrap gap-2 mb-4 p-2 rounded bg-surface border border-subtle">
        <div className="flex items-center gap-1 flex-wrap">
          <button type="button" className="btn-primary btn-xs flex items-center gap-1">
            <Activity size={13} /> Dashboard
          </button>
          {onNavigateEndToEnd && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateEndToEnd}>
              <Play size={13} /> End-to-End Pipeline
            </button>
          )}
          {onNavigateEdgeCases && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateEdgeCases}>
              <Sliders size={13} /> 18 Edge Cases
            </button>
          )}
          {onNavigateDataQuality && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateDataQuality}>
              <Layers size={13} /> Data Quality
            </button>
          )}
          {onNavigateConsistency && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateConsistency}>
              <ShieldAlert size={13} /> Consistency
            </button>
          )}
          {onNavigatePermissions && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigatePermissions}>
              <CheckCircle2 size={13} /> Permissions (RBAC)
            </button>
          )}
          {onNavigateRegression && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateRegression}>
              <RotateCcw size={13} /> Regression Suite
            </button>
          )}
          {onNavigateReport && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateReport}>
              <FileText size={13} /> Test Report
            </button>
          )}
        </div>

        {/* Environment Indicator Pill (Section 29) */}
        <div className="flex items-center gap-2">
          <span className={`priority-pill font-mono font-bold text-2xs uppercase ${
            env === 'MOCK' ? 'badge-risk-low' : 'badge-risk-medium'
          }`}>
            Environment: {env}
          </span>
        </div>
      </div>

      {/* Hero Header */}
      <header className="page-header testing-header mb-4">
        <div className="header-container">
          <div className="header-badge-row">
            <span className="module-badge">
              <Activity size={13} /> Module 9: Verification & System Reliability
            </span>
          </div>
          <h1 className="page-title font-serif">System Validation & Testing</h1>
          <p className="page-description">
            Verify end-to-end correctness, reliability, edge case boundaries, and decision traceability across Modules 1 through 8.
          </p>
        </div>
      </header>

      {/* Global Actions Toolbar (Section 32) */}
      <div className="global-actions-card form-card mb-4 p-3 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            className="btn-primary btn-sm flex items-center gap-1.5 font-bold"
            onClick={handleRunFullTest}
            disabled={isRunning}
          >
            <Play size={13} className={isRunning ? 'animate-spin' : ''} />
            <span>{isRunning ? 'Executing Test Suite...' : 'RUN FULL SYSTEM TEST'}</span>
          </button>

          <button
            type="button"
            className="btn-secondary btn-sm flex items-center gap-1"
            onClick={handleRunRegression}
            disabled={isRunning}
          >
            <RotateCcw size={13} />
            <span>Run Regression</span>
          </button>

          {onNavigateEdgeCases && (
            <button
              type="button"
              className="btn-ghost btn-sm flex items-center gap-1"
              onClick={onNavigateEdgeCases}
            >
              <Sliders size={13} />
              <span>Run Edge Cases</span>
            </button>
          )}

          {onNavigateDataQuality && (
            <button
              type="button"
              className="btn-ghost btn-sm flex items-center gap-1"
              onClick={onNavigateDataQuality}
            >
              <Layers size={13} />
              <span>Run Data Quality</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {latestRun && (
            <>
              <button
                type="button"
                className="btn-ghost btn-xs flex items-center gap-1"
                onClick={() => exportTestResultsCsv(latestRun.results)}
              >
                <Download size={11} /> Export CSV
              </button>
              <button
                type="button"
                className="btn-ghost btn-xs flex items-center gap-1"
                onClick={() => exportTestResultsJson(latestRun)}
              >
                <Download size={11} /> Export JSON
              </button>
            </>
          )}
          <button
            type="button"
            className="btn-ghost btn-xs text-red-400 hover:text-red-300"
            onClick={handleClearResults}
          >
            Clear Results
          </button>
        </div>
      </div>

      {/* Progress Bar (Section 6) */}
      {isRunning && progress && (
        <div className="testing-progress-card form-card mb-4 border-primary p-3 text-xs">
          <div className="flex items-center justify-between mb-1.5 font-bold">
            <span className="text-primary-light flex items-center gap-1.5">
              <RefreshCw size={13} className="animate-spin" />
              <span>{progress.currentTestName}</span>
            </span>
            <span className="font-mono text-primary">{progress.current} / {progress.total} ({progress.percentage}%)</span>
          </div>
          <div className="w-full bg-surface rounded-full h-2 overflow-hidden border border-subtle">
            <div 
              className="bg-primary h-full transition-all duration-150" 
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Display Cards (Section 3): Total, Passed, Failed, Warnings, Blocked, Not Run, Pass Rate, Last Run */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 mb-4 text-xs">
        <div className="stat-card p-2 rounded bg-surface border border-subtle">
          <span className="text-dim text-3xs uppercase block">Total Tests</span>
          <span className="font-mono font-bold text-lg text-primary">
            {latestRun ? latestRun.total : TEST_DEFINITIONS.length}
          </span>
        </div>

        <div className="stat-card p-2 rounded bg-surface border border-subtle">
          <span className="text-dim text-3xs uppercase block">Passed</span>
          <span className="font-mono font-bold text-lg text-emerald-400">
            {latestRun ? latestRun.passed : '---'}
          </span>
        </div>

        <div className="stat-card p-2 rounded bg-surface border border-subtle">
          <span className="text-dim text-3xs uppercase block">Failed</span>
          <span className={`font-mono font-bold text-lg ${latestRun?.failed > 0 ? 'text-red-400' : 'text-dim'}`}>
            {latestRun ? latestRun.failed : '---'}
          </span>
        </div>

        <div className="stat-card p-2 rounded bg-surface border border-subtle">
          <span className="text-dim text-3xs uppercase block">Warnings</span>
          <span className="font-mono font-bold text-lg text-amber-300">
            {latestRun ? latestRun.warnings : '---'}
          </span>
        </div>

        <div className="stat-card p-2 rounded bg-surface border border-subtle">
          <span className="text-dim text-3xs uppercase block">Blocked</span>
          <span className="font-mono font-bold text-lg text-dim">
            {latestRun ? latestRun.blocked : '---'}
          </span>
        </div>

        <div className="stat-card p-2 rounded bg-surface border border-subtle">
          <span className="text-dim text-3xs uppercase block">Not Run</span>
          <span className="font-mono font-bold text-lg text-dim">
            {latestRun ? 0 : TEST_DEFINITIONS.length}
          </span>
        </div>

        <div className="stat-card p-2 rounded bg-surface border border-subtle">
          <span className="text-dim text-3xs uppercase block">Pass Rate</span>
          <span className="font-mono font-bold text-lg text-emerald-300">
            {latestRun ? `${latestRun.passRate}%` : 'NOT RUN'}
          </span>
        </div>

        <div className="stat-card p-2 rounded bg-surface border border-subtle">
          <span className="text-dim text-3xs uppercase block">Last Test Run</span>
          <span className="font-mono text-2xs text-secondary truncate block mt-1">
            {latestRun ? new Date(latestRun.completedAt).toLocaleTimeString() : 'NOT RUN'}
          </span>
        </div>
      </div>

      {/* System Health Panel (Section 26) */}
      {systemHealth && (
        <div className="form-card mb-4 text-xs">
          <div className="card-header border-bottom pb-2 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity size={15} className="text-emerald-400" />
                <h3 className="card-title text-sm">System Subsystems Health Monitor (10 Components)</h3>
              </div>
              <span className="badge-sla-on-track font-bold text-2xs">
                STATUS: {systemHealth.overallStatus}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {systemHealth.components.map(comp => (
              <div key={comp.id} className="p-2 rounded bg-surface border border-subtle">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-2xs truncate" title={comp.name}>{comp.name}</span>
                  <span className={`w-2 h-2 rounded-full ${
                    comp.status === 'HEALTHY' ? 'bg-emerald-400' :
                    comp.status === 'WARNING' ? 'bg-amber-400' : 'bg-red-400'
                  }`} />
                </div>
                <p className="text-dim text-3xs truncate">{comp.details}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="cases-filter-card form-card mb-4 p-3 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2 flex-grow max-w-sm">
          <Search size={14} className="text-dim" />
          <input
            type="text"
            className="form-input text-xs w-full"
            placeholder="Search tests by ID, name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            className="form-select text-xs"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="ALL">All Test Categories</option>
            {Object.values(TEST_CATEGORIES).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            className="form-select text-xs"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="PASS">PASS</option>
            <option value="FAIL">FAIL</option>
            <option value="WARNING">WARNING</option>
          </select>
        </div>
      </div>

      {/* Test Results Table with Expandable Rows (Section 23 & 24) */}
      <div className="form-card mb-4">
        <div className="card-header border-bottom pb-2 mb-3">
          <div className="flex items-center justify-between">
            <h3 className="card-title text-base">
              Test Execution Registry ({latestRun ? `${filteredResults.length} / ${results.length}` : `${TEST_DEFINITIONS.length} Available`})
            </h3>
            <span className="text-dim text-xs">Click row to inspect expected vs actual details</span>
          </div>
        </div>

        {!latestRun ? (
          <div className="p-8 text-center text-dim text-xs">
            <Play size={24} className="mx-auto mb-2 opacity-40" />
            <p className="font-bold text-secondary">No test runs recorded in this session.</p>
            <p className="text-2xs mt-1">Click &ldquo;RUN FULL SYSTEM TEST&rdquo; above to execute deterministic tests.</p>
          </div>
        ) : (
          <div className="pickup-table-wrapper">
            <table className="pickup-queue-table text-xs">
              <thead>
                <tr>
                  <th style={{ width: '32px' }}></th>
                  <th>Test ID</th>
                  <th>Test Name</th>
                  <th>Category</th>
                  <th>Module</th>
                  <th className="text-center">Severity</th>
                  <th className="text-center">Status</th>
                  <th className="text-right">Duration</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map(test => {
                  const isExpanded = expandedRowId === test.id;
                  return (
                    <React.Fragment key={test.id}>
                      <tr 
                        className="cursor-pointer hover:bg-surface" 
                        onClick={() => setExpandedRowId(isExpanded ? null : test.id)}
                      >
                        <td className="text-center text-dim">
                          {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        </td>
                        <td className="font-mono font-bold text-primary">{test.id}</td>
                        <td className="font-medium text-secondary">{test.name}</td>
                        <td className="text-dim">{test.category}</td>
                        <td><span className="badge-prototype-tag text-3xs">{test.relatedModule}</span></td>
                        <td className="text-center">
                          <span className={`priority-pill text-3xs ${
                            test.severity === 'CRITICAL' ? 'badge-risk-critical' :
                            test.severity === 'HIGH' ? 'badge-risk-high' : 'badge-risk-low'
                          }`}>
                            {test.severity}
                          </span>
                        </td>
                        <td className="text-center font-bold">
                          {test.status === 'PASS' ? (
                            <span className="badge-sla-on-track flex items-center justify-center gap-1">
                              <CheckCircle2 size={11} /> PASS
                            </span>
                          ) : (
                            <span className="badge-risk-critical flex items-center justify-center gap-1">
                              <XCircle size={11} /> FAIL
                            </span>
                          )}
                        </td>
                        <td className="text-right font-mono text-dim">{test.duration || 0}ms</td>
                      </tr>

                      {/* Expandable Test Detail Row (Section 23 & 24) */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={8} className="p-3 bg-surface border-top border-bottom">
                            <div className="space-y-2 text-xs">
                              <div>
                                <span className="text-dim text-3xs uppercase font-bold block">Description:</span>
                                <p className="text-secondary">{test.description}</p>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div className="p-2 rounded bg-card border border-subtle">
                                  <span className="text-dim text-3xs uppercase font-bold block text-emerald-400">Expected Contract:</span>
                                  <p className="font-mono text-3xs text-secondary mt-0.5">{test.expected}</p>
                                </div>
                                <div className="p-2 rounded bg-card border border-subtle">
                                  <span className="text-dim text-3xs uppercase font-bold block text-primary-light">Actual Observed:</span>
                                  <p className="font-mono text-3xs text-secondary mt-0.5">{test.actual}</p>
                                </div>
                              </div>

                              {test.error && (
                                <div className="p-2.5 rounded bg-red-950/40 border border-red-800 text-red-200">
                                  <strong className="block text-red-300 mb-0.5">Failure Diagnostic:</strong>
                                  <p className="font-mono text-3xs">{test.error}</p>
                                  {test.possibleCause && (
                                    <p className="text-3xs text-dim mt-1">
                                      <strong>Possible Cause:</strong> {test.possibleCause}
                                    </p>
                                  )}
                                  {test.suggestedInvestigation && (
                                    <p className="text-3xs text-dim">
                                      <strong>Suggested Action:</strong> {test.suggestedInvestigation}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Live Execution Logs Drawer (Section 30) */}
      {liveLogs.length > 0 && (
        <div className="form-card text-xs">
          <div className="card-header border-bottom pb-2 mb-2 flex items-center justify-between">
            <h4 className="font-bold text-xs text-secondary flex items-center gap-1.5">
              <Terminal size={13} className="text-primary-light" />
              <span>Live Test Execution Stream</span>
            </h4>
            <span className="text-dim text-3xs">{liveLogs.length} events logged</span>
          </div>
          <pre className="p-2.5 rounded bg-surface border border-subtle font-mono text-3xs text-secondary max-h-40 overflow-y-auto leading-relaxed">
            {liveLogs.join('\n')}
          </pre>
        </div>
      )}
    </div>
  );
}
