import React, { useState } from 'react';
import { Sliders, X, AlertTriangle, CheckCircle2, RotateCcw } from 'lucide-react';
import { PICKUP_CONFIG } from '../../config/pickupRules.js';

export default function PriorityOverrideModal({
  isOpen,
  caseItem,
  onClose,
  onConfirmOverride
}) {
  if (!isOpen || !caseItem) return null;

  const originalScore = caseItem.calculated_score !== undefined ? caseItem.calculated_score : caseItem.pickup_priority_score;
  const originalLevel = caseItem.calculated_level || caseItem.priority_level;

  const [newScore, setNewScore] = useState(caseItem.pickup_priority_score);
  const [selectedReasonCategory, setSelectedReasonCategory] = useState('Customer escalation');
  const [reasonExplanation, setReasonExplanation] = useState(caseItem.override?.override_reason || '');
  const [managerName, setManagerName] = useState('Surya (Operations Manager)');
  const [errorMessage, setErrorMessage] = useState('');

  const calculateLevelForScore = (score) => {
    if (score >= PICKUP_CONFIG.thresholds.critical) return 'CRITICAL';
    if (score >= PICKUP_CONFIG.thresholds.high) return 'HIGH';
    if (score >= PICKUP_CONFIG.thresholds.standard) return 'STANDARD';
    return 'LOW';
  };

  const newLevel = calculateLevelForScore(newScore);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reasonExplanation.trim() || reasonExplanation.trim().length < 15) {
      setErrorMessage('A detailed operational rationale is mandatory (minimum 15 characters).');
      return;
    }

    const fullReason = `[${selectedReasonCategory}] ${reasonExplanation.trim()}`;
    onConfirmOverride(caseItem.return_id, originalScore, originalLevel, newScore, newLevel, fullReason, managerName);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content override-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <Sliders size={20} className="text-amber-400" />
            <div>
              <h3 className="modal-title font-serif">Manual Priority Override</h3>
              <span className="text-xs text-dim">Case ID: {caseItem.return_id}</span>
            </div>
          </div>
          <button type="button" onClick={onClose} className="modal-close-btn" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="modal-body p-4 text-xs">
          <div className="original-vs-new-box p-3 rounded bg-surface border border-subtle mb-3 flex items-center justify-between">
            <div>
              <span className="text-dim text-2xs block uppercase font-bold">System Calculated Score:</span>
              <span className="text-lg font-serif font-bold text-primary">{originalScore}</span>
              <span className="text-dim ml-1">({originalLevel})</span>
            </div>
            <span className="text-dim text-base">&rarr;</span>
            <div className="text-right">
              <span className="text-dim text-2xs block uppercase font-bold">Overridden Priority:</span>
              <span className="text-lg font-serif font-bold text-amber-300">{newScore}</span>
              <span className="text-amber-400 ml-1 font-bold">({newLevel})</span>
            </div>
          </div>

          {/* Range Slider for Score */}
          <div className="form-group mb-3">
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="priority-range-input" className="form-label text-xs">
                Adjust Operational Score:
              </label>
              <span className="font-mono font-bold text-amber-300">{newScore} / 100</span>
            </div>
            <input
              id="priority-range-input"
              type="range"
              min={0}
              max={100}
              value={newScore}
              onChange={(e) => setNewScore(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-2xs text-dim mt-0.5">
              <span>0 (Low)</span>
              <span>30 (Standard)</span>
              <span>60 (High)</span>
              <span>80 (Critical)</span>
              <span>100</span>
            </div>
          </div>

          {/* Reason Category Selector */}
          <div className="form-group mb-3">
            <label htmlFor="override-category-select" className="form-label text-xs">
              Primary Override Factor:
            </label>
            <select
              id="override-category-select"
              className="form-select text-xs"
              value={selectedReasonCategory}
              onChange={(e) => setSelectedReasonCategory(e.target.value)}
            >
              <option value="Customer escalation">Customer escalation (Direct support intervention)</option>
              <option value="SLA protection">SLA protection (Customer approaching SLA breach)</option>
              <option value="Route consolidation">Route consolidation (Matching specific local truck run)</option>
              <option value="Vehicle availability">Vehicle availability (Heavy lift capacity available)</option>
              <option value="Special handling">Special handling requirement</option>
              <option value="Operational constraint">Operational constraint (Warehouse bay availability)</option>
              <option value="Manager decision">Senior Operations Manager decision</option>
              <option value="Other">Other operational justification</option>
            </select>
          </div>

          {/* Mandatory Detailed Rationale Textarea */}
          <div className="form-group mb-3">
            <label htmlFor="override-reason-textarea" className="form-label text-xs">
              Detailed Operational Justification (Required):
            </label>
            <textarea
              id="override-reason-textarea"
              rows={3}
              className={`form-textarea text-xs ${errorMessage ? 'input-error' : ''}`}
              placeholder="e.g. VIP customer escalation via executive desk; approved single-piece express pickup route prior to weekend."
              value={reasonExplanation}
              onChange={(e) => {
                setReasonExplanation(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
            />
            {errorMessage && <span className="field-error-msg">{errorMessage}</span>}
          </div>

          {/* Manager Identity */}
          <div className="form-group mb-4">
            <label htmlFor="manager-name-input" className="form-label text-xs">
              Authorized Operations Manager Name:
            </label>
            <input
              id="manager-name-input"
              type="text"
              className="form-input text-xs"
              value={managerName}
              onChange={(e) => setManagerName(e.target.value)}
              required
            />
          </div>

          {/* Modal Actions */}
          <div className="modal-footer flex items-center justify-end gap-2 pt-3 border-top">
            <button type="button" className="btn-ghost btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary btn-sm flex items-center gap-1.5">
              <CheckCircle2 size={14} />
              <span>Record Manual Priority Override</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
