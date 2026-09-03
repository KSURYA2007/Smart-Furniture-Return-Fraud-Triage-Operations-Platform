import React from 'react';
import { ShieldAlert, TrendingDown, CheckCircle2, DollarSign, AlertTriangle } from 'lucide-react';
import { formatCurrencyINR } from '../../utils/customerHistory.js';

export default function FraudProtectionCard({ results, onSelectCase }) {
  if (!results) return null;

  const { confirmedFraudCount, detection, comparison } = results;
  const falseNegatives = detection.falseNegativeCases || [];

  const coveragePct = confirmedFraudCount > 0 
    ? (((confirmedFraudCount - falseNegatives.length) / confirmedFraudCount) * 100).toFixed(1) 
    : '100.0';

  return (
    <div className="fraud-protection-card form-card mb-4 border-amber">
      <div className="card-header border-bottom pb-2 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="card-header-icon bg-amber-bg">
              <ShieldAlert size={16} className="text-amber-400" />
            </div>
            <div>
              <h3 className="card-title text-base">Fraud-Loss Prevention & Detection Performance</h3>
              <p className="card-subtitle">
                Quantifying financial exposure safeguards, intercepted claims, and potential detection gaps
              </p>
            </div>
          </div>
          <span className="badge-count text-amber-300 font-bold text-xs">
            {confirmedFraudCount} Confirmed Fraud Cases
          </span>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 text-xs">
        <div className="stat-card p-2.5 rounded bg-surface border border-subtle">
          <span className="text-dim block text-3xs uppercase font-bold">Fraud Exposure Safeguarded:</span>
          <span className="text-lg font-bold text-emerald-400 font-mono">
            {comparison.fraudLossExposure.difference < 0 
              ? formatCurrencyINR(Math.abs(comparison.fraudLossExposure.difference)) 
              : '₹0'}
          </span>
          <span className="text-dim text-3xs block">Intercepted prior to refund</span>
        </div>

        <div className="stat-card p-2.5 rounded bg-surface border border-subtle">
          <span className="text-dim block text-3xs uppercase font-bold">Fraud Review Coverage:</span>
          <span className="text-lg font-bold text-primary-light font-mono">
            {coveragePct}%
          </span>
          <span className="text-dim text-3xs block">Flagged for human inspection</span>
        </div>

        <div className="stat-card p-2.5 rounded bg-surface border border-subtle">
          <span className="text-dim block text-3xs uppercase font-bold">Residual Leakage Exposure:</span>
          <span className="text-lg font-bold text-red-400 font-mono">
            {formatCurrencyINR(comparison.fraudLossExposure.proposed)}
          </span>
          <span className="text-dim text-3xs block">FIFO had {formatCurrencyINR(comparison.fraudLossExposure.baseline)}</span>
        </div>

        <div className="stat-card p-2.5 rounded bg-surface border border-subtle">
          <span className="text-dim block text-3xs uppercase font-bold">Missed Fraud Cases (FN):</span>
          <span className="text-lg font-bold text-red-400 font-mono">
            {falseNegatives.length} cases
          </span>
          <span className="text-dim text-3xs block">Recall: {detection.recall !== 'N/A' ? `${detection.recall}%` : 'N/A'}</span>
        </div>
      </div>

      {/* False Negatives Subpanel (Section 21) */}
      <div className="false-negatives-subpanel">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold text-xs text-secondary flex items-center gap-1.5">
            <AlertTriangle size={14} className="text-red-400" />
            <span>False Negative Cases (Confirmed Fraud Missed by Initial Triage)</span>
          </h4>
          <span className="text-dim text-2xs">{falseNegatives.length} unflagged cases</span>
        </div>

        {falseNegatives.length === 0 ? (
          <div className="p-3 text-center rounded bg-surface text-xs text-emerald-400">
            All confirmed fraud cases were successfully flagged for enhanced human review.
          </div>
        ) : (
          <div className="pickup-table-wrapper">
            <table className="pickup-queue-table text-xs">
              <thead>
                <tr>
                  <th>Return ID</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Risk Score</th>
                  <th>Evidence Quality</th>
                  <th>Financial Loss</th>
                  <th>Why it was missed</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {falseNegatives.map(fn => (
                  <tr key={fn.returnId}>
                    <td className="font-serif-id font-bold text-red-400">{fn.returnId}</td>
                    <td>{fn.customerId}</td>
                    <td className="truncate max-w-xs">{fn.product}</td>
                    <td>
                      <span className="priority-pill badge-risk-low font-mono">
                        {fn.triage.riskScore}
                      </span>
                    </td>
                    <td>
                      <span className="text-dim text-2xs uppercase">{fn.evidence.strength}</span>
                    </td>
                    <td className="font-mono text-red-400 font-bold">
                      {formatCurrencyINR(fn.groundTruth.fraudLoss)}
                    </td>
                    <td className="text-2xs text-dim italic">
                      Customer had no prior return history and high photographic clarity masked substituted item.
                    </td>
                    <td>
                      {onSelectCase && (
                        <button
                          type="button"
                          className="btn-ghost btn-xs"
                          onClick={() => onSelectCase(fn.returnId)}
                        >
                          Trace &rarr;
                        </button>
                      )}
                    </td>
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
