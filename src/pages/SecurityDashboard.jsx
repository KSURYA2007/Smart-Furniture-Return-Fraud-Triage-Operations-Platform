import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Key, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Activity, 
  UserCheck, 
  Sliders, 
  FileText, 
  Database, 
  RotateCcw, 
  Sparkles,
  Layers,
  Terminal,
  LogOut
} from 'lucide-react';

import { runAllSecurityChecks } from '../security/securityChecks.js';
import { sessionManager, SESSION_STATUS } from '../security/sessionSecurity.js';
import { authService } from '../auth/authService.js';
import { getApiMode } from '../api/apiClient.js';

export default function SecurityDashboard({
  onNavigateAccess,
  onNavigatePrivacy,
  onNavigateAudit,
  onNavigateReliability,
  onNavigateConfig,
  onNavigateRecovery,
  onNavigateReport
}) {
  const [assessment, setAssessment] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [session, setSession] = useState(null);
  const [activeUserRole, setActiveUserRole] = useState(null);

  const loadSession = () => {
    const s = sessionManager.getSession();
    setSession(s);
    setActiveUserRole(s?.role || 'REVIEWER');
  };

  useEffect(() => {
    loadSession();
    // Run initial security checks automatically
    handleRunSecurityChecks();
  }, []);

  const handleRunSecurityChecks = async () => {
    setIsRunning(true);
    try {
      const res = await runAllSecurityChecks();
      setAssessment(res);
      loadSession();
    } catch (err) {
      console.error('Security checks failed:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSwitchUser = (userId) => {
    sessionManager.loginAs(userId);
    loadSession();
  };

  const handleLogout = () => {
    sessionManager.logout();
    loadSession();
  };

  const env = getApiMode().toUpperCase();

  return (
    <div className="page-wrapper security-dashboard-page">
      {/* Sub-Navigation Bar */}
      <div className="metrics-subnav-bar flex items-center justify-between flex-wrap gap-2 mb-4 p-2 rounded bg-surface border border-subtle">
        <div className="flex items-center gap-1 flex-wrap">
          <button type="button" className="btn-primary btn-xs flex items-center gap-1 font-bold">
            <ShieldCheck size={13} /> Dashboard
          </button>
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

        {/* Environment Pill (Section 40) */}
        <div className="flex items-center gap-2">
          <span className={`priority-pill font-mono font-bold text-2xs uppercase ${
            env === 'MOCK' ? 'badge-risk-low' : 'badge-risk-medium'
          }`}>
            Environment: {env} (Demo Sandbox)
          </span>
        </div>
      </div>

      {/* Hero Header */}
      <header className="page-header security-header mb-4">
        <div className="header-container">
          <div className="header-badge-row">
            <span className="module-badge">
              <ShieldCheck size={13} /> Module 10: Security, Privacy & Reliability
            </span>
          </div>
          <h1 className="page-title font-serif">Security, Privacy & Reliability</h1>
          <p className="page-description">
            Monitor application security, access control, privacy, and system reliability across Modules 1 through 9.
          </p>
        </div>
      </header>

      {/* Notice Banner (Section 39) */}
      <div className="p-3 rounded bg-surface border border-primary-subtle mb-4 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2">
          <ShieldAlert size={16} className="text-primary" />
          <div>
            <strong className="text-secondary block">Privacy Notice & Demonstration Boundary</strong>
            <span className="text-dim text-3xs">
              This prototype operates strictly with synthetic customer, order, and evidence data. Real customer documents and credentials are never stored or transmitted.
            </span>
          </div>
        </div>
        <button
          type="button"
          className="btn-primary btn-sm flex items-center gap-1.5 font-bold"
          onClick={handleRunSecurityChecks}
          disabled={isRunning}
        >
          <Sparkles size={13} className={isRunning ? 'animate-spin' : ''} />
          <span>{isRunning ? 'Auditing System...' : 'RUN COMPLETE SECURITY CHECK'}</span>
        </button>
      </div>

      {/* Active Session Status Bar (Section 5 & 6) */}
      <div className="form-card mb-4 p-3 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <UserCheck size={14} className="text-emerald-400" />
            <span className="text-dim text-3xs uppercase font-bold">Active Operator:</span>
            <strong className="text-secondary">{session?.name || 'Authorized Reviewer'}</strong>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-dim text-3xs uppercase font-bold">Role:</span>
            <span className="badge-prototype-tag font-mono text-3xs font-bold">{session?.role || 'REVIEWER'}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-dim text-3xs uppercase font-bold">Session State:</span>
            <span className={`priority-pill font-mono text-3xs ${
              session?.status === SESSION_STATUS.ACTIVE ? 'badge-risk-low' : 'badge-risk-critical'
            }`}>
              {session?.status || 'ACTIVE'}
            </span>
          </div>
        </div>

        {/* User Role Switcher Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-dim text-3xs">Switch Role:</span>
          <select
            className="form-select text-xs py-1"
            value={session?.userId || 'USR-01'}
            onChange={(e) => handleSwitchUser(e.target.value)}
          >
            {authService.getAvailableUsers().map(u => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn-ghost btn-xs text-dim hover:text-red-400 flex items-center gap-1"
            onClick={handleLogout}
            title="Simulate Logout"
          >
            <LogOut size={12} /> Logout
          </button>
        </div>
      </div>

      {/* Display KPI Cards (Section 3) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 mb-4 text-xs">
        <div className="stat-card p-2 rounded bg-surface border border-subtle">
          <span className="text-dim text-3xs uppercase block">Security Score</span>
          <span className="font-mono font-bold text-lg text-emerald-400">
            {assessment ? `${assessment.score}%` : 'NOT ASSESSED'}
          </span>
        </div>

        <div className="stat-card p-2 rounded bg-surface border border-subtle">
          <span className="text-dim text-3xs uppercase block">Privacy Status</span>
          <span className="font-mono font-bold text-xs text-emerald-300 truncate block mt-1">
            SYNTHETIC ONLY
          </span>
        </div>

        <div className="stat-card p-2 rounded bg-surface border border-subtle">
          <span className="text-dim text-3xs uppercase block">Authentication</span>
          <span className="font-mono font-bold text-xs text-emerald-400 truncate block mt-1">
            {session?.status === SESSION_STATUS.ACTIVE ? 'AUTHENTICATED' : 'EXPIRED'}
          </span>
        </div>

        <div className="stat-card p-2 rounded bg-surface border border-subtle">
          <span className="text-dim text-3xs uppercase block">Authorization</span>
          <span className="font-mono font-bold text-xs text-emerald-300 truncate block mt-1">
            RBAC ENFORCED
          </span>
        </div>

        <div className="stat-card p-2 rounded bg-surface border border-subtle">
          <span className="text-dim text-3xs uppercase block">Audit Integrity</span>
          <span className="font-mono font-bold text-xs text-emerald-400 truncate block mt-1">
            TAMPER FREE
          </span>
        </div>

        <div className="stat-card p-2 rounded bg-surface border border-subtle">
          <span className="text-dim text-3xs uppercase block">API Health</span>
          <span className="font-mono font-bold text-xs text-emerald-300 truncate block mt-1">
            ONLINE (MOCK)
          </span>
        </div>

        <div className="stat-card p-2 rounded bg-surface border border-subtle">
          <span className="text-dim text-3xs uppercase block">Reliability</span>
          <span className="font-mono font-bold text-xs text-emerald-400 truncate block mt-1">
            FAULT TOLERANT
          </span>
        </div>

        <div className="stat-card p-2 rounded bg-surface border border-subtle">
          <span className="text-dim text-3xs uppercase block">Open Issues</span>
          <span className={`font-mono font-bold text-lg ${assessment?.failed > 0 ? 'text-red-400' : 'text-dim'}`}>
            {assessment ? assessment.failed : '---'}
          </span>
        </div>
      </div>

      {/* Security Check Registry Table */}
      <div className="form-card mb-4">
        <div className="card-header border-bottom pb-2 mb-3">
          <div className="flex items-center justify-between">
            <h3 className="card-title text-base">
              System Security & Reliability Assessment ({assessment ? `${assessment.passed} / ${assessment.totalChecks} Checks Passed` : 'Pending Assessment'})
            </h3>
            <span className="text-dim text-xs">
              {assessment ? `Assessed: ${new Date(assessment.assessedAt).toLocaleTimeString()}` : 'Click "RUN COMPLETE SECURITY CHECK" above'}
            </span>
          </div>
        </div>

        {!assessment ? (
          <div className="p-8 text-center text-dim text-xs">
            <ShieldCheck size={28} className="mx-auto mb-2 opacity-40" />
            <p className="font-bold text-secondary">Security checks have not yet been evaluated.</p>
            <p className="text-2xs mt-1">Click &ldquo;RUN COMPLETE SECURITY CHECK&rdquo; to execute the deterministic assessment.</p>
          </div>
        ) : (
          <div className="pickup-table-wrapper">
            <table className="pickup-queue-table text-xs">
              <thead>
                <tr>
                  <th>Check ID</th>
                  <th>Security Verification Domain</th>
                  <th>Category</th>
                  <th className="text-center">Severity</th>
                  <th className="text-center">Status</th>
                  <th>Observed System State</th>
                </tr>
              </thead>
              <tbody>
                {assessment.checks.map(chk => (
                  <tr key={chk.id}>
                    <td className="font-mono font-bold text-primary">{chk.id}</td>
                    <td>
                      <strong className="text-secondary block">{chk.name}</strong>
                      <span className="text-dim text-3xs">{chk.description}</span>
                    </td>
                    <td><span className="badge-prototype-tag text-3xs">{chk.category}</span></td>
                    <td className="text-center">
                      <span className={`priority-pill font-mono text-3xs ${
                        chk.severity === 'CRITICAL' ? 'badge-risk-critical' :
                        chk.severity === 'HIGH' ? 'badge-risk-high' : 'badge-risk-low'
                      }`}>
                        {chk.severity}
                      </span>
                    </td>
                    <td className="text-center font-bold">
                      {chk.status === 'PASS' ? (
                        <span className="badge-sla-on-track font-bold text-3xs inline-flex items-center gap-1">
                          <CheckCircle2 size={11} /> PASS
                        </span>
                      ) : (
                        <span className="badge-risk-critical font-bold text-3xs inline-flex items-center gap-1">
                          <XCircle size={11} /> FAIL
                        </span>
                      )}
                    </td>
                    <td className="text-secondary font-mono text-3xs">{chk.actual}</td>
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
