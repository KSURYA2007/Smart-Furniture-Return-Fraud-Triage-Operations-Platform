import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Activity, 
  Play, 
  Sliders, 
  Layers, 
  FileText 
} from 'lucide-react';
import { runConsistencyCheck } from '../testing/dataQuality.js';

export default function ConsistencyView({
  onNavigateDashboard,
  onNavigateEndToEnd,
  onNavigateEdgeCases,
  onNavigateDataQuality,
  onNavigateReport
}) {
  const [report, setReport] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  const loadCheck = () => {
    setIsChecking(true);
    setTimeout(() => {
      const res = runConsistencyCheck();
      setReport(res);
      setIsChecking(false);
    }, 150);
  };

  useEffect(() => {
    loadCheck();
  }, []);

  if (!report) return null;

  return (
    <div className="page-wrapper consistency-page">
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
          <button type="button" className="btn-primary btn-xs flex items-center gap-1">
            <ShieldAlert size={13} /> Consistency
          </button>
          {onNavigateReport && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateReport}>
              <FileText size={13} /> Test Report
            </button>
          )}
        </div>

        <button
          type="button"
          className="btn-secondary btn-xs flex items-center gap-1"
          onClick={loadCheck}
          disabled={isChecking}
        >
          <RefreshCw size={11} className={isChecking ? 'animate-spin' : ''} />
          <span>Re-verify Linkages</span>
        </button>
      </div>

      {/* Hero Header */}
      <header className="page-header consistency-header mb-4">
        <div className="header-container">
          <div className="header-badge-row">
            <span className="module-badge">
              <ShieldAlert size={13} /> Module 9: Cross-Module Relational Integrity
            </span>
          </div>
          <h1 className="page-title font-serif">Cross-Module Consistency Verification</h1>
          <p className="page-description">
            Verify that entity states across Intake, Customer History, Evidence, Risk Engine, Human Review, and Pickup Operations stay synchronized without conflicting states.
          </p>
        </div>
      </header>

      {/* Overall Status Banner */}
      <div className={`p-4 rounded border mb-4 text-xs flex items-center justify-between flex-wrap gap-2 ${
        report.overallStatus === 'PASS' ? 'bg-emerald-bg border-emerald-border' : 'bg-amber-bg border-amber-border'
      }`}>
        <div className="flex items-center gap-2">
          {report.overallStatus === 'PASS' ? (
            <CheckCircle2 size={18} className="text-emerald-400" />
          ) : (
            <AlertTriangle size={18} className="text-amber-400" />
          )}
          <div>
            <strong className="text-secondary block">
              Cross-Module Consistency Status: {report.overallStatus}
            </strong>
            <span className="text-dim text-3xs">All relational linkages and business authority rules validated.</span>
          </div>
        </div>
        <span className="text-dim font-mono text-3xs">Checked at: {new Date(report.checkedAt).toLocaleTimeString()}</span>
      </div>

      {/* Consistency Checks Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-xs">
        {report.checks.map((c, idx) => (
          <div key={idx} className="form-card p-3 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {c.status === 'PASS' ? (
                  <CheckCircle2 size={14} className="text-emerald-400" />
                ) : (
                  <XCircle size={14} className="text-red-400" />
                )}
                <h4 className="font-bold text-xs text-secondary">{c.name}</h4>
              </div>
              <p className="text-dim text-xs leading-relaxed">{c.details}</p>
            </div>

            <span className={`priority-pill font-mono font-bold text-3xs ${
              c.status === 'PASS' ? 'badge-risk-low' : 'badge-risk-critical'
            }`}>
              {c.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
