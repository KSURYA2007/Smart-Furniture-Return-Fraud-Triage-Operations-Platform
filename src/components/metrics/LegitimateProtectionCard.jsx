import React from 'react';
import { UserCheck, Clock, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';

export default function LegitimateProtectionCard({ results, onSelectCase }) {
  if (!results) return null;

  const { legitimateCount, detection, comparison } = results;
  const falsePositives = detection.falsePositiveCases || [];

  return (
    <div className="legitimate-protection-card form-card mb-4 border-emerald">
      <div className="card-header border-bottom pb-2 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="card-header-icon bg-emerald-bg">
              <UserCheck size={16} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="card-title text-base">Legitimate Customer Protection Dashboard</h3>
              <p className="card-subtitle">
                Monitoring genuine customers to ensure fraud prevention does not create unfair operational friction
              </p>
            </div>
          </div>
          <span className="badge-count text-emerald-400 font-bold text-xs">
            {legitimateCount} Confirmed Legitimate
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 text-xs">
        <div className="stat-card p-2.5 rounded bg-surface border border-subtle">
          <span className="text-dim block text-3xs uppercase font-bold">Legitimate Avg Delay:</span>
          <span className="text-lg font-bold text-primary-light font-mono">
            {comparison.legitimateAvgDelay.proposed} days
          </span>
          <span className="text-dim text-3xs block">FIFO was {comparison.legitimateAvgDelay.baseline} days</span>
        </div>

        <div className="stat-card p-2.5 rounded bg-surface border border-subtle">
          <span className="text-dim block text-3xs uppercase font-bold">Legitimate SLA Violations:</span>
          <span className="text-lg font-bold text-emerald-400 font-mono">
            {comparison.slaViolationsLegit.proposed} cases
          </span>
          <span className="text-dim text-3xs block">FIFO had {comparison.slaViolationsLegit.baseline} cases</span>
        </div>

        <div className="stat-card p-2.5 rounded bg-surface border border-subtle">
          <span className="text-dim block text-3xs uppercase font-bold">Unnecessary Review (FP):</span>
          <span className="text-lg font-bold text-amber-300 font-mono">
            {falsePositives.length} cases
          </span>
          <span className="text-dim text-3xs block">
            {legitimateCount > 0 ? `${((falsePositives.length / legitimateCount) * 100).toFixed(1)}% of genuine` : '0%'}
          </span>
        </div>

        <div className="stat-card p-2.5 rounded bg-surface border border-subtle">
          <span className="text-dim block text-3xs uppercase font-bold">Median Customer Wait:</span>
          <span className="text-lg font-bold text-primary font-mono">
            {comparison.medianDelay.proposed} days
          </span>
          <span className="text-dim text-3xs block">SLA Target: 7 days</span>
        </div>
      </div>

      {/* False Positive Cases Inspection List (Section 20) */}
      <div className="false-positives-subpanel">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold text-xs text-secondary flex items-center gap-1.5">
            <ShieldAlert size={14} className="text-amber-400" />
            <span>False Positive Deep Dive (Legitimate Returns Subjected to Additional Review)</span>
          </h4>
          <span className="text-dim text-2xs">{falsePositives.length} cases flagged</span>
        </div>

        {falsePositives.length === 0 ? (
          <div className="p-3 text-center rounded bg-surface text-xs text-dim">
            Zero legitimate customers were subjected to unnecessary enhanced review.
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
                  <th>Evidence</th>
                  <th>Human Decision</th>
                  <th>Delay</th>
                  <th>Flagging Rationale</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {falsePositives.map(fp => (
                  <tr key={fp.returnId}>
                    <td className="font-serif-id font-bold text-primary">{fp.returnId}</td>
                    <td>{fp.customerId}</td>
                    <td className="truncate max-w-xs">{fp.product}</td>
                    <td>
                      <span className="priority-pill badge-risk-high font-mono">
                        {fp.triage.riskScore}
                      </span>
                    </td>
                    <td>
                      <span className="text-dim text-2xs uppercase">{fp.evidence.strength}</span>
                    </td>
                    <td>
                      <span className="text-emerald-400 font-semibold">{fp.review.humanDecision}</span>
                    </td>
                    <td className="font-mono">{fp.pickup.waitingDays}d</td>
                    <td className="text-2xs text-dim italic">
                      High historical return frequency triggered threshold before evidence review.
                    </td>
                    <td>
                      {onSelectCase && (
                        <button
                          type="button"
                          className="btn-ghost btn-xs"
                          onClick={() => onSelectCase(fp.returnId)}
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
