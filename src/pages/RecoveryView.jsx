import React, { useState } from 'react';
import { 
  Database, 
  ShieldCheck, 
  Key, 
  Eye, 
  FileText, 
  Activity, 
  Sliders, 
  Download, 
  Upload, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { getAllReturns, getStoredAuditLogs, initializeStorage } from '../utils/storage.js';
import { logSecurityEvent } from '../security/auditIntegrity.js';
import { authService, ROLES } from '../auth/authService.js';

export default function RecoveryView({
  onNavigateDashboard,
  onNavigateAccess,
  onNavigatePrivacy,
  onNavigateAudit,
  onNavigateReliability,
  onNavigateConfig,
  onNavigateReport
}) {
  const [notice, setNotice] = useState(null);
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === ROLES.ADMIN;

  const handleExportState = () => {
    const backup = {
      backupId: `DEMO-BACKUP-${Date.now()}`,
      exportedAt: new Date().toISOString(),
      environment: 'MOCK',
      returns: getAllReturns(),
      auditLogs: getStoredAuditLogs()
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `furniture_triage_demo_state_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setNotice('Demo system state exported to JSON file.');
    setTimeout(() => setNotice(null), 3000);
  };

  const handleResetDemoData = () => {
    if (!window.confirm('Reset all demo records back to baseline factory seed data?')) return;

    localStorage.clear();
    initializeStorage();

    logSecurityEvent({
      severity: 'INFO',
      actor: `${currentUser.name} (${currentUser.role})`,
      event: 'Demo State Restored',
      module: 'Backup & Recovery',
      description: 'Factory demonstration seed data re-initialized across all modules.'
    });

    setNotice('Demo dataset successfully restored to baseline state.');
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div className="page-wrapper recovery-page">
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
          <button type="button" className="btn-primary btn-xs flex items-center gap-1 font-bold">
            <Database size={13} /> Backup & Recovery
          </button>
          {onNavigateReport && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateReport}>
              <FileText size={13} /> Security Report
            </button>
          )}
        </div>
      </div>

      {/* Hero Header */}
      <header className="page-header recovery-header mb-4">
        <div className="header-container">
          <div className="header-badge-row">
            <span className="module-badge">
              <Database size={13} /> Module 10: State Recovery & Demo Persistence
            </span>
          </div>
          <h1 className="page-title font-serif">Demo Backup & State Recovery</h1>
          <p className="page-description">
            Export sandbox state snapshots, restore baseline seed demonstrations, and simulate recovery from local storage corruptions.
          </p>
        </div>
      </header>

      {/* Notice Banner */}
      {notice && (
        <div className="p-3 rounded bg-emerald-bg border border-emerald-border mb-4 flex items-center gap-2 text-xs">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span className="text-emerald-300 font-semibold">{notice}</span>
        </div>
      )}

      {/* Disclaimer (Section 30) */}
      <div className="p-3.5 rounded bg-surface border border-subtle mb-4 text-xs space-y-1">
        <strong className="text-secondary block">PROTOTYPE DEMONSTRATION BACKUP DISCLAIMER</strong>
        <p className="text-dim leading-relaxed">
          This feature provides client-side JSON export and restoration for demonstration testing purposes only. It is not an enterprise server backup system.
        </p>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="form-card p-4 space-y-3">
          <div className="border-bottom pb-2">
            <h4 className="font-bold text-sm text-secondary flex items-center gap-1.5">
              <Download size={15} className="text-primary-light" />
              <span>Export Demo System State</span>
            </h4>
            <span className="text-dim text-3xs">Download full local JSON snapshot (Returns, Reviews, Pickups, Audits)</span>
          </div>

          <p className="text-dim leading-relaxed">
            Exports active claims, operational decisions, and chronological audit entries into an offline JSON payload for auditing.
          </p>

          <button
            type="button"
            className="btn-primary btn-sm flex items-center gap-1.5 font-bold"
            onClick={handleExportState}
          >
            <Download size={13} /> Export JSON Snapshot
          </button>
        </div>

        <div className="form-card p-4 space-y-3">
          <div className="border-bottom pb-2">
            <h4 className="font-bold text-sm text-secondary flex items-center gap-1.5">
              <RotateCcw size={15} className="text-amber-400" />
              <span>Restore Factory Demo Dataset</span>
            </h4>
            <span className="text-dim text-3xs">Reset all modified records back to initial 24 clean demo cases</span>
          </div>

          <p className="text-dim leading-relaxed">
            Re-initializes all test returns, synthetic customer profiles, and evidence metadata if records were altered during testing.
          </p>

          <button
            type="button"
            className="btn-secondary btn-sm flex items-center gap-1.5"
            onClick={handleResetDemoData}
          >
            <RotateCcw size={13} /> Re-seed Demo Records
          </button>
        </div>
      </div>
    </div>
  );
}
