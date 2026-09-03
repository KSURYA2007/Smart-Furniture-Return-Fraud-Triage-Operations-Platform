import React from 'react';
import { Clock, CheckCircle2, ShieldAlert, UserCheck, FileText, AlertTriangle } from 'lucide-react';

export default function ReviewTimeline({ timeline = [] }) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="review-timeline-card form-card mb-4">
        <h4 className="card-title text-base mb-2">Review Audit Trail</h4>
        <p className="text-dim text-xs">No lifecycle events recorded yet.</p>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const getActionIcon = (action = '') => {
    const act = action.toLowerCase();
    if (act.includes('created')) return <FileText size={14} className="text-primary-light" />;
    if (act.includes('triage') || act.includes('risk')) return <ShieldAlert size={14} className="text-amber-400" />;
    if (act.includes('approved') || act.includes('decision')) return <CheckCircle2 size={14} className="text-emerald-400" />;
    if (act.includes('reject') || act.includes('override')) return <AlertTriangle size={14} className="text-red-400" />;
    return <UserCheck size={14} className="text-secondary" />;
  };

  return (
    <div className="review-timeline-card form-card mb-4">
      <div className="card-header border-bottom pb-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="card-header-icon bg-primary-light">
            <Clock size={16} className="icon-blue" />
          </div>
          <div>
            <h3 className="card-title text-base">Review Timeline & Audit Log</h3>
            <p className="card-subtitle">Complete chronological trace of system scoring, case views, and human decisions</p>
          </div>
        </div>
      </div>

      <div className="timeline-trail-container">
        {timeline.map((item, index) => (
          <div key={item.id || index} className="timeline-node-item">
            <div className="timeline-marker">
              <div className="marker-dot">
                {getActionIcon(item.action)}
              </div>
              {index < timeline.length - 1 && <div className="marker-connector-line" />}
            </div>

            <div className="timeline-node-content">
              <div className="timeline-time-row flex items-center justify-between text-xs mb-1">
                <span className="timeline-time-text text-dim font-medium">
                  {formatDate(item.timestamp)}
                </span>
                <span className="timeline-actor-pill text-xs">
                  {item.user} &bull; <span className="text-dim">{item.role}</span>
                </span>
              </div>
              <p className="timeline-action-text text-xs text-secondary font-medium">
                {item.action}
              </p>
              {item.details && (
                <p className="timeline-details-text text-xs text-dim mt-0.5">
                  {item.details}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
