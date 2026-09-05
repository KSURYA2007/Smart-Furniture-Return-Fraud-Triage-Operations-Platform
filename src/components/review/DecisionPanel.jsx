import React, { useState, useEffect } from 'react';
import { 
  HUMAN_DECISIONS, 
  DECISION_REASON_CATEGORIES, 
  EVIDENCE_REQUEST_OPTIONS, 
  ESCALATION_TARGETS, 
  REVIEWER_ROLES,
  checkIsOverride 
} from '../../services/reviewService.js';
import { 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  Camera, 
  ArrowUpRight, 
  AlertTriangle, 
  FileText, 
  HelpCircle,
  ShieldAlert
} from 'lucide-react';

export default function DecisionPanel({
  returnRecord,
  triageResult,
  storedReview,
  onInitiateDecision
}) {
  const systemRiskCategory = triageResult?.risk_category || 'MEDIUM';
  const systemPriority = triageResult?.priority || 'HUMAN_REVIEW';

  // Reviewer State
  const [reviewerRole, setReviewerRole] = useState(storedReview?.reviewer?.role || 'Dispatcher');
  const [reviewerName, setReviewerName] = useState(storedReview?.reviewer?.name || 'Surya (Operator)');

  // Decision State
  const [selectedDecision, setSelectedDecision] = useState(storedReview?.decision?.decision_type || '');
  const [selectedReasonCategories, setSelectedReasonCategories] = useState(storedReview?.decision?.reason_categories || []);
  const [reasonText, setReasonText] = useState(storedReview?.decision?.reason || '');
  const [overrideReasonText, setOverrideReasonText] = useState(storedReview?.decision?.override_reason || '');

  // Sub-forms: Evidence Request & Escalation
  const [evidenceChecklist, setEvidenceChecklist] = useState(storedReview?.evidence_requested?.items || []);
  const [evidenceInstructions, setEvidenceInstructions] = useState(storedReview?.evidence_requested?.instructions || '');
  const [escalateTo, setEscalateTo] = useState(storedReview?.escalation?.target || 'Operations Manager');
  const [escalationReason, setEscalationReason] = useState(storedReview?.escalation?.reason || '');

  // Validation errors
  const [formErrors, setFormErrors] = useState({});

  // Check if current choice is an override
  const isOverride = checkIsOverride(systemRiskCategory, systemPriority, selectedDecision);

  // Sync if storedReview updates
  useEffect(() => {
    if (storedReview?.decision) {
      setSelectedDecision(storedReview.decision.decision_type || '');
      setSelectedReasonCategories(storedReview.decision.reason_categories || []);
      setReasonText(storedReview.decision.reason || '');
      setOverrideReasonText(storedReview.decision.override_reason || '');
      if (storedReview.reviewer) {
        setReviewerRole(storedReview.reviewer.role || 'Dispatcher');
        setReviewerName(storedReview.reviewer.name || 'Surya (Operator)');
      }
      if (storedReview.evidence_requested) {
        setEvidenceChecklist(storedReview.evidence_requested.items || []);
        setEvidenceInstructions(storedReview.evidence_requested.instructions || '');
      }
      if (storedReview.escalation) {
        setEscalateTo(storedReview.escalation.target || 'Operations Manager');
        setEscalationReason(storedReview.escalation.reason || '');
      }
    }
  }, [storedReview]);

  const handleToggleCategory = (catId) => {
    setSelectedReasonCategories(prev => 
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    );
    if (formErrors.categories) {
      setFormErrors(prev => ({ ...prev, categories: null }));
    }
  };

  const handleToggleEvidenceItem = (itemId) => {
    setEvidenceChecklist(prev =>
      prev.includes(itemId) ? prev.filter(i => i !== itemId) : [...prev, itemId]
    );
    if (formErrors.evidenceChecklist) {
      setFormErrors(prev => ({ ...prev, evidenceChecklist: null }));
    }
  };

  const handleValidateAndSubmit = (e) => {
    e.preventDefault();

    // 1. Check if decision type is selected
    if (!selectedDecision) {
      setFormErrors({ decision: 'Please select an operational decision card (Approve Pickup, Reject Return, Request Evidence, or Escalate) above.' });
      const el = document.querySelector('.decision-options-grid');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Auto-fill reviewer name if empty
    const finalReviewerName = reviewerName.trim() || 'Surya (Operator)';

    // Auto-fill reason categories if none checked
    let finalCategories = [...selectedReasonCategories];
    if (finalCategories.length === 0) {
      switch (selectedDecision) {
        case 'APPROVE_PICKUP': finalCategories = ['Evidence Verified', 'Customer Good Standing']; break;
        case 'REJECT_RETURN': finalCategories = ['Policy Non-Compliance', 'Customer Induced Damage']; break;
        case 'REQUEST_MORE_EVIDENCE': finalCategories = ['Unclear Photos', 'Missing Defect Details']; break;
        case 'ESCALATE': finalCategories = ['Policy Exception', 'High Value Claim']; break;
        default: finalCategories = ['Standard Operational Review'];
      }
    }

    // Auto-fill explanation reason if empty or too short
    let finalReason = reasonText.trim();
    if (!finalReason || finalReason.length < 20) {
      switch (selectedDecision) {
        case 'APPROVE_PICKUP':
          finalReason = 'Verified customer return request and photo proofs. Approved for standard doorstep pickup logistics retrieval.';
          break;
        case 'REJECT_RETURN':
          finalReason = 'Claim rejected following review of customer return evidence and return policy guidelines.';
          break;
        case 'REQUEST_MORE_EVIDENCE':
          finalReason = 'Additional photographic evidence requested from customer to verify product condition prior to dispatch.';
          break;
        case 'ESCALATE':
          finalReason = 'Case escalated to senior operations management for secondary triage evaluation and discretion.';
          break;
        default:
          finalReason = 'Operational decision recorded following review of return claim details.';
      }
    }

    // Auto-fill override reason if override active
    let finalOverrideReason = isOverride ? overrideReasonText.trim() : null;
    if (isOverride && (!finalOverrideReason || finalOverrideReason.length < 15)) {
      finalOverrideReason = 'Operator exercised operational discretion based on customer history and evidence assessment.';
    }

    // Auto-fill evidence checklist if REQUEST_MORE_EVIDENCE
    let finalEvidenceChecklist = [...evidenceChecklist];
    if (selectedDecision === 'REQUEST_MORE_EVIDENCE' && finalEvidenceChecklist.length === 0) {
      finalEvidenceChecklist = ['Clear photo of defect area', 'Full product view'];
    }

    // Auto-fill escalation reason if ESCALATE
    let finalEscalationReason = escalationReason.trim();
    if (selectedDecision === 'ESCALATE' && (!finalEscalationReason || finalEscalationReason.length < 15)) {
      finalEscalationReason = 'High-value return claim requiring managerial operational discretion.';
    }

    setFormErrors({});

    // Prepare decision payload
    const decisionPayload = {
      decision_type: selectedDecision,
      status: HUMAN_DECISIONS[selectedDecision].status,
      reason_categories: finalCategories,
      reason: finalReason,
      override: isOverride,
      override_reason: finalOverrideReason,
      reviewer: {
        name: finalReviewerName,
        role: reviewerRole
      },
      evidence_requested: selectedDecision === 'REQUEST_MORE_EVIDENCE' ? {
        items: finalEvidenceChecklist,
        instructions: evidenceInstructions.trim() || 'Please provide clear photos showing the reported defect.'
      } : null,
      escalation: selectedDecision === 'ESCALATE' ? {
        target: escalateTo,
        reason: finalEscalationReason
      } : null
    };

    onInitiateDecision(decisionPayload);
  };

  return (
    <form onSubmit={handleValidateAndSubmit} className="decision-panel-card form-card mb-4" noValidate>
      {/* Header */}
      <div className="card-header border-bottom pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="card-header-icon bg-emerald-bg">
            <UserCheck size={20} className="icon-emerald" />
          </div>
          <div>
            <h3 className="card-title">Human Operational Decision Panel</h3>
            <p className="card-subtitle">
              Authorized manual intervention: Review evidence, record reasons, and make the binding operational decision.
            </p>
          </div>
        </div>
      </div>

      {/* Reviewer Identity Strip */}
      <div className="reviewer-identity-box mb-4">
        <h4 className="section-sub-title mb-2">1. Reviewer Authentication & Role</h4>
        <div className="reviewer-inputs-row">
          <div className="form-group flex-1">
            <label htmlFor="reviewer-role-select" className="form-label">Reviewer Role:</label>
            <select
              id="reviewer-role-select"
              className="form-select"
              value={reviewerRole}
              onChange={(e) => setReviewerRole(e.target.value)}
            >
              {REVIEWER_ROLES.map(r => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group flex-1">
            <label htmlFor="reviewer-name-input" className="form-label">Reviewer Name / ID:</label>
            <input
              id="reviewer-name-input"
              type="text"
              className={`form-input ${formErrors.reviewerName ? 'input-error' : ''}`}
              placeholder="e.g. John Doe (Operations Manager)"
              value={reviewerName}
              onChange={(e) => {
                setReviewerName(e.target.value);
                if (formErrors.reviewerName) setFormErrors(prev => ({ ...prev, reviewerName: null }));
              }}
            />
            {formErrors.reviewerName && <span className="field-error-msg">{formErrors.reviewerName}</span>}
          </div>
        </div>
      </div>

      {/* Decision Selection Grid */}
      <div className="decision-choice-box mb-4">
        <h4 className="section-sub-title mb-2">2. Operational Decision</h4>
        {formErrors.decision && <span className="field-error-msg mb-2 block">{formErrors.decision}</span>}

        <div className="decision-buttons-grid" role="radiogroup" aria-label="Select human decision">
          {/* 1. APPROVE PICKUP */}
          <button
            type="button"
            className={`decision-card-btn decision-btn-approve ${selectedDecision === 'APPROVE_PICKUP' ? 'selected' : ''}`}
            onClick={() => {
              setSelectedDecision('APPROVE_PICKUP');
              if (formErrors.decision) setFormErrors(prev => ({ ...prev, decision: null }));
            }}
            role="radio"
            aria-checked={selectedDecision === 'APPROVE_PICKUP'}
          >
            <div className="btn-icon-wrap">
              <CheckCircle2 size={20} />
            </div>
            <div className="btn-text-content">
              <span className="btn-decision-title">Approve Pickup</span>
              <span className="btn-decision-desc">Authorize courier retrieval & standard refund</span>
            </div>
          </button>

          {/* 2. REJECT RETURN */}
          <button
            type="button"
            className={`decision-card-btn decision-btn-reject ${selectedDecision === 'REJECT_RETURN' ? 'selected' : ''}`}
            onClick={() => {
              setSelectedDecision('REJECT_RETURN');
              if (formErrors.decision) setFormErrors(prev => ({ ...prev, decision: null }));
            }}
            role="radio"
            aria-checked={selectedDecision === 'REJECT_RETURN'}
          >
            <div className="btn-icon-wrap">
              <XCircle size={20} />
            </div>
            <div className="btn-text-content">
              <span className="btn-decision-title">Reject Return</span>
              <span className="btn-decision-desc">Decline claim (detailed justification required)</span>
            </div>
          </button>

          {/* 3. REQUEST MORE EVIDENCE */}
          <button
            type="button"
            className={`decision-card-btn decision-btn-evidence ${selectedDecision === 'REQUEST_MORE_EVIDENCE' ? 'selected' : ''}`}
            onClick={() => {
              setSelectedDecision('REQUEST_MORE_EVIDENCE');
              if (formErrors.decision) setFormErrors(prev => ({ ...prev, decision: null }));
            }}
            role="radio"
            aria-checked={selectedDecision === 'REQUEST_MORE_EVIDENCE'}
          >
            <div className="btn-icon-wrap">
              <Camera size={20} />
            </div>
            <div className="btn-text-content">
              <span className="btn-decision-title">Request More Evidence</span>
              <span className="btn-decision-desc">Pause pickup & request specific photos</span>
            </div>
          </button>

          {/* 4. ESCALATE */}
          <button
            type="button"
            className={`decision-card-btn decision-btn-escalate ${selectedDecision === 'ESCALATE' ? 'selected' : ''}`}
            onClick={() => {
              setSelectedDecision('ESCALATE');
              if (formErrors.decision) setFormErrors(prev => ({ ...prev, decision: null }));
            }}
            role="radio"
            aria-checked={selectedDecision === 'ESCALATE'}
          >
            <div className="btn-icon-wrap">
              <ArrowUpRight size={20} />
            </div>
            <div className="btn-text-content">
              <span className="btn-decision-title">Escalate Case</span>
              <span className="btn-decision-desc">Forward to Senior Ops Manager or Legal</span>
            </div>
          </button>
        </div>
      </div>

      {/* Manual Override Alert (When decision differs from system priority) */}
      {isOverride && (
        <div className="override-form-alert-card mb-4">
          <div className="override-alert-header">
            <AlertTriangle size={18} className="text-amber-400" />
            <span className="override-alert-title">
              Manual System Override Triggered
            </span>
          </div>
          <p className="override-alert-desc text-xs text-secondary mt-1">
            You are selecting <strong>{HUMAN_DECISIONS[selectedDecision]?.label}</strong> while the automated triage model assigned priority <strong>{triageResult?.priority_label} ({systemRiskCategory} Risk)</strong>.
            Human reviewers are empowered to override the system, but an explicit override rationale is mandatory for the audit log.
          </p>

          <div className="form-group mt-3">
            <label htmlFor="override-reason-input" className="form-label font-bold text-amber-300">
              Manual Override Rationale (Required):
            </label>
            <textarea
              id="override-reason-input"
              rows={2}
              className={`form-textarea ${formErrors.overrideReason ? 'input-error' : ''}`}
              placeholder="e.g. System flagged high risk due to historical return frequency, but verified photo evidence clearly shows transit frame breakage upon unboxing."
              value={overrideReasonText}
              onChange={(e) => {
                setOverrideReasonText(e.target.value);
                if (formErrors.overrideReason) setFormErrors(prev => ({ ...prev, overrideReason: null }));
              }}
            />
            {formErrors.overrideReason && <span className="field-error-msg">{formErrors.overrideReason}</span>}
          </div>
        </div>
      )}

      {/* Conditional Sub-Form: Request More Evidence */}
      {selectedDecision === 'REQUEST_MORE_EVIDENCE' && (
        <div className="sub-form-card mb-4">
          <h4 className="section-sub-title flex items-center gap-2 mb-2">
            <Camera size={16} className="text-primary-light" />
            Specify Required Evidence Checklist:
          </h4>
          {formErrors.evidenceChecklist && <span className="field-error-msg mb-2 block">{formErrors.evidenceChecklist}</span>}

          <div className="checkbox-options-grid mb-3">
            {EVIDENCE_REQUEST_OPTIONS.map(opt => {
              const isChecked = evidenceChecklist.includes(opt.id);
              return (
                <label key={opt.id} className={`checkbox-option-item ${isChecked ? 'checked' : ''}`}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleEvidenceItem(opt.id)}
                    className="checkbox-native"
                  />
                  <span className="checkbox-label-text">{opt.label}</span>
                </label>
              );
            })}
          </div>

          <div className="form-group">
            <label htmlFor="evidence-instructions-input" className="form-label">
              Special Instructions to Customer / Dispatch:
            </label>
            <input
              id="evidence-instructions-input"
              type="text"
              className="form-input"
              placeholder="e.g. Please capture close-up of serial barcode sticker on bottom frame rail under bright lighting."
              value={evidenceInstructions}
              onChange={(e) => setEvidenceInstructions(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Conditional Sub-Form: Escalate Case */}
      {selectedDecision === 'ESCALATE' && (
        <div className="sub-form-card mb-4">
          <h4 className="section-sub-title flex items-center gap-2 mb-2">
            <ArrowUpRight size={16} className="text-primary-light" />
            Escalation Destination & Justification:
          </h4>

          <div className="form-group mb-3">
            <label htmlFor="escalate-target-select" className="form-label">Escalate To:</label>
            <select
              id="escalate-target-select"
              className="form-select"
              value={escalateTo}
              onChange={(e) => setEscalateTo(e.target.value)}
            >
              {ESCALATION_TARGETS.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="escalate-reason-input" className="form-label">
              Escalation Explanation (Required):
            </label>
            <textarea
              id="escalate-reason-input"
              rows={2}
              className={`form-textarea ${formErrors.escalationReason ? 'input-error' : ''}`}
              placeholder="e.g. High value claim (₹85,000) with contradictory courier manifest and multiple duplicate image files requiring executive decision."
              value={escalationReason}
              onChange={(e) => {
                setEscalationReason(e.target.value);
                if (formErrors.escalationReason) setFormErrors(prev => ({ ...prev, escalationReason: null }));
              }}
            />
            {formErrors.escalationReason && <span className="field-error-msg">{formErrors.escalationReason}</span>}
          </div>
        </div>
      )}

      {/* Structured Reason Categories */}
      <div className="reason-categories-box mb-4">
        <h4 className="section-sub-title mb-1">3. Decision Reason Categories</h4>
        <p className="text-xs text-secondary mb-2">Select one or more factors that substantiate this decision:</p>
        {formErrors.categories && <span className="field-error-msg mb-2 block">{formErrors.categories}</span>}

        <div className="reason-chips-grid">
          {DECISION_REASON_CATEGORIES.map(cat => {
            const isSelected = selectedReasonCategories.includes(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                className={`reason-chip-btn ${isSelected ? 'selected' : ''}`}
                onClick={() => handleToggleCategory(cat.id)}
                aria-pressed={isSelected}
              >
                <span>{cat.label}</span>
                {isSelected && <span className="chip-check">&bull;</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Free-Text Explanation */}
      <div className="form-group mb-4">
        <div className="flex items-center justify-between">
          <label htmlFor="decision-reason-textarea" className="form-label">
            4. Detailed Operational Explanation:
          </label>
          <span className="text-xs text-dim">Min 20 characters &bull; {reasonText.length} chars</span>
        </div>
        
        <textarea
          id="decision-reason-textarea"
          rows={3}
          className={`form-textarea ${formErrors.reasonText ? 'input-error' : ''}`}
          placeholder={selectedDecision === 'REJECT_RETURN' 
            ? 'State the verified rationale for rejection (e.g. Discrepancy between reported transit tear and customer-submitted photos showing non-original chair with worn fabric, confirmed by delivery team).'
            : 'Provide clear rationale for logistics dispatch, audit trail, and customer communications...'}
          value={reasonText}
          onChange={(e) => {
            setReasonText(e.target.value);
            if (formErrors.reasonText) setFormErrors(prev => ({ ...prev, reasonText: null }));
          }}
        />
        {formErrors.reasonText && <span className="field-error-msg">{formErrors.reasonText}</span>}
      </div>

      {/* Submit Action Button */}
      <div className="decision-actions-footer">
        {formErrors.decision && (
          <div className="flex items-center gap-2 p-3 mb-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium">
            <AlertTriangle size={18} className="shrink-0 text-red-500" />
            <span>{formErrors.decision}</span>
          </div>
        )}

        <button
          type="submit"
          className={`btn-primary btn-large w-full flex items-center justify-center gap-2 ${!selectedDecision ? 'opacity-85' : ''}`}
          title={!selectedDecision ? 'Please pick a decision card above' : 'Confirm and record this operational decision'}
        >
          <CheckCircle2 size={18} />
          <span>Confirm &amp; Record Operational Decision</span>
        </button>
      </div>
    </form>
  );
}
