import React, { useState } from 'react';
import { 
  RotateCcw, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Activity, 
  Sliders, 
  Layers, 
  ShieldCheck, 
  FileText,
  Sparkles
} from 'lucide-react';
import { runRegressionTests } from '../testing/testRunner.js';
import { TEST_DEFINITIONS, TEST_CATEGORIES } from '../testing/testRegistry.js';

export default function RegressionTestView({
  onNavigateDashboard,
  onNavigateEndToEnd,
  onNavigateEdgeCases,
  onNavigateDataQuality,
  onNavigateConsistency,
  onNavigatePermissions,
  onNavigateReport
}) {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);

  const regressionDefs = TEST_DEFINITIONS.filter(t => t.category === TEST_CATEGORIES.REGRESSION);

  const handleRunRegression = async () => {
    setIsRunning(true);
    try {
      const runRecord = await runRegressionTests();
      setResults(runRecord.results);
    } catch (e) {
      console.error('Regression suite failed:', e);
    } finally {
      setIsRunning(false);
    }
  };

  const passCount = results ? results.filter(r => r.status === 'PASS').length : 0;

  return (
    <div className="page-wrapper regression-test-page">
      {/* Sub-Navigation Bar */}
      <div className="metrics-subnav-bar flex items-center justify-between flex-wrap gap-2 mb-4 p-2 rounded bg-surface border border-subtle">
        <div className="flex items-center gap-1 flex-wrap">
          {onNavigateDashboard && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateDashboard}>
              <Activity size={13} /> Dashboard
            </button>
          )}
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
              <ShieldCheck size={13} /> Consistency
            </button>
          )}
          {onNavigatePermissions && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigatePermissions}>
              <CheckCircle2 size={13} /> Permissions (RBAC)
            </button>
          )}
          <button type="button" className="btn-primary btn-xs flex items-center gap-1">
            <RotateCcw size={13} /> Regression Suite
          </button>
          {onNavigateReport && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateReport}>
              <FileText size={13} /> Test Report
            </button>
          )}
        </div>

        <button
          type="button"
          className="btn-primary btn-xs flex items-center gap-1.5 font-bold"
          onClick={handleRunRegression}
          disabled={isRunning}
        >
          <RotateCcw size={12} className={isRunning ? 'animate-spin' : ''} />
          <span>{isRunning ? 'Running Regression...' : 'RUN REGRESSION TESTS'}</span>
        </button>
      </div>

      {/* Hero Header */}
      <header className="page-header regression-header mb-4">
        <div className="header-container">
          <div className="header-badge-row">
            <span className="module-badge">
              <RotateCcw size={13} /> Module 9: Cross-Module Regression Protection (REG-001 to REG-010)
            </span>
          </div>
          <h1 className="page-title font-serif">Regression Test Suite</h1>
          <p className="page-description">
            Verify that foundational components across M1 through M8 continue functioning without unintended side-effects as new operational modules are layered on.
          </p>
        </div>
      </header>

      {/* Summary Box */}
      <div className="form-card mb-4 p-3 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div>
          <span className="text-dim text-3xs uppercase font-bold block">Regression Test Coverage</span>
          <span className="font-bold text-secondary text-sm">
            {results ? `${passCount} / ${regressionDefs.length} Tests Passed` : `${regressionDefs.length} Baseline Regression Tests Configured`}
          </span>
        </div>
        <span className={`priority-pill font-mono font-bold text-xs ${
          results && passCount === regressionDefs.length ? 'badge-risk-low' : 'badge-risk-medium'
        }`}>
          {results ? (passCount === regressionDefs.length ? '100% REGRESSION PASS' : 'REGRESSION WARNING') : 'READY TO EXECUTE'}
        </span>
      </div>

      {/* Regression Tests List */}
      <div className="form-card mb-4">
        <div className="card-header border-bottom pb-2 mb-3">
          <h3 className="card-title text-base">Regression Verification Matrix</h3>
        </div>

        <div className="pickup-table-wrapper">
          <table className="pickup-queue-table text-xs">
            <thead>
              <tr>
                <th>Test ID</th>
                <th>Target Feature & Module</th>
                <th>Description</th>
                <th className="text-center">Severity</th>
                <th className="text-center">Status</th>
                <th className="text-right">Observed Output</th>
              </tr>
            </thead>
            <tbody>
              {regressionDefs.map(def => {
                const res = results?.find(r => r.id === def.id);
                return (
                  <tr key={def.id}>
                    <td className="font-mono font-bold text-primary">{def.id}</td>
                    <td>
                      <strong className="text-secondary block">{def.name}</strong>
                      <span className="badge-prototype-tag text-3xs">{def.relatedModule}</span>
                    </td>
                    <td className="text-dim">{def.description}</td>
                    <td className="text-center">
                      <span className={`priority-pill font-mono text-3xs ${
                        def.severity === 'CRITICAL' ? 'badge-risk-critical' : 'badge-risk-high'
                      }`}>
                        {def.severity}
                      </span>
                    </td>
                    <td className="text-center">
                      {res ? (
                        res.status === 'PASS' ? (
                          <span className="badge-sla-on-track font-bold text-3xs inline-flex items-center gap-1">
                            <CheckCircle2 size={11} /> PASS
                          </span>
                        ) : (
                          <span className="badge-risk-critical font-bold text-3xs inline-flex items-center gap-1">
                            <XCircle size={11} /> FAIL
                          </span>
                        )
                      ) : (
                        <span className="text-dim font-mono text-3xs">NOT RUN</span>
                      )}
                    </td>
                    <td className="text-right font-mono text-secondary text-3xs">
                      {res ? `${res.actual} (${res.duration}ms)` : '---'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
