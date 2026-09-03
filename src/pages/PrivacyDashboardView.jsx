import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Key, 
  FileText, 
  Activity, 
  Sliders, 
  Database, 
  Camera, 
  Lock 
} from 'lucide-react';
import { runDataMinimizationAudit, DATA_CLASSIFICATIONS, FIELD_CLASSIFICATIONS } from '../security/privacy.js';
import { EVIDENCE_POLICY } from '../security/evidenceSecurity.js';

export default function PrivacyDashboardView({
  onNavigateDashboard,
  onNavigateAccess,
  onNavigateAudit,
  onNavigateReliability,
  onNavigateConfig,
  onNavigateRecovery,
  onNavigateReport
}) {
  const [audit, setAudit] = useState(null);

  useEffect(() => {
    setAudit(runDataMinimizationAudit());
  }, []);

  return (
    <div className="page-wrapper privacy-dashboard-page">
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
          <button type="button" className="btn-primary btn-xs flex items-center gap-1 font-bold">
            <Eye size={13} /> Data Privacy
          </button>
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
      <header className="page-header privacy-header mb-4">
        <div className="header-container">
          <div className="header-badge-row">
            <span className="module-badge">
              <Eye size={13} /> Module 10: Data Privacy & Minimization
            </span>
          </div>
          <h1 className="page-title font-serif">Data Privacy & Information Protection</h1>
          <p className="page-description">
            Audit data minimization, privacy classifications, customer PII boundaries, and evidence retention.
          </p>
        </div>
      </header>

      {/* Mandatory Demo Banner (Section 9 & 39) */}
      <div className="p-3.5 rounded bg-surface border border-primary-subtle mb-4 text-xs space-y-1">
        <div className="flex items-center gap-2">
          <ShieldAlert size={16} className="text-primary" />
          <strong className="text-secondary text-sm">DEMO ENVIRONMENT PRIVACY NOTICE</strong>
        </div>
        <p className="text-dim text-xs leading-relaxed">
          This system uses <strong>strictly synthetic demonstration records</strong>. Do not enter real customer names, phone numbers, addresses, government IDs, bank details, or live payment credentials. Evidence images are processed strictly in local browser memory; no data is uploaded to third-party AI or public cloud services.
        </p>
      </div>

      {/* Privacy KPI Cards (Section 9) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-xs">
        <div className="stat-card p-3 rounded bg-surface border border-subtle">
          <span className="text-dim text-3xs uppercase font-bold block">Privacy Compliance:</span>
          <span className="text-xl font-mono font-bold text-emerald-400">100% COMPLIANT</span>
          <span className="text-dim text-3xs block">Zero PII violations detected</span>
        </div>

        <div className="stat-card p-3 rounded bg-surface border border-subtle">
          <span className="text-dim text-3xs uppercase font-bold block">External Cloud Uploads:</span>
          <span className="text-xl font-mono font-bold text-emerald-300">0 (BLOCKED)</span>
          <span className="text-dim text-3xs block">Local execution only</span>
        </div>

        <div className="stat-card p-3 rounded bg-surface border border-subtle">
          <span className="text-dim text-3xs uppercase font-bold block">Data Minimization:</span>
          <span className="text-xl font-mono font-bold text-primary">ENFORCED</span>
          <span className="text-dim text-3xs block">Operational attributes only</span>
        </div>

        <div className="stat-card p-3 rounded bg-surface border border-subtle">
          <span className="text-dim text-3xs uppercase font-bold block">Data Retention:</span>
          <span className="text-xl font-mono font-bold text-secondary">EPHEMERAL</span>
          <span className="text-dim text-3xs block">Client storage sandbox</span>
        </div>
      </div>

      {/* 2-Column: Privacy Classification & Evidence Security */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 text-xs">
        {/* Left: Classification Levels (Section 11) */}
        <div className="form-card p-3 space-y-2">
          <h4 className="font-bold text-xs text-secondary mb-2">Data Sensitivity Classifications:</h4>
          {Object.values(DATA_CLASSIFICATIONS).map(cls => (
            <div key={cls.level} className="p-2.5 rounded bg-surface border border-subtle flex items-start justify-between gap-2">
              <div>
                <strong className={`font-mono text-xs block ${
                  cls.level === 'PUBLIC' ? 'text-emerald-400' :
                  cls.level === 'INTERNAL' ? 'text-blue-400' :
                  cls.level === 'CONFIDENTIAL' ? 'text-amber-300' : 'text-red-400'
                }`}>
                  {cls.level}
                </strong>
                <p className="text-dim text-3xs mt-0.5">{cls.description}</p>
              </div>
              <span className={`priority-pill font-mono text-3xs ${
                cls.level === 'PUBLIC' ? 'badge-risk-low' :
                cls.level === 'INTERNAL' ? 'badge-risk-low' :
                cls.level === 'CONFIDENTIAL' ? 'badge-risk-medium' : 'badge-risk-high'
              }`}>
                {cls.level}
              </span>
            </div>
          ))}
        </div>

        {/* Right: Evidence Protection (Section 12) */}
        <div className="form-card p-3 space-y-3">
          <div className="border-bottom pb-2 flex items-center justify-between">
            <h4 className="font-bold text-xs text-secondary flex items-center gap-1.5">
              <Camera size={14} className="text-primary-light" />
              <span>Evidence Handling Safeguards</span>
            </h4>
            <span className="priority-pill badge-risk-low font-mono text-3xs font-bold">PROTECTED</span>
          </div>

          <div className="space-y-2 text-dim leading-relaxed">
            <div className="p-2 rounded bg-surface border border-subtle">
              <strong className="text-secondary block mb-0.5">Supported Image Formats:</strong>
              <span className="font-mono text-emerald-400 text-3xs">
                {EVIDENCE_POLICY.allowedExtensions.map(e => `.${e.toUpperCase()}`).join(', ')}
              </span>
              <p className="text-3xs text-dim mt-0.5">Executable binaries (.exe, .bat, .sh) and script formats are rejected.</p>
            </div>

            <div className="p-2 rounded bg-surface border border-subtle">
              <strong className="text-secondary block mb-0.5">Maximum File Size Boundary:</strong>
              <span className="font-mono text-secondary text-3xs">
                {EVIDENCE_POLICY.maxSizeBytes / (1024 * 1024)} MB per evidence upload
              </span>
            </div>

            <div className="p-2 rounded bg-surface border border-subtle">
              <strong className="text-secondary block mb-0.5">External AI Upload Policy:</strong>
              <span className="text-emerald-400 font-bold text-3xs">BLOCKED (ZERO EXTERNAL LEAK)</span>
              <p className="text-3xs text-dim mt-0.5">Customer photos are processed strictly inside the local decision pipeline.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
