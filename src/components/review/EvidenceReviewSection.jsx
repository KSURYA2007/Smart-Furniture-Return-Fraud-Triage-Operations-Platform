import React, { useState } from 'react';
import { 
  Camera, 
  ZoomIn, 
  Eye, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  History, 
  Layers, 
  Maximize2, 
  X,
  ExternalLink
} from 'lucide-react';
import { formatBytes } from '../../utils/validation.js';

export default function EvidenceReviewSection({
  evidenceAnalysis,
  returnRecord,
  onViewCustomerHistory,
  onViewHistoricalReturn
}) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeZoomUrl, setActiveZoomUrl] = useState(null);

  const evidenceList = evidenceAnalysis?.evidenceList || returnRecord?.evidence || [];
  const imageCount = evidenceList.length;

  const currentImage = evidenceList[activeImageIndex] || evidenceList[0];

  // Failure Case 1: Missing Evidence
  if (!evidenceList || evidenceList.length === 0) {
    return (
      <div className="evidence-review-card form-card mb-4">
        <div className="card-header border-bottom pb-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="card-header-icon bg-amber-bg">
              <AlertTriangle size={18} className="text-amber-400" />
            </div>
            <div>
              <h3 className="card-title">Submitted Evidence Verification</h3>
              <p className="card-subtitle">Media inspection, forensic annotations, and damage visibility</p>
            </div>
          </div>
        </div>

        <div className="missing-evidence-banner p-4 text-center">
          <AlertTriangle size={32} className="text-amber-400 mx-auto mb-2" />
          <h4 className="font-bold text-sm text-primary mb-1">Evidence Unavailable</h4>
          <p className="text-xs text-secondary max-w-md mx-auto mb-3">
            No photograph attachments were submitted with this return request. 
            Reviewer should choose <strong>Request More Evidence</strong> before making a final authorization or rejection.
          </p>
          <span className="badge-warn-high text-xs">Action Recommended: Request Photos</span>
        </div>
      </div>
    );
  }

  const {
    evidence_strength = 'MEDIUM',
    evidence_completeness = 'PARTIAL',
    damage_visibility = 'CLEAR',
    condition_consistency = 'CONSISTENT',
    findings = [],
    warnings = [],
    detected_damage_areas = [],
    detected_damage_types = []
  } = evidenceAnalysis || {};

  const isConflicting = condition_consistency === 'PARTIALLY_CONSISTENT' || condition_consistency === 'INCONSISTENT';

  return (
    <div className="evidence-review-card form-card mb-4">
      {/* Header */}
      <div className="card-header border-bottom pb-3 mb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="card-header-icon bg-primary-light">
              <Camera size={18} className="icon-blue" />
            </div>
            <div>
              <h3 className="card-title">Submitted Evidence Verification</h3>
              <p className="card-subtitle">Forensic media inspection, damage localization, and cross-source traceability</p>
            </div>
          </div>
          <span className="badge-count">{imageCount} Photo{imageCount !== 1 ? 's' : ''} Attached</span>
        </div>
      </div>

      {/* Quick Metrics Badges Strip */}
      <div className="evidence-metrics-badges-row mb-3">
        <div className="metric-pill-item">
          <span className="pill-item-lbl">Evidence Strength:</span>
          <span className="pill-item-val font-semibold text-primary">{evidence_strength}</span>
        </div>
        <div className="metric-pill-item">
          <span className="pill-item-lbl">Completeness:</span>
          <span className="pill-item-val font-semibold">{evidence_completeness}</span>
        </div>
        <div className="metric-pill-item">
          <span className="pill-item-lbl">Damage Visibility:</span>
          <span className="pill-item-val font-semibold">{damage_visibility}</span>
        </div>
        <div className="metric-pill-item">
          <span className="pill-item-lbl">Condition Consistency:</span>
          <span className={`pill-item-val font-semibold ${isConflicting ? 'text-amber-400' : 'text-emerald-400'}`}>
            {condition_consistency.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Failure Case 3: Conflicting Evidence Warning */}
      {isConflicting && (
        <div className="conflicting-evidence-notice mb-3">
          <AlertTriangle size={15} className="text-amber-400" />
          <span className="text-xs text-amber-200">
            <strong>Evidence requires careful review:</strong> Reported condition (&ldquo;{returnRecord?.return?.condition || returnRecord?.condition}&rdquo;) differs in severity from observed damage characteristics.
          </span>
        </div>
      )}

      {/* Main Photo Viewer & Thumbnails */}
      <div className="review-gallery-viewer mb-4">
        <div className="review-photo-frame">
          <img
            src={currentImage?.dataUrl}
            alt={currentImage?.name || 'Evidence photo'}
            className="review-active-photo"
          />
          <button
            type="button"
            className="gallery-zoom-overlay-btn"
            onClick={() => setActiveZoomUrl(currentImage?.dataUrl)}
            title="Expand full screen"
          >
            <ZoomIn size={15} /> Zoom Full Screen
          </button>
        </div>

        {/* Thumbnails row */}
        {evidenceList.length > 1 && (
          <div className="review-thumbnails-row mt-2">
            {evidenceList.map((img, idx) => (
              <button
                key={img.id || idx}
                type="button"
                className={`review-thumb-btn ${idx === activeImageIndex ? 'active' : ''}`}
                onClick={() => setActiveImageIndex(idx)}
                title={img.name || `Photo ${idx + 1}`}
              >
                <img src={img.dataUrl} alt={`Thumb ${idx + 1}`} className="thumb-img" />
                <span className="thumb-num">{idx + 1}</span>
              </button>
            ))}
          </div>
        )}

        {/* Current Photo Metadata */}
        <div className="current-photo-meta-strip text-xs text-secondary mt-2 flex items-center justify-between">
          <span>File: <strong>{currentImage?.name || `photo_${activeImageIndex + 1}.jpg`}</strong> ({formatBytes(currentImage?.size || 1500000)})</span>
          <span>Detected Areas: <strong>{detected_damage_areas.join(', ') || 'General Surface'}</strong></span>
        </div>
      </div>

      {/* Traceable Sources Panel (Section 10 Requirement) */}
      <div className="traceable-sources-section mb-3">
        <h4 className="section-sub-title flex items-center gap-2 mb-2">
          <Layers size={15} className="text-primary-light" />
          Evidence Source Traceability & Audit Links
        </h4>
        <div className="traceable-cards-grid">
          {/* Finding 1: Damage Visibility */}
          <div className="trace-card">
            <div className="trace-header">
              <span className="trace-lbl">Finding:</span>
              <span className="trace-badge">Damage Extraction</span>
            </div>
            <p className="trace-finding-text text-xs">
              {detected_damage_types.join(', ')} detected on {detected_damage_areas.join(', ')}.
            </p>
            <div className="trace-source-row text-xs mt-2">
              <span className="text-dim">Source:</span>
              <button
                type="button"
                className="trace-link-btn"
                onClick={() => {
                  setActiveImageIndex(0);
                  setActiveZoomUrl(currentImage?.dataUrl);
                }}
              >
                <Camera size={12} /> Image {activeImageIndex + 1} &bull; View Photo
              </button>
            </div>
          </div>

          {/* Finding 2: Customer History Source */}
          <div className="trace-card">
            <div className="trace-header">
              <span className="trace-lbl">Finding:</span>
              <span className="trace-badge">Customer Pattern</span>
            </div>
            <p className="trace-finding-text text-xs">
              Lifetime return rate and prior verified delivery outcomes evaluated.
            </p>
            <div className="trace-source-row text-xs mt-2">
              <span className="text-dim">Source:</span>
              {onViewCustomerHistory ? (
                <button
                  type="button"
                  className="trace-link-btn"
                  onClick={onViewCustomerHistory}
                >
                  <History size={12} /> Customer Profile &bull; Module 2
                </button>
              ) : (
                <span className="text-secondary font-medium">Customer Profile Data</span>
              )}
            </div>
          </div>

          {/* Finding 3: Timing Window Source */}
          <div className="trace-card">
            <div className="trace-header">
              <span className="trace-lbl">Finding:</span>
              <span className="trace-badge">Delivery Manifest</span>
            </div>
            <p className="trace-finding-text text-xs">
              Days elapsed between confirmed delivery and return request creation.
            </p>
            <div className="trace-source-row text-xs mt-2">
              <span className="text-dim">Source:</span>
              <span className="text-secondary font-medium flex items-center gap-1">
                <FileText size={12} /> Order Delivery Date
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Forensic Findings & Warnings */}
      {(findings.length > 0 || warnings.length > 0) && (
        <div className="findings-warnings-box mt-3">
          {findings.map((f, i) => (
            <div key={i} className="finding-pill-row">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span className="text-xs text-secondary">{f.text || f}</span>
            </div>
          ))}
          {warnings.map((w, i) => (
            <div key={i} className="warning-pill-row">
              <AlertTriangle size={13} className="text-amber-400" />
              <span className="text-xs text-amber-200">{w.text || w}</span>
            </div>
          ))}
        </div>
      )}

      {/* Full Screen Zoom Modal */}
      {activeZoomUrl && (
        <div className="modal-backdrop" onClick={() => setActiveZoomUrl(null)}>
          <div className="modal-content zoom-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-filename font-serif">High-Resolution Evidence Photo</span>
              <button 
                type="button" 
                onClick={() => setActiveZoomUrl(null)} 
                className="modal-close-btn"
                aria-label="Close image zoom"
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body text-center">
              <img src={activeZoomUrl} alt="Zoomed evidence" className="modal-full-img" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
