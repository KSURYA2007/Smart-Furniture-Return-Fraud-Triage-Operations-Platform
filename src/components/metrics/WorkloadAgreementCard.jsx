import React from 'react';
import { UserCheck, Clock, Sliders, CheckCircle2, AlertCircle } from 'lucide-react';

export default function WorkloadAgreementCard({ workload }) {
  if (!workload) return null;

  const {
    totalReviews,
    avgReviewDuration,
    reviewHours,
    reviewsPer100,
    totalOverrides,
    overrideRate,
    systemHumanAgreement,
    systemHumanDisagreement
  } = workload;

  return (
    <div className="workload-agreement-card form-card mb-4">
      <div className="card-header border-bottom pb-2 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="card-header-icon bg-primary-light">
              <UserCheck size={16} className="icon-blue" />
            </div>
            <div>
              <h3 className="card-title text-base">Human Review Workload & System-Human Agreement</h3>
              <p className="card-subtitle">
                Measuring operational burden on dispatchers and alignment between automated triage and final human decisions
              </p>
            </div>
          </div>
          <span className="badge-count font-bold text-xs">{totalReviews} Reviews Executed</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Review Workload */}
        <div className="workload-box p-3 rounded bg-surface border border-subtle">
          <h4 className="font-bold text-xs text-secondary mb-2 flex items-center gap-1.5">
            <Clock size={14} className="text-primary-light" />
            <span>Dispatcher Review Workload</span>
          </h4>

          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div>
              <span className="text-dim text-3xs uppercase block">Total Review Hours:</span>
              <span className="font-mono font-bold text-lg text-primary">{reviewHours} hrs</span>
            </div>
            <div>
              <span className="text-dim text-3xs uppercase block">Avg Time per Case:</span>
              <span className="font-mono font-bold text-lg text-secondary">{avgReviewDuration} min</span>
            </div>
            <div>
              <span className="text-dim text-3xs uppercase block">Review Intensity:</span>
              <span className="font-mono font-bold text-sm text-secondary">{reviewsPer100} / 100 returns</span>
            </div>
            <div>
              <span className="text-dim text-3xs uppercase block">Active Reviewers:</span>
              <span className="font-mono font-bold text-sm text-secondary">3 Dispatchers</span>
            </div>
          </div>

          <p className="text-dim text-3xs leading-relaxed border-top pt-2">
            Workload represents human time invested inspecting photographic evidence, reviewing lifetime return velocity, and validating claims.
          </p>
        </div>

        {/* Right: Human-System Agreement & Overrides */}
        <div className="agreement-box p-3 rounded bg-surface border border-subtle">
          <h4 className="font-bold text-xs text-secondary mb-2 flex items-center gap-1.5">
            <Sliders size={14} className="text-amber-400" />
            <span>Human-System Agreement & Overrides</span>
          </h4>

          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div>
              <span className="text-dim text-3xs uppercase block">Agreement Rate:</span>
              <span className="font-mono font-bold text-lg text-emerald-400">{systemHumanAgreement}%</span>
            </div>
            <div>
              <span className="text-dim text-3xs uppercase block">Override Rate:</span>
              <span className="font-mono font-bold text-lg text-amber-300">{overrideRate}%</span>
            </div>
            <div>
              <span className="text-dim text-3xs uppercase block">Total Overrides:</span>
              <span className="font-mono font-bold text-sm text-amber-300">{totalOverrides} cases</span>
            </div>
            <div>
              <span className="text-dim text-3xs uppercase block">Disagreement:</span>
              <span className="font-mono font-bold text-sm text-dim">{systemHumanDisagreement}%</span>
            </div>
          </div>

          <p className="text-dim text-3xs leading-relaxed border-top pt-2">
            Note: Disagreement is considered healthy feedback in human-in-the-loop triage, validating that operators retain final operational authority.
          </p>
        </div>
      </div>
    </div>
  );
}
