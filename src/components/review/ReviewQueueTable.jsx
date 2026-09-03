import React from 'react';
import { formatCurrencyINR } from '../../utils/customerHistory.js';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  User, 
  Package, 
  Camera, 
  FileText,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function ReviewQueueTable({ cases = [], onSelectCase }) {
  if (!cases || cases.length === 0) {
    return (
      <div className="review-empty-queue form-card text-center p-8">
        <div className="empty-icon-wrap mx-auto mb-3">
          <CheckCircle2 size={36} className="text-emerald-400" />
        </div>
        <h3 className="text-lg font-serif font-bold text-primary mb-1">Queue Clear</h3>
        <p className="text-muted text-sm max-w-md mx-auto">
          No return cases currently match the selected filter criteria or require urgent human intervention.
        </p>
      </div>
    );
  }

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getRiskBadgeClass = (category) => {
    switch (category) {
      case 'CRITICAL': return 'badge-risk-critical';
      case 'HIGH': return 'badge-risk-high';
      case 'MEDIUM': return 'badge-risk-medium';
      case 'LOW': return 'badge-risk-low';
      default: return 'badge-risk-medium';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'APPROVED': return 'badge-status-approved';
      case 'REJECTED': return 'badge-status-rejected';
      case 'ESCALATED': return 'badge-status-escalated';
      case 'REQUEST_MORE_EVIDENCE': return 'badge-status-more-evidence';
      case 'IN_REVIEW': return 'badge-status-in-review';
      case 'PENDING':
      default: return 'badge-status-pending';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'APPROVED': return 'Approved';
      case 'REJECTED': return 'Rejected';
      case 'ESCALATED': return 'Escalated';
      case 'REQUEST_MORE_EVIDENCE': return 'More Evidence Req.';
      case 'IN_REVIEW': return 'In Review';
      case 'PENDING':
      default: return 'Pending Review';
    }
  };

  return (
    <div className="review-table-container">
      <div className="table-responsive">
        <table className="review-queue-table" role="table" aria-label="Human Review Queue">
          <thead>
            <tr>
              <th scope="col">Return ID</th>
              <th scope="col">Customer</th>
              <th scope="col">Product</th>
              <th scope="col" className="text-right">Order Value</th>
              <th scope="col" className="text-center">Risk Score</th>
              <th scope="col">Risk Category</th>
              <th scope="col">Evidence</th>
              <th scope="col">Priority</th>
              <th scope="col">Submitted Date</th>
              <th scope="col">Review Status</th>
              <th scope="col" className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => {
              const isResolved = c.review_status === 'APPROVED' || c.review_status === 'REJECTED' || c.review_status === 'ESCALATED';
              return (
                <tr 
                  key={c.return_id} 
                  className={`review-row ${isResolved ? 'review-row-resolved' : 'review-row-actionable'}`}
                  onClick={() => onSelectCase(c.return_id)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectCase(c.return_id);
                    }
                  }}
                >
                  {/* Return ID */}
                  <td className="cell-id">
                    <span className="return-id-code font-serif-id font-semibold">{c.return_id}</span>
                    {c.is_overridden && (
                      <span className="badge-overridden-mini" title="Human decision overrode system triage recommendation">
                        Override
                      </span>
                    )}
                  </td>

                  {/* Customer */}
                  <td className="cell-customer">
                    <div className="customer-cell-wrap">
                      <span className="customer-name font-medium">{c.customer_name}</span>
                      <span className="customer-sub-id text-dim text-xs">{c.customer_id}</span>
                    </div>
                  </td>

                  {/* Product */}
                  <td className="cell-product" title={c.product_name}>
                    <div className="product-cell-wrap">
                      <span className="product-title font-medium truncate-1">{c.product_name}</span>
                      <span className="product-cat text-dim text-xs">{c.category}</span>
                    </div>
                  </td>

                  {/* Order Value */}
                  <td className="cell-price text-right font-medium">
                    {formatCurrencyINR(c.order_value)}
                  </td>

                  {/* Risk Score */}
                  <td className="cell-score text-center">
                    <span className={`score-badge ${getRiskBadgeClass(c.risk_category)}`}>
                      {c.risk_score}
                    </span>
                  </td>

                  {/* Risk Category */}
                  <td className="cell-category">
                    <span className={`risk-category-pill ${getRiskBadgeClass(c.risk_category)}`}>
                      {c.risk_category}
                    </span>
                  </td>

                  {/* Evidence Strength */}
                  <td className="cell-evidence">
                    <div className="evidence-cell-wrap">
                      <span className="evidence-strength-badge" data-strength={c.evidence_strength}>
                        <Camera size={12} /> {c.evidence_strength}
                      </span>
                      <span className="evidence-photos-count text-dim text-xs">
                        {c.evidence_count} photo{c.evidence_count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="cell-priority">
                    <span className="priority-pill-text">
                      {c.priority_label}
                    </span>
                  </td>

                  {/* Submitted Date */}
                  <td className="cell-date text-xs text-secondary">
                    {formatDate(c.submitted_date)}
                  </td>

                  {/* Review Status */}
                  <td className="cell-status">
                    <span className={`review-status-pill ${getStatusBadgeClass(c.review_status)}`}>
                      {getStatusLabel(c.review_status)}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="cell-action text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => onSelectCase(c.return_id)}
                      className="btn-review-case"
                      title={`Review Return Case ${c.return_id}`}
                      aria-label={`Review case ${c.return_id}`}
                    >
                      <span>Review</span>
                      <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
