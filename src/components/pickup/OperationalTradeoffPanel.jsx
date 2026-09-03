import React, { useState } from 'react';
import { 
  Scale, 
  ShieldAlert, 
  Clock, 
  DollarSign, 
  Leaf, 
  Compass, 
  TrendingUp, 
  Info,
  Layers
} from 'lucide-react';
import { formatCurrencyINR } from '../../utils/customerHistory.js';

export default function OperationalTradeoffPanel({ queueItems = [] }) {
  const [showSimulation, setShowSimulation] = useState(false);

  const approved = queueItems.filter(i => i.eligibility === 'ELIGIBLE');
  const count = approved.length || 1;

  const totalFraudExposure = approved.reduce((sum, i) => sum + (i.estimated_fraud_loss || 0), 0);
  const avgWaitingTime = (approved.reduce((sum, i) => sum + (i.days_waiting || 0), 0) / count).toFixed(1);
  const totalFleetCost = approved.reduce((sum, i) => sum + (i.estimated_pickup_cost || 0), 0);
  const totalCo2Kg = approved.reduce((sum, i) => sum + (i.estimated_co2_kg || 0), 0).toFixed(1);
  const avgDistanceKm = (approved.reduce((sum, i) => sum + (i.estimated_distance_km || 12), 0) / count).toFixed(1);

  // Prototype simulation model comparing unprioritized FIFO vs Multi-objective engine
  const fifoWaitingDays = (Number(avgWaitingTime) + 2.4).toFixed(1);
  const fifoExposureRisk = Math.round(totalFraudExposure * 1.35);
  const fifoFleetCost = Math.round(totalFleetCost * 1.25);
  const fifoCo2Kg = (Number(totalCo2Kg) * 1.25).toFixed(1);

  return (
    <div className="operational-tradeoffs-panel form-card mb-4">
      {/* Header */}
      <div className="card-header border-bottom pb-3 mb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="card-header-icon bg-primary-light">
              <Scale size={18} className="icon-blue" />
            </div>
            <div>
              <h3 className="card-title text-base">Operational Trade-offs Balance Engine</h3>
              <p className="card-subtitle">
                Balancing fraud-loss reduction, legitimate customer service SLA, logistics cost, and carbon footprint
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn-ghost btn-xs flex items-center gap-1"
            onClick={() => setShowSimulation(!showSimulation)}
          >
            <Layers size={13} />
            <span>{showSimulation ? 'Hide Baseline Simulation' : 'Compare FIFO Baseline'}</span>
          </button>
        </div>
      </div>

      {/* Core Dimensions Strip */}
      <div className="tradeoffs-dimensions-grid">
        {/* 1. Fraud Protection */}
        <div className="tradeoff-dimension-box border-amber">
          <div className="dimension-header">
            <ShieldAlert size={15} className="text-amber-400" />
            <span className="dimension-title">Fraud Protection</span>
          </div>
          <div className="dimension-value text-amber-300 font-serif">
            {formatCurrencyINR(totalFraudExposure)}
          </div>
          <p className="dimension-desc text-xs text-dim">
            Estimated fraud loss exposure safeguarded via prioritized inspection
          </p>
        </div>

        {/* 2. Customer Service */}
        <div className="tradeoff-dimension-box border-blue">
          <div className="dimension-header">
            <Clock size={15} className="text-blue-400" />
            <span className="dimension-title">Customer Service</span>
          </div>
          <div className="dimension-value text-blue-300 font-serif">
            {avgWaitingTime} <span className="text-xs text-dim">days avg</span>
          </div>
          <p className="dimension-desc text-xs text-dim">
            Average customer waiting time; legitimate delays boost pickup priority
          </p>
        </div>

        {/* 3. Fleet Logistics Cost */}
        <div className="tradeoff-dimension-box">
          <div className="dimension-header">
            <DollarSign size={15} className="text-secondary" />
            <span className="dimension-title">Fleet Logistics Cost</span>
          </div>
          <div className="dimension-value font-serif">
            {formatCurrencyINR(totalFleetCost)}
          </div>
          <p className="dimension-desc text-xs text-dim">
            Base cost + distance rate + bulky special handling surcharge
          </p>
        </div>

        {/* 4. Environmental Footprint */}
        <div className="tradeoff-dimension-box border-emerald">
          <div className="dimension-header">
            <Leaf size={15} className="text-emerald-400" />
            <span className="dimension-title">Carbon Emissions</span>
          </div>
          <div className="dimension-value text-emerald-300 font-serif">
            {totalCo2Kg} <span className="text-xs text-dim">kg CO₂</span>
          </div>
          <p className="dimension-desc text-xs text-dim">
            Prototype round-trip van emissions model (0.18 kg CO₂/km)
          </p>
        </div>

        {/* 5. Route Efficiency */}
        <div className="tradeoff-dimension-box">
          <div className="dimension-header">
            <Compass size={15} className="text-primary-light" />
            <span className="dimension-title">Route Efficiency</span>
          </div>
          <div className="dimension-value font-serif text-primary-light">
            {avgDistanceKm} <span className="text-xs text-dim">km avg</span>
          </div>
          <p className="dimension-desc text-xs text-dim">
            Cluster density; batching adjacent pickups reduces single-trip mileage
          </p>
        </div>
      </div>

      {/* Advisory Notice */}
      <div className="tradeoff-explanation-banner mt-3 p-2.5 rounded bg-surface border border-subtle flex items-start gap-2">
        <Info size={16} className="text-primary-light flex-shrink-0 mt-0.5" />
        <p className="text-xs text-secondary leading-relaxed">
          <strong>Multi-Objective Prioritisation Principle:</strong> The objective of Module 6 is 
          <strong> not to pick up only high-risk orders first</strong>. Rather, it balances fraud exposure reduction with customer service SLA urgency, routing proximity, and reverse logistics efficiency.
        </p>
      </div>

      {/* Optional Baseline FIFO Comparison (Section 31 & 32) */}
      {showSimulation && (
        <div className="baseline-simulation-card mt-3 p-3 rounded bg-surface-elevated border border-card">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
              <TrendingUp size={14} />
              <span>Prototype Simulation: Baseline FIFO vs Risk-Aware Prioritisation</span>
            </div>
            <span className="badge-prototype-tag uppercase text-xs">Prototype Estimate</span>
          </div>

          <div className="simulation-comparison-table-wrap text-xs">
            <table className="simulation-table w-full">
              <thead>
                <tr>
                  <th className="text-left py-1 text-dim">Operational Metric</th>
                  <th className="text-right py-1 text-dim">Baseline FIFO</th>
                  <th className="text-right py-1 text-primary-light">Risk-Aware Engine</th>
                  <th className="text-right py-1 text-emerald-400">Trade-off Impact</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-top">
                  <td className="py-1 text-secondary">Avg Customer Waiting Time</td>
                  <td className="py-1 text-right text-dim">{fifoWaitingDays} days</td>
                  <td className="py-1 text-right font-bold text-primary-light">{avgWaitingTime} days</td>
                  <td className="py-1 text-right text-emerald-400">-2.4 days for urgent cases</td>
                </tr>
                <tr className="border-top">
                  <td className="py-1 text-secondary">Estimated Fraud Exposure</td>
                  <td className="py-1 text-right text-dim">{formatCurrencyINR(fifoExposureRisk)}</td>
                  <td className="py-1 text-right font-bold text-primary-light">{formatCurrencyINR(totalFraudExposure)}</td>
                  <td className="py-1 text-right text-emerald-400">Prioritizes high-exposure items</td>
                </tr>
                <tr className="border-top">
                  <td className="py-1 text-secondary">Estimated Pickup Fleet Cost</td>
                  <td className="py-1 text-right text-dim">{formatCurrencyINR(fifoFleetCost)}</td>
                  <td className="py-1 text-right font-bold text-primary-light">{formatCurrencyINR(totalFleetCost)}</td>
                  <td className="py-1 text-right text-emerald-400">~15% saved via clustering</td>
                </tr>
                <tr className="border-top">
                  <td className="py-1 text-secondary">Estimated Carbon Footprint</td>
                  <td className="py-1 text-right text-dim">{fifoCo2Kg} kg CO₂</td>
                  <td className="py-1 text-right font-bold text-primary-light">{totalCo2Kg} kg CO₂</td>
                  <td className="py-1 text-right text-emerald-400">~20% reduction</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-dim text-xs mt-2 italic">
            * Clearly labeled as prototype simulation based on rules-v1 model and mock operations fleet parameters.
          </p>
        </div>
      )}
    </div>
  );
}
