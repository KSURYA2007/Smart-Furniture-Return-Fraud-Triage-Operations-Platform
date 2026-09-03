import React, { useState, useEffect } from 'react';
import PickupPriorityBreakdown from '../components/pickup/PickupPriorityBreakdown.jsx';
import PickupSchedulingModal from '../components/pickup/PickupSchedulingModal.jsx';
import PriorityOverrideModal from '../components/pickup/PriorityOverrideModal.jsx';
import OperationalAuditTimeline from '../components/pickup/OperationalAuditTimeline.jsx';
import EmptyState from '../components/common/EmptyState';

import { 
  getReturnById, 
  getAllReturns, 
  getStoredReview, 
  getStoredPickup, 
  saveStoredPickup,
  getPickupAuditLog,
  addPickupAuditEntry
} from '../utils/storage.js';
import { calculateCustomerHistoryStats, formatCurrencyINR } from '../utils/customerHistory.js';
import { analyzeReturnEvidence } from '../utils/evidenceAnalysis.js';
import { calculateRisk } from '../services/riskEngine.js';
import { 
  calculatePickupPriority, 
  schedulePickup, 
  completePickup, 
  overridePickupPriority 
} from '../services/pickupService.js';

import { 
  ArrowLeft, 
  Truck, 
  UserCheck, 
  ShieldAlert, 
  Calendar, 
  Clock, 
  DollarSign, 
  Package, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  Sliders, 
  Eye, 
  History, 
  Layers 
} from 'lucide-react';

