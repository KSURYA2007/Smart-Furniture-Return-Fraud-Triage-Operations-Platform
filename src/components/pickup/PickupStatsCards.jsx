import React from 'react';
import { 
  Truck, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  ShieldAlert, 
  Leaf, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { formatCurrencyINR } from '../../utils/customerHistory.js';

export default function PickupStatsCards({ queueItems = [] }) {
  // Compute operational aggregates
  const totalApproved = queueItems.filter(i => i.eligibility === 'ELIGIBLE');
  const readyCount = totalApproved.filter(i => i.operational_status === 'READY').length;
  const scheduledCount = totalApproved.filter(i => i.operational_status === 'SCHEDULED').length;
  const criticalCount = totalApproved.filter(i => i.priority_level === 'CRITICAL').length;
  const highCount = totalApproved.filter(i => i.priority_level === 'HIGH').length;

  const totalWaitingDays = totalApproved.reduce((sum, i) => sum + (i.days_waiting || 0), 0);
  const avgWaitingDays = totalApproved.length > 0 ? (totalWaitingDays / totalApproved.length).toFixed(1) : '0.0';

  const totalFraudExposure = totalApproved.reduce((sum, i) => sum + (i.estimated_fraud_loss || 0), 0);
  const totalPickupCost = totalApproved.reduce((sum, i) => sum + (i.estimated_pickup_cost || 0), 0);
  const totalCo2Kg = totalApproved.reduce((sum, i) => sum + (i.estimated_co2_kg || 0), 0).toFixed(1);

  const slaAtRiskCount = totalApproved.filter(i => i.sla_status === 'AT_RISK' || i.sla_status === 'OVERDUE').length;

  return (
    <div className="pickup-stats-grid mb-4">
      {/* 1. Ready for Pickup */}
      <div className="pickup-stat-card border-emerald">
        <div className="flex items-center justify-between">
          <span className="stat-card-title">Ready for Pickup</span>
          <div className="stat-icon-wrap bg-emerald-bg">
            <Truck size={16} className="text-emerald-400" />
          </div>
        </div>
        <div className="stat-card-value font-serif text-emerald-400">{readyCount}</div>
        <div className="stat-card-subtitle">
          {scheduledCount} currently scheduled &bull; {totalApproved.length} approved
        </div>
      </div>

      {/* 2. Critical Priority */}
      <div className="pickup-stat-card border-red">
        <div className="flex items-center justify-between">
          <span className="stat-card-title">Critical Priority</span>
          <div className="stat-icon-wrap bg-red-bg">
            <AlertTriangle size={16} className="text-red-400" />
          </div>
        </div>
        <div className="stat-card-value font-serif text-red-400">{criticalCount}</div>
        <div className="stat-card-subtitle">
          Score 80–100 &bull; Immediate routing required
        </div>
      </div>

      {/* 3. High Priority */}
      <div className="pickup-stat-card border-amber">
        <div className="flex items-center justify-between">
          <span className="stat-card-title">High Priority</span>
          <div className="stat-icon-wrap bg-amber-bg">
            <AlertCircle size={16} className="text-amber-400" />
          </div>
        </div>
        <div className="stat-card-value font-serif text-amber-400">{highCount}</div>
        <div className="stat-card-subtitle">
          Score 60–79 &bull; Standard priority dispatch
        </div>
      </div>

      {/* 4. Average Waiting Time */}
      <div className="pickup-stat-card">
        <div className="flex items-center justify-between">
          <span className="stat-card-title">Avg Waiting Time</span>
          <div className="stat-icon-wrap bg-primary-light">
            <Clock size={16} className="icon-blue" />
          </div>
        </div>
        <div className="stat-card-value font-serif">{avgWaitingDays} <span className="stat-unit text-sm">days</span></div>
        <div className="stat-card-subtitle">
          Target SLA: &lt; 7 days per return
        </div>
      </div>

      {/* 5. Estimated Fraud Exposure */}
      <div className="pickup-stat-card">
        <div className="flex items-center justify-between">
          <span className="stat-card-title">Estimated Fraud Exposure</span>
          <div className="stat-icon-wrap bg-amber-bg">
            <ShieldAlert size={16} className="text-amber-400" />
          </div>
        </div>
        <div className="stat-card-value font-serif text-amber-300">{formatCurrencyINR(totalFraudExposure)}</div>
        <div className="stat-card-subtitle">
          Prototype loss exposure estimate
        </div>
      </div>

      {/* 6. Estimated Pickup Cost */}
      <div className="pickup-stat-card">
        <div className="flex items-center justify-between">
          <span className="stat-card-title">Estimated Fleet Cost</span>
          <div className="stat-icon-wrap bg-surface-elevated">
            <DollarSign size={16} className="text-secondary" />
          </div>
        </div>
        <div className="stat-card-value font-serif">{formatCurrencyINR(totalPickupCost)}</div>
        <div className="stat-card-subtitle">
          Base ₹200 + ₹15/km + handling
        </div>
      </div>

      {/* 7. Estimated CO2 Emissions */}
      <div className="pickup-stat-card">
        <div className="flex items-center justify-between">
          <span className="stat-card-title">Estimated Emissions</span>
          <div className="stat-icon-wrap bg-emerald-bg">
            <Leaf size={16} className="text-emerald-400" />
          </div>
        </div>
        <div className="stat-card-value font-serif text-emerald-300">{totalCo2Kg} <span className="stat-unit text-sm">kg CO₂</span></div>
        <div className="stat-card-subtitle">
          Prototype round-trip model
        </div>
      </div>

      {/* 8. SLA At Risk / Overdue */}
      <div className="pickup-stat-card border-red">
        <div className="flex items-center justify-between">
          <span className="stat-card-title">SLA At Risk / Overdue</span>
          <div className="stat-icon-wrap bg-red-bg">
            <Clock size={16} className="text-red-400" />
          </div>
        </div>
        <div className={`stat-card-value font-serif ${slaAtRiskCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
          {slaAtRiskCount}
        </div>
        <div className="stat-card-subtitle">
          {slaAtRiskCount > 0 ? 'Exceeding 5–7 day service window' : 'All approved cases on track'}
        </div>
      </div>
    </div>
  );
}
