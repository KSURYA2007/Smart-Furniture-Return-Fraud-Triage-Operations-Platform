import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  Truck, 
  ArrowLeft, 
  Camera, 
  AlertCircle, 
  Calendar, 
  MapPin, 
  HelpCircle, 
  Package,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { getCustomerReturnDetail } from '../services/customerPortalService.js';
import { subscribeRealtime } from '../utils/realtimeBus.js';

export default function CustomerReturnStatus({
  activeCustomer,
  returnId,
  onNavigate,
  onNavigateSupport
}) {
  const [returnDetail, setReturnDetail] = React.useState(() => getCustomerReturnDetail(activeCustomer.id, returnId));

  React.useEffect(() => {
    const refresh = () => setReturnDetail(getCustomerReturnDetail(activeCustomer.id, returnId));
    refresh();
    return subscribeRealtime('*', refresh);
  }, [activeCustomer.id, returnId]);

  if (!returnDetail) {
    return (
      <div className="crs-empty-card">
        <Package size={36} className="crs-empty-icon" />
        <h2 className="crs-empty-title">Return Claim Not Found</h2>
        <p className="crs-empty-desc">The requested return could not be found or belongs to another account.</p>
        <button
          type="button"
          className="crs-btn-primary"
          onClick={() => onNavigate('returns')}
        >
          Back to My Returns
        </button>
      </div>
    );
  }

  const stages = [
    { num: 1, label: 'Claim Submitted', desc: 'Received in portal' },
    { num: 2, label: 'Photos Verified', desc: 'Images checked' },
    { num: 3, label: 'Under Review', desc: 'Assigned to specialist' },
    { num: 4, label: 'Review Decision', desc: returnDetail.customerStatus },
    { num: 5, label: 'Doorstep Pickup', desc: returnDetail.pickupDetails ? 'Scheduled' : 'Pending slot' },
    { num: 6, label: 'Refund Complete', desc: '2–4 days after pickup' }
  ];

  const currentStageNum = returnDetail.stage || 3;

  return (
    <div className="crs-root">
      {/* Top Header */}
      <div className="crs-header">
        <div className="crs-header-left">
          <button
            type="button"
            className="crs-back-btn"
            onClick={() => onNavigate('returns')}
            title="Back to Returns"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="crs-title-row">
              <h1 className="crs-title">{returnDetail.productName}</h1>
              <span className="crs-status-pill">{returnDetail.customerStatus}</span>
            </div>
            <p className="crs-meta">
              Return Reference: <span className="crs-mono">{returnDetail.returnId}</span> &bull; Order: <span className="crs-mono">{returnDetail.orderId}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          className="crs-support-btn"
          onClick={() => onNavigateSupport(returnDetail.returnId)}
        >
          <HelpCircle size={15} />
          <span>Need Help with this Return?</span>
        </button>
      </div>

      {/* Progress Timeline Stepper */}
      <div className="crs-card">
        <div className="crs-card-header">
          <h3 className="crs-card-title">Return Progress &amp; Pickup Journey</h3>
          <span className="crs-stage-indicator">Stage {currentStageNum} of 6</span>
        </div>

        <div className="crs-stepper-grid">
          {stages.map((st) => {
            const isDone = st.num < currentStageNum;
            const isCurrent = st.num === currentStageNum;

            return (
              <div 
                key={st.num} 
                className={`crs-step-box ${isDone ? 'crs-step-done' : isCurrent ? 'crs-step-current' : 'crs-step-pending'}`}
              >
                <div className="crs-step-circle">
                  {isDone ? <CheckCircle2 size={15} /> : st.num}
                </div>
                <strong className="crs-step-label">{st.label}</strong>
                <span className="crs-step-desc">{st.desc}</span>
              </div>
            );
          })}
        </div>

        {/* Current Stage Explanation Banner */}
        <div className="crs-status-banner">
          <div className="crs-status-banner-header">
            <Clock size={18} className="crs-clock-icon" />
            <div>
              <div className="crs-banner-status">Current Status: {returnDetail.customerStatus}</div>
              <p className="crs-banner-desc">{returnDetail.statusDescription}</p>
            </div>
          </div>

          {/* Conditional Action: If More Evidence is Needed */}
          {returnDetail.customerStatus === 'More Information Needed' && (
            <div className="crs-banner-actions">
              <button
                type="button"
                className="crs-btn-action"
                onClick={() => onNavigate('evidence')}
              >
                <Camera size={14} />
                <span>Upload Additional Verification Photos</span>
              </button>
            </div>
          )}

          {/* Conditional Action: If Rejected */}
          {returnDetail.customerStatus === 'Return Not Approved' && (
            <div className="crs-banner-actions">
              <button
                type="button"
                className="crs-btn-action crs-btn-appeal"
                onClick={() => onNavigateSupport(returnDetail.returnId)}
              >
                <HelpCircle size={14} />
                <span>Contact Customer Care to Appeal</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Doorstep Pickup Coordination Card */}
      <div className="crs-card">
        <div className="crs-card-header">
          <div className="crs-pickup-header-left">
            <Truck size={18} className="crs-truck-icon" />
            <h3 className="crs-card-title">Doorstep Retrieval Details</h3>
          </div>
          <span className={`crs-pickup-badge ${returnDetail.pickupDetails ? 'crs-badge-confirmed' : 'crs-badge-pending'}`}>
            {returnDetail.pickupDetails ? 'CONFIRMED' : 'SCHEDULING IN PROGRESS'}
          </span>
        </div>

        <div className="crs-pickup-grid">
          <div className="crs-pickup-box">
            <span className="crs-pickup-label">
              <Calendar size={13} /> Scheduled Pickup Date
            </span>
            <strong className="crs-pickup-val">
              {returnDetail.pickupDetails?.scheduled_date || returnDetail.preferredDate || 'Pending review completion'}
            </strong>
            <span className="crs-pickup-sub">
              Time Window: {returnDetail.pickupDetails?.time_slot || '09:00 AM – 01:00 PM'}
            </span>
          </div>

          <div className="crs-pickup-box crs-pickup-box-wide">
            <span className="crs-pickup-label">
              <MapPin size={13} /> Retrieval Address
            </span>
            <strong className="crs-pickup-val">
              {returnDetail.address || activeCustomer.address}
            </strong>
            <span className="crs-pickup-trust">
              <CheckCircle2 size={13} /> Our 2-person delivery crew provides heavy furniture lifting &amp; protective blankets.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
