import React, { useState, useEffect } from 'react';
import GroundTruthModal from '../components/metrics/GroundTruthModal.jsx';
import { buildEvaluationDataset } from '../services/evaluationService.js';
import { formatCurrencyINR } from '../utils/customerHistory.js';

import { 
  Table, 
  ShieldAlert, 
  ShieldCheck, 
  Edit3, 
  Eye, 
  Search, 
  Filter, 
  CheckCircle2, 
  HelpCircle,
  BarChart2,
  FlaskConical,
  AlertTriangle,
  FileText
} from 'lucide-react';

export default function EvaluationCases({
  onNavigateDashboard,
  onNavigateExperiment,
  onNavigateValidation,
  onNavigateLimitations,
  onNavigateReport,
  onTraceCase
}) {
  const [dataset, setDataset] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [labelFilter, setLabelFilter] = useState('ALL');
  const [classificationFilter, setClassificationFilter] = useState('ALL');

  const [editingCase, setEditingCase] = useState(null);
  const [traceCase, setTraceCase] = useState(null);

  const loadDataset = () => {
    const data = buildEvaluationDataset();
    setDataset(data);
  };

  useEffect(() => {
    loadDataset();
  }, []);

  const handleGroundTruthSaved = () => {
    setEditingCase(null);
    loadDataset();
  };

  // Filter dataset
  const filteredCases = dataset.filter(item => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
      item.returnId.toLowerCase().includes(q) || 
      item.customerId.toLowerCase().includes(q) || 
      item.product.toLowerCase().includes(q);

    const matchesLabel = labelFilter === 'ALL' || item.groundTruth.label === labelFilter;

    // Classification (TP, FP, TN, FN)
    const isFraud = item.groundTruth.label === 'FRAUD_CONFIRMED';
    const isLegit = item.groundTruth.label === 'LEGITIMATE';
    const isFlagged = item.triage.riskScore >= 50 || item.triage.recommendation !== 'FAST_TRACK_PICKUP';

    let classification = 'UNKNOWN';
    if (isFraud && isFlagged) classification = 'TP';
    else if (!isFraud && isLegit && isFlagged) classification = 'FP';
    else if (!isFraud && isLegit && !isFlagged) classification = 'TN';
    else if (isFraud && !isFlagged) classification = 'FN';

    const matchesClass = classificationFilter === 'ALL' || classification === classificationFilter;

    return matchesSearch && matchesLabel && matchesClass;
  });

  return (
    <div className="page-wrapper evaluation-cases-page">
      {/* Sub-Navigation Bar */}
      <div className="metrics-subnav-bar flex items-center justify-between flex-wrap gap-2 mb-4 p-2 rounded bg-surface border border-subtle">
        <div className="flex items-center gap-1 flex-wrap">
          {onNavigateDashboard && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateDashboard}>
              <BarChart2 size={13} /> Dashboard
            </button>
          )}
          {onNavigateExperiment && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateExperiment}>
              <FlaskConical size={13} /> Experiment Simulator
            </button>
          )}
          <button type="button" className="btn-primary btn-xs flex items-center gap-1">
            <Table size={13} /> Evaluation Cases
          </button>
          {onNavigateValidation && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateValidation}>
              <CheckCircle2 size={13} /> Stakeholder Validation
            </button>
          )}
          {onNavigateLimitations && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateLimitations}>
              <AlertTriangle size={13} /> Limitations
            </button>
          )}
          {onNavigateReport && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateReport}>
              <FileText size={13} /> Report & Export
            </button>
          )}
        </div>
      </div>

      {/* Hero Header */}
      <header className="page-header cases-header mb-4">
        <div className="header-container">
          <div className="header-badge-row">
            <span className="module-badge">
              <Table size={13} /> Module 7: Ground Truth & Case Evaluation
            </span>
          </div>
          <h1 className="page-title font-serif">Case-Level Evaluation & Ground Truth</h1>
          <p className="page-description">
            Assign verified real-world operational outcomes (Legitimate, Confirmed Fraud, Unknown) to evaluate classifier precision, recall, and unnecessary review burden.
          </p>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="cases-filter-card form-card mb-4 p-3 flex items-center justify-between flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-2 flex-grow max-w-md">
          <Search size={14} className="text-dim" />
          <input
            type="text"
            className="form-input text-xs w-full"
            placeholder="Search by Return ID, Customer, or Product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            className="form-select text-xs"
            value={labelFilter}
            onChange={(e) => setLabelFilter(e.target.value)}
          >
            <option value="ALL">All Ground Truth Labels</option>
            <option value="LEGITIMATE">LEGITIMATE</option>
            <option value="FRAUD_CONFIRMED">FRAUD_CONFIRMED</option>
            <option value="UNKNOWN">UNKNOWN</option>
          </select>

          <select
            className="form-select text-xs"
            value={classificationFilter}
            onChange={(e) => setClassificationFilter(e.target.value)}
          >
            <option value="ALL">All Classifications</option>
            <option value="TP">True Positive (TP)</option>
            <option value="FP">False Positive (FP)</option>
            <option value="TN">True Negative (TN)</option>
            <option value="FN">False Negative (FN)</option>
          </select>
        </div>
      </div>

      {/* Cases Table */}
      <div className="form-card mb-4">
        <div className="card-header border-bottom pb-2 mb-3">
          <div className="flex items-center justify-between">
            <h3 className="card-title text-base">Normalized Return Claims ({filteredCases.length})</h3>
            <span className="text-dim text-xs">Click Edit to assign verified ground truth</span>
          </div>
        </div>

        <div className="pickup-table-wrapper">
          <table className="pickup-queue-table text-xs">
            <thead>
              <tr>
                <th>Return ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th className="text-right">Order Value</th>
                <th className="text-center">Risk Score</th>
                <th>Human Review</th>
                <th>Pickup Status</th>
                <th className="text-center">Ground Truth</th>
                <th className="text-center">Outcome Class</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map(item => {
                const isFraud = item.groundTruth.label === 'FRAUD_CONFIRMED';
                const isLegit = item.groundTruth.label === 'LEGITIMATE';
                const isFlagged = item.triage.riskScore >= 50 || item.triage.recommendation !== 'FAST_TRACK_PICKUP';

                let classBadge = <span className="text-dim">UNKNOWN</span>;
                if (isFraud && isFlagged) classBadge = <span className="badge-risk-critical font-bold">TP</span>;
                else if (!isFraud && isLegit && isFlagged) classBadge = <span className="badge-risk-high font-bold">FP</span>;
                else if (!isFraud && isLegit && !isFlagged) classBadge = <span className="badge-risk-low font-bold">TN</span>;
                else if (isFraud && !isFlagged) classBadge = <span className="badge-risk-critical font-bold">FN</span>;

                return (
                  <tr key={item.returnId}>
                    <td className="font-serif-id font-bold text-primary">{item.returnId}</td>
                    <td>{item.customerId}</td>
                    <td className="truncate max-w-xs">{item.product}</td>
                    <td className="text-right font-mono">{formatCurrencyINR(item.orderValue)}</td>
                    <td className="text-center font-mono font-bold">
                      <span className={`priority-pill badge-risk-${item.triage.riskCategory.toLowerCase()}`}>
                        {item.triage.riskScore}
                      </span>
                    </td>
                    <td>
                      <span className="text-secondary font-medium">{item.review.humanDecision}</span>
                      {item.review.override && <span className="service-urgency-mini-tag ml-1">OVR</span>}
                    </td>
                    <td>
                      <span className="badge-pickup-status">{item.pickup.operationalStatus}</span>
                    </td>
                    <td className="text-center font-bold">
                      {item.groundTruth.label === 'FRAUD_CONFIRMED' ? (
                        <span className="text-red-400">FRAUD</span>
                      ) : item.groundTruth.label === 'LEGITIMATE' ? (
                        <span className="text-emerald-400">GENUINE</span>
                      ) : (
                        <span className="text-dim">UNKNOWN</span>
                      )}
                    </td>
                    <td className="text-center font-mono">{classBadge}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          className="btn-secondary btn-xs flex items-center gap-1"
                          onClick={() => setEditingCase(item)}
                          title="Assign ground truth outcome"
                        >
                          <Edit3 size={11} /> Label
                        </button>
                        <button
                          type="button"
                          className="btn-ghost btn-xs flex items-center gap-1"
                          onClick={() => setTraceCase(item)}
                          title="View end-to-end case explanation"
                        >
                          <Eye size={11} /> Trace
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ground Truth Labeling Modal */}
      {editingCase && (
        <GroundTruthModal
          isOpen={Boolean(editingCase)}
          caseItem={editingCase}
          onClose={() => setEditingCase(null)}
          onSaved={handleGroundTruthSaved}
        />
      )}

      {/* Section 40: End-to-End Case Trace Explanation Drawer/Modal */}
      {traceCase && (
        <div className="modal-backdrop" onClick={() => setTraceCase(null)}>
          <div className="modal-content scheduling-modal-content text-xs p-4" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex items-center justify-between border-bottom pb-2 mb-3">
              <h3 className="modal-title font-bold text-sm">
                End-to-End Case Trace & Explanation &bull; <span className="font-serif-id text-primary">{traceCase.returnId}</span>
              </h3>
              <button type="button" className="btn-ghost btn-xs" onClick={() => setTraceCase(null)}>
                &times;
              </button>
            </div>

            <div className="trace-qa-grid space-y-2 mb-4">
              <div className="p-2.5 rounded bg-surface border border-subtle">
                <strong className="text-secondary block mb-0.5">1. Why was this case flagged?</strong>
                <p className="text-dim text-2xs">
                  {traceCase.triage.riskScore >= 50 
                    ? `Assigned Risk Score ${traceCase.triage.riskScore} (Category: ${traceCase.triage.riskCategory}). Exceeded threshold for enhanced review.` 
                    : `Low risk score (${traceCase.triage.riskScore}), fast-tracked for standard operations.`}
                </p>
              </div>

              <div className="p-2.5 rounded bg-surface border border-subtle">
                <strong className="text-secondary block mb-0.5">2. What evidence supported the decision?</strong>
                <p className="text-dim text-2xs">
                  Evidence Strength: <strong>{traceCase.evidence.strength}</strong> &bull; Damage Visibility: <strong>{traceCase.evidence.damageVisibility}</strong> &bull; Completeness: <strong>{traceCase.evidence.completeness}</strong>
                </p>
              </div>

              <div className="p-2.5 rounded bg-surface border border-subtle">
                <strong className="text-secondary block mb-0.5">3. What did the human reviewer decide?</strong>
                <p className="text-dim text-2xs">
                  Reviewer: <strong>{traceCase.review.reviewer}</strong> ({traceCase.review.role}) &bull; Decision: <strong>{traceCase.review.humanDecision}</strong> {traceCase.review.override && '(Overridden)'} &bull; Reason: &ldquo;{traceCase.review.reason || 'Verified legitimate intake claim.'}&rdquo;
                </p>
              </div>

              <div className="p-2.5 rounded bg-surface border border-subtle">
                <strong className="text-secondary block mb-0.5">4. What was the ground truth & classification?</strong>
                <p className="text-dim text-2xs">
                  Ground Truth: <strong>{traceCase.groundTruth.label}</strong> (Source: {traceCase.groundTruth.source}) &bull; Financial Exposure: <strong>{formatCurrencyINR(traceCase.groundTruth.fraudLoss)}</strong>
                </p>
              </div>

              <div className="p-2.5 rounded bg-surface border border-subtle">
                <strong className="text-secondary block mb-0.5">5. What happened operationally?</strong>
                <p className="text-dim text-2xs">
                  Pickup Priority Score: <strong>{traceCase.pickup.priorityScore}</strong> ({traceCase.pickup.priorityLevel}) &bull; Status: <strong>{traceCase.pickup.operationalStatus}</strong> &bull; Waiting Days: <strong>{traceCase.pickup.waitingDays} days</strong>
                </p>
              </div>
            </div>

            <div className="modal-footer flex justify-end pt-2 border-top">
              <button type="button" className="btn-ghost btn-sm" onClick={() => setTraceCase(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
