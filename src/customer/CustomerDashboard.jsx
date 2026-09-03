import React, { useState, useEffect } from 'react';
import {
  Package, Clock, Truck, CheckCircle2,
  AlertCircle, PlusCircle, ArrowRight, Camera
} from 'lucide-react';
import { getCustomerReturns } from '../services/customerPortalService.js';
import { subscribeRealtime } from '../utils/realtimeBus.js';

export default function CustomerDashboard({ activeCustomer, onNavigate, onSelectReturn }) {
  const [returns, setReturns] = useState(() => getCustomerReturns(activeCustomer.id));

  useEffect(() => {
    const refresh = () => setReturns(getCustomerReturns(activeCustomer.id));
    refresh();
    return subscribeRealtime('*', refresh);
  }, [activeCustomer.id]);

  const activeCount    = returns.filter(r => r.customerStatus !== 'Product Picked Up' && r.customerStatus !== 'Return Not Approved').length;
  const reviewCount    = returns.filter(r => r.customerStatus === 'Under Review' || r.customerStatus === 'Submitted').length;
  const pickupCount    = returns.filter(r => r.customerStatus === 'Pickup Scheduled' || r.customerStatus === 'Return Approved').length;
  const completedCount = returns.filter(r => r.customerStatus === 'Product Picked Up').length;

  const kpis = [
    { label: 'Active Claims',      value: activeCount,    sub: 'In progress',         color: '#4f46e5', bg: '#eff0ff' },
    { label: 'Under Review',       value: reviewCount,    sub: 'Operations review',   color: '#d97706', bg: '#fffbeb' },
    { label: 'Pickup Scheduled',   value: pickupCount,    sub: 'Confirmed van runs',  color: '#059669', bg: '#ecfdf5' },
    { label: 'Completed',          value: completedCount, sub: 'Retrieved & refunded', color: '#64748b', bg: '#f8fafc' },
  ];

  return (
    <div className="cd-root">
      {/* Welcome Banner */}
      <div className="cd-welcome">
        <div>
          <p className="cd-welcome-sub">Welcome back,</p>
          <h1 className="cd-welcome-name">{activeCustomer.name}</h1>
          <p className="cd-welcome-desc">
            Manage your active furniture return requests and coordinate doorstep pickup.
          </p>
        </div>
        <button type="button" className="cd-new-btn" onClick={() => onNavigate('new')}>
          <PlusCircle size={16} />
          Start a New Return
        </button>
      </div>

      {/* KPI Cards */}
      <div className="cd-kpi-grid">
        {kpis.map((kpi, i) => (
          <div key={i} className="cd-kpi-card" style={{ borderTopColor: kpi.color }}>
            <div className="cd-kpi-label">{kpi.label}</div>
            <div className="cd-kpi-value" style={{ color: kpi.color }}>{kpi.value}</div>
            <div className="cd-kpi-sub">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Returns List */}
      <div className="cd-returns-card">
        <div className="cd-returns-header">
          <div>
            <h2 className="cd-returns-title">My Return Claims</h2>
            <p className="cd-returns-sub">Review status updates and pickup time windows</p>
          </div>
          <button type="button" className="cd-view-all" onClick={() => onNavigate('returns')}>
            View All ({returns.length}) <ArrowRight size={13} />
          </button>
        </div>

        {returns.length === 0 ? (
          <div className="cd-empty">
            <Package size={32} className="cd-empty-icon" />
            <p className="cd-empty-title">No active returns yet.</p>
            <p className="cd-empty-sub">Delivered items eligible for 30-day returns can be submitted below.</p>
            <button type="button" className="cd-empty-btn" onClick={() => onNavigate('new')}>
              Start Return Request
            </button>
          </div>
        ) : (
          <div className="cd-return-list">
            {returns.map(ret => (
              <div key={ret.returnId} className="cd-return-row">
                {/* Left: return info */}
                <div className="cd-return-info">
                  <div className="cd-return-id-row">
                    <span className="cd-return-id">{ret.returnId}</span>
                    <span className="cd-status-badge">{ret.customerStatus}</span>
                  </div>
                  <div className="cd-return-product">{ret.productName}</div>
                  <div className="cd-return-meta">
                    Submitted: {new Date(ret.submittedDate).toLocaleDateString()}
                    &nbsp;&bull;&nbsp;Reason: {ret.returnReason}
                  </div>
                </div>

                {/* Right: next step + actions */}
                <div className="cd-return-actions">
                  <div className="cd-next-step">
                    <span className="cd-next-step-label">Next Step</span>
                    <span className="cd-next-step-val">{ret.nextStep}</span>
                  </div>
                  <div className="cd-action-btns">
                    <button
                      type="button"
                      className="cd-track-btn"
                      onClick={() => { onSelectReturn(ret.returnId); onNavigate('status'); }}
                    >
                      <Clock size={13} /> Track Status
                    </button>
                    <button
                      type="button"
                      className="cd-photo-btn"
                      onClick={() => { onSelectReturn(ret.returnId); onNavigate('evidence'); }}
                      title="Upload Photos"
                    >
                      <Camera size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
