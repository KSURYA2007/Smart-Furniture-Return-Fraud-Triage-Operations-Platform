import React from 'react';
import { 
  ShieldAlert, 
  Clock, 
  TrendingDown, 
  TrendingUp, 
  CheckCircle2, 
  UserCheck, 
  DollarSign, 
  Leaf 
} from 'lucide-react';
import { formatCurrencyINR } from '../../utils/customerHistory.js';

export default function ExecutiveSummaryCards({ results }) {
  if (!results || !results.comparison) {
    return (
      <div className="metrics-summary-empty p-4 rounded bg-surface border border-subtle text-xs text-dim text-center">
        Run an experiment to populate executive summary metrics.
      </div>
    );
  }

  const { comparison, workload, detection } = results;

  const fraudReduction = comparison.fraudLossExposure.difference < 0 
    ? formatCurrencyINR(Math.abs(comparison.fraudLossExposure.difference)) 
    : '₹0';
  const fraudReductionPct = comparison.fraudLossExposure.percentageChange;

  return (
    <section className="executive-summary-cards-section mb-4">
      <div className="pickup-stats-grid">
        {/* 1. Fraud Loss Reduction */}
        <div className="pickup-stat-card border-emerald">
          <div className="flex items-center justify-between">
            <span className="stat-card-title">Fraud Loss Reduction</span>
            <div className="stat-icon-wrap bg-emerald-bg">
              <TrendingDown size={16} className="text-emerald-400" />
            </div>
          </div>
          <div className="stat-card-value text-emerald-400">{fraudReduction}</div>
          <div className="stat-card-subtitle flex items-center gap-1">
            <span>Reduction: <strong>{fraudReductionPct}</strong> vs FIFO</span>
          </div>
        </div>

        {/* 2. Legitimate Customer Delay */}
        <div className="pickup-stat-card border-blue">
          <div className="flex items-center justify-between">
            <span className="stat-card-title">Legitimate Avg Delay</span>
            <div className="stat-icon-wrap bg-primary-light">
              <Clock size={16} className="text-primary-light" />
            </div>
          </div>
          <div className="stat-card-value font-mono">
            {comparison.legitimateAvgDelay.proposed} <span className="text-sm font-sans font-normal text-dim">days</span>
          </div>
          <div className="stat-card-subtitle">
            FIFO Baseline: <strong>{comparison.legitimateAvgDelay.baseline} days</strong>
          </div>
        </div>

        {/* 3. False Positive Rate */}
        <div className="pickup-stat-card border-amber">
          <div className="flex items-center justify-between">
            <span className="stat-card-title">False Positive Cases</span>
            <div className="stat-icon-wrap bg-amber-bg">
              <ShieldAlert size={16} className="text-amber-400" />
            </div>
          </div>
          <div className="stat-card-value text-amber-300 font-mono">
            {detection.FP} <span className="text-sm font-sans font-normal text-dim">cases</span>
          </div>
          <div className="stat-card-subtitle">
            Precision: <strong>{detection.precision !== 'N/A' ? `${detection.precision}%` : 'N/A'}</strong>
          </div>
        </div>

        {/* 4. False Negative Rate */}
        <div className="pickup-stat-card border-red">
          <div className="flex items-center justify-between">
            <span className="stat-card-title">Missed Fraud (FN)</span>
            <div className="stat-icon-wrap bg-red-bg">
              <ShieldAlert size={16} className="text-red-400" />
            </div>
          </div>
          <div className="stat-card-value text-red-400 font-mono">
            {detection.FN} <span className="text-sm font-sans font-normal text-dim">cases</span>
          </div>
          <div className="stat-card-subtitle">
            Recall: <strong>{detection.recall !== 'N/A' ? `${detection.recall}%` : 'N/A'}</strong>
          </div>
        </div>

        {/* 5. Review Workload */}
        <div className="pickup-stat-card">
          <div className="flex items-center justify-between">
            <span className="stat-card-title">Review Workload</span>
            <div className="stat-icon-wrap bg-surface">
              <UserCheck size={16} className="text-secondary" />
            </div>
          </div>
          <div className="stat-card-value font-mono">
            {workload.reviewHours} <span className="text-sm font-sans font-normal text-dim">hours</span>
          </div>
          <div className="stat-card-subtitle">
            Total {workload.totalReviews} human reviews conducted
          </div>
        </div>

        {/* 6. SLA Compliance */}
        <div className="pickup-stat-card border-emerald">
          <div className="flex items-center justify-between">
            <span className="stat-card-title">SLA Compliance</span>
            <div className="stat-icon-wrap bg-emerald-bg">
              <CheckCircle2 size={16} className="text-emerald-400" />
            </div>
          </div>
          <div className="stat-card-value text-emerald-300 font-mono">
            {comparison.slaCompliance.proposed}
          </div>
          <div className="stat-card-subtitle">
            FIFO Baseline: <strong>{comparison.slaCompliance.baseline}</strong>
          </div>
        </div>

        {/* 7. Fleet Logistics Cost */}
        <div className="pickup-stat-card">
          <div className="flex items-center justify-between">
            <span className="stat-card-title">Estimated Fleet Cost</span>
            <div className="stat-icon-wrap bg-surface">
              <DollarSign size={16} className="text-amber-300" />
            </div>
          </div>
          <div className="stat-card-value font-mono">
            {formatCurrencyINR(comparison.pickupCost.proposed)}
          </div>
          <div className="stat-card-subtitle">
            FIFO Baseline: <strong>{formatCurrencyINR(comparison.pickupCost.baseline)}</strong>
          </div>
        </div>

        {/* 8. Fleet CO2 Footprint */}
        <div className="pickup-stat-card">
          <div className="flex items-center justify-between">
            <span className="stat-card-title">Carbon Footprint</span>
            <div className="stat-icon-wrap bg-surface">
              <Leaf size={16} className="text-emerald-400" />
            </div>
          </div>
          <div className="stat-card-value font-mono">
            {comparison.co2Kg.proposed} <span className="text-sm font-sans font-normal text-dim">kg CO₂</span>
          </div>
          <div className="stat-card-subtitle">
            Difference: <strong>{comparison.co2Kg.difference > 0 ? `+${comparison.co2Kg.difference}` : comparison.co2Kg.difference} kg</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
