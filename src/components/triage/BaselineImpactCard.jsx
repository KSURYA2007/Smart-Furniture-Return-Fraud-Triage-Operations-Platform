import React from 'react';
import { 
  Zap, 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  DollarSign, 
  Leaf, 
  Info,
  Scale
} from 'lucide-react';
import { formatCurrencyINR } from '../../utils/customerHistory';

export default function BaselineImpactCard({ triageStats }) {
  if (!triageStats) return null;

  const {
    totalEvaluated = 0,
    fastTrackCount = 0,
    standardCount = 0,
    humanReviewCount = 0,
    priorityReviewCount = 0,
    totalPotentialLossSaved = 0,
    estimatedTotalCo2Saved = 0
  } = triageStats;

  const fastTrackPct = totalEvaluated > 0 ? Math.round((fastTrackCount / totalEvaluated) * 100) : 0;
  const reviewRequiredPct = totalEvaluated > 0 ? Math.round(((humanReviewCount + priorityReviewCount) / totalEvaluated) * 100) : 0;

  return (
    <div className="baseline-impact-card">
      <div className="section-header-row mb-3">
        <div className="flex items-center gap-2">
          <div className="card-header-icon bg-emerald-glow">
            <Scale size={18} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="section-subheading-serif">Baseline vs Risk-Based Triage Impact</h3>
            <p className="section-subtext">Operational efficiency, genuine customer acceleration, and financial protection</p>
          </div>
        </div>
        <span className="prototype-badge-pill">Estimated / Prototype Metrics</span>
      </div>

      <div className="impact-metrics-grid">
        {/* Fast-Track Acceleration */}
        <div className="impact-metric-box">
          <div className="metric-top-line">
            <Zap size={16} className="text-emerald" />
            <span className="metric-stat-pct font-serif text-emerald">{fastTrackPct}%</span>
          </div>
          <span className="metric-stat-label">Fast-Track Accelerated</span>
          <p className="metric-stat-desc">
            {fastTrackCount} genuine claims processed immediately without manual investigation delays.
          </p>
        </div>

        {/* Focused Human Review Workload */}
        <div className="impact-metric-box">
          <div className="metric-top-line">
            <ShieldCheck size={16} className="text-amber" />
            <span className="metric-stat-pct font-serif text-amber">{reviewRequiredPct}%</span>
          </div>
          <span className="metric-stat-label">Focused Desk Review</span>
          <p className="metric-stat-desc">
            {humanReviewCount + priorityReviewCount} high-risk cases prioritized for specialized desk verification.
          </p>
        </div>

        {/* Potential Financial Loss Intercepted */}
        <div className="impact-metric-box">
          <div className="metric-top-line">
            <TrendingUp size={16} className="text-blue" />
            <span className="metric-stat-pct font-serif text-blue">
              {formatCurrencyINR(totalPotentialLossSaved)}
            </span>
          </div>
          <span className="metric-stat-label">Potential Exposure Flagged</span>
          <p className="metric-stat-desc">
            Inventory value flagged for verification before issuing unconditional refunds.
          </p>
        </div>

        {/* Reverse Logistics Sustainability */}
        <div className="impact-metric-box">
          <div className="metric-top-line">
            <Leaf size={16} className="text-emerald-300" />
            <span className="metric-stat-pct font-serif text-emerald-300">
              ~{estimatedTotalCo2Saved} kg
            </span>
          </div>
          <span className="metric-stat-label">Estimated CO2 Saved</span>
          <p className="metric-stat-desc">
            Avoided unnecessary duplicate pickup dispatches and route re-attempts.
          </p>
        </div>
      </div>
    </div>
  );
}
