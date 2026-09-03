import React, { useState } from 'react';
import { 
  BarChart2, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Link, 
  Calculator,
  ShieldAlert
} from 'lucide-react';

export default function RiskFactorBreakdown({ factors = [], totalScore = 0 }) {
  const [expandedFactor, setExpandedFactor] = useState(null);

  const toggleFactor = (id) => {
    setExpandedFactor(expandedFactor === id ? null : id);
  };

  return (
    <div className="risk-factor-breakdown-card">
      <div className="section-header-row mb-3">
        <div>
          <h3 className="section-subheading-serif">Explainable Factor Breakdown</h3>
          <p className="section-subtext">Deterministic point contributions across 6 independent operational features</p>
        </div>

        {/* Arithmetic Audit Verification Pill */}
        <div className="arithmetic-audit-pill" title="Audit verification confirming exact point summation">
          <Calculator size={13} className="text-primary-light" />
          <span>Sum = <strong>{totalScore}</strong> / 100</span>
        </div>
      </div>

      <div className="factors-list-container">
        {factors.map((factor) => {
          const pct = Math.round((factor.points / factor.max_points) * 100);
          const isExpanded = expandedFactor === factor.id;
          const isZero = factor.points === 0;

          return (
            <div 
              key={factor.id} 
              className={`factor-item-row ${isZero ? 'factor-zero' : 'factor-active'}`}
            >
              <div 
                className="factor-main-clickable"
                onClick={() => toggleFactor(factor.id)}
                role="button"
                tabIndex={0}
              >
                <div className="factor-left-meta">
                  <span className="factor-name font-semibold text-white text-sm">
                    {factor.name}
                  </span>
                  <span className="factor-source-badge">
                    {factor.source_module} &bull; {factor.source}
                  </span>
                </div>

                <div className="factor-right-metrics">
                  <div className="factor-bar-wrapper">
                    <div 
                      className={`factor-bar-fill ${factor.points > 0 ? 'bg-fill-active' : 'bg-fill-zero'}`}
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>

                  <div className="factor-points-display">
                    <span className="points-assigned">
                      {factor.points > 0 ? `+${factor.points}` : '0'}
                    </span>
                    <span className="points-max">/{factor.max_points}</span>
                  </div>

                  <button type="button" className="btn-toggle-factor-icon" aria-label="Toggle explanation">
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              </div>

              {/* Expandable Explanation & Source Reference */}
              {isExpanded && (
                <div className="factor-expanded-details">
                  <div className="factor-detail-block">
                    <span className="detail-lbl">Observed Value:</span>
                    <span className="detail-val font-semibold text-white">{factor.value}</span>
                  </div>
                  <div className="factor-detail-block">
                    <span className="detail-lbl">Rule Explanation:</span>
                    <p className="detail-desc text-secondary text-xs">{factor.explanation}</p>
                  </div>
                  <div className="factor-detail-block">
                    <span className="detail-lbl">Trace Reference:</span>
                    <span className="detail-trace-tag text-xs">
                      <Link size={11} /> {factor.source_reference}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
