import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  Zap, 
  Clock, 
  Sparkles,
  Info
} from 'lucide-react';

export default function RiskScoreGauge({ triageResult }) {
  if (!triageResult) return null;

  const {
    risk_score,
    risk_category,
    priority_label,
    priority_color,
    recommendation,
    is_legitimate_protected,
    legitimate_protection_note
  } = triageResult;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-red-400';
    if (score >= 60) return 'text-amber-400';
    if (score >= 30) return 'text-blue-400';
    return 'text-emerald-400';
  };

  const getCategoryClass = (category) => {
    switch (category) {
      case 'CRITICAL': return 'badge-risk-critical';
      case 'HIGH': return 'badge-risk-high';
      case 'MEDIUM': return 'badge-risk-medium';
      case 'LOW': default: return 'badge-risk-low';
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'PRIORITY_HUMAN_REVIEW': return 'badge-priority-critical';
      case 'HUMAN_REVIEW': return 'badge-priority-high';
      case 'STANDARD_PROCESS': return 'badge-priority-medium';
      case 'FAST_TRACK': default: return 'badge-priority-low';
    }
  };

  return (
    <div className="risk-score-gauge-card">
      <div className="gauge-header-row">
        <div>
          <span className="gauge-label-sub">Decision Support Assessment</span>
          <h3 className="section-subheading-serif">Fraud Risk & Operational Priority</h3>
        </div>
        <span className="gauge-model-version">Model v1.0 (rules-v1)</span>
      </div>

      <div className="gauge-main-display">
        {/* Big Score Visualizer */}
        <div className="gauge-score-orb">
          <div className="score-number-wrap">
            <span className={`score-digit font-serif ${getScoreColor(risk_score)}`}>
              {risk_score}
            </span>
            <span className="score-max-sub">/ 100</span>
          </div>
          <span className={`gauge-category-pill ${getCategoryClass(risk_category)}`}>
            {risk_category} RISK
          </span>
        </div>

        {/* Priority & Operational Action */}
        <div className="gauge-priority-info">
          <div className="priority-title-row">
            <span className="text-dim text-xs uppercase font-bold tracking-wider">Operational Routing:</span>
            <span className={`priority-route-pill ${getPriorityClass(triageResult.priority)}`}>
              {priority_label}
            </span>
          </div>

          <div className="recommendation-box">
            <span className="rec-heading font-semibold text-white flex items-center gap-1.5 mb-1">
              <Info size={14} className="text-primary-light" /> Action Recommendation:
            </span>
            <p className="rec-text text-secondary text-sm">
              {recommendation}
            </p>
          </div>
        </div>
      </div>

      {/* Legitimate Customer Protection Banner */}
      {isLegitimateProtected && (
        <div className="legitimate-protection-callout">
          <div className="flex items-start gap-2.5">
            <Sparkles size={18} className="text-emerald shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white text-sm block">Legitimate Customer Protection Active</span>
              <p className="text-xs text-secondary mt-0.5">
                {legitimate_protection_note || 'Verified photographic proof submitted. Recommended to avoid unnecessary processing delays.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
