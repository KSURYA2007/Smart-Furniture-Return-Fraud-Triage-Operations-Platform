import React, { useState, useEffect } from 'react';
import RiskScoreGauge from '../components/triage/RiskScoreGauge';
import RiskFactorBreakdown from '../components/triage/RiskFactorBreakdown';
import SupportingEvidenceCard from '../components/triage/SupportingEvidenceCard';
import EmptyState from '../components/common/EmptyState';
import { 
  getReturnById, 
  getCustomerById, 
  getStoredTriageAssessment, 
  saveStoredTriageAssessment,
  getAllReturns
} from '../utils/storage';
import { calculateCustomerHistoryStats, formatCurrencyINR } from '../utils/customerHistory';
import { analyzeReturnEvidence } from '../utils/evidenceAnalysis';
import { calculateRisk } from '../services/riskEngine';
import { 
  ArrowLeft, 
  Layers, 
  History, 
  Camera, 
  ShieldAlert, 
  Package, 
  User, 
  Calendar, 
  DollarSign, 
  FileText, 
  CheckCircle2, 
  Info,
  Cpu,
  Code,
  ChevronDown,
  ChevronUp,
  UserCheck
} from 'lucide-react';

export default function TriageCaseDetail({
  returnId,
  onBack,
  onViewCustomer,
  onViewEvidence,
  onViewReview,
  onSelectReturn
}) {
  const [returnRecord, setReturnRecord] = useState(null);
  const [customerStats, setCustomerStats] = useState(null);
  const [evidenceAnalysis, setEvidenceAnalysis] = useState(null);
  const [triageResult, setTriageResult] = useState(null);
  const [allReturns, setAllReturns] = useState([]);
  const [selectedReturnId, setSelectedReturnId] = useState(returnId);
  const [showJsonAudit, setShowJsonAudit] = useState(false);

  useEffect(() => {
    setAllReturns(getAllReturns());
  }, []);

  useEffect(() => {
    const idToFetch = selectedReturnId || returnId || (allReturns.length > 0 ? allReturns[0].return_id : null);
    if (idToFetch) {
      const rec = getReturnById(idToFetch);
      if (rec) {
        setReturnRecord(rec);

        const customerId = rec.customer_id || rec.customer?.customer_id;
        let stats = null;
        if (customerId) {
          stats = calculateCustomerHistoryStats(customerId);
          setCustomerStats(stats);
        }

        const analyzed = analyzeReturnEvidence(rec);
        setEvidenceAnalysis(analyzed);

        const triage = calculateRisk(rec, stats, analyzed);
        setTriageResult(triage);
        saveStoredTriageAssessment(idToFetch, triage);
      }
    }
  }, [selectedReturnId, returnId, allReturns]);

  const handleSwitchReturn = (newId) => {
    setSelectedReturnId(newId);
    if (onSelectReturn) onSelectReturn(newId);
  };

  if (!returnRecord || !triageResult) {
    return (
      <div className="page-wrapper triage-detail-page">
        <EmptyState
          icon={ShieldAlert}
          title="Triage Case Not Found"
          message={`No return claim record found matching ID "${returnId || 'Unknown'}".`}
          actionText="Back to Triage Queue"
          onAction={onBack}
        />
      </div>
    );
  }

  const { customer = {}, order = {}, return: returnInfo = {} } = returnRecord;
  const productPrice = Number(order.product_price || order.price || returnRecord.product_price || 0);

  return (
    <div className="page-wrapper triage-detail-page">
      {/* Top Action & Navigation Bar */}
      <div className="triage-top-actions-bar">
        <div className="flex items-center gap-3 flex-wrap">
          {onBack && (
            <button type="button" onClick={onBack} className="btn-back-link">
              <ArrowLeft size={16} /> Back to Triage Queue
            </button>
          )}

          {customer?.customer_id && onViewCustomer && (
            <button
              type="button"
              onClick={() => onViewCustomer(customer.customer_id, returnRecord)}
              className="btn-secondary btn-sm"
              title="Inspect customer order and return history"
            >
              <History size={14} /> View Customer History
            </button>
          )}

          {onViewEvidence && (
            <button
              type="button"
              onClick={() => onViewEvidence(returnRecord.return_id)}
              className="btn-secondary btn-sm"
              title="Inspect evidence photos and condition consistency"
            >
              <Camera size={14} /> View Evidence Analysis
            </button>
          )}

          {onViewReview && (
            <button
              type="button"
              onClick={() => onViewReview(returnRecord.return_id)}
              className="btn-primary btn-sm"
              title="Open human review & operational decision workspace in Module 5"
            >
              <UserCheck size={14} /> Open Review Workspace (Module 5)
            </button>
          )}
        </div>

        {/* Quick Return Selector Switcher */}
        {allReturns.length > 1 && (
          <div className="return-selector-wrap">
            <span className="text-dim text-xs font-semibold uppercase">Switch Case:</span>
            <select
              className="filter-select return-dropdown"
              value={selectedReturnId || returnRecord.return_id}
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

      {/* Page Header Hero Banner */}
      <header className="page-header triage-detail-header">
        <div className="header-container">
          <div className="header-badge-row">
            <span className="module-badge">
              <ShieldAlert size={13} /> Decision-Support Case Evaluation
            </span>
          </div>
          <h1 className="page-title font-serif">Fraud Risk & Operational Routing</h1>
          <p className="page-description">
            Transparent scoring model (<code>{triageResult.model_version}</code>) combining historical return patterns, condition verification, and financial exposure.
          </p>
        </div>

        {/* Header Target Card */}
        <div className="triage-header-target-card">
          <div className="header-target-id-row">
            <span className="target-lbl">Claim ID:</span>
            <span className="target-id-val font-serif-id">{returnRecord.return_id}</span>
          </div>
          <div className="header-target-product">
            <Package size={14} className="text-primary-light" />
            <span>{order?.product_name || returnRecord.product || 'Furniture Item'}</span>
            <span className="text-xs text-dim">({formatCurrencyINR(productPrice)})</span>
          </div>
          <div className="header-target-meta">
            <span>Customer: <strong>{customer?.name || returnRecord.customer_name || 'Customer'}</strong> ({customer?.customer_id || returnRecord.customer_id})</span>
            <span>Reported Reason: <strong>{returnInfo?.reason || returnRecord.reason || '—'}</strong></span>
          </div>
        </div>
      </header>

      {/* Main Grid: Score Gauge & Factor Breakdown */}
      <div className="triage-case-grid">
        {/* Left Column: Risk Gauge, Supporting Evidence, Context Highlights */}
        <div className="triage-case-col-left">
          {/* Risk Gauge Card */}
          <section className="form-card">
            <RiskScoreGauge triageResult={triageResult} />
          </section>

          {/* Supporting Evidence Card (for High/Critical cases) */}
          {triageResult.supporting_evidence?.length > 0 && (
            <section className="form-card">
              <SupportingEvidenceCard
                supportingEvidence={triageResult.supporting_evidence}
                onViewCustomer={onViewCustomer}
                onViewEvidence={onViewEvidence}
                customerId={customer.customer_id || returnRecord.customer_id}
                returnId={returnRecord.return_id}
              />
            </section>
          )}

          {/* Cross-Module Quick Summary Box */}
          <section className="form-card cross-module-summary-card">
            <h4 className="checklist-title mb-2">Cross-Module Intake Snapshot</h4>
            
            <div className="cross-module-rows">
              <div className="cross-row">
                <span className="cross-lbl">Customer Lifetime Stats (Module 2):</span>
                <span className="cross-val">
                  {customerStats 
                    ? `${customerStats.total_orders} orders &bull; ${customerStats.total_returns} returns (${customerStats.return_rate}% return rate) &bull; ${customerStats.total_confirmed_fraud} fraud cases` 
                    : 'Customer profile loaded'}
                </span>
              </div>

              <div className="cross-row">
                <span className="cross-lbl">Evidence Analysis (Module 3):</span>
                <span className="cross-val">
                  Strength: <strong>{evidenceAnalysis?.evidence_strength || 'MEDIUM'}</strong> &bull; 
                  Consistency: <strong>{evidenceAnalysis?.condition_consistency || 'CONSISTENT'}</strong> &bull; 
                  Damage Area: <strong>{evidenceAnalysis?.detected_damage_areas?.join(', ') || 'Unspecified'}</strong>
                </span>
              </div>

              <div className="cross-row">
                <span className="cross-lbl">Timing Window:</span>
                <span className="cross-val">
                  {evidenceAnalysis?.timeline?.days_from_delivery_to_return !== null
                    ? `${evidenceAnalysis.timeline.days_from_delivery_to_return} days after delivery completion`
                    : 'Standard return period'}
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Factor Breakdown & Audit Trace */}
        <div className="triage-case-col-right">
          <section className="form-card">
            <RiskFactorBreakdown
              factors={triageResult.factors}
              totalScore={triageResult.risk_score}
            />
          </section>

          {/* Module 5 Human Review Preparation Card */}
          <section className="form-card human-review-prep-card">
            <div className="flex items-center gap-2 mb-2">
              <div className="card-header-icon bg-primary-light">
                <UserCheck size={18} className="icon-blue" />
              </div>
              <div>
                <h4 className="checklist-title">Module 5 Human Review Status</h4>
                <p className="checklist-subtitle">Prepared structure for future operational override & review notes</p>
              </div>
            </div>

            <div className="review-status-box">
              <div className="status-indicator-line">
                <span className="text-xs text-dim uppercase font-bold">Current Decision:</span>
                <span className="badge-pending-decision">Awaiting Review Triage</span>
              </div>
              <p className="text-xs text-secondary mt-1 mb-3">
                This case has been routed to <strong>{triageResult.priority_label}</strong>. Final operational authorization occurs in Module 5 (Human Review & Final Decision Workspace).
              </p>

              {onViewReview && (
                <button
                  type="button"
                  onClick={() => onViewReview(returnRecord.return_id)}
                  className="btn-primary btn-sm w-full flex items-center justify-center gap-2"
                  title="Make decision and manual override in Module 5"
                >
                  <UserCheck size={14} /> Open Human Review Workspace (Module 5)
                </button>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* JSON Audit Trail Section */}
      <section className="module-pipeline-card mt-4">
        <div className="pipeline-title">
          <Cpu size={16} className="text-primary-light" /> Triage Assessment Schema Output (JSON Audit Trail)
        </div>
        <p className="pipeline-desc">
          Structured deterministic decision-support payload conforming to <code>model_version: rules-v1</code>.
        </p>

        <button
          type="button"
          className="btn-toggle-json"
          onClick={() => setShowJsonAudit(!showJsonAudit)}
        >
          <Code size={14} />
          <span>{showJsonAudit ? 'Hide Audit JSON Payload' : 'Inspect Audit JSON Payload'}</span>
          {showJsonAudit ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showJsonAudit && (
          <pre className="json-viewer" tabIndex={0} aria-label="Triage Assessment Audit JSON">
            {JSON.stringify(triageResult, null, 2)}
          </pre>
        )}
      </section>
    </div>
  );
}
