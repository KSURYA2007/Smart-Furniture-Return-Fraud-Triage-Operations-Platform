import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, Save, AlertTriangle } from 'lucide-react';
import { saveStoredEvaluationLabel } from '../../utils/storage.js';

export default function GroundTruthModal({
  isOpen,
  caseItem,
  onClose,
  onSaved
}) {
  if (!isOpen || !caseItem) return null;

  const currentGt = caseItem.groundTruth || {};
  const [label, setLabel] = useState(currentGt.label || 'UNKNOWN');
  const [fraudLoss, setFraudLoss] = useState(currentGt.fraudLoss || caseItem.orderValue || 0);
  const [source, setSource] = useState(currentGt.source || 'Investigation');
  const [confirmedDate, setConfirmedDate] = useState(currentGt.confirmedDate || new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState(currentGt.notes || '');

  const handleSave = (e) => {
    e.preventDefault();
    const success = saveStoredEvaluationLabel(caseItem.returnId, {
      label,
      fraud_loss: label === 'FRAUD_CONFIRMED' ? Number(fraudLoss) : 0,
      source,
      confirmed_date: confirmedDate,
      notes
    });

    if (success && onSaved) {
      onSaved(caseItem.returnId);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content override-modal-content text-xs p-4" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header flex items-center justify-between border-bottom pb-2 mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-primary-light" />
            <h3 className="modal-title font-bold text-sm">Assign Evaluation Ground Truth</h3>
          </div>
          <button type="button" className="btn-ghost btn-xs" onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="p-2.5 rounded bg-surface border border-subtle mb-3">
            <p className="mb-1"><strong>Target Return ID:</strong> <span className="font-serif-id font-bold text-primary">{caseItem.returnId}</span></p>
            <p className="mb-1"><strong>Customer:</strong> {caseItem.customerId} &bull; <strong>Product:</strong> {caseItem.product}</p>
            <p className="text-dim text-2xs">
              Ground truth is independent of automated risk scores and represents verified real-world operational outcomes for scientific evaluation.
            </p>
          </div>

          <div className="form-group mb-3">
            <label className="form-label text-xs font-bold">Ground Truth Verified Label: *</label>
            <select
              className="form-select text-xs"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
            >
              <option value="LEGITIMATE">LEGITIMATE — Confirmed Genuine Customer Claim</option>
              <option value="FRAUD_CONFIRMED">FRAUD_CONFIRMED — Confirmed Fraudulent / Substituted Claim</option>
              <option value="UNKNOWN">UNKNOWN — Insufficient Evidence to Confirm Either Way</option>
            </select>
          </div>

          {label === 'FRAUD_CONFIRMED' && (
            <div className="form-group mb-3">
              <label className="form-label text-xs font-bold">Estimated Fraud Loss Exposure (₹): *</label>
              <input
                type="number"
                className="form-input text-xs font-mono"
                value={fraudLoss}
                onChange={(e) => setFraudLoss(e.target.value)}
                min="0"
                required
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="form-group">
              <label className="form-label text-xs">Confirmation Source:</label>
              <select
                className="form-select text-xs"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              >
                <option value="Investigation">Carrier / Lab Investigation</option>
                <option value="Manual verification">Manual Technician Verification</option>
                <option value="Policy review">Operations Policy Review</option>
                <option value="Historical confirmed outcome">Historical Confirmed Outcome</option>
                <option value="Customer Service Review">Customer Service Direct Audit</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label text-xs">Confirmation Date:</label>
              <input
                type="date"
                className="form-input text-xs"
                value={confirmedDate}
                onChange={(e) => setConfirmedDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group mb-4">
            <label className="form-label text-xs">Verification Details & Notes:</label>
            <textarea
              rows={2}
              className="form-textarea text-xs"
              placeholder="e.g., Physical serial number mismatch documented at returns depot."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="modal-footer flex items-center justify-end gap-2 pt-2 border-top">
            <button type="button" className="btn-ghost btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary btn-sm flex items-center gap-1">
              <Save size={13} />
              <span>Save Ground Truth</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
