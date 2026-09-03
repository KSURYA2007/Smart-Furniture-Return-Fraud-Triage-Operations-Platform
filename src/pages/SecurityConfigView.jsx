import React, { useState } from 'react';
import { 
  Sliders, 
  ShieldCheck, 
  Key, 
  Eye, 
  FileText, 
  Activity, 
  Database, 
  Lock, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { authService, ROLES } from '../auth/authService.js';
import { sessionManager } from '../security/sessionSecurity.js';
import { logSecurityEvent } from '../security/auditIntegrity.js';
import { setRateLimitMax, getRateLimitMax } from '../security/reliability.js';

export default function SecurityConfigView({
  onNavigateDashboard,
  onNavigateAccess,
  onNavigatePrivacy,
  onNavigateAudit,
  onNavigateReliability,
  onNavigateRecovery,
  onNavigateReport
}) {
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === ROLES.ADMIN;

  const [sessionTimeout, setSessionTimeout] = useState(sessionManager.getTimeoutMinutes());
  const [maxEvidenceSize, setMaxEvidenceSize] = useState(15);
  const [apiTimeout, setApiTimeout] = useState(5000);
  const [maxRetries, setMaxRetries] = useState(3);
  const [mockRateLimit, setMockRateLimit] = useState(getRateLimitMax());
  const [savedNotice, setSavedNotice] = useState(null);

  const handleSaveConfig = (e) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Permission Denied: Only the ADMINISTRATOR role can modify security configurations.');
      return;
    }

    sessionManager.setTimeoutMinutes(sessionTimeout);
    setRateLimitMax(mockRateLimit);

    logSecurityEvent({
      severity: 'INFO',
      actor: `${currentUser.name} (${currentUser.role})`,
      event: 'Security Configuration Updated',
      module: 'Configuration',
      description: `Updated session timeout to ${sessionTimeout}m and rate limit to ${mockRateLimit} req/min.`
    });

    setSavedNotice('Security configuration parameters updated and audit event logged.');
    setTimeout(() => setSavedNotice(null), 3000);
  };

  return (
    <div className="page-wrapper security-config-page">
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
          {onNavigateAudit && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateAudit}>
              <FileText size={13} /> Audit Integrity
            </button>
          )}
          {onNavigateReliability && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateReliability}>
              <Activity size={13} /> Reliability & Health
            </button>
          )}
          <button type="button" className="btn-primary btn-xs flex items-center gap-1 font-bold">
            <Sliders size={13} /> Configuration
          </button>
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
      </div>

      {/* Hero Header */}
      <header className="page-header config-header mb-4">
        <div className="header-container">
          <div className="header-badge-row">
            <span className="module-badge">
              <Sliders size={13} /> Module 10: Security Configuration & Admin Governance
            </span>
          </div>
          <h1 className="page-title font-serif">Security Parameters & Boundary Controls</h1>
          <p className="page-description">
            Configure prototype timeouts, evidence size boundaries, rate-limit thresholds, and audit retention policies.
          </p>
        </div>
      </header>

      {/* Saved Notice */}
      {savedNotice && (
        <div className="p-3 rounded bg-emerald-bg border border-emerald-border mb-4 flex items-center gap-2 text-xs">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span className="text-emerald-300 font-semibold">{savedNotice}</span>
        </div>
      )}

      {/* Role Notice */}
      {!isAdmin && (
        <div className="p-3 rounded bg-amber-bg border border-amber-border mb-4 flex items-center gap-2 text-xs">
          <AlertTriangle size={16} className="text-amber-400" />
          <span className="text-amber-200">
            Read-Only Mode: Active role is <strong>{currentUser?.role || 'REVIEWER'}</strong>. Administrative privileges (ADMIN role) are required to commit configuration changes.
          </span>
        </div>
      )}

      {/* Configuration Form */}
      <form onSubmit={handleSaveConfig} className="form-card p-4 space-y-4 text-xs max-w-2xl">
        <div className="border-bottom pb-2">
          <h3 className="card-title text-sm">Configurable Prototype Controls</h3>
          <span className="text-dim text-2xs">All parameter modifications generate chronological audit entries</span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="form-label text-2xs block mb-1">Session Inactivity Timeout (Minutes):</label>
            <input
              type="number"
              min="1"
              max="120"
              className="form-input text-xs w-full"
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(Number(e.target.value))}
              disabled={!isAdmin}
            />
            <span className="text-dim text-3xs">Inactivity threshold before session automatically expires.</span>
          </div>

          <div>
            <label className="form-label text-2xs block mb-1">Maximum Evidence File Size (MB):</label>
            <input
              type="number"
              min="1"
              max="50"
              className="form-input text-xs w-full"
              value={maxEvidenceSize}
              onChange={(e) => setMaxEvidenceSize(Number(e.target.value))}
              disabled={!isAdmin}
            />
            <span className="text-dim text-3xs">Upload payload boundary enforced at evidence intake.</span>
          </div>

          <div>
            <label className="form-label text-2xs block mb-1">Client API Request Timeout (Milliseconds):</label>
            <input
              type="number"
              min="1000"
              max="30000"
              step="500"
              className="form-input text-xs w-full"
              value={apiTimeout}
              onChange={(e) => setApiTimeout(Number(e.target.value))}
              disabled={!isAdmin}
            />
            <span className="text-dim text-3xs">AbortController timeout before triggering retry or failure recovery.</span>
          </div>

          <div>
            <label className="form-label text-2xs block mb-1">Maximum Operational Retries:</label>
            <input
              type="number"
              min="1"
              max="5"
              className="form-input text-xs w-full"
              value={maxRetries}
              onChange={(e) => setMaxRetries(Number(e.target.value))}
              disabled={!isAdmin}
            />
            <span className="text-dim text-3xs">Exponential backoff retry limit for idempotent read operations.</span>
          </div>

          <div>
            <label className="form-label text-2xs block mb-1">Mock Rate Limit (Requests per Minute):</label>
            <input
              type="number"
              min="5"
              max="120"
              className="form-input text-xs w-full"
              value={mockRateLimit}
              onChange={(e) => setMockRateLimit(Number(e.target.value))}
              disabled={!isAdmin}
            />
            <span className="text-dim text-3xs">Simulated prototype security rate-limiting control.</span>
          </div>
        </div>

        <div className="pt-2 border-top">
          <button
            type="submit"
            className="btn-primary btn-sm flex items-center gap-1.5 font-bold"
            disabled={!isAdmin}
          >
            <Lock size={12} />
            <span>Save Security Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
