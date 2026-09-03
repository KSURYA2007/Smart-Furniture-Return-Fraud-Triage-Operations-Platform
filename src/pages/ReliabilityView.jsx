import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Key, 
  Eye, 
  FileText, 
  Sliders, 
  Database, 
  Zap, 
  Clock, 
  ArrowRight 
} from 'lucide-react';
import { getReliabilityStatus, simulateRateLimit, getRateLimitMax } from '../security/reliability.js';

export default function ReliabilityView({
  onNavigateDashboard,
  onNavigateAccess,
  onNavigatePrivacy,
  onNavigateAudit,
  onNavigateConfig,
  onNavigateRecovery,
  onNavigateReport
}) {
  const [status, setStatus] = useState(null);
  const [rateLimitStatus, setRateLimitStatus] = useState(null);
  const [isPinging, setIsPinging] = useState(false);

  const loadStatus = async () => {
    setIsPinging(true);
    const s = await getReliabilityStatus();
    setStatus(s);
    setRateLimitStatus(simulateRateLimit());
    setIsPinging(false);
  };

  useEffect(() => {
    loadStatus();
  }, []);

  if (!status) return null;

  return (
    <div className="page-wrapper reliability-page">
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
          <button type="button" className="btn-primary btn-xs flex items-center gap-1 font-bold">
            <Activity size={13} /> Reliability & Health
          </button>
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
          onClick={loadStatus}
          disabled={isPinging}
        >
          <RefreshCw size={11} className={isPinging ? 'animate-spin' : ''} />
          <span>Ping Services</span>
        </button>
      </div>

      {/* Hero Header */}
      <header className="page-header rel-header mb-4">
        <div className="header-container">
          <div className="header-badge-row">
            <span className="module-badge">
              <Activity size={13} /> Module 10: System Reliability & Fault Tolerance
            </span>
          </div>
          <h1 className="page-title font-serif">Reliability, Fault Tolerance & Recovery</h1>
          <p className="page-description">
            Monitor subsystem availability, rate-limiting simulation, exponential backoff retries, and finite state machine transition guards.
          </p>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-xs">
        <div className="stat-card p-3 rounded bg-surface border border-subtle">
          <span className="text-dim text-3xs uppercase font-bold block">Overall System Health:</span>
          <span className="text-xl font-mono font-bold text-emerald-400">{status.overallStatus}</span>
          <span className="text-dim text-3xs block">{status.subsystems.length} subsystems online</span>
        </div>

        <div className="stat-card p-3 rounded bg-surface border border-subtle">
          <span className="text-dim text-3xs uppercase font-bold block">API Availability:</span>
          <span className="text-xl font-mono font-bold text-emerald-300">100%</span>
          <span className="text-dim text-3xs block">Local Client Dispatcher</span>
        </div>

        <div className="stat-card p-3 rounded bg-surface border border-subtle">
          <span className="text-dim text-3xs uppercase font-bold block">Rate Limiter State:</span>
          <span className="text-xl font-mono font-bold text-primary">
            {rateLimitStatus?.remaining || getRateLimitMax()} / {getRateLimitMax()}
          </span>
          <span className="text-dim text-3xs block">Reqs remaining in window</span>
        </div>

        <div className="stat-card p-3 rounded bg-surface border border-subtle">
          <span className="text-dim text-3xs uppercase font-bold block">Storage Stability:</span>
          <span className="text-xl font-mono font-bold text-secondary">NORMAL</span>
          <span className="text-dim text-3xs block">Zero quota overflow</span>
        </div>
      </div>

      {/* Subsystem Health Grid (Section 18) */}
      <div className="form-card mb-4 text-xs">
        <div className="card-header border-bottom pb-2 mb-3">
          <h3 className="card-title text-sm">Subsystems Operational Availability</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {status.subsystems.map(comp => (
            <div key={comp.id} className="p-2.5 rounded bg-surface border border-subtle">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-2xs truncate" title={comp.name}>{comp.name}</span>
                <span className={`w-2 h-2 rounded-full ${
                  comp.status === 'HEALTHY' ? 'bg-emerald-400' : 'bg-amber-400'
                }`} />
              </div>
              <p className="text-dim text-3xs truncate">{comp.details}</p>
            </div>
          ))}
        </div>
      </div>

      {/* State Transition Guards & Finite State Machine (Section 22) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 text-xs">
        <div className="form-card p-3 space-y-2">
          <h4 className="font-bold text-xs text-secondary mb-1">Human Review State Transitions:</h4>
          <p className="text-dim text-3xs mb-2">Enforced by review service; prevents skipping review steps.</p>
          <div className="space-y-1.5 font-mono text-3xs">
            <div className="p-2 rounded bg-surface border border-subtle flex items-center justify-between">
              <span className="text-primary font-bold">PENDING</span>
              <span className="text-dim">→ IN_REVIEW, APPROVED, REJECTED, ESCALATED</span>
            </div>
            <div className="p-2 rounded bg-surface border border-subtle flex items-center justify-between">
              <span className="text-primary font-bold">IN_REVIEW</span>
              <span className="text-dim">→ APPROVED, REJECTED, REQUEST_MORE_EVIDENCE</span>
            </div>
            <div className="p-2 rounded bg-surface border border-subtle flex items-center justify-between">
              <span className="text-emerald-400 font-bold">APPROVED / REJECTED</span>
              <span className="text-emerald-400 font-bold">TERMINAL (LOCKED)</span>
            </div>
          </div>
        </div>

        <div className="form-card p-3 space-y-2">
          <h4 className="font-bold text-xs text-secondary mb-1">Pickup Logistics State Transitions:</h4>
          <p className="text-dim text-3xs mb-2">Enforced by pickup service; prevents backward dispatching.</p>
          <div className="space-y-1.5 font-mono text-3xs">
            <div className="p-2 rounded bg-surface border border-subtle flex items-center justify-between">
              <span className="text-primary font-bold">READY</span>
              <span className="text-dim">→ SCHEDULED</span>
            </div>
            <div className="p-2 rounded bg-surface border border-subtle flex items-center justify-between">
              <span className="text-primary font-bold">SCHEDULED</span>
              <span className="text-dim">→ PICKED_UP, CANCELLED</span>
            </div>
            <div className="p-2 rounded bg-surface border border-subtle flex items-center justify-between">
              <span className="text-emerald-400 font-bold">PICKED_UP</span>
              <span className="text-emerald-400 font-bold">TERMINAL (Cannot return to READY)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
