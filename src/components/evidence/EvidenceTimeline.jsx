import React from 'react';
import { Calendar, Clock, ShoppingCart, Truck, RotateCcw, Image as ImageIcon, ArrowRight } from 'lucide-react';

export default function EvidenceTimeline({ timeline }) {
  if (!timeline) return null;

  const { purchase_date, delivery_date, return_date, days_from_delivery_to_return } = timeline;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not Available';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="evidence-timeline-card">
      <div className="section-header-row mb-3">
        <div>
          <h3 className="section-subheading-serif">Factual Intake Timeline</h3>
          <p className="section-subtext">Chronological sequence from initial purchase to return evidence upload</p>
        </div>
      </div>

      <div className="timeline-flow-container">
        {/* Step 1: Purchase */}
        <div className="timeline-milestone">
          <div className="milestone-icon-wrap bg-blue-glow">
            <ShoppingCart size={16} className="text-blue" />
          </div>
          <div className="milestone-text">
            <span className="milestone-label">Purchase Date</span>
            <span className="milestone-date">{formatDate(purchase_date)}</span>
          </div>
        </div>

        <div className="timeline-connector-line" />

        {/* Step 2: Delivery */}
        <div className="timeline-milestone">
          <div className="milestone-icon-wrap bg-purple-glow">
            <Truck size={16} className="text-purple" />
          </div>
          <div className="milestone-text">
            <span className="milestone-label">Delivery Date</span>
            <span className="milestone-date">{formatDate(delivery_date)}</span>
          </div>
        </div>

        <div className="timeline-connector-line" />

        {/* Step 3: Return Request */}
        <div className="timeline-milestone">
          <div className="milestone-icon-wrap bg-amber-glow">
            <RotateCcw size={16} className="text-amber" />
          </div>
          <div className="milestone-text">
            <span className="milestone-label">Return Submitted</span>
            <span className="milestone-date">{formatDate(return_date)}</span>
          </div>
        </div>

        <div className="timeline-connector-line" />

        {/* Step 4: Evidence Timestamp */}
        <div className="timeline-milestone">
          <div className="milestone-icon-wrap bg-emerald-glow">
            <ImageIcon size={16} className="text-emerald" />
          </div>
          <div className="milestone-text">
            <span className="milestone-label">Evidence Logged</span>
            <span className="milestone-date">{formatDate(return_date)}</span>
          </div>
        </div>
      </div>

      {/* Days from Delivery Metric Callout */}
      {days_from_delivery_to_return !== null && (
        <div className="timeline-elapsed-badge">
          <Clock size={15} className="text-blue" />
          <span>
            Return requested <strong>{days_from_delivery_to_return} day{days_from_delivery_to_return !== 1 ? 's' : ''}</strong> after delivery completion.
          </span>
        </div>
      )}
    </div>
  );
}
