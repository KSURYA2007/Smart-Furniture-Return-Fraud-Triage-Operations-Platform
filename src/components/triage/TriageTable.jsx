import React from 'react';
import { 
  Eye, 
  Layers, 
  History, 
  Camera, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ChevronRight 
} from 'lucide-react';
import { formatCurrencyINR } from '../../utils/customerHistory';

export default function TriageTable({
  triageList = [],
  onSelectCase,
  onViewEvidence,
  onViewCustomer
}) {
  if (!triageList || triageList.length === 0) {
    return (
      <div className="empty-table-box">
        <p className="text-muted text-sm">No return requests match the selected filter criteria.</p>
      </div>
    );
  }

  const getScoreBadgeClass = (score) => {
    if (score >= 80) return 'score-pill-critical';
    if (score >= 60) return 'score-pill-high';
    if (score >= 30) return 'score-pill-medium';
    return 'score-pill-low';
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'PRIORITY_HUMAN_REVIEW': return 'badge-priority-critical';
      case 'HUMAN_REVIEW': return 'badge-priority-high';
      case 'STANDARD_PROCESS': return 'badge-priority-medium';
      case 'FAST_TRACK': default: return 'badge-priority-low';
    }
  };

  const getEvidenceStrengthClass = (str) => {
    switch (str) {
      case 'HIGH': return 'badge-quality-good';
      case 'MEDIUM': return 'badge-quality-moderate';
      case 'LOW': default: return 'badge-quality-low';
    }
  };

  return (
    <div className="triage-table-responsive-wrapper">
      <table className="data-table triage-data-table">
        <thead>
          <tr>
            <th>Return ID</th>
            <th>Customer</th>
            <th>Product & Value</th>
            <th>Return Reason</th>
            <th className="text-center">Risk Score</th>
            <th>Category</th>
            <th>Operational Priority</th>
            <th>Evidence</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {triageList.map((item) => {
            const { returnRecord, triage } = item;
            const customer = returnRecord.customer || {};
            const order = returnRecord.order || {};
            const productPrice = Number(order.product_price || order.price || returnRecord.product_price || 0);

            return (
              <tr key={returnRecord.return_id} className="data-table-row triage-table-row">
                {/* Return ID */}
                <td className="cell-highlight-id font-serif-id">
                  <button
                    type="button"
                    onClick={() => onSelectCase(returnRecord.return_id)}
                    className="id-link-button"
                    title="Open triage case details"
                  >
                    {returnRecord.return_id}
                  </button>
                </td>

                {/* Customer */}
                <td>
                  <button
                    type="button"
                    onClick={() => onViewCustomer(customer.customer_id || returnRecord.customer_id)}
                    className="customer-link-btn"
                    title="View customer profile"
                  >
                    {customer.name || returnRecord.customer_name || 'Customer'}
                  </button>
                  <span className="cell-sub-id block text-xs text-dim">
                    {customer.customer_id || returnRecord.customer_id}
                  </span>
                </td>

                {/* Product & Value */}
                <td>
                  <span className="font-semibold text-white block text-sm">
                    {order.product_name || returnRecord.product || 'Furniture Item'}
                  </span>
                  <span className="text-xs text-dim">
                    {formatCurrencyINR(productPrice)}
                  </span>
                </td>

                {/* Return Reason */}
                <td>
                  <span className="text-sm text-secondary block">
                    {returnRecord.return?.reason || returnRecord.reason || '—'}
                  </span>
                </td>

                {/* Risk Score */}
                <td className="text-center">
                  <span className={`score-metric-pill ${getScoreBadgeClass(triage.risk_score)}`}>
                    <strong>{triage.risk_score}</strong>
                    <span className="text-xs opacity-75">/100</span>
                  </span>
                </td>

                {/* Risk Category */}
                <td>
                  <span className="risk-cat-text font-bold text-xs">
                    {triage.risk_category}
                  </span>
                </td>

                {/* Operational Priority */}
                <td>
                  <div className="flex flex-col gap-1 items-start">
                    <span className={`priority-route-pill-sm ${getPriorityBadgeClass(triage.priority)}`}>
                      {triage.priority_label}
                    </span>
                    {triage.is_legitimate_protected && (
                      <span className="protected-tag-chip" title="Verified damage photo protection">
                        <Sparkles size={10} /> Protected
                      </span>
                    )}
                  </div>
                </td>

                {/* Evidence Strength */}
                <td>
                  <span className={`metric-pill text-xs ${getEvidenceStrengthClass(item.evidenceAnalysis?.evidence_strength)}`}>
                    {item.evidenceAnalysis?.evidence_strength || 'MEDIUM'}
                  </span>
                </td>

                {/* Actions */}
                <td className="text-right">
                  <div className="flex gap-1.5 justify-end flex-wrap">
                    <button
                      type="button"
                      onClick={() => onSelectCase(returnRecord.return_id)}
                      className="btn-table-action btn-table-primary"
                      title="Open full risk factor analysis"
                    >
                      <Eye size={13} /> Case Detail
                    </button>
                    <button
                      type="button"
                      onClick={() => onViewEvidence(returnRecord.return_id)}
                      className="btn-table-action"
                      title="Inspect evidence photos in Module 3"
                    >
                      <Camera size={13} /> Evidence
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
