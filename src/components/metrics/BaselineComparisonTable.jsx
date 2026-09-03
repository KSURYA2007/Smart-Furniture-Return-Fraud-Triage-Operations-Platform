import React from 'react';
import { formatCurrencyINR } from '../../utils/customerHistory.js';
import { Sliders, CheckCircle2, TrendingDown, ArrowRight } from 'lucide-react';

export default function BaselineComparisonTable({ comparison }) {
  if (!comparison) return null;

  return (
    <div className="baseline-comparison-card form-card mb-4">
      <div className="card-header border-bottom pb-2 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="card-header-icon bg-primary-light">
              <Sliders size={16} className="icon-blue" />
            </div>
            <div>
              <h3 className="card-title text-base">Benchmark: FIFO Baseline vs Proposed System</h3>
              <p className="card-subtitle">
                Deterministic comparison running identical returns across naive FIFO vs Risk-Aware Triage & Route Operations
              </p>
            </div>
          </div>
          <span className="badge-prototype-tag uppercase font-bold text-xs">Deterministic Benchmark</span>
        </div>
      </div>

      <div className="pickup-table-wrapper">
        <table className="pickup-queue-table">
          <thead>
            <tr>
              <th>Evaluation Metric</th>
              <th className="text-right">FIFO Baseline</th>
              <th className="text-right">Proposed System</th>
              <th className="text-right">Observed Impact / Delta</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong className="block text-secondary">Fraud Loss Exposure</strong>
                <span className="text-dim text-xs">Unmitigated fraudulent refund value</span>
              </td>
              <td className="text-right font-mono text-red-400">
                {formatCurrencyINR(comparison.fraudLossExposure.baseline)}
              </td>
              <td className="text-right font-mono text-emerald-400 font-bold">
                {formatCurrencyINR(comparison.fraudLossExposure.proposed)}
              </td>
              <td className="text-right font-mono text-emerald-300">
                {comparison.fraudLossExposure.difference < 0 
                  ? `Saved ${formatCurrencyINR(Math.abs(comparison.fraudLossExposure.difference))} (${comparison.fraudLossExposure.percentageChange})` 
                  : 'No Change'}
              </td>
            </tr>

            <tr>
              <td>
                <strong className="block text-secondary">Fraud Cases Prioritized / Caught</strong>
                <span className="text-dim text-xs">High-risk returns flagged for inspection</span>
              </td>
              <td className="text-right font-mono text-dim">0 cases (uninspected)</td>
              <td className="text-right font-mono text-primary font-bold">{comparison.fraudCasesPrioritized.proposed} cases</td>
              <td className="text-right font-mono text-emerald-300">+{comparison.fraudCasesPrioritized.difference} cases caught</td>
            </tr>

            <tr>
              <td>
                <strong className="block text-secondary">Legitimate Average Delay</strong>
                <span className="text-dim text-xs">Mean turnaround for confirmed genuine returns</span>
              </td>
              <td className="text-right font-mono">{comparison.legitimateAvgDelay.baseline} days</td>
              <td className="text-right font-mono text-primary-light font-bold">{comparison.legitimateAvgDelay.proposed} days</td>
              <td className="text-right font-mono text-emerald-300">
                {Number(comparison.legitimateAvgDelay.difference) < 0 
                  ? `${comparison.legitimateAvgDelay.difference} days faster` 
                  : `${comparison.legitimateAvgDelay.difference} days`}
              </td>
            </tr>

            <tr>
              <td>
                <strong className="block text-secondary">Median Turnaround Delay</strong>
                <span className="text-dim text-xs">Robust middle wait time (outlier resistant)</span>
              </td>
              <td className="text-right font-mono">{comparison.medianDelay.baseline} days</td>
              <td className="text-right font-mono text-primary font-bold">{comparison.medianDelay.proposed} days</td>
              <td className="text-right font-mono text-secondary">
                {comparison.medianDelay.difference} days
              </td>
            </tr>

            <tr>
              <td>
                <strong className="block text-secondary">SLA Violations (All Cases)</strong>
                <span className="text-dim text-xs">Returns exceeding 7-day pickup target</span>
              </td>
              <td className="text-right font-mono text-amber-300">{comparison.slaViolationsAll.baseline} cases</td>
              <td className="text-right font-mono text-emerald-400 font-bold">{comparison.slaViolationsAll.proposed} cases</td>
              <td className="text-right font-mono text-emerald-300">
                {comparison.slaViolationsAll.difference <= 0 
                  ? `${comparison.slaViolationsAll.difference} violations` 
                  : `+${comparison.slaViolationsAll.difference}`}
              </td>
            </tr>

            <tr>
              <td>
                <strong className="block text-secondary">SLA Compliance Rate</strong>
                <span className="text-dim text-xs">Overall returns serviced within SLA window</span>
              </td>
              <td className="text-right font-mono">{comparison.slaCompliance.baseline}</td>
              <td className="text-right font-mono text-emerald-300 font-bold">{comparison.slaCompliance.proposed}</td>
              <td className="text-right font-mono text-emerald-300">{comparison.slaCompliance.difference}</td>
            </tr>

            <tr>
              <td>
                <strong className="block text-secondary">Human Review Workload</strong>
                <span className="text-dim text-xs">Dispatcher investigation hours</span>
              </td>
              <td className="text-right font-mono text-dim">{comparison.reviewWorkload.baseline}</td>
              <td className="text-right font-mono text-amber-300">{comparison.reviewWorkload.proposed}</td>
              <td className="text-right font-mono text-dim">{comparison.reviewWorkload.difference}</td>
            </tr>

            <tr>
              <td>
                <strong className="block text-secondary">Total Pickup Fleet Cost</strong>
                <span className="text-dim text-xs">Consolidated routes vs single trips</span>
              </td>
              <td className="text-right font-mono">{formatCurrencyINR(comparison.pickupCost.baseline)}</td>
              <td className="text-right font-mono text-amber-300 font-bold">{formatCurrencyINR(comparison.pickupCost.proposed)}</td>
              <td className="text-right font-mono">
                {comparison.pickupCost.difference < 0 
                  ? <span className="text-emerald-300">-₹{Math.abs(comparison.pickupCost.difference)}</span> 
                  : <span className="text-dim">+₹{comparison.pickupCost.difference}</span>}
              </td>
            </tr>

            <tr>
              <td>
                <strong className="block text-secondary">Route Distance & Emissions</strong>
                <span className="text-dim text-xs">Transit mileage and CO₂ footprint</span>
              </td>
              <td className="text-right font-mono">{comparison.distanceKm.baseline} km ({comparison.co2Kg.baseline} kg)</td>
              <td className="text-right font-mono text-emerald-400 font-bold">{comparison.distanceKm.proposed} km ({comparison.co2Kg.proposed} kg)</td>
              <td className="text-right font-mono text-emerald-300">
                {comparison.distanceKm.difference < 0 
                  ? `${comparison.distanceKm.difference} km saved` 
                  : `${comparison.distanceKm.difference} km`}
              </td>
            </tr>

            <tr>
              <td>
                <strong className="block text-secondary">Manual Operator Overrides</strong>
                <span className="text-dim text-xs">Reviewer interventions adjusting priority</span>
              </td>
              <td className="text-right font-mono text-dim">0</td>
              <td className="text-right font-mono text-primary">{comparison.manualOverrides.proposed} recorded</td>
              <td className="text-right font-mono text-dim">+{comparison.manualOverrides.difference} overrides</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
