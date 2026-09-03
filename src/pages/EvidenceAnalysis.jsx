import React, { useState, useEffect } from 'react';
import EvidenceGallery from '../components/evidence/EvidenceGallery';
import EvidenceQualityCard from '../components/evidence/EvidenceQualityCard';
import ConditionConsistencyCard from '../components/evidence/ConditionConsistencyCard';
import EvidenceChecklist from '../components/evidence/EvidenceChecklist';
import EvidenceFindingsPanel from '../components/evidence/EvidenceFindingsPanel';
import EvidenceTimeline from '../components/evidence/EvidenceTimeline';
import EvidenceAnnotationTool from '../components/evidence/EvidenceAnnotationTool';
import EvidenceReviewNotes from '../components/evidence/EvidenceReviewNotes';
import EmptyState from '../components/common/EmptyState';
import { analyzeReturnEvidence } from '../utils/evidenceAnalysis';
import { getReturnById, getAllReturns, saveStoredEvidenceAnalysis } from '../utils/storage';
import { 
  Layers, 
  ArrowLeft, 
  User, 
  RotateCcw, 
  Package, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Cpu, 
  Code, 
  ChevronDown, 
  ChevronUp, 
  History, 
  Maximize2, 
  X,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

export default function EvidenceAnalysis({ 
  returnId, 
  onBack, 
  onViewCustomerHistory,
  onTriageCase,
  onSelectReturn
}) {
  const [allReturns, setAllReturns] = useState(() => getAllReturns());
  const [selectedReturnId, setSelectedReturnId] = useState(() => {
    if (returnId) return returnId;
    const list = getAllReturns();
    return list.length > 0 ? list[0].return_id : null;
  });

  const [returnRecord, setReturnRecord] = useState(() => {
    const list = getAllReturns();
    const id = returnId || (list.length > 0 ? list[0].return_id : null);
    return id ? getReturnById(id) : null;
  });

  const [analysis, setAnalysis] = useState(() => {
    const list = getAllReturns();
    const id = returnId || (list.length > 0 ? list[0].return_id : null);
    const rec = id ? getReturnById(id) : null;
    return rec ? analyzeReturnEvidence(rec) : null;
  });

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showAnnotationModal, setShowAnnotationModal] = useState(false);
  const [activeZoomUrl, setActiveZoomUrl] = useState(null);
  const [showJsonSummary, setShowJsonSummary] = useState(false);

  // Synchronize when returnId prop changes (e.g. user selects a return in Module 1 or 2)
  useEffect(() => {
    const list = getAllReturns();
    setAllReturns(list);
    const idToFetch = returnId || selectedReturnId || (list.length > 0 ? list[0].return_id : null);
    if (idToFetch) {
      if (returnId && returnId !== selectedReturnId) {
        setSelectedReturnId(returnId);
      }
      const rec = getReturnById(idToFetch);
      if (rec) {
        setReturnRecord(rec);
        const analyzed = analyzeReturnEvidence(rec);
        setAnalysis(analyzed);
        saveStoredEvidenceAnalysis(idToFetch, analyzed);
      }
    }
  }, [returnId, selectedReturnId]);

  const handleSwitchReturn = (newId) => {
    setSelectedReturnId(newId);
    setActiveImageIndex(0);
    if (onSelectReturn) onSelectReturn(newId);
  };

  if (!returnRecord || !analysis) {
    return (
      <div className="page-wrapper evidence-analysis-page">
        <EmptyState
          icon={RotateCcw}
          title="Return Request Not Found"
          message={`No return record was found matching ID "${returnId || 'Unknown'}".`}
          actionText="Back to Returns"
          onAction={onBack}
        />
      </div>
    );
  }

  const { return_id, customer, order, returnInfo } = analysis;
  const currentImage = analysis.evidenceList[activeImageIndex] || analysis.evidenceList[0];

  return (
    <div className="page-wrapper evidence-analysis-page">
      {/* Top Action & Navigation Bar */}
      <div className="evidence-top-actions-bar">
        <div className="flex items-center gap-3 flex-wrap">
          {onBack && (
            <button type="button" onClick={onBack} className="btn-back-link">
              <ArrowLeft size={16} /> Back
            </button>
          )}

          {onTriageCase && (
            <button
              type="button"
              onClick={() => onTriageCase(return_id)}
              className="btn-primary btn-sm"
              title="Open fraud risk score & priority in Module 4"
            >
              <ShieldAlert size={14} /> Calculate Risk Score (Module 4)
            </button>
          )}

          {customer?.customer_id && onViewCustomerHistory && (
            <button
              type="button"
              onClick={() => onViewCustomerHistory(customer.customer_id, returnRecord)}
              className="btn-secondary btn-sm"
              title="Open customer order history profile"
            >
              <History size={14} /> View Customer History
            </button>
          )}
        </div>

        {/* Quick Return Selector Switcher */}
        {allReturns.length > 1 && (
          <div className="return-selector-wrap">
            <span className="text-dim text-xs font-semibold uppercase">Inspect Return:</span>
            <select
              className="filter-select return-dropdown"
              value={selectedReturnId || return_id}
              onChange={(e) => handleSwitchReturn(e.target.value)}
            >
              {allReturns.map((r) => (
                <option key={r.return_id} value={r.return_id}>
                  {r.return_id} &bull; {r.product || r.order?.product_name || 'Item'}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Page Header Hero */}
      <header className="page-header evidence-header-banner">
        <div className="header-container">
          <div className="header-badge-row">
            <span className="module-badge">
              <Layers size={13} /> Module 3: Evidence & Product Condition Analysis
            </span>
          </div>
          <h1 className="page-title font-serif">Evidence Analysis & Quality Triage</h1>
          <p className="page-description">
            Structured forensic verification of uploaded media, component damage extraction, and condition consistency.
          </p>
        </div>

        <div className="evidence-header-target-card">
          <div className="header-target-id-row">
            <span className="target-lbl">Return ID:</span>
            <span className="target-id-val font-serif-id">{return_id}</span>
          </div>
          <div className="header-target-product">
            <Package size={14} className="text-primary-light" />
            <span>{order?.product_name || returnRecord.product || 'Furniture Item'}</span>
          </div>
          <div className="header-target-meta">
            <span>Customer: <strong>{customer?.name || returnRecord.customer_name || 'Customer'}</strong></span>
            <span>Reason: <strong>{returnInfo?.reason || returnRecord.reason || '—'}</strong></span>
          </div>
        </div>
      </header>

      {/* Main Analysis Grid (Side-by-side on desktop, stacked on mobile) */}
      <div className="evidence-workspace-grid">
        {/* Left Column: Evidence Gallery & Annotations */}
        <div className="evidence-col-left">
          <section className="evidence-section-card form-card">
            <div className="card-header">
              <div className="card-header-icon">
                <Layers size={20} className="icon-blue" />
              </div>
              <div className="card-header-flex">
                <div>
                  <h2 className="card-title">Submitted Evidence Gallery</h2>
                  <p className="card-subtitle">Inspect high-resolution damage photographs submitted with the claim</p>
                </div>
                <span className="badge-count">{analysis.image_count} Photo{analysis.image_count !== 1 ? 's' : ''}</span>
              </div>
            </div>

            <EvidenceGallery
              evidenceList={analysis.evidenceList}
              activeImageIndex={activeImageIndex}
              onSelectImage={(idx) => setActiveImageIndex(idx)}
              onOpenAnnotation={() => setShowAnnotationModal(true)}
              onOpenZoom={(url) => setActiveZoomUrl(url)}
            />
          </section>

          {/* Factual Timeline */}
          <section className="evidence-section-card form-card">
            <EvidenceTimeline timeline={analysis.timeline} />
          </section>

          {/* Reviewer Notes Section */}
          <section className="evidence-section-card form-card">
            <EvidenceReviewNotes returnId={return_id} />
          </section>
        </div>

        {/* Right Column: Structured Quality, Consistency & Findings */}
        <div className="evidence-col-right">
          {/* Quality & Strength Card */}
          <section className="evidence-section-card form-card">
            <EvidenceQualityCard analysis={analysis} />
          </section>

          {/* Condition & Consistency Card */}
          <section className="evidence-section-card form-card">
            <ConditionConsistencyCard analysis={analysis} />
          </section>

          {/* Completeness Checklist */}
          <section className="evidence-section-card form-card">
            <EvidenceChecklist checklist={analysis.checklist} />
          </section>

          {/* Traceable Findings Panel */}
          <section className="evidence-section-card form-card">
            <EvidenceFindingsPanel
              findings={analysis.findings}
              warnings={analysis.warnings}
            />
          </section>
        </div>
      </div>

      {/* Structured Summary Output Banner for Downstream Module 4 */}
      <section className="module-pipeline-card evidence-structured-summary-card mt-4">
        <div className="pipeline-title">
          <Cpu size={16} className="text-primary-light" /> Module 3 Structured Analysis Output (Stored in LocalStorage)
        </div>
        <p className="pipeline-desc">
          The verified evidence metrics above (strength: <code>{analysis.evidence_strength}</code>, consistency: <code>{analysis.condition_consistency}</code>, damage area: <code>{analysis.detected_damage_areas.join(', ')}</code>) are stored in <code>localStorage.return_evidence_analysis</code> for downstream processing by Module 4 (Fraud Risk & Priority Engine).
        </p>

        <button
          type="button"
          className="btn-toggle-json"
          onClick={() => setShowJsonSummary(!showJsonSummary)}
        >
          <Code size={14} />
          <span>{showJsonSummary ? 'Hide Structured Evidence JSON' : 'Inspect Structured Evidence JSON Payload'}</span>
          {showJsonSummary ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showJsonSummary && (
          <pre className="json-viewer" tabIndex={0} aria-label="Structured Evidence JSON Output">
            {JSON.stringify({
              return_id: analysis.return_id,
              evidence_analysis: {
                image_count: analysis.image_count,
                usable_image_count: analysis.usable_image_count,
                image_quality: analysis.image_quality,
                damage_visibility: analysis.damage_visibility,
                evidence_completeness: analysis.evidence_completeness,
                detected_damage_areas: analysis.detected_damage_areas,
                detected_damage_types: analysis.detected_damage_types,
                condition_consistency: analysis.condition_consistency,
                evidence_strength: analysis.evidence_strength,
                findings: analysis.findings,
                warnings: analysis.warnings,
                days_since_delivery: analysis.timeline?.days_from_delivery_to_return
              }
            }, null, 2)}
          </pre>
        )}
      </section>

      {/* Annotation Canvas Tool Modal */}
      {showAnnotationModal && currentImage && (
        <EvidenceAnnotationTool
          returnId={return_id}
          image={currentImage}
          imageIndex={activeImageIndex}
          onClose={() => setShowAnnotationModal(false)}
        />
      )}

      {/* Full Image Zoom Modal */}
      {activeZoomUrl && (
        <div className="modal-backdrop nested-zoom" onClick={() => setActiveZoomUrl(null)}>
          <div className="modal-content zoom-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-filename font-serif">High-Resolution Evidence Photo</span>
              <button 
                type="button" 
                onClick={() => setActiveZoomUrl(null)} 
                className="modal-close-btn"
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <img src={activeZoomUrl} alt="Zoomed evidence" className="modal-full-img" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
