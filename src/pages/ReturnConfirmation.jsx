import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  ArrowLeft, 
  Package, 
  Truck, 
  Image as ImageIcon, 
  Calendar, 
  User, 
  Code, 
  ChevronDown, 
  ChevronUp,
  Clock,
  Layers,
  FileText,
  History,
  ShieldAlert
} from 'lucide-react';
import { formatBytes } from '../utils/validation';
import { formatCurrencyINR } from '../utils/customerHistory';

export default function ReturnConfirmation({ returnData, onReset, onViewCustomerHistory, onAnalyzeEvidence, onTriageCase }) {
  const [copied, setCopied] = useState(false);
  const [showJson, setShowJson] = useState(false);

  if (!returnData) {
    return (
      <div className="page-wrapper confirmation-wrapper">
        <div className="confirmation-card text-center">
          <h2>No Return Request Found</h2>
          <p className="text-muted">Please create a return request first.</p>
          <button type="button" onClick={onReset} className="btn-primary mt-4">
            Create Return Request
          </button>
        </div>
      </div>
    );
  }

  const { return_id, customer, order, return: returnInfo, evidence = [], pickup, status, created_at } = returnData;

  const handleCopyId = () => {
    if (return_id) {
      navigator.clipboard.writeText(return_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Format date display
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="page-wrapper confirmation-wrapper">
      <div className="confirmation-card">
        {/* Success Header Icon */}
        <div className="success-badge-container">
          <div className="success-icon-bubble">
            <CheckCircle2 size={44} className="icon-success" />
          </div>
          <span className="success-subheading">Intake Complete &bull; Module 1 Recorded</span>
          <h1 className="success-title">Return Request Submitted</h1>
          <p className="success-message">
            Your return request has been successfully recorded in the reverse logistics intake queue.
          </p>
        </div>

        {/* Return ID Card */}
        <div className="return-id-highlight-box">
          <span className="return-id-label">Generated Return ID</span>
          <div className="return-id-row">
            <span className="return-id-text">{return_id}</span>
            <button
              type="button"
              className="btn-copy-id"
              onClick={handleCopyId}
              title="Copy Return ID"
              aria-label="Copy Return ID"
            >
              {copied ? (
                <>
                  <Check size={15} className="text-emerald" />
                  <span className="text-emerald">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={15} />
                  <span>Copy ID</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Core Summary Grid */}
        <div className="confirmation-summary-section">
          <div className="summary-row">
            <span className="summary-item-label">
              <Package size={16} className="summary-icon" /> Product
            </span>
            <span className="summary-item-value font-semibold">
              {order.product_name}
            </span>
          </div>

          <div className="summary-row">
            <span className="summary-item-label">
              <Layers size={16} className="summary-icon" /> Condition
            </span>
            <span className="summary-item-value">
              <span className="badge-condition-pill">{returnInfo.condition}</span>
            </span>
          </div>

          <div className="summary-row">
            <span className="summary-item-label">
              <ImageIcon size={16} className="summary-icon" /> Evidence
            </span>
            <span className="summary-item-value font-medium">
              {evidence.length} photo{evidence.length !== 1 ? 's' : ''} attached
            </span>
          </div>

          <div className="summary-row">
            <span className="summary-item-label">
              <Truck size={16} className="summary-icon" /> Preferred Pickup
            </span>
            <span className="summary-item-value font-medium">
              {formatDate(pickup.preferred_date)}
            </span>
          </div>

          <div className="summary-row">
            <span className="summary-item-label">
              <Clock size={16} className="summary-icon" /> Status
            </span>
            <span className="summary-item-value">
              <span className="badge-status-submitted">{status}</span>
            </span>
          </div>
        </div>

        {/* Detailed Logistics & Order Breakdown */}
        <div className="confirmation-details-box">
          <h3 className="details-box-title">Order & Customer Breakdown</h3>
          <div className="details-2-col">
            <div>
              <p className="detail-line"><strong>Customer:</strong> {customer.name} ({customer.customer_id})</p>
              <p className="detail-line"><strong>Contact:</strong> {customer.email} &bull; {customer.phone}</p>
              <p className="detail-line"><strong>Order Reference:</strong> {order.order_id} ({order.category})</p>
              <p className="detail-line"><strong>Item Value:</strong> {formatCurrencyINR(order.price)}</p>
            </div>
            <div>
              <p className="detail-line"><strong>Return Reason:</strong> {returnInfo.reason}</p>
              <p className="detail-line"><strong>Pickup Destination:</strong> {pickup.address}, {pickup.city} - {pickup.postal_code}</p>
              {pickup.instructions && (
                <p className="detail-line"><strong>Logistics Notes:</strong> {pickup.instructions}</p>
              )}
            </div>
          </div>

          {/* Evidence Thumbnails Display */}
          {evidence.length > 0 && (
            <div className="confirmation-evidence-strip">
              <span className="evidence-strip-label">Attached Evidence Preview:</span>
              <div className="evidence-thumb-row">
                {evidence.map((img, idx) => (
                  <div key={img.id || idx} className="thumb-item" title={`${img.name} (${formatBytes(img.size)})`}>
                    <img src={img.dataUrl} alt={`Evidence ${idx + 1}`} className="thumb-img" />
                    <span className="thumb-caption">{img.name.slice(0, 12)}...</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons: Triage Case, Analyze Evidence, View Customer History */}
        <div className="confirmation-actions-row flex-wrap">
          {onTriageCase && (
            <button
              type="button"
              onClick={() => onTriageCase(return_id)}
              className="btn-primary btn-large flex-1"
              title="Open fraud risk & priority assessment in Module 4"
            >
              <ShieldAlert size={18} />
              <span>Fraud Risk Assessment (Module 4)</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onAnalyzeEvidence?.(return_id)}
            className="btn-secondary btn-large"
            title="Analyze evidence quality & condition in Module 3"
          >
            <Layers size={18} />
            <span>Evidence (Module 3)</span>
          </button>

          <button
            type="button"
            onClick={() => onViewCustomerHistory?.(customer.customer_id, returnData)}
            className="btn-secondary btn-large"
            title="Open customer order and return history in Module 2"
          >
            <History size={18} />
            <span>Customer History</span>
          </button>
          
          <button
            type="button"
            onClick={onReset}
            className="btn-secondary btn-large"
            title="Create another return intake request"
          >
            <ArrowLeft size={18} />
            <span>Create Another</span>
          </button>
        </div>

        {/* Future Modules Pipeline Compatibility Banner */}
        <div className="module-pipeline-card mt-4">
          <div className="pipeline-title">
            <Layers size={16} /> Module 2 Connected
          </div>
          <p className="pipeline-desc">
            This return record is stored in <code>localStorage.return_requests</code>. Click <strong>"View Customer History"</strong> to inspect customer <code>{customer.customer_id}</code>'s lifetime orders, return rates, and historical outcomes.
          </p>
          <button
            type="button"
            className="btn-toggle-json"
            onClick={() => setShowJson(!showJson)}
          >
            <Code size={14} />
            <span>{showJson ? 'Hide Stored JSON Payload' : 'Inspect Stored JSON Payload'}</span>
            {showJson ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showJson && (
            <pre className="json-viewer" tabIndex={0} aria-label="JSON Payload Output">
              {JSON.stringify(returnData, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
