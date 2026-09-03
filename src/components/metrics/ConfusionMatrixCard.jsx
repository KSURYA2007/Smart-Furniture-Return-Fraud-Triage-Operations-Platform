import React from 'react';
import { ShieldAlert, HelpCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function ConfusionMatrixCard({ detection }) {
  if (!detection || detection.status === 'INSUFFICIENT_DATA') {
    return (
      <div className="confusion-matrix-card form-card mb-4">
        <div className="card-header border-bottom pb-2 mb-3">
          <h3 className="card-title text-base">Confusion Matrix & Detection Performance</h3>
        </div>
        <div className="p-4 text-center text-xs text-dim bg-surface rounded">
          <AlertTriangle size={20} className="text-amber-400 mx-auto mb-1.5" />
          <p className="font-bold text-secondary">Ground truth data required</p>
          <p className="text-dim">Assign Ground Truth labels in the Case Evaluation view to generate accuracy metrics.</p>
        </div>
      </div>
    );
  }

  const { TP, FP, TN, FN, precision, recall, f1, totalLabelled } = detection;

  return (
    <div className="confusion-matrix-card form-card mb-4">
      <div className="card-header border-bottom pb-2 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="card-header-icon bg-primary-light">
              <ShieldAlert size={16} className="icon-blue" />
            </div>
            <div>
              <h3 className="card-title text-base">Fraud Detection Confusion Matrix</h3>
              <p className="card-subtitle">
                Binary classification of system enhanced-review triage flags against verified ground truth (N = {totalLabelled} confirmed cases)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="badge-prototype-tag">F1 Score: <strong>{f1}</strong></span>
          </div>
        </div>
      </div>

      {/* 2x2 Matrix Display */}
      <div className="matrix-grid-wrapper mb-3">
        <div className="matrix-table-grid">
          {/* Header Row */}
          <div className="matrix-cell matrix-corner-cell">
            <span className="text-dim text-3xs uppercase">Flagged \ Actual</span>
          </div>
          <div className="matrix-cell matrix-header-cell text-center">
            <strong className="text-red-400 block text-xs">Actual Fraud (Confirmed)</strong>
          </div>
          <div className="matrix-cell matrix-header-cell text-center">
            <strong className="text-emerald-400 block text-xs">Actual Legitimate (Confirmed)</strong>
          </div>

          {/* Row 1: Flagged */}
          <div className="matrix-cell matrix-side-header">
            <strong className="text-secondary text-xs">Flagged for Review</strong>
            <span className="text-dim text-3xs block">(Risk &ge; 50 or Escalated)</span>
          </div>
          <div className="matrix-cell matrix-value-cell bg-emerald-bg border-emerald text-center p-3">
            <span className="text-2xs text-emerald-300 font-bold block">True Positive (TP)</span>
            <span className="text-2xl font-bold font-mono text-emerald-400">{TP}</span>
            <span className="text-3xs text-dim block mt-0.5">Fraud correctly intercepted</span>
          </div>
          <div className="matrix-cell matrix-value-cell bg-amber-bg border-amber text-center p-3">
            <span className="text-2xs text-amber-300 font-bold block">False Positive (FP)</span>
            <span className="text-2xl font-bold font-mono text-amber-300">{FP}</span>
            <span className="text-3xs text-dim block mt-0.5">Legitimate unnecessarily flagged</span>
          </div>

          {/* Row 2: Not Flagged */}
          <div className="matrix-cell matrix-side-header">
            <strong className="text-secondary text-xs">Not Flagged</strong>
            <span className="text-dim text-3xs block">(Fast-Track Approved)</span>
          </div>
          <div className="matrix-cell matrix-value-cell bg-red-bg border-red text-center p-3">
            <span className="text-2xs text-red-400 font-bold block">False Negative (FN)</span>
            <span className="text-2xl font-bold font-mono text-red-400">{FN}</span>
            <span className="text-3xs text-dim block mt-0.5">Fraud slipped through undetected</span>
          </div>
          <div className="matrix-cell matrix-value-cell bg-surface border text-center p-3">
            <span className="text-2xs text-secondary font-bold block">True Negative (TN)</span>
            <span className="text-2xl font-bold font-mono text-primary">{TN}</span>
            <span className="text-3xs text-dim block mt-0.5">Legitimate smoothly fast-tracked</span>
          </div>
        </div>
      </div>

      {/* Precision / Recall / F1 Metric Definitions (Section 17, 18, 19) */}
      <div className="detection-metrics-details-grid grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-2 border-top">
        <div className="metric-def-box p-2.5 rounded bg-surface border border-subtle">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-secondary">Precision:</span>
            <span className="font-mono font-bold text-amber-300 text-sm">
              {precision !== 'N/A' ? `${precision}%` : 'N/A'}
            </span>
          </div>
          <p className="text-dim text-3xs leading-relaxed">
            &ldquo;Of the cases flagged for enhanced review, how many were actually confirmed fraud?&rdquo;
          </p>
        </div>

        <div className="metric-def-box p-2.5 rounded bg-surface border border-subtle">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-secondary">Recall (Sensitivity):</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              {recall !== 'N/A' ? `${recall}%` : 'N/A'}
            </span>
          </div>
          <p className="text-dim text-3xs leading-relaxed">
            &ldquo;Of all confirmed fraud cases, how many were identified for enhanced review?&rdquo;
          </p>
        </div>

        <div className="metric-def-box p-2.5 rounded bg-surface border border-subtle">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-secondary">F1 Harmonic Score:</span>
            <span className="font-mono font-bold text-primary text-sm">{f1}</span>
          </div>
          <p className="text-dim text-3xs leading-relaxed">
            Balanced harmonic mean between Precision and Recall. Avoids overclaiming single-metric success.
          </p>
        </div>
      </div>
    </div>
  );
}
