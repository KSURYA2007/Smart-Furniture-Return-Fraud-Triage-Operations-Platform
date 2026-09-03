import React, { useState, useEffect } from 'react';
import SystemRecommendationCard from '../components/review/SystemRecommendationCard.jsx';
import EvidenceReviewSection from '../components/review/EvidenceReviewSection.jsx';
import DecisionPanel from '../components/review/DecisionPanel.jsx';
import InternalReviewNotes from '../components/review/InternalReviewNotes.jsx';
import ReviewTimeline from '../components/review/ReviewTimeline.jsx';
import DecisionModal from '../components/review/DecisionModal.jsx';
import EmptyState from '../components/common/EmptyState';

import { 
  getReturnById, 
  getAllReturns, 
  getStoredReview, 
  saveStoredReview, 
  addReviewAuditEntry 
} from '../utils/storage.js';
import { calculateCustomerHistoryStats, formatCurrencyINR } from '../utils/customerHistory.js';
import { analyzeReturnEvidence } from '../utils/evidenceAnalysis.js';
import { calculateRisk } from '../services/riskEngine.js';
import { calculatePrototypeEstimates, HUMAN_DECISIONS } from '../services/reviewService.js';

import { 
  ArrowLeft, 
  ShieldAlert, 
  Package, 
  User, 
  UserCheck,
  Calendar, 
  Truck, 
  CheckCircle2, 
  Layers, 
  History, 
  Clock, 
  DollarSign, 
  FileText, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
  Scale
} from 'lucide-react';

