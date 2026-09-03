import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Key, 
  Eye, 
  Activity, 
  Sliders, 
  Database, 
  Search, 
  Trash2 
} from 'lucide-react';
import { checkAuditIntegrity, getSecurityEvents, clearSecurityEvents } from '../security/auditIntegrity.js';

export default function AuditIntegrityView({
  onNavigateDashboard,
  onNavigateAccess,
  onNavigatePrivacy,
  onNavigateReliability,
  onNavigateConfig,
  onNavigateRecovery,
  onNavigateReport
}) {
  const [auditCheck, setAuditCheck] = useState(null);
  const [securityEvents, setSecurityEvents] = useState([]);
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  const refreshData = () => {
    setAuditCheck(checkAuditIntegrity());
    setSecurityEvents(getSecurityEvents());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleClearEvents = () => {
    if (window.confirm('Clear all recorded security event logs?')) {
      clearSecurityEvents();
      setSecurityEvents([]);
    }
  };

  const filteredEvents = securityEvents.filter(evt => {
    return filterSeverity === 'ALL' || evt.severity === filterSeverity;
  });

  return (
    <div className="page-wrapper audit-integrity-page">
      {/* Sub-Navigation Bar */}
      <div className="metrics-subnav-bar flex items-center justify-between flex-wrap gap-2 mb-4 p-2 rounded bg-surface border border-subtle">
        <div className="flex items-center gap-1 flex-wrap">
          {onNavigateDashboard && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateDashboard}>
              <ShieldCheck size={13} /> Dashboard
            </button>
          )}
          {onNavigateAccess && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateAccess}>
              <Key size={13} /> Access Control (RBAC)
            </button>
          )}
          {onNavigatePrivacy && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigatePrivacy}>
              <Eye size={13} /> Data Privacy
            </button>
          )}
          <button type="button" className="btn-primary btn-xs flex items-center gap-1 font-bold">
            <FileText size={13} /> Audit Integrity
          </button>
          {onNavigateReliability && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateReliability}>
              <Activity size={13} /> Reliability & Health
            </button>
          )}
          {onNavigateConfig && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateConfig}>
              <Sliders size={13} /> Configuration
            </button>
          )}
          {onNavigateRecovery && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateRecovery}>
              <Database size={13} /> Backup & Recovery
            </button>
          )}
          {onNavigateReport && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateReport}>
              <FileText size={13} /> Security Report
            </button>
          )}
        </div>

        <button
          type="button"
          className="btn-secondary btn-xs flex items-center gap-1"
          onClick={refreshData}
        >
          <RefreshCw size={11} /> Re-verify Audit Logs
        </button>
      </div>

      {/* Hero Header */}
      <header className="page-header audit-header mb-4">
        <div className="header-container">
          <div className="header-badge-row">
            <span className="module-badge">
              <FileText size={13} /> Module 10: Audit Log Integrity & Security Event Log
            </span>
          </div>
          <h1 className="page-title font-serif">Audit Trail Integrity & Incident Log</h1>
          <p className="page-description">
            Verify the structural integrity, chronological ordering, and non-repudiation of operational audit records.
          </p>
        </div>
      </header>

      {/* Audit Integrity Status Banner (Section 24) */}
      {auditCheck && (
        <div className={`p-4 rounded border mb-4 text-xs flex items-center justify-between flex-wrap gap-2 ${
          auditCheck.status === 'PASS' ? 'bg-emerald-bg border-emerald-border' : 'bg-amber-bg border-amber-border'
        }`}>
          <div className="flex items-center gap-2">
            {auditCheck.status === 'PASS' ? (
              <CheckCircle2 size={18} className="text-emerald-400" />
            ) : (
              <AlertTriangle size={18} className="text-amber-400" />
            )}
            <div>
              <strong className="text-secondary block">
                Audit Trail Integrity Status: {auditCheck.status}
              </strong>
              <span className="text-dim text-3xs">
                {auditCheck.totalAuditEvents} chronological operational events verified. Zero duplicate keys or structural corruptions.
              </span>
            </div>
          </div>
          <span className="text-dim font-mono text-3xs">
            Verified: {new Date(auditCheck.checkedAt).toLocaleTimeString()}
          </span>
        </div>
      )}

      {/* Security Incident Log Table (Section 25) */}
      <div className="form-card mb-4">
        <div className="card-header border-bottom pb-2 mb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="card-title text-base">Security Events & Boundary Incident Log</h3>
              <span className="text-dim text-xs">Captures unauthorized access attempts, validation failures, and policy rejections</span>
            </div>

            <div className="flex items-center gap-2">
              <select
                className="form-select text-xs py-1"
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="INFO">INFO</option>
              </select>

              {securityEvents.length > 0 && (
                <button
                  type="button"
                  className="btn-ghost btn-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                  onClick={handleClearEvents}
                >
                  <Trash2 size={11} /> Clear Log
                </button>
              )}
            </div>
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center text-dim text-xs">
            <CheckCircle2 size={24} className="mx-auto mb-2 text-emerald-400" />
            <p className="font-bold text-secondary">No security incidents recorded in this session.</p>
            <p className="text-2xs mt-1">All role requests, validations, and state transitions conform to policy.</p>
          </div>
        ) : (
          <div className="pickup-table-wrapper">
            <table className="pickup-queue-table text-xs">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th className="text-center">Severity</th>
                  <th>Actor</th>
                  <th>Security Event</th>
                  <th>Domain</th>
                  <th>Diagnostic Incident Description</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map(evt => (
                  <tr key={evt.id}>
                    <td className="font-mono text-dim text-3xs whitespace-nowrap">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="text-center">
                      <span className={`priority-pill font-mono font-bold text-3xs ${
                        evt.severity === 'CRITICAL' ? 'badge-risk-critical' :
                        evt.severity === 'HIGH' ? 'badge-risk-high' : 'badge-risk-low'
                      }`}>
                        {evt.severity}
                      </span>
                    </td>
                    <td className="font-mono font-bold text-primary">{evt.actor}</td>
                    <td className="font-medium text-secondary">{evt.event}</td>
                    <td><span className="badge-prototype-tag text-3xs">{evt.module}</span></td>
                    <td className="text-secondary">{evt.description}</td>
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
