import React, { useState, useEffect } from 'react';
import PickupStatsCards from '../components/pickup/PickupStatsCards.jsx';
import OperationalTradeoffPanel from '../components/pickup/OperationalTradeoffPanel.jsx';
import PickupFilters from '../components/pickup/PickupFilters.jsx';
import PickupQueueTable from '../components/pickup/PickupQueueTable.jsx';
import PickupSchedulingModal from '../components/pickup/PickupSchedulingModal.jsx';
import { buildPickupQueue, schedulePickup } from '../services/pickupService.js';
import { subscribeRealtime } from '../utils/realtimeBus.js';
import { 
  Truck, 
  Compass, 
  Layers, 
  RotateCcw, 
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function PickupDashboard({
  onSelectCase,
  onOpenBatches,
  greeting
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [humanDecisionFilter, setHumanDecisionFilter] = useState('ALL');
  const [pickupStatusFilter, setPickupStatusFilter] = useState('ALL');
  const [slaFilter, setSlaFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [areaFilter, setAreaFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('PRIORITY_DESC');

  const [queueItems, setQueueItems] = useState([]);
  const [schedulingCase, setSchedulingCase] = useState(null);
  const [scheduleSuccessNotice, setScheduleSuccessNotice] = useState(false);

  const loadQueue = () => {
    const items = buildPickupQueue({
      priorityFilter,
      humanDecisionFilter,
      pickupStatusFilter,
      slaFilter,
      riskFilter,
      areaFilter,
      searchQuery,
      sortBy
    });
    setQueueItems(items);
  };

  useEffect(() => {
    loadQueue();
  }, [priorityFilter, humanDecisionFilter, pickupStatusFilter, slaFilter, riskFilter, areaFilter, searchQuery, sortBy]);

  useEffect(() => {
    return subscribeRealtime('*', () => {
      loadQueue();
    });
  }, []);

  const handleResetFilters = () => {
    setSearchQuery('');
    setPriorityFilter('ALL');
    setHumanDecisionFilter('ALL');
    setPickupStatusFilter('ALL');
    setSlaFilter('ALL');
    setRiskFilter('ALL');
    setAreaFilter('ALL');
    setSortBy('PRIORITY_DESC');
  };

  const handleConfirmSchedule = (returnId, schedulePayload) => {
    const success = schedulePickup(returnId, schedulePayload);
    if (success) {
      setSchedulingCase(null);
      setScheduleSuccessNotice(true);
      setTimeout(() => setScheduleSuccessNotice(false), 3500);
      loadQueue();
    }
  };

  return (
    <div className="page-wrapper pickup-dashboard-page">
      {/* Page Header */}
      <header className="page-header pickup-page-header mb-4">
        <div className="header-container">
          <div className="header-badge-row">
            <span className="module-badge">
              <Truck size={13} /> Module 6: Pickup Prioritisation & Operations Decision Engine
            </span>
          </div>
          {greeting && <div className="header-greeting">{greeting}</div>}
          <h1 className="page-title font-serif">Reverse Logistics Pickup Dispatch</h1>
          <p className="page-description">
            Which approved returns should be picked up first, and why? Balancing fraud-loss protection, legitimate customer SLA delay, fleet cost, and environmental footprint.
          </p>
        </div>

        {/* Action button to open Area Route Batches */}
        <div className="header-actions-row flex items-center justify-between flex-wrap gap-2 mt-3">
          <div className="text-xs text-dim">
            Showing <strong>{queueItems.length}</strong> operational cases
          </div>

          {onOpenBatches && (
            <button
              type="button"
              className="btn-secondary btn-sm flex items-center gap-1.5"
              onClick={onOpenBatches}
            >
              <Compass size={14} className="text-primary-light" />
              <span>View Route Grouping Batches &rarr;</span>
            </button>
          )}
        </div>
      </header>

      {/* Success Notification Banner */}
      {scheduleSuccessNotice && (
        <div className="pickup-schedule-success-banner mb-4 p-3 rounded bg-emerald-bg border border-emerald-border flex items-center gap-2 text-xs">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span className="text-emerald-300 font-semibold">
            Pickup successfully scheduled and assigned to driver. Operational audit trail updated.
          </span>
        </div>
      )}

      {/* Top 8 Aggregate Metrics Cards */}
      <PickupStatsCards queueItems={queueItems} />

      {/* Operational Trade-offs Panel (Section 15) */}
      <OperationalTradeoffPanel queueItems={queueItems} />

      {/* Filters & Live Search */}
      <PickupFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        humanDecisionFilter={humanDecisionFilter}
        onHumanDecisionFilterChange={setHumanDecisionFilter}
        pickupStatusFilter={pickupStatusFilter}
        onPickupStatusFilterChange={setPickupStatusFilter}
        slaFilter={slaFilter}
        onSlaFilterChange={setSlaFilter}
        riskFilter={riskFilter}
        onRiskFilterChange={setRiskFilter}
        areaFilter={areaFilter}
        onAreaFilterChange={setAreaFilter}
        onResetFilters={handleResetFilters}
      />

      {/* Detailed Operations Queue Table */}
      <div className="pickup-table-card form-card">
        <div className="card-header border-bottom pb-2 mb-3">
          <div className="flex items-center justify-between">
            <h3 className="card-title text-base">Prioritised Pickup Queue</h3>
            <span className="text-xs text-dim">Sorted by {sortBy.replace('_', ' ')}</span>
          </div>
        </div>

        <PickupQueueTable
          cases={queueItems}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onSelectCase={onSelectCase}
          onScheduleCase={(caseItem) => setSchedulingCase(caseItem)}
        />
      </div>

      {/* Scheduling Modal */}
      {schedulingCase && (
        <PickupSchedulingModal
          isOpen={Boolean(schedulingCase)}
          caseItem={schedulingCase}
          onClose={() => setSchedulingCase(null)}
          onConfirmSchedule={handleConfirmSchedule}
        />
      )}
    </div>
  );
}