export default function ReviewCaseDetail({
  returnId,
  onBack,
  onViewCustomer,
  onViewEvidence,
  onViewTriage,
  onViewPickup,
  onSelectReturn
}) {
  const [returnRecord, setReturnRecord] = useState(null);
  const [customerStats, setCustomerStats] = useState(null);
  const [evidenceAnalysis, setEvidenceAnalysis] = useState(null);
  const [triageResult, setTriageResult] = useState(null);
  const [storedReview, setStoredReview] = useState(null);
  const [allReturns, setAllReturns] = useState([]);
  const [selectedReturnId, setSelectedReturnId] = useState(returnId);

  // Review timing
  const [reviewStartTime] = useState(() => Date.now());

  // Decision confirmation modal
  const [pendingDecisionPayload, setPendingDecisionPayload] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);
  const [decisionSuccessNotice, setDecisionSuccessNotice] = useState(false);

  useEffect(() => {
    setAllReturns(getAllReturns());
  }, []);

  const loadCaseData = () => {
    const idToFetch = selectedReturnId || returnId || (allReturns.length > 0 ? allReturns[0].return_id : null);
    if (!idToFetch) return;

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

      // Fetch or initialize stored review
      let rev = getStoredReview(idToFetch);
      if (!rev) {
        // Initialize pending review with default creation audit log
        rev = {
          return_id: idToFetch.toUpperCase(),
          review_status: 'PENDING',
          system_recommendation: {
            risk_score: triage?.risk_score ?? 50,
            risk_category: triage?.risk_category || 'MEDIUM',
            priority: triage?.priority || 'HUMAN_REVIEW',
            recommendation: triage?.recommendation || 'Review required'
          },
          notes: [],
          timeline: [
            {
              id: `audit_init_1`,
              timestamp: rec.created_at || new Date().toISOString(),
              action: 'Return request submitted into logistics queue (Module 1)',
              user: rec.customer?.name || 'Customer',
              role: 'Customer'
            },
            {
              id: `audit_init_2`,
              timestamp: new Date().toISOString(),
              action: `Automated risk triage completed: ${triage?.risk_score}/100 (${triage?.risk_category})`,
              user: 'Risk Engine',
              role: 'System'
            },
            {
              id: `audit_init_3`,
              timestamp: new Date().toISOString(),
              action: 'Case opened in Module 5 Human Review Workspace',
              user: 'Dispatcher',
              role: 'Operator'
            }
          ]
        };
        saveStoredReview(idToFetch, rev);
      }
      setStoredReview(rev);
    }
  };

  useEffect(() => {
    loadCaseData();
  }, [selectedReturnId, returnId, allReturns]);

  const handleSwitchReturn = (newId) => {
    setSelectedReturnId(newId);
    if (onSelectReturn) onSelectReturn(newId);
  };

  // Called when user clicks "Confirm & Record Operational Decision" in DecisionPanel
  const handleInitiateDecision = (payload) => {
    setPendingDecisionPayload(payload);
    setShowConfirmModal(true);
  };

  // Confirmed in modal
  const handleConfirmDecision = () => {
    if (!pendingDecisionPayload || !returnRecord) return;
    setIsSubmittingDecision(true);

    const now = new Date().toISOString();
    const durationMinutes = Math.max(1, Math.round((Date.now() - reviewStartTime) / 60000));
    const price = Number(returnRecord.order?.price || returnRecord.product_price || 25000);
    const estimates = calculatePrototypeEstimates(price, triageResult?.risk_score, pendingDecisionPayload.decision_type);

    const updatedReview = {
      return_id: returnRecord.return_id.toUpperCase(),
      review_status: pendingDecisionPayload.status,
      system_recommendation: {
        risk_score: triageResult?.risk_score,
        risk_category: triageResult?.risk_category,
        priority: triageResult?.priority,
        recommendation: triageResult?.recommendation
      },
      reviewer: pendingDecisionPayload.reviewer,
      decision: {
        status: pendingDecisionPayload.status,
        decision_type: pendingDecisionPayload.decision_type,
        reason_categories: pendingDecisionPayload.reason_categories,
        reason: pendingDecisionPayload.reason,
        override: pendingDecisionPayload.override,
        override_reason: pendingDecisionPayload.override_reason
      },
      evidence_requested: pendingDecisionPayload.evidence_requested,
      escalation: pendingDecisionPayload.escalation,
      review_required: true,
      review_started_at: new Date(reviewStartTime).toISOString(),
      review_completed_at: now,
      review_duration_minutes: durationMinutes,
      ...estimates
    };

    // Append to timeline
    const timeline = Array.isArray(storedReview?.timeline) ? [...storedReview.timeline] : [];
    timeline.push({
      id: `audit_decided_${Date.now()}`,
      timestamp: now,
      action: `Human decision confirmed: ${HUMAN_DECISIONS[pendingDecisionPayload.decision_type]?.label} (${pendingDecisionPayload.status})`,
      user: pendingDecisionPayload.reviewer?.name,
      role: pendingDecisionPayload.reviewer?.role,
      details: pendingDecisionPayload.override 
        ? `Manual Override applied: "${pendingDecisionPayload.override_reason}"` 
        : `Reason: ${pendingDecisionPayload.reason.slice(0, 100)}...`
    });
    updatedReview.timeline = timeline;

    saveStoredReview(returnRecord.return_id, updatedReview);
    setStoredReview(updatedReview);
    setIsSubmittingDecision(false);
    setShowConfirmModal(false);
    setDecisionSuccessNotice(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!returnRecord || !triageResult) {
    return (
      <div className="page-wrapper review-detail-page">
        <EmptyState
          icon={ShieldAlert}
          title="Review Case Not Found"
          message={`No return claim matching ID "${returnId || 'Unknown'}" was found in local storage.`}
          actionText="Back to Review Queue"
          onAction={onBack}
        />
      </div>
    );
  }

  const { customer = {}, order = {}, return: returnInfo = {}, pickup = {} } = returnRecord;
  const orderPrice = Number(order.product_price || order.price || returnRecord.product_price || 0);
  const currentReviewStatus = storedReview?.decision?.status || storedReview?.review_status || 'PENDING';
  const isDecided = currentReviewStatus === 'APPROVED' || currentReviewStatus === 'REJECTED' || currentReviewStatus === 'ESCALATED';

  // Days since delivery calculation for Service Protection (Section 30)
  const calculateDaysSinceDelivery = () => {
    if (!order.delivery_date) return null;
    const delivery = new Date(order.delivery_date);
    const submitted = new Date(returnRecord.created_at || Date.now());
    const diffTime = Math.abs(submitted - delivery);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };
  const daysSinceDelivery = calculateDaysSinceDelivery();

  return (
    <div className="page-wrapper review-detail-page">
      {/* Top Action & Case Switcher Bar */}
      <div className="review-top-actions-bar mb-3">
        <div className="flex items-center gap-3 flex-wrap">
          {onBack && (
            <button type="button" onClick={onBack} className="btn-back-link">
              <ArrowLeft size={16} /> Back to Review Queue
            </button>
          )}

          {customer?.customer_id && onViewCustomer && (
            <button
              type="button"
              onClick={() => onViewCustomer(customer.customer_id, returnRecord)}
              className="btn-secondary btn-sm"
              title="Open customer lifetime orders and return history"
            >
              <History size={14} /> View Full Customer History (Module 2)
            </button>
          )}

          {onViewEvidence && (
            <button
              type="button"
              onClick={() => onViewEvidence(returnRecord.return_id)}
              className="btn-secondary btn-sm"
              title="Open deep forensic evidence tool in Module 3"
            >
              <Layers size={14} /> Open Evidence Analysis (Module 3)
            </button>
          )}

          {onViewTriage && (
            <button
              type="button"
              onClick={() => onViewTriage(returnRecord.return_id)}
              className="btn-secondary btn-sm"
              title="Open risk scoring engine in Module 4"
            >
              <ShieldAlert size={14} /> Open Risk Engine (Module 4)
            </button>
          )}

          {onViewPickup && (storedReview?.decision?.decision_type === 'APPROVE_PICKUP' || storedReview?.review_status === 'APPROVED') && (
            <button
              type="button"
              onClick={() => onViewPickup(returnRecord.return_id)}
              className="btn-primary btn-sm flex items-center gap-1.5"
              title="Open in Module 6 Pickup Operations & Prioritisation"
            >
              <Truck size={14} /> Open in Pickup Dispatch (Module 6)
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

      {/* Success Notification Banner after submission */}
      {decisionSuccessNotice && (
        <div className="decision-completed-banner mb-4 p-4 rounded bg-emerald-bg border border-emerald-border">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={22} className="text-emerald-400" />
              <div>
                <h4 className="font-bold text-sm text-emerald-300">Operational Decision Recorded Successfully</h4>
                <p className="text-xs text-secondary">
                  Decision <strong>{storedReview?.decision?.decision_type?.replace('_', ' ')}</strong> saved by {storedReview?.reviewer?.name} ({storedReview?.reviewer?.role}). Case updated in audit trail.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onBack}
                className="btn-ghost btn-sm"
              >
                Back to Review Queue &rarr;
              </button>
              {onViewPickup && storedReview?.decision?.decision_type === 'APPROVE_PICKUP' && (
                <button
                  type="button"
                  onClick={() => onViewPickup(returnRecord.return_id)}
                  className="btn-primary btn-sm flex items-center gap-1.5"
                >
                  <Truck size={14} />
                  <span>Open Pickup Dispatch (Module 6) &rarr;</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Page Header Hero with Target Return Details */}
      <header className="page-header review-header-banner mb-4">
        <div className="header-container">
          <div className="header-badge-row">
            <span className="module-badge">
              <UserCheck size={13} /> Module 5: Human Review & Final Decision
            </span>
          </div>
          <h1 className="page-title font-serif">Human Operational Review Workspace</h1>
          <p className="page-description">
            Evaluate claim veracity, inspect physical damage proof, and record binding operational actions with automated audit logging.
          </p>
        </div>

        {/* Case Overview Target Card */}
        <div className="review-header-target-card">
          <div className="header-target-id-row">
            <span className="target-lbl">Return ID:</span>
            <span className="target-id-val font-serif-id">{returnRecord.return_id}</span>
          </div>
          <div className="header-target-product">
            <Package size={14} className="text-primary-light" />
            <span>{order?.product_name || returnRecord.product || 'Furniture Item'}</span>
            <span className="text-xs text-dim">({formatCurrencyINR(orderPrice)})</span>
          </div>
          <div className="header-target-meta">
            <span>Customer: <strong>{customer?.name || returnRecord.customer_name || 'Customer'}</strong></span>
            <span>Reason: <strong>{returnInfo?.reason || returnRecord.reason || '—'}</strong></span>
            <span>Current Status: <strong className="text-primary">{currentReviewStatus}</strong></span>
          </div>
        </div>
      </header>

      {/* Section 6 & 7: System Recommendation vs Human Decision Panel */}
      <SystemRecommendationCard
        triageResult={triageResult}
        orderValue={orderPrice}
        storedReview={storedReview}
      />

      {/* Main 2-Column Review Grid */}
      <div className="review-workspace-grid">
        {/* Left Column: Evidence Verification, Current Return, Customer Lifetime Profile */}
        <div className="review-col-left">
          {/* Section 9 & 10: Multimodal Evidence Verification with Source Traceability */}
          <EvidenceReviewSection
            evidenceAnalysis={evidenceAnalysis}
            returnRecord={returnRecord}
            onViewCustomerHistory={() => onViewCustomer && onViewCustomer(customer?.customer_id, returnRecord)}
          />

          {/* Section 12: Current Return & Pickup Logistics Breakdown */}
          <section className="form-card mb-4">
            <div className="card-header border-bottom pb-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="card-header-icon bg-primary-light">
                  <Package size={16} className="icon-blue" />
                </div>
                <div>
                  <h3 className="card-title text-base">Current Return Details & Logistics</h3>
                  <p className="card-subtitle">Intake data captured during Module 1 customer filing</p>
                </div>
              </div>
            </div>

            <div className="details-2-col text-xs">
              <div>
                <p className="detail-line mb-1"><strong>Order ID:</strong> {order?.order_id || 'ORD-UNKNOWN'}</p>
                <p className="detail-line mb-1"><strong>Category:</strong> {order?.category || 'Bulky Furniture'}</p>
                <p className="detail-line mb-1"><strong>Item Price:</strong> {formatCurrencyINR(orderPrice)}</p>
                <p className="detail-line mb-1"><strong>Condition Reported:</strong> {returnInfo?.condition || 'Major Damage'}</p>
                <p className="detail-line mb-1"><strong>Customer Explanation:</strong> {returnInfo?.description || 'No description provided.'}</p>
              </div>
              <div>
                <p className="detail-line mb-1"><strong>Pickup City:</strong> {pickup?.city || '—'} - {pickup?.postal_code || '—'}</p>
                <p className="detail-line mb-1"><strong>Pickup Address:</strong> {pickup?.address || '—'}</p>
                <p className="detail-line mb-1"><strong>Preferred Date:</strong> {pickup?.preferred_date || 'Standard Courier'}</p>
                {pickup?.instructions && (
                  <p className="detail-line mb-1"><strong>Courier Notes:</strong> {pickup.instructions}</p>
                )}
              </div>
            </div>
          </section>

          {/* Section 11: Compact Customer Lifetime History (Module 2) */}
          <section className="form-card mb-4">
            <div className="card-header border-bottom pb-2 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="card-header-icon bg-primary-light">
                    <History size={16} className="icon-blue" />
                  </div>
                  <div>
                    <h3 className="card-title text-base">Customer Account Lifetime History</h3>
                    <p className="card-subtitle">Lifetime orders, return frequency, and past fraud outcomes</p>
                  </div>
                </div>
                {onViewCustomer && (
                  <button
                    type="button"
                    onClick={() => onViewCustomer(customer?.customer_id, returnRecord)}
                    className="btn-ghost btn-xs"
                  >
                    View All &rarr;
                  </button>
                )}
              </div>
            </div>

            {/* Failure Case 2: Missing Customer History */}
            {customerStats === null ? (
              <div className="missing-history-banner p-3 text-center text-xs">
                <Info size={18} className="text-secondary mx-auto mb-1" />
                <p className="font-semibold text-secondary">Customer history unavailable.</p>
                <p className="text-dim">Historical factors were not available for this case. Evaluated with neutral baseline.</p>
              </div>
            ) : (
              <div className="customer-summary-pills-row">
                <div className="summary-pill-item">
                  <span className="pill-item-lbl">Total Orders:</span>
                  <span className="pill-item-val font-semibold">{customerStats.total_orders}</span>
                </div>
                <div className="summary-pill-item">
                  <span className="pill-item-lbl">Total Returns:</span>
                  <span className="pill-item-val font-semibold">{customerStats.total_returns}</span>
                </div>
                <div className="summary-pill-item">
                  <span className="pill-item-lbl">Return Rate:</span>
                  <span className={`pill-item-val font-semibold ${customerStats.return_rate >= 40 ? 'text-amber-400' : ''}`}>
                    {customerStats.return_rate}%
                  </span>
                </div>
                <div className="summary-pill-item">
                  <span className="pill-item-lbl">Confirmed Fraud:</span>
                  <span className={`pill-item-val font-semibold ${customerStats.total_confirmed_fraud > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {customerStats.total_confirmed_fraud}
                  </span>
                </div>
                <div className="summary-pill-item">
                  <span className="pill-item-lbl">Avg Order Value:</span>
                  <span className="pill-item-val font-semibold">{formatCurrencyINR(customerStats.avg_order_value)}</span>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Risk Factor Arithmetic, Human Decision Panel, Review Notes, Audit Trail */}
        <div className="review-col-right">
          {/* Section 8: Risk Arithmetic Factor Breakdown */}
          <section className="form-card mb-4">
            <div className="card-header border-bottom pb-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="card-header-icon bg-amber-bg">
                  <ShieldAlert size={16} className="text-amber-400" />
                </div>
                <div>
                  <h3 className="card-title text-base">Why was this case prioritized?</h3>
                  <p className="card-subtitle">Transparent points arithmetic (Module 4 model: {triageResult.model_version})</p>
                </div>
              </div>
            </div>

            <div className="factors-review-list">
              {triageResult.factors?.map((f) => (
                <div key={f.id} className="factor-review-item mb-2 pb-2 border-bottom">
                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <span className="font-semibold text-secondary">{f.name}</span>
                    <span className={`factor-points-tag font-bold ${f.points > 0 ? 'text-amber-400' : 'text-dim'}`}>
                      +{f.points} / {f.max_points} pts
                    </span>
                  </div>
                  <p className="text-xs text-dim mb-1">{f.explanation}</p>
                  <div className="flex items-center justify-between text-xs text-dim">
                    <span>Source: <strong className="text-secondary">{f.source}</strong> ({f.source_reference})</span>
                    <span>Value: <strong className="text-secondary">{f.value}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 30: Service Protection & Timing Information */}
          <section className="form-card mb-4 service-impact-card">
            <div className="card-header border-bottom pb-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="card-header-icon bg-primary-light">
                  <Clock size={16} className="icon-blue" />
                </div>
                <div>
                  <h3 className="card-title text-base">Service Protection & Operational Context</h3>
                  <p className="card-subtitle">Minimizing legitimate return friction while safeguarding reverse logistics</p>
                </div>
              </div>
            </div>

            <div className="service-impact-grid text-xs">
              <div className="service-impact-item">
                <span className="text-dim">Days Since Delivery:</span>
                <span className="font-semibold text-secondary ml-1">
                  {daysSinceDelivery !== null ? `${daysSinceDelivery} days` : 'Within policy'}
                </span>
              </div>
              <div className="service-impact-item">
                <span className="text-dim">Return Submitted:</span>
                <span className="font-semibold text-secondary ml-1">
                  {new Date(returnRecord.created_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
              </div>
              <div className="service-impact-item">
                <span className="text-dim">Preferred Pickup:</span>
                <span className="font-semibold text-secondary ml-1">
                  {pickup?.preferred_date || 'Standard Courier'}
                </span>
              </div>
              <div className="service-impact-item">
                <span className="text-dim">Current Review Status:</span>
                <span className="font-semibold text-primary ml-1">{currentReviewStatus}</span>
              </div>
            </div>

            {/* Prototype Estimates Badge (Section 35) */}
            <div className="prototype-estimates-strip mt-3 pt-2 border-top text-xs text-dim">
              <span className="badge-prototype-tag uppercase font-bold mr-1">Prototype Estimates:</span>
              <span>Pickup Cost: ~₹1,450 &bull; Distance: ~22 km &bull; Est. Carbon: ~5.4 kg CO₂</span>
            </div>
          </section>

          {/* Section 14–20: Human Decision Panel */}
          <DecisionPanel
            returnRecord={returnRecord}
            triageResult={triageResult}
            storedReview={storedReview}
            onInitiateDecision={handleInitiateDecision}
          />

          {/* Section 21: Internal Review Notes */}
          <InternalReviewNotes
            returnId={returnRecord.return_id}
            notes={storedReview?.notes || []}
            reviewerName={storedReview?.reviewer?.name || 'Surya (Operator)'}
            reviewerRole={storedReview?.reviewer?.role || 'Dispatcher'}
            onNotesUpdated={loadCaseData}
          />

          {/* Section 22: Review Timeline / Audit Log */}
          <ReviewTimeline
            timeline={storedReview?.timeline || []}
          />
        </div>
      </div>

      {/* Section 23: Decision Confirmation Modal */}
      <DecisionModal
        isOpen={showConfirmModal}
        decisionPayload={pendingDecisionPayload}
        returnId={returnRecord.return_id}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmDecision}
        isSubmitting={isSubmittingDecision}
      />
    </div>
  );
}
