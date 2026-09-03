import React, { useState } from 'react';
import StatusBadge from '../common/StatusBadge';
import { 
  X, 
  RotateCcw, 
  Package, 
  FileText, 
  Calendar, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Clock,
  Eye,
  ArrowLeft
} from 'lucide-react';

export default function ReturnHistoryDetailModal({ returnItem, onClose, onAnalyzeEvidence }) {
  const [activeImageZoom, setActiveImageZoom] = useState(null);

  if (!returnItem) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Pending / Not Recorded';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const images = returnItem.evidence_images || 
    (returnItem.evidence ? returnItem.evidence.map(e => e.dataUrl).filter(Boolean) : []);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content return-detail-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="card-header-icon bg-primary-light">
              <RotateCcw size={18} className="icon-blue" />
            </div>
            <div>
              <div className="modal-return-id">{returnItem.return_id}</div>
              <span className="modal-sub-label">Historical Return Record</span>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="modal-close-btn"
            aria-label="Close details"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-scroll-body">
          {/* Outcome Hero Banner */}
          <div className="outcome-hero-banner">
            <div className="outcome-banner-left">
              <span className="outcome-label">Confirmed Historical Outcome</span>
              <div className="outcome-badge-wrap">
                <StatusBadge status={returnItem.outcome} type="outcome" size="normal" />
              </div>
            </div>
            {returnItem.decision_date && (
              <div className="outcome-banner-right">
                <span className="decision-date-label">Decision Recorded</span>
                <span className="decision-date-val">{formatDate(returnItem.decision_date)}</span>
              </div>
            )}
          </div>

          {/* Grid of details */}
          <div className="return-meta-grid-2col">
            {/* Product & Order Details */}
            <div className="detail-panel-box">
              <h4 className="detail-panel-title">Order & Item</h4>
              <div className="panel-row">
                <span className="panel-lbl">Order ID:</span>
                <span className="panel-val font-semibold">{returnItem.order_id || returnItem.order?.order_id || '—'}</span>
              </div>
              <div className="panel-row">
                <span className="panel-lbl">Product:</span>
                <span className="panel-val">{returnItem.product || returnItem.order?.product_name || '—'}</span>
              </div>
              <div className="panel-row">
                <span className="panel-lbl">Category:</span>
                <span className="panel-val">{returnItem.category || returnItem.order?.category || '—'}</span>
              </div>
              <div className="panel-row">
                <span className="panel-lbl">Return Date:</span>
                <span className="panel-val">{formatDate(returnItem.return_date || returnItem.created_at)}</span>
              </div>
            </div>

            {/* Claim Details */}
            <div className="detail-panel-box">
              <h4 className="detail-panel-title">Return Claim</h4>
              <div className="panel-row">
                <span className="panel-lbl">Reason:</span>
                <span className="panel-val font-semibold">{returnItem.reason || returnItem.return?.reason || '—'}</span>
              </div>
              <div className="panel-row">
                <span className="panel-lbl">Condition:</span>
                <span className="panel-val">{returnItem.condition || returnItem.return?.condition || '—'}</span>
              </div>
              <div className="panel-row">
                <span className="panel-lbl">Review Status:</span>
                <span className="panel-val">{returnItem.review_status || 'Under Triage'}</span>
              </div>
            </div>
          </div>

          {/* Damage Description / Notes */}
          {(returnItem.notes || returnItem.return?.description) && (
            <div className="detail-panel-box mt-3">
              <h4 className="detail-panel-title">Triage Notes & Description</h4>
              <p className="panel-text-notes">
                {returnItem.notes || returnItem.return?.description}
              </p>
            </div>
          )}

          {/* Evidence Reference Gallery */}
          <div className="detail-panel-box mt-3">
            <div className="evidence-header-row">
              <h4 className="detail-panel-title mb-0">Submitted Evidence</h4>
              <span className="evidence-count-badge">
                <ImageIcon size={13} /> {returnItem.evidence_count || images.length || 0} Images
              </span>
            </div>

            {images.length > 0 ? (
              <div className="evidence-thumbnails-gallery">
                {images.map((imgSrc, idx) => (
                  <div 
                    key={idx} 
                    className="evidence-thumb-container"
                    onClick={() => setActiveImageZoom(imgSrc)}
                    title="Click to zoom image"
                  >
                    <img src={imgSrc} alt={`Evidence ${idx + 1}`} className="evidence-thumb-photo" />
                    <div className="evidence-thumb-hover">
                      <Eye size={16} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-sm mt-2">
                No image attachments preserved in this historical archive record.
              </p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer flex justify-between">
          <button 
            type="button" 
            onClick={onClose} 
            className="btn-secondary"
          >
            <ArrowLeft size={15} /> Back
          </button>

          {onAnalyzeEvidence && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onAnalyzeEvidence(returnItem.return_id);
              }}
              className="btn-primary"
            >
              <Eye size={15} /> Analyze Evidence in Module 3
            </button>
          )}
        </div>

        {/* Full Image Zoom Overlay */}
        {activeImageZoom && (
          <div className="modal-backdrop nested-zoom" onClick={() => setActiveImageZoom(null)}>
            <div className="modal-content zoom-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <span className="modal-filename">Evidence Photo Preview</span>
                <button 
                  type="button" 
                  onClick={() => setActiveImageZoom(null)} 
                  className="modal-close-btn"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="modal-body">
                <img src={activeImageZoom} alt="Zoomed evidence" className="modal-full-img" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
