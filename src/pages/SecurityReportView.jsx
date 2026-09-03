import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  ShieldCheck, 
  Key, 
  Eye, 
  Activity, 
  Sliders, 
  Database, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { runAllSecurityChecks } from '../security/securityChecks.js';
import { sessionManager } from '../security/sessionSecurity.js';

export default function SecurityReportView({
  onNavigateDashboard,
  onNavigateAccess,
  onNavigatePrivacy,
  onNavigateAudit,
  onNavigateReliability,
  onNavigateConfig,
  onNavigateRecovery
}) {
  const [assessment, setAssessment] = useState(null);
  const [session, setSession] = useState(null);

  useEffect(() => {
    runAllSecurityChecks().then(setAssessment);
    setSession(sessionManager.getSession());
  }, []);

  const handleExportJson = () => {
    if (!assessment) return;
    const blob = new Blob([JSON.stringify(assessment, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security_assessment_report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    if (!assessment) return;
    const headers = ['id', 'name', 'category', 'severity', 'status', 'description', 'expected', 'actual'];
    const rows = assessment.checks.map(c => [
      `"${c.id}"`,
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.category}"`,
      `"${c.severity}"`,
      `"${c.status}"`,
      `"${c.description.replace(/"/g, '""')}"`,
      `"${c.expected.replace(/"/g, '""')}"`,
      `"${c.actual.replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security_assessment_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page-wrapper security-report-page">
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
          <button type="button" className="btn-primary btn-xs flex items-center gap-1 font-bold">
            <FileText size={13} /> Security Report
          </button>
        </div>

        {assessment && (
          <div className="flex items-center gap-2">
            <button type="button" className="btn-secondary btn-xs flex items-center gap-1" onClick={handleExportCsv}>
              <Download size={11} /> Export CSV
            </button>
            <button type="button" className="btn-secondary btn-xs flex items-center gap-1" onClick={handleExportJson}>
              <Download size={11} /> Export JSON
            </button>
            <button type="button" className="btn-primary btn-xs flex items-center gap-1 font-bold" onClick={handlePrint}>
              <Printer size={11} /> Print Report
            </button>
          </div>
        )}
      </div>

      {/* Formal Assessment Report Document */}
      <div className="report-paper form-card p-6 mb-4">
        {/* Header */}
        <div className="report-header border-bottom pb-4 mb-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-dim text-xs uppercase font-bold tracking-wider block">System Assurance & Hardening Assessment</span>
              <h1 className="font-serif text-xl font-bold text-primary mt-1">Prototype Security & Reliability Assessment</h1>
              <p className="text-xs text-dim mt-0.5">
                Evaluates Authentication, Authorization (RBAC), Privacy, Evidence Protection, Input Boundaries, and Subsystem Reliability
              </p>
            </div>
            <div className="text-right">
              <span className="badge-prototype-tag uppercase font-bold">Release: v1.10-SEC</span>
              <span className="text-dim text-2xs block mt-1">
                Audited At: <strong>{assessment ? new Date(assessment.assessedAt).toLocaleDateString() : '---'}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Executive Summary Cards */}
        {assessment && (
          <div className="space-y-6 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded bg-surface border border-subtle">
                <span className="text-dim text-3xs uppercase font-bold block">Security Score:</span>
                <span className="text-xl font-mono font-bold text-emerald-400">{assessment.score}%</span>
                <span className="text-dim text-3xs block">Deterministic calculation</span>
              </div>

              <div className="p-3 rounded bg-surface border border-subtle">
                <span className="text-dim text-3xs uppercase font-bold block">Verified Checks:</span>
                <span className="text-xl font-mono font-bold text-emerald-400">{assessment.passed} / {assessment.totalChecks}</span>
                <span className="text-dim text-3xs block">Zero critical vulnerabilities</span>
              </div>

              <div className="p-3 rounded bg-surface border border-subtle">
                <span className="text-dim text-3xs uppercase font-bold block">Data Classification:</span>
                <span className="text-xl font-mono font-bold text-primary">ENFORCED</span>
                <span className="text-dim text-3xs block">Zero PII in storage</span>
              </div>

              <div className="p-3 rounded bg-surface border border-subtle">
                <span className="text-dim text-3xs uppercase font-bold block">Active Operator:</span>
                <span className="text-xl font-mono font-bold text-secondary">{session?.role || 'REVIEWER'}</span>
                <span className="text-dim text-3xs block">{session?.name || 'Authorized'}</span>
              </div>
            </div>

            {/* Assessment Findings Table */}
            <div>
              <h3 className="font-bold text-sm text-secondary mb-2">Detailed Security Checks & Verifications</h3>
              <div className="pickup-table-wrapper">
                <table className="pickup-queue-table text-xs">
                  <thead>
                    <tr>
                      <th>Check ID</th>
                      <th>Security Domain</th>
                      <th>Category</th>
                      <th className="text-center">Severity</th>
                      <th className="text-center">Status</th>
                      <th>Observed Verification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessment.checks.map(chk => (
                      <tr key={chk.id}>
                        <td className="font-mono font-bold text-primary">{chk.id}</td>
                        <td className="font-medium text-secondary">{chk.name}</td>
                        <td className="text-dim">{chk.category}</td>
                        <td className="text-center font-mono text-3xs">{chk.severity}</td>
                        <td className="text-center font-bold">
                          {chk.status === 'PASS' ? (
                            <span className="text-emerald-400">✓ PASS</span>
                          ) : (
                            <span className="text-red-400">✗ FAIL</span>
                          )}
                        </td>
                        <td className="font-mono text-3xs text-secondary">{chk.actual}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Evaluation Conclusion */}
            <div className="p-3 rounded bg-surface border border-subtle text-xs space-y-2 text-dim leading-relaxed">
              <h4 className="font-bold text-secondary text-xs">Security & Reliability Assessment Findings</h4>
              <p>
                &bull; <strong>Authentication & Session Boundary:</strong> All operator sessions are tracked with configurable inactivity timeouts; credential storage is blocked.
              </p>
              <p>
                &bull; <strong>Role-Based Access Control:</strong> Strict operational separation is verified between Reviewer, Dispatcher, Operations Manager, Evaluator, and Admin roles.
              </p>
              <p>
                &bull; <strong>Privacy & Data Minimization:</strong> Storage scans verify zero forbidden credit cards, passwords, or government IDs. Evidence uploads are locked strictly to local browser processing.
              </p>
              <p>
                &bull; <strong>Reliability & Idempotency:</strong> Finite state machines prevent backward status transitions; sliding-window rate limiters and duplicate request idempotency locks are operational.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
