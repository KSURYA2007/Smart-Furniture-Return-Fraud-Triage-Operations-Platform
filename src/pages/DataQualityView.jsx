import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Search, 
  Filter, 
  Activity, 
  Play, 
  Sliders, 
  FileText 
} from 'lucide-react';
import { runDataQualityAudit } from '../testing/dataQuality.js';

export default function DataQualityView({
  onNavigateDashboard,
  onNavigateEndToEnd,
  onNavigateEdgeCases,
  onNavigateConsistency,
  onNavigateReport
}) {
  const [audit, setAudit] = useState(null);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const loadAudit = () => {
    setIsScanning(true);
    setTimeout(() => {
      const res = runDataQualityAudit();
      setAudit(res);
      setIsScanning(false);
    }, 150);
  };

  useEffect(() => {
    loadAudit();
  }, []);

  if (!audit) return null;

  const filteredIssues = audit.issues.filter(i => {
    const matchesSev = severityFilter === 'ALL' || i.severity === severityFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || i.returnId.toLowerCase().includes(q) || i.field.toLowerCase().includes(q) || i.message.toLowerCase().includes(q);
    return matchesSev && matchesSearch;
  });

  return (
    <div className="page-wrapper data-quality-page">
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
          <button type="button" className="btn-primary btn-xs flex items-center gap-1">
            <Layers size={13} /> Data Quality
          </button>
          {onNavigateConsistency && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateConsistency}>
              <ShieldAlert size={13} /> Consistency
            </button>
          )}
          {onNavigateReport && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateReport}>
              <FileText size={13} /> Test Report
            </button>
          )}
        </div>

        <button
          type="button"
          className="btn-secondary btn-xs flex items-center gap-1"
          onClick={loadAudit}
          disabled={isScanning}
        >
          <RefreshCw size={11} className={isScanning ? 'animate-spin' : ''} />
          <span>Re-scan Records</span>
        </button>
      </div>

      {/* Hero Header */}
      <header className="page-header dq-header mb-4">
        <div className="header-container">
          <div className="header-badge-row">
            <span className="module-badge">
              <Layers size={13} /> Module 9: Data Quality & Schema Hygiene
            </span>
          </div>
          <h1 className="page-title font-serif">Data Quality & Completeness Audit</h1>
          <p className="page-description">
            Audit stored return records for mandatory attributes, orphaned entity keys, broken relations, and invalid status values.
          </p>
        </div>
      </header>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4 text-xs">
        <div className="stat-card p-3 rounded bg-surface border border-subtle">
          <span className="text-dim text-3xs uppercase block font-bold">Total Stored Records:</span>
          <span className="text-xl font-mono font-bold text-primary">{audit.totalReturns}</span>
          <span className="text-dim text-3xs block">Across all active claims</span>
        </div>

        <div className="stat-card p-3 rounded bg-surface border border-subtle">
          <span className="text-dim text-3xs uppercase font-bold block">Complete Records:</span>
          <span className="text-xl font-mono font-bold text-emerald-400">{audit.completeReturns}</span>
          <span className="text-dim text-3xs block">Zero missing mandatory fields</span>
        </div>

        <div className="stat-card p-3 rounded bg-surface border border-subtle">
          <span className="text-dim text-3xs uppercase font-bold block">Incomplete Records:</span>
          <span className={`text-xl font-mono font-bold ${audit.incompleteReturns > 0 ? 'text-amber-300' : 'text-emerald-400'}`}>
            {audit.incompleteReturns}
          </span>
          <span className="text-dim text-3xs block">Require data hygiene fix</span>
        </div>

        <div className="stat-card p-3 rounded bg-surface border border-subtle">
          <span className="text-dim text-3xs uppercase font-bold block">Completeness Rate:</span>
          <span className="text-xl font-mono font-bold text-emerald-300">{audit.completenessRate}%</span>
          <span className="text-dim text-3xs block">Quality score</span>
        </div>

        <div className="stat-card p-3 rounded bg-surface border border-subtle">
          <span className="text-dim text-3xs uppercase font-bold block">Critical Issues:</span>
          <span className={`text-xl font-mono font-bold ${audit.severityCounts.CRITICAL > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {audit.severityCounts.CRITICAL}
          </span>
          <span className="text-dim text-3xs block">Blockers detected</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="cases-filter-card form-card mb-4 p-3 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2 flex-grow max-w-sm">
          <Search size={14} className="text-dim" />
          <input
            type="text"
            className="form-input text-xs w-full"
            placeholder="Search issues by Return ID or field..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(sev => (
            <button
              key={sev}
              type="button"
              className={`btn-xs ${severityFilter === sev ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setSeverityFilter(sev)}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Issues Table */}
      <div className="form-card mb-4">
        <div className="card-header border-bottom pb-2 mb-3">
          <div className="flex items-center justify-between">
            <h3 className="card-title text-base">Detected Data Quality & Integrity Issues ({filteredIssues.length})</h3>
            <span className="text-dim text-xs">Scanned at: {new Date(audit.scannedAt).toLocaleTimeString()}</span>
          </div>
        </div>

        {filteredIssues.length === 0 ? (
          <div className="p-8 text-center text-dim text-xs">
            <CheckCircle2 size={24} className="mx-auto mb-2 text-emerald-400" />
            <p className="font-bold text-secondary">No matching data quality issues found!</p>
            <p className="text-2xs mt-1">All scanned return records satisfy schema and consistency criteria.</p>
          </div>
        ) : (
          <div className="pickup-table-wrapper">
            <table className="pickup-queue-table text-xs">
              <thead>
                <tr>
                  <th>Severity</th>
                  <th>Return ID</th>
                  <th>Field</th>
                  <th>Issue Category</th>
                  <th>Diagnostic Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.map((issue, idx) => (
                  <tr key={idx}>
                    <td>
                      <span className={`priority-pill font-mono font-bold text-3xs ${
                        issue.severity === 'CRITICAL' ? 'badge-risk-critical' :
                        issue.severity === 'HIGH' ? 'badge-risk-high' :
                        issue.severity === 'MEDIUM' ? 'badge-risk-medium' : 'badge-risk-low'
                      }`}>
                        {issue.severity}
                      </span>
                    </td>
                    <td className="font-mono font-bold text-primary">{issue.returnId}</td>
                    <td className="font-mono text-secondary">{issue.field}</td>
                    <td><span className="badge-prototype-tag text-3xs">{issue.type}</span></td>
                    <td className="text-secondary">{issue.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
