import React, { useState } from 'react';
import { 
  Key, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  UserCheck, 
  ShieldAlert, 
  Play, 
  FileText, 
  Eye, 
  Activity, 
  Sliders, 
  Database 
} from 'lucide-react';
import { getAuthorizationMatrix, checkAuthorization, SECURITY_ACTIONS } from '../security/authorization.js';
import { authService, ROLES } from '../auth/authService.js';
import { logSecurityEvent } from '../security/auditIntegrity.js';

export default function AccessControlView({
  onNavigateDashboard,
  onNavigatePrivacy,
  onNavigateAudit,
  onNavigateReliability,
  onNavigateConfig,
  onNavigateRecovery,
  onNavigateReport
}) {
  const { roles, matrix } = getAuthorizationMatrix();
  const [testAction, setTestAction] = useState(SECURITY_ACTIONS.SUBMIT_REVIEW);
  const [testRole, setTestRole] = useState(ROLES.DISPATCHER);
  const [testResult, setTestResult] = useState(null);

  const handleExecuteActionTest = () => {
    const res = checkAuthorization(testAction, testRole);
    setTestResult(res);

    if (!res.allowed) {
      logSecurityEvent({
        severity: 'HIGH',
        actor: `Simulated Role (${testRole})`,
        event: 'Unauthorized Action Blocked',
        module: 'Authorization (RBAC)',
        description: `Blocked attempt to execute "${testAction}" by unauthorized role "${testRole}".`
      });
    }
  };

  return (
    <div className="page-wrapper access-control-page">
      {/* Sub-Navigation Bar */}
      <div className="metrics-subnav-bar flex items-center justify-between flex-wrap gap-2 mb-4 p-2 rounded bg-surface border border-subtle">
        <div className="flex items-center gap-1 flex-wrap">
          {onNavigateDashboard && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateDashboard}>
              <ShieldCheck size={13} /> Dashboard
            </button>
          )}
          <button type="button" className="btn-primary btn-xs flex items-center gap-1 font-bold">
            <Key size={13} /> Access Control (RBAC)
          </button>
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
      </div>

      {/* Hero Header */}
      <header className="page-header access-header mb-4">
        <div className="header-container">
          <div className="header-badge-row">
            <span className="module-badge">
              <Key size={13} /> Module 10: Role-Based Access Control (RBAC)
            </span>
          </div>
          <h1 className="page-title font-serif">Authorization Policy & Access Matrix</h1>
          <p className="page-description">
            Enforce role boundaries across Reviewer, Dispatcher, Operations Manager, Senior Manager, Evaluator, and Administrator.
          </p>
        </div>
      </header>

      {/* Interactive Authorization Policy Tester */}
      <div className="form-card mb-4 p-4 space-y-3 text-xs">
        <div className="border-bottom pb-2 flex items-center justify-between">
          <h3 className="card-title text-sm flex items-center gap-1.5">
            <ShieldAlert size={15} className="text-primary-light" />
            <span>Simulate Role Authorization Enforcement</span>
          </h3>
          <span className="text-dim text-3xs">Test 403 Forbidden enforcement</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="form-label text-2xs block mb-1">Target Action to Execute:</label>
            <select
              className="form-select text-xs w-full"
              value={testAction}
              onChange={(e) => setTestAction(e.target.value)}
            >
              {Object.keys(SECURITY_ACTIONS).map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label text-2xs block mb-1">Simulated User Role:</label>
            <select
              className="form-select text-xs w-full"
              value={testRole}
              onChange={(e) => setTestRole(e.target.value)}
            >
              {roles.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              className="btn-primary btn-sm w-full flex items-center justify-center gap-1.5 font-bold"
              onClick={handleExecuteActionTest}
            >
              <Play size={12} /> Test Authorization
            </button>
          </div>
        </div>

        {testResult && (
          <div className={`p-3 rounded border text-xs flex items-center justify-between ${
            testResult.allowed ? 'bg-emerald-bg border-emerald-border' : 'bg-red-950/40 border-red-800'
          }`}>
            <div className="flex items-center gap-2">
              {testResult.allowed ? (
                <CheckCircle2 size={16} className="text-emerald-400" />
              ) : (
                <XCircle size={16} className="text-red-400" />
              )}
              <div>
                <strong className={testResult.allowed ? 'text-emerald-300' : 'text-red-300'}>
                  {testResult.allowed ? 'ACCESS GRANTED (200 OK)' : 'ACCESS BLOCKED (403 FORBIDDEN)'}
                </strong>
                <p className="text-dim text-3xs mt-0.5">{testResult.reason}</p>
              </div>
            </div>
            <span className={`priority-pill font-mono font-bold text-3xs ${
              testResult.allowed ? 'badge-risk-low' : 'badge-risk-critical'
            }`}>
              {testResult.allowed ? 'AUTHORIZED' : 'POLICY_VIOLATION'}
            </span>
          </div>
        )}
      </div>

      {/* Role-Feature Matrix Table (Section 8) */}
      <div className="form-card mb-4">
        <div className="card-header border-bottom pb-2 mb-3">
          <h3 className="card-title text-base">Comprehensive Role &bull; Action Authorization Matrix</h3>
        </div>

        <div className="pickup-table-wrapper">
          <table className="pickup-queue-table text-xs">
            <thead>
              <tr>
                <th>Operational Action</th>
                {roles.map(r => (
                  <th key={r} className="text-center font-mono text-3xs">{r}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map(row => (
                <tr key={row.action}>
                  <td className="font-mono font-bold text-primary">{row.action}</td>
                  {roles.map(r => {
                    const allowed = row.permissions[r];
                    return (
                      <td key={r} className="text-center">
                        {allowed ? (
                          <span className="text-emerald-400 font-bold text-xs">✓</span>
                        ) : (
                          <span className="text-dim opacity-30">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
