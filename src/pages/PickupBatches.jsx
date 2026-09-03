import React, { useState, useEffect } from 'react';
import PickupBatchCard from '../components/pickup/PickupBatchCard.jsx';
import PickupSchedulingModal from '../components/pickup/PickupSchedulingModal.jsx';
import { buildPickupQueue, groupPickupBatches, schedulePickup } from '../services/pickupService.js';
import { Compass, ArrowLeft, Truck, Leaf, DollarSign, CheckCircle2, Layers } from 'lucide-react';
import { formatCurrencyINR } from '../utils/customerHistory.js';

export default function PickupBatches({
  onBack,
  onViewCase
}) {
  const [batches, setBatches] = useState([]);
  const [schedulingBatch, setSchedulingBatch] = useState(null);
  const [batchScheduleNotice, setBatchScheduleNotice] = useState(false);

  const loadBatches = () => {
    const queue = buildPickupQueue();
    const grouped = groupPickupBatches(queue);
    setBatches(grouped);
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const handleScheduleEntireBatch = (batch) => {
    // Schedule all items in batch
    const defaultDate = batch.suggested_date;
    batch.items.forEach(item => {
      schedulePickup(item.return_id, {
        date: defaultDate,
        timeSlot: '09:00 AM – 12:00 PM',
        driver: { id: 'DRV-01', name: 'Ramesh Kumar', phone: '+91 98451 22301' },
        vehicle: { id: 'VEH-VAN-01', name: 'Van 01', type: 'Light Cargo Van' },
        specialHandling: ['Clustered Route Run']
      }, 'Batch Dispatch Engine');
    });

    setBatchScheduleNotice(true);
    setTimeout(() => setBatchScheduleNotice(false), 3500);
    loadBatches();
  };

  const totalBatches = batches.length;
  const totalClusteredItems = batches.reduce((sum, b) => sum + b.total_items, 0);
  const totalDistance = batches.reduce((sum, b) => sum + b.consolidated_distance_km, 0).toFixed(1);
  const totalCost = batches.reduce((sum, b) => sum + b.consolidated_cost, 0);
  const totalCo2 = batches.reduce((sum, b) => sum + b.consolidated_co2_kg, 0).toFixed(1);

  return (
    <div className="page-wrapper pickup-batches-page">
      {/* Top Bar */}
      <div className="batches-top-bar flex items-center justify-between mb-3">
        {onBack && (
          <button type="button" onClick={onBack} className="btn-back-link">
            <ArrowLeft size={16} /> Back to Pickup Dashboard
          </button>
        )}
      </div>

      {/* Page Header */}
      <header className="page-header batches-header mb-4">
        <div className="header-container">
          <div className="header-badge-row">
            <span className="module-badge">
              <Compass size={13} /> Module 6: Route Grouping & Area Batches
            </span>
          </div>
          <h1 className="page-title font-serif">Prototype Route Consolidation</h1>
          <p className="page-description">
            Clustering approved furniture return pickups by geographic service corridor to reduce single-trip mileage, fleet expenditure, and carbon emissions.
          </p>
        </div>

        {/* Aggregates Strip */}
        <div className="batches-stats-grid grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-xs">
          <div className="stat-card p-2.5 rounded bg-surface border border-subtle">
            <span className="text-dim block">Active Route Batches:</span>
            <span className="text-lg font-serif font-bold text-primary">{totalBatches} Zones</span>
          </div>
          <div className="stat-card p-2.5 rounded bg-surface border border-subtle">
            <span className="text-dim block">Consolidated Pickups:</span>
            <span className="text-lg font-serif font-bold text-primary-light">{totalClusteredItems} Returns</span>
          </div>
          <div className="stat-card p-2.5 rounded bg-surface border border-subtle">
            <span className="text-dim block">Estimated Fleet Cost:</span>
            <span className="text-lg font-serif font-bold text-amber-300">{formatCurrencyINR(totalCost)}</span>
          </div>
          <div className="stat-card p-2.5 rounded bg-surface border border-subtle">
            <span className="text-dim block">Combined Emissions:</span>
            <span className="text-lg font-serif font-bold text-emerald-400">{totalCo2} kg CO₂</span>
          </div>
        </div>
      </header>

      {/* Success Notification */}
      {batchScheduleNotice && (
        <div className="p-3 rounded bg-emerald-bg border border-emerald-border mb-4 flex items-center gap-2 text-xs">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span className="text-emerald-300 font-semibold">
            All return pickups in the zone successfully scheduled into a consolidated route dispatch run!
          </span>
        </div>
      )}

      {/* Batches Grid */}
      <div className="batches-list-grid">
        {batches.length === 0 ? (
          <div className="p-8 text-center bg-surface rounded border border-card">
            <Compass size={32} className="text-dim mx-auto mb-2 opacity-50" />
            <h4 className="font-bold text-sm text-primary mb-1">No Approved Returns Available for Route Batching</h4>
            <p className="text-xs text-dim">
              Only returns with human approval (Module 5) can be clustered into pickup batches.
            </p>
          </div>
        ) : (
          batches.map(batch => (
            <PickupBatchCard
              key={batch.batch_id}
              batch={batch}
              onScheduleBatch={handleScheduleEntireBatch}
              onViewCase={onViewCase}
            />
          ))
        )}
      </div>
    </div>
  );
}
