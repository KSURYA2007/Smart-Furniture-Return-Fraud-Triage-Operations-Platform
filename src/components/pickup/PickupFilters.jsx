import React from 'react';
import { Search, Filter, RotateCcw, MapPin, ShieldAlert, Clock, CheckCircle2 } from 'lucide-react';
import { PICKUP_CONFIG } from '../../config/pickupRules.js';

export default function PickupFilters({
  searchQuery,
  onSearchChange,
  priorityFilter,
  onPriorityFilterChange,
  humanDecisionFilter,
  onHumanDecisionFilterChange,
  pickupStatusFilter,
  onPickupStatusFilterChange,
  slaFilter,
  onSlaFilterChange,
  riskFilter,
  onRiskFilterChange,
  areaFilter,
  onAreaFilterChange,
  onResetFilters
}) {
  const isFiltered = 
    Boolean(searchQuery) ||
    priorityFilter !== 'ALL' ||
    humanDecisionFilter !== 'ALL' ||
    pickupStatusFilter !== 'ALL' ||
    slaFilter !== 'ALL' ||
    riskFilter !== 'ALL' ||
    areaFilter !== 'ALL';

  return (
    <div className="pickup-filters-card form-card mb-4">
      {/* Top Search Bar */}
      <div className="filters-search-row flex items-center gap-2 mb-3">
        <div className="search-input-wrap flex-1 relative">
          <Search size={15} className="search-icon text-dim absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            className="form-input pl-9 text-xs"
            placeholder="Search by Return ID (e.g. RET-3001), Customer, Product, Order ID, or City..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {isFiltered && (
          <button
            type="button"
            className="btn-ghost btn-xs flex items-center gap-1 text-dim"
            onClick={onResetFilters}
            title="Reset all filters"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Dropdown Filters Grid */}
      <div className="filters-dropdowns-grid">
        {/* 1. Priority Level */}
        <div className="filter-group">
          <label className="filter-label text-xs text-dim">Priority Level:</label>
          <select
            className="filter-select form-select text-xs"
            value={priorityFilter}
            onChange={(e) => onPriorityFilterChange(e.target.value)}
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical (80–100)</option>
            <option value="HIGH">High (60–79)</option>
            <option value="STANDARD">Standard (30–59)</option>
            <option value="LOW">Low (0–29)</option>
          </select>
        </div>

        {/* 2. Human Review Decision */}
        <div className="filter-group">
          <label className="filter-label text-xs text-dim">Human Decision:</label>
          <select
            className="filter-select form-select text-xs"
            value={humanDecisionFilter}
            onChange={(e) => onHumanDecisionFilterChange(e.target.value)}
          >
            <option value="ALL">All Decisions</option>
            <option value="APPROVED">Approved for Pickup</option>
            <option value="REJECTED">Rejected Return</option>
            <option value="REQUEST_MORE_EVIDENCE">Waiting for Evidence</option>
            <option value="ESCALATED">Escalated / On Hold</option>
          </select>
        </div>

        {/* 3. Pickup Operations Status */}
        <div className="filter-group">
          <label className="filter-label text-xs text-dim">Pickup Status:</label>
          <select
            className="filter-select form-select text-xs"
            value={pickupStatusFilter}
            onChange={(e) => onPickupStatusFilterChange(e.target.value)}
          >
            <option value="ALL">All Pickup Statuses</option>
            <option value="READY">Ready for Pickup</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="PICKED_UP">Picked Up / Completed</option>
            <option value="WAITING_FOR_EVIDENCE">Waiting for Evidence</option>
            <option value="ESCALATED">Escalated</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* 4. SLA Urgency */}
        <div className="filter-group">
          <label className="filter-label text-xs text-dim">SLA Urgency:</label>
          <select
            className="filter-select form-select text-xs"
            value={slaFilter}
            onChange={(e) => onSlaFilterChange(e.target.value)}
          >
            <option value="ALL">All SLA Tiers</option>
            <option value="ON_TRACK">On Track (&lt; 5 days)</option>
            <option value="AT_RISK">At Risk (5–7 days)</option>
            <option value="OVERDUE">Overdue (&gt; 7 days)</option>
          </select>
        </div>

        {/* 5. Fraud Risk Tier */}
        <div className="filter-group">
          <label className="filter-label text-xs text-dim">Fraud Risk Tier:</label>
          <select
            className="filter-select form-select text-xs"
            value={riskFilter}
            onChange={(e) => onRiskFilterChange(e.target.value)}
          >
            <option value="ALL">All Risk Tiers</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        {/* 6. Route / Area Cluster */}
        <div className="filter-group">
          <label className="filter-label text-xs text-dim">Geographic Zone:</label>
          <select
            className="filter-select form-select text-xs"
            value={areaFilter}
            onChange={(e) => onAreaFilterChange(e.target.value)}
          >
            <option value="ALL">All Zones</option>
            {PICKUP_CONFIG.knownServiceAreas.map(a => (
              <option key={a.id} value={a.id}>{a.name} ({a.city})</option>
            ))}
            <option value="UNKNOWN">Unmapped / Missing</option>
          </select>
        </div>
      </div>
    </div>
  );
}
