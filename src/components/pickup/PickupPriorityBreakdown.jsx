import React from 'react';
import { 
  ShieldAlert, 
  HelpCircle, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  Compass, 
  Leaf, 
  Scale, 
  Sliders
} from 'lucide-react';

export default function PickupPriorityBreakdown({
  priorityData,
  onOpenOverrideModal
}) {
  if (!priorityData) return null;

  const {
    pickup_priority_score,
    priority_level,
    factors = [],
    is_customer_service_urgency,
    is_overridden,
    override
  } = priorityData;

  const getPriorityColor = (level) => {
    switch (level) {
      case 'CRITICAL': return 'text-red-400';
      case 'HIGH': return 'text-amber-400';
      case 'STANDARD': return 'text-yellow-400';
      case 'LOW': return 'text-emerald-400';
      default: return 'text-primary';
    }
  };

  return (
    <div className="pickup-priority-breakdown-card form-card mb-4">
      {/* Header */}
      <div className="card-header border-bottom pb-3 mb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="card-header-icon bg-primary-light">
              <Scale size={18} className="icon-blue" />
            </div>
            <div>
              <h3 className="card-title text-base">Pickup Priority Score & Factor Arithmetic</h3>
              <p className="card-subtitle">Transparent multi-objective weighting (0–100 operational priority)</p>
            </div>
          </div>

          {onOpenOverrideModal && (
            <button
              type="button"
              className="btn-secondary btn-xs flex items-center gap-1"
              onClick={onOpenOverrideModal}
            >
              <Sliders size={13} />
              <span>Override Priority</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Score Hero Pill */}
      <div className="priority-hero-row flex items-center justify-between p-3 rounded bg-surface border border-subtle mb-3">
        <div className="flex items-center gap-3">
          <div className="priority-num-box text-center">
            <span className={`text-3xl font-bold font-serif ${getPriorityColor(priority_level)}`}>
              {pickup_priority_score}
            </span>
            <span className="text-dim text-xs block">/ 100 pts</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`priority-level-badge font-bold uppercase tracking-wider text-xs px-2 py-0.5 rounded ${getPriorityColor(priority_level)} bg-surface-elevated`}>
                {priority_level} PRIORITY
              </span>
              {is_overridden && (
                <span className="badge-warn-high text-xs">
                  Manual Manager Override Active
                </span>
              )}
            </div>
            <p className="text-xs text-secondary mt-1">
              Operational urgency ranking for reverse logistics dispatch and route assignment.
            </p>
          </div>
        </div>

        {/* Customer Service Urgency Badge (Section 7 & 26) */}
        {is_customer_service_urgency && (
          <div className="customer-service-urgency-banner p-2 rounded bg-blue-bg border border-blue-border text-xs">
            <div className="flex items-center gap-1 font-bold text-blue-300">
              <Clock size={13} />
              <span>CUSTOMER SERVICE URGENCY</span>
            </div>
            <p className="text-blue-200 text-2xs mt-0.5">
              Legitimate approved return waiting &gt; 5 days — prioritised to prevent customer delay.
            </p>
          </div>
        )}
      </div>

      {/* Active Manual Override Warning if present */}
      {is_overridden && (
        <div className="override-details-box p-2.5 rounded bg-amber-bg border border-amber-border text-xs mb-3">
          <div className="flex items-center gap-1.5 font-bold text-amber-300 mb-1">
            <AlertTriangle size={14} />
            <span>Operational Override: Changed from {override.original_priority_score} ({override.original_priority_level}) to {override.overridden_score} ({override.overridden_level})</span>
          </div>
          <p className="text-amber-200 text-xs italic">
            &ldquo;{override.override_reason}&rdquo; &bull; Logged by {override.overridden_by} at {new Date(override.overridden_at).toLocaleTimeString('en-IN')}
          </p>
        </div>
      )}

      {/* Why is this pickup prioritized? Explanation Box (Section 27) */}
      <div className="why-prioritized-box p-3 rounded bg-surface-elevated border border-card mb-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-primary mb-1">
          <HelpCircle size={14} className="text-primary-light" />
          <span>Why is this pickup prioritized?</span>
        </div>
        <p className="text-xs text-secondary leading-relaxed">
          {priorityData.is_customer_service_urgency ? (
            <span>
              Prioritized primarily because <strong>the claim is verified and approved by a human reviewer</strong>, the customer has been waiting <strong>{priorityData.days_waiting} days</strong>, and expedited collection is required to maintain customer satisfaction and service SLA.
            </span>
          ) : (
            <span>
              Prioritized based on balanced consideration of human review approval, an order value of <strong>{priorityData.factors.find(f => f.id === 'financial_exposure')?.value}</strong>, waiting duration of <strong>{priorityData.days_waiting} days</strong>, and local route density in <strong>{priorityData.factors.find(f => f.id === 'route_efficiency')?.value}</strong>.
            </span>
          )}
        </p>
      </div>

      {/* 8-Factor Arithmetic Table */}
      <div className="factors-table-wrap overflow-x-auto text-xs">
        <table className="w-full text-left">
          <thead>
            <tr className="border-bottom text-dim">
              <th className="py-1.5">Factor</th>
              <th className="py-1.5 text-right">Points</th>
              <th className="py-1.5">Explanation</th>
              <th className="py-1.5">Source</th>
              <th className="py-1.5 text-right">Value</th>
            </tr>
          </thead>
          <tbody>
            {factors.map((factor) => (
              <tr key={factor.id} className="border-bottom hover:bg-surface">
                <td className="py-2 font-medium text-primary">
                  {factor.name}
                </td>
                <td className="py-2 text-right font-mono font-bold text-amber-400">
                  +{factor.points} / {factor.max_points}
                </td>
                <td className="py-2 text-secondary max-w-sm">
                  {factor.explanation}
                </td>
                <td className="py-2 text-dim text-2xs">
                  {factor.source}
                </td>
                <td className="py-2 text-right font-semibold text-secondary">
                  {factor.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Fairness & Model Disclaimer */}
      <p className="text-dim text-2xs mt-3 pt-2 border-top">
        * Priority Score is a deterministic operational metric balancing logistics efficiency and customer service. It does NOT represent fraud probability or customer suspicion.
      </p>
    </div>
  );
}