export default function PickupCaseDetail({
  returnId,
  onBack,
  onViewCustomer,
  onViewEvidence,
  onViewTriage,
  onViewReview,
  onSelectReturn
}) {
  const [returnRecord, setReturnRecord] = useState(null);
  const [customerStats, setCustomerStats] = useState(null);
  const [evidenceAnalysis, setEvidenceAnalysis] = useState(null);
  const [triageResult, setTriageResult] = useState(null);
  const [humanReview, setHumanReview] = useState(null);
  const [storedPickup, setStoredPickup] = useState(null);
  const [priorityData, setPriorityData] = useState(null);
  const [allReturns, setAllReturns] = useState([]);
  const [selectedReturnId, setSelectedReturnId] = useState(returnId);

  // Modals state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('Item retrieved in good condition. Packaging intact.');
  const [auditTimeline, setAuditTimeline] = useState([]);

  useEffect(() => {
    setAllReturns(getAllReturns());
  }, []);

  const loadCaseData = () => {
    const idToFetch = selectedReturnId || returnId;
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

      const review = getStoredReview(idToFetch);
      setHumanReview(review);

      const pickup = getStoredPickup(idToFetch);
      setStoredPickup(pickup);

      const prio = calculatePickupPriority(rec, triage, review, analyzed);
      setPriorityData(prio);

      // Assemble audit timeline
      let log = getPickupAuditLog(idToFetch);
      if (log.length === 0) {
        // Build initial chronological audit history
        const initialLog = [
          {
            id: 'audit_req_init',
            timestamp: rec.created_at || new Date(Date.now() - 86400000 * 3).toISOString(),
            action: 'Return request submitted by customer (Module 1)',
            user: rec.customer?.name || 'Customer',
            role: 'Customer'
          },
          {
            id: 'audit_triage_init',
            timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
            action: `Automated risk triage completed: ${triage?.risk_score}/100 (${triage?.risk_category})`,
            user: 'Risk Engine',
            role: 'System'
          }
        ];
        if (review?.decision) {
          initialLog.push({
            id: 'audit_review_init',
            timestamp: review.review_completed_at || new Date(Date.now() - 86400000).toISOString(),
            action: `Human Review: ${review.decision.decision_type} (${review.decision.status})`,
            user: review.reviewer?.name || 'Reviewer',
            role: review.reviewer?.role || 'Dispatcher',
            details: review.decision.reason
          });
        }
        initialLog.push({
          id: 'audit_prio_init',
          timestamp: new Date().toISOString(),
          action: `Pickup priority calculated: Score ${prio?.pickup_priority_score} (${prio?.priority_level})`,
          user: 'Operations Engine',
          role: 'System'
        });
        setAuditTimeline(initialLog);
      } else {
        setAuditTimeline(log);
      }
    }
  };

  useEffect(() => {
    loadCaseData();
  }, [selectedReturnId, returnId, allReturns]);

  const handleSwitchReturn = (newId) => {
    setSelectedReturnId(newId);
    if (onSelectReturn) onSelectReturn(newId);
  };

  const handleScheduleConfirm = (targetId, schedulePayload) => {
    const success = schedulePickup(targetId, schedulePayload);
    if (success) {
      setShowScheduleModal(false);
      loadCaseData();
    }
  };

  const handleCompleteConfirm = () => {
    const success = completePickup(returnRecord.return_id, { notes: completionNotes });
    if (success) {
      setShowCompleteModal(false);
      loadCaseData();
    }
  };

  const handleOverrideConfirm = (targetId, originalScore, originalLevel, newScore, newLevel, reason, managerName) => {
    const success = overridePickupPriority(targetId, originalScore, originalLevel, newScore, newLevel, reason, managerName);
    if (success) {
      loadCaseData();
    }
  };

  if (!returnRecord || !priorityData) {
    return (
      <div className="page-wrapper pickup-detail-page">
        <EmptyState
          icon={Truck}
          title="Pickup Case Not Found"
          message={`No return claim matching ID "${returnId || 'Unknown'}" was found.`}
          actionText="Back to Pickup Dashboard"
          onAction={onBack}
        />
      </div>
    );
  }

  const { order = {}, pickup = {}, return: returnInfo = {}, customer = {} } = returnRecord;
  const isApproved = priorityData.eligibility === 'ELIGIBLE';
  const isScheduled = priorityData.operational_status === 'SCHEDULED';
  const isCompleted = priorityData.operational_status === 'PICKED_UP';

  return (
    <div className="page-wrapper pickup-detail-page">
      {/* Top Action & Navigation Bar */}
      <div className="pickup-top-bar flex items-center justify-between flex-wrap gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {onBack && (
            <button type="button" onClick={onBack} className="btn-back-link">
              <ArrowLeft size={16} /> Back to Pickup Dashboard
            </button>
          )}

          {onViewReview && (
            <button
              type="button"
              onClick={() => onViewReview(returnRecord.return_id)}
              className="btn-secondary btn-xs"
              title="Open human review in Module 5"
            >
              <UserCheck size={13} /> View Human Review (Module 5)
            </button>
          )}

          {onViewEvidence && (
            <button
              type="button"
              onClick={() => onViewEvidence(returnRecord.return_id)}
              className="btn-secondary btn-xs"
              title="Open evidence analysis in Module 3"
            >
              <Layers size={13} /> View Evidence (Module 3)
            </button>
          )}

          {customer?.customer_id && onViewCustomer && (
            <button
              type="button"
              onClick={() => onViewCustomer(customer.customer_id, returnRecord)}
              className="btn-secondary btn-xs"
              title="Open customer profile in Module 2"
            >
              <History size={13} /> View Customer Profile (Module 2)
            </button>
          )}
        </div>

        {/* Case Switcher Dropdown */}
        {allReturns.length > 1 && (
          <div className="return-selector-wrap flex items-center gap-1.5">
            <span className="text-dim text-xs font-semibold uppercase">Switch Case:</span>
            <select
              className="filter-select return-dropdown text-xs"
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

      {/* Hero Header Banner */}
      <header className="page-header pickup-case-header mb-4">
        <div className="header-container">
          <div className="header-badge-row">
            <span className="module-badge">
              <Truck size={13} /> Module 6: Pickup Operations Workspace
            </span>
          </div>
          <h1 className="page-title font-serif">Pickup Operations Case Detail</h1>
          <p className="page-description">
            Reverse logistics dispatch management, route assignment, and driver execution tracking.
          </p>
        </div>

        {/* Case Target Card */}
        <div className="pickup-header-target-card mt-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="target-id font-serif-id font-bold text-lg text-primary">
                {returnRecord.return_id}
              </span>
              <span className={`priority-pill badge-risk-${priorityData.priority_level.toLowerCase()}`}>
                {priorityData.priority_level} PRIORITY ({priorityData.pickup_priority_score})
              </span>
              <span className="badge-pickup-status">
                {priorityData.operational_status.replace('_', ' ')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isApproved && !isCompleted && (
                <button
                  type="button"
                  className="btn-primary btn-sm flex items-center gap-1.5"
                  onClick={() => setShowScheduleModal(true)}
                >
                  <Calendar size={14} />
                  <span>{isScheduled ? 'Update Schedule' : 'Schedule Pickup'}</span>
                </button>
              )}

              {isScheduled && (
                <button
                  type="button"
                  className="btn-secondary btn-sm flex items-center gap-1.5 text-emerald-400"
                  onClick={() => setShowCompleteModal(true)}
                >
                  <CheckCircle2 size={14} />
                  <span>Confirm Picked Up</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Human Review Result Card (Section 13) */}
      <section className="human-review-result-card form-card mb-4 border-emerald">
        <div className="card-header border-bottom pb-2 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="card-header-icon bg-emerald-bg">
                <UserCheck size={18} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="card-title text-base">Module 5 Human Review Result</h3>
                <p className="card-subtitle">Binding operational authority for pickup eligibility</p>
              </div>
            </div>
            <span className="text-xs uppercase font-bold text-emerald-400">
              Decision: {humanReview?.decision?.decision_type || 'AWAITING_REVIEW'}
            </span>
          </div>
        </div>

        <div className="human-review-content-grid text-xs">
          <div>
            <p className="mb-1"><strong>Reviewer:</strong> {humanReview?.reviewer?.name || 'Authorized Dispatcher'} ({humanReview?.reviewer?.role || 'Operations'})</p>
            <p className="mb-1"><strong>Decision Timestamp:</strong> {humanReview?.review_completed_at ? new Date(humanReview.review_completed_at).toLocaleString('en-IN') : 'Logged in intake'}</p>
            <p className="mb-1"><strong>Manual Override:</strong> {humanReview?.decision?.override ? <span className="text-amber-400 font-bold">Yes (Override Active)</span> : 'No'}</p>
          </div>
          <div>
            <p className="mb-1"><strong>Decision Reason:</strong></p>
            <p className="p-2 rounded bg-surface border border-subtle text-secondary italic">
              &ldquo;{humanReview?.decision?.reason || 'Verified legitimate delivery claim.'}&rdquo;
            </p>
          </div>
        </div>

        {/* Section 4 Guardrail: Notice if not approved */}
        {!isApproved && (
          <div className="ineligible-warning-banner mt-3 p-2.5 rounded bg-amber-bg border border-amber-border text-xs flex items-start gap-2">
            <AlertTriangle size={15} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300 block">Pickup Scheduling Blocked:</strong>
              <span className="text-amber-200">
                This case has human review status <strong>{priorityData.operational_status}</strong>. Only returns with <code>human_decision = APPROVE_PICKUP</code> are eligible for pickup scheduling.
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Main 2-Column Operations Layout */}
      <div className="pickup-workspace-grid">
        {/* Left Column: Priority Factor Breakdown & Trade-offs */}
        <div className="pickup-col-left">
          {/* Priority Score Breakdown (Section 14) */}
          <PickupPriorityBreakdown
            priorityData={priorityData}
            onOpenOverrideModal={() => setShowOverrideModal(true)}
          />

          {/* Current Return & Logistics Summary */}
          <section className="form-card mb-4">
            <div className="card-header border-bottom pb-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="card-header-icon bg-primary-light">
                  <Package size={16} className="icon-blue" />
                </div>
                <div>
                  <h3 className="card-title text-base">Return Intake Summary & Location</h3>
                  <p className="card-subtitle">Intake data and address geocode</p>
                </div>
              </div>
            </div>

            <div className="details-2-col text-xs">
              <div>
                <p className="mb-1"><strong>Product:</strong> {order.product_name || returnRecord.product}</p>
                <p className="mb-1"><strong>Order ID:</strong> {order.order_id || returnRecord.order_id}</p>
                <p className="mb-1">
                  <strong>Order Value:</strong> {priorityData.financial_exposure_available ? formatCurrencyINR(order.price || returnRecord.product_price) : <span className="text-amber-400 italic">Financial exposure unavailable</span>}
                </p>
                <p className="mb-1"><strong>Return Reason:</strong> {returnInfo.reason || returnRecord.reason}</p>
                <p className="mb-1"><strong>Customer Condition:</strong> {returnInfo.condition || returnRecord.condition}</p>
              </div>

              <div>
                <p className="mb-1"><strong>Customer:</strong> {customer.name || returnRecord.customer_name}</p>
                <p className="mb-1">
                  <strong>Pickup Address:</strong> {priorityData.location_available ? `${pickup.address || ''}, ${pickup.city || ''} (${pickup.postal_code || ''})` : <span className="text-amber-400 italic">Location unavailable</span>}
                </p>
                <p className="mb-1"><strong>Service Area:</strong> {pickup.area_cluster || 'Unmapped'}</p>
                <p className="mb-1"><strong>Preferred Date:</strong> {pickup.preferred_date || 'Standard Courier'}</p>
                <p className="mb-1"><strong>Transit Distance:</strong> {priorityData.estimated_distance_km ? `${priorityData.estimated_distance_km} km` : 'Unavailable'}</p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Dispatch Scheduling Status & Audit Timeline */}
        <div className="pickup-col-right">
          {/* Scheduled Dispatch Status Box (Section 16, 17, 18) */}
          <section className="form-card mb-4">
            <div className="card-header border-bottom pb-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="card-header-icon bg-primary-light">
                  <Truck size={16} className="icon-blue" />
                </div>
                <div>
                  <h3 className="card-title text-base">Pickup Dispatch Status</h3>
                  <p className="card-subtitle">Driver assignment and vehicle scheduling</p>
                </div>
              </div>
            </div>

            {isCompleted ? (
              <div className="p-3 rounded bg-emerald-bg border border-emerald-border text-xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-300 mb-1">
                  <CheckCircle2 size={16} />
                  <span>Item Collected Successfully (PICKED UP)</span>
                </div>
                <p className="text-secondary">
                  <strong>Completed At:</strong> {storedPickup?.completed_at ? new Date(storedPickup.completed_at).toLocaleString('en-IN') : 'Confirmed'}
                </p>
                <p className="text-secondary mt-1">
                  <strong>Driver Notes:</strong> {storedPickup?.completion_notes || 'Packaging intact.'}
                </p>
              </div>
            ) : isScheduled ? (
              <div className="scheduled-dispatch-card p-3 rounded bg-surface border border-card text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-primary-light flex items-center gap-1">
                    <CheckCircle2 size={14} className="text-primary-light" />
                    <span>Scheduled for Dispatch</span>
                  </span>
                  <span className="badge-prototype-tag uppercase">Active Run</span>
                </div>

                <p className="mb-1"><strong>Scheduled Date:</strong> {storedPickup?.scheduled_date} &bull; <strong>Time Slot:</strong> {storedPickup?.scheduled_time_slot}</p>
                <p className="mb-1"><strong>Assigned Driver:</strong> {storedPickup?.driver?.name} ({storedPickup?.driver?.phone})</p>
                <p className="mb-1"><strong>Vehicle:</strong> {storedPickup?.vehicle?.name} [{storedPickup?.vehicle?.type}]</p>
                {storedPickup?.special_handling?.length > 0 && (
                  <p className="mb-2"><strong>Special Handling:</strong> {storedPickup.special_handling.join(', ')}</p>
                )}

                <div className="pt-2 border-top flex gap-2">
                  <button
                    type="button"
                    className="btn-primary btn-xs flex items-center gap-1 text-emerald-300"
                    onClick={() => setShowCompleteModal(true)}
                  >
                    <CheckCircle2 size={12} /> Confirm Picked Up
                  </button>
                  <button
                    type="button"
                    className="btn-secondary btn-xs flex items-center gap-1"
                    onClick={() => setShowScheduleModal(true)}
                  >
                    <Calendar size={12} /> Reschedule
                  </button>
                </div>
              </div>
            ) : isApproved ? (
              <div className="ready-to-schedule-box p-3 rounded bg-surface text-xs text-center">
                <p className="text-secondary mb-2">
                  This return is approved and ready for pickup scheduling.
                </p>
                <button
                  type="button"
                  className="btn-primary btn-sm mx-auto flex items-center gap-1.5"
                  onClick={() => setShowScheduleModal(true)}
                >
                  <Calendar size={14} />
                  <span>Assign Driver & Schedule Pickup</span>
                </button>
              </div>
            ) : (
              <div className="p-3 rounded bg-surface text-xs text-dim text-center">
                Pickup scheduling is currently disabled for this status ({priorityData.operational_status}).
              </div>
            )}
          </section>

          {/* Operational Audit Timeline (Section 29) */}
          <OperationalAuditTimeline timeline={auditTimeline} />
        </div>
      </div>

      {/* Scheduling Modal */}
      {showScheduleModal && (
        <PickupSchedulingModal
          isOpen={showScheduleModal}
          caseItem={{ ...returnRecord, ...priorityData }}
          onClose={() => setShowScheduleModal(false)}
          onConfirmSchedule={handleScheduleConfirm}
        />
      )}

      {/* Priority Override Modal */}
      {showOverrideModal && (
        <PriorityOverrideModal
          isOpen={showOverrideModal}
          caseItem={{ ...returnRecord, ...priorityData }}
          onClose={() => setShowOverrideModal(false)}
          onConfirmOverride={handleOverrideConfirm}
        />
      )}

      {/* Mark Completed Modal */}
      {showCompleteModal && (
        <div className="modal-backdrop" onClick={() => setShowCompleteModal(false)}>
          <div className="modal-content text-xs p-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title font-serif text-sm mb-2 flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>Confirm Item Pickup</span>
            </h3>
            <p className="text-secondary mb-3">
              Confirm that the driver has arrived at the customer location and collected the returned item.
            </p>

            <div className="form-group mb-3">
              <label className="form-label text-xs">Driver Collection Notes:</label>
              <textarea
                rows={2}
                className="form-textarea text-xs"
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
              />
            </div>

            <div className="modal-footer flex justify-end gap-2 pt-2 border-top">
              <button type="button" className="btn-ghost btn-sm" onClick={() => setShowCompleteModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn-primary btn-sm flex items-center gap-1 text-emerald-400" onClick={handleCompleteConfirm}>
                <CheckCircle2 size={13} />
                <span>Record As Picked Up</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
