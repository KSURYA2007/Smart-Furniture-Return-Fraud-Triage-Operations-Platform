import React from 'react';
import { Sliders, HelpCircle } from 'lucide-react';

export default function ThresholdAnalysisCard({ thresholdData = [], currentThreshold = 50, onSelectThreshold }) {
  if (!thresholdData || thresholdData.length === 0) return null;

  return (
    <div className="threshold-analysis-card form-card mb-4">
      <div className="card-header border-bottom pb-2 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="card-header-icon bg-primary-light">
              <Sliders size={16} className="icon-blue" />
            </div>
            <div>
              <h3 className="card-title text-base">Risk Threshold Sensitivity & Operational Trade-off</h3>
              <p className="card-subtitle">
                Comparing triage outcomes across risk cutoff scores (30, 40, 50, 60, 70)
              </p>
            </div>
          </div>
          <span className="text-xs text-dim">Active Cutoff: <strong>{currentThreshold}</strong></span>
        </div>
      </div>

      <div className="pickup-table-wrapper mb-3">
        <table className="pickup-queue-table">
          <thead>
            <tr>
              <th>Cutoff Threshold</th>
              <th className="text-center">Flagged Cases</th>
              <th className="text-center">Workload %</th>
              <th className="text-center">TP</th>
              <th className="text-center">FP</th>
              <th className="text-center">FN</th>
              <th className="text-center">TN</th>
              <th className="text-right">Precision</th>
              <th className="text-right">Recall</th>
              <th className="text-right">F1 Score</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {thresholdData.map(row => {
              const isSelected = row.threshold === currentThreshold;
              return (
                <tr key={row.threshold} className={isSelected ? 'bg-primary-subtle' : ''}>
                  <td>
                    <strong className="text-primary font-mono text-sm">&ge; {row.threshold}</strong>
                    {isSelected && <span className="service-urgency-mini-tag ml-1.5">ACTIVE</span>}
                  </td>
                  <td className="text-center font-mono font-bold">{row.flaggedCount}</td>
                  <td className="text-center font-mono text-dim">{row.workloadPct}%</td>
                  <td className="text-center font-mono text-emerald-400 font-bold">{row.TP}</td>
                  <td className="text-center font-mono text-amber-300">{row.FP}</td>
                  <td className="text-center font-mono text-red-400">{row.FN}</td>
                  <td className="text-center font-mono text-dim">{row.TN}</td>
                  <td className="text-right font-mono font-bold text-amber-300">
                    {row.precision !== 'N/A' ? `${row.precision}%` : 'N/A'}
                  </td>
                  <td className="text-right font-mono font-bold text-emerald-400">
                    {row.recall !== 'N/A' ? `${row.recall}%` : 'N/A'}
                  </td>
                  <td className="text-right font-mono font-bold text-primary">
                    {row.f1}
                  </td>
                  <td className="text-center">
                    {onSelectThreshold && (
                      <button
                        type="button"
                        className={`btn-xs ${isSelected ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => onSelectThreshold(row.threshold)}
                      >
                        {isSelected ? 'Selected' : 'Simulate'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Section 24 Trade-off Explanation Banner */}
      <div className="threshold-tradeoff-banner p-2.5 rounded bg-surface border border-subtle text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <strong className="text-secondary block mb-0.5">&darr; Lower Threshold (&le; 30–40):</strong>
            <p className="text-dim text-2xs leading-relaxed">
              Catches more potential fraud (higher Recall) at the expense of higher False Positives and increased dispatcher review burden.
            </p>
          </div>
          <div>
            <strong className="text-secondary block mb-0.5">&uarr; Higher Threshold (&ge; 60–70):</strong>
            <p className="text-dim text-2xs leading-relaxed">
              Reduces dispatcher workload and review delays for legitimate customers, but increases the risk of undetected fraud slip-throughs (higher False Negatives).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
