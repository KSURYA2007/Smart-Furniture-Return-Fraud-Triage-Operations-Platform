import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  UserCheck, 
  X, 
  ArrowUpRight, 
  Camera 
} from 'lucide-react';
import { HUMAN_DECISIONS } from '../../services/reviewService.js';

export default function DecisionModal({
  isOpen,
  decisionPayload,
  returnId,
  onCancel,
  onConfirm,
  isSubmitting = false
}) {
  if (!isOpen || !decisionPayload) return null;

  const decisionMeta = HUMAN_DECISIONS[decisionPayload.decision_type] || {};

  const getModalHeaderIcon = () => {
    switch (decisionPayload.decision_type) {
      case 'APPROVE_PICKUP': return <CheckCircle2 size={24} className="text-emerald-400" />;
      case 'REJECT_RETURN': return <XCircle size={24} className="text-red-400" />;
      case 'REQUEST_MORE_EVIDENCE': return <Camera size={24} className="text-primary-light" />;
      case 'ESCALATE': return <ArrowUpRight size={24} className="text-amber-400" />;
      default: return <UserCheck size={24} className="text-secondary" />;
    }
  };

  return (
    <div className="modal-backdrop" onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="modal-decision-title">
      <div className="modal-content decision-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="flex items-center gap-2">
            {getModalHeaderIcon()}
            <div>
              <h3 id="modal-decision-title" className="modal-title font-serif">Confirm Operational Decision</h3>
              <span className="text-xs text-dim">Case ID: {returnId}</span>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onCancel} 
            className="modal-close-btn"
            aria-label="Close confirmation modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body p-4">
          {/* Decision Summary Banner */}
          <div className={`modal-decision-summary-banner ${decisionPayload.decision_type?.toLowerCase()} p-3 rounded mb-3`}>
            <div className="text-xs uppercase tracking-wide font-bold mb-1">Human Decision:</div>
            <div className="text-lg font-bold">{decisionMeta.label || decisionPayload.decision_type}</div>
            <p className="text-xs text-secondary mt-1">{decisionMeta.description}</p>
          </div>

          {/* Override Indicator */}
          {decisionPayload.override && (
            <div className="modal-override-warning mb-3 p-2 rounded bg-amber-bg border border-amber-border">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                <AlertTriangle size={15} />
                <span>Manual Override Active</span>
              </div>
              <p className="text-xs text-amber-200 mt-1">
                <strong>Override Justification:</strong> &ldquo;{decisionPayload.override_reason}&rdquo;
              </p>
            </div>
          )}

          {/* Reason Details */}
          <div className="modal-decision-details-box text-xs mb-3">
            <div className="detail-row mb-1">
              <span className="text-dim">Reason Categories:</span>
              <span className="font-semibold text-primary ml-1">
                {decisionPayload.reason_categories?.join(', ')}
              </span>
            </div>

            <div className="detail-row mb-2">
              <span className="text-dim">Explanation:</span>
              <p className="text-secondary font-medium mt-0.5 whitespace-pre-line bg-surface p-2 rounded">
                {decisionPayload.reason}
              </p>
            </div>

            {decisionPayload.evidence_requested && (
              <div className="detail-row mb-2">
                <span className="text-dim">Requested Evidence Checklist:</span>
                <span className="font-semibold text-secondary ml-1">
                  {decisionPayload.evidence_requested.items?.join(', ')}
                </span>
              </div>
            )}

            {decisionPayload.escalation && (
              <div className="detail-row mb-2">
                <span className="text-dim">Escalate To:</span>
                <span className="font-semibold text-amber-300 ml-1">
                  {decisionPayload.escalation.target}
                </span>
              </div>
            )}

            <div className="detail-row mt-2 pt-2 border-top">
              <span className="text-dim">Authorized Reviewer:</span>
              <span className="font-semibold text-secondary ml-1">
                {decisionPayload.reviewer?.name} ({decisionPayload.reviewer?.role})
              </span>
            </div>
          </div>

          <p className="text-dim text-xs text-center">
            Once submitted, this decision will be permanently logged in the audit trail.
          </p>
        </div>

        {/* Modal Footer Actions */}
        <div className="modal-footer flex items-center justify-end gap-2 p-3 border-top">
          <button
            type="button"
            className="btn-ghost btn-sm"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary btn-sm flex items-center gap-2"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span>Recording...</span>
            ) : (
              <>
                <CheckCircle2 size={15} />
                <span>Confirm & Save Decision</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
