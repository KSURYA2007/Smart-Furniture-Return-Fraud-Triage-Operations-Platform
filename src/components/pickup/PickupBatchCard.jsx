import React from 'react';
import { Compass, Truck, Leaf, DollarSign, Calendar, ArrowRight, Layers } from 'lucide-react';
import { formatCurrencyINR } from '../../utils/customerHistory.js';

export default function PickupBatchCard({
  batch,
  onScheduleBatch,
  onViewCase
}) {
  if (!batch) return null;

  const {
    batch_id,
    area_name,
    city,
    items = [],
    total_items,
    consolidated_distance_km,
    consolidated_cost,
    consolidated_co2_kg,
    highest_priority_score,
    highest_priority_level,
    suggested_date
  } = batch;

  return (
    <div className="pickup-batch-card form-card mb-3">
      <div className="batch-card-header flex items-center justify-between border-bottom pb-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="card-header-icon bg-primary-light">
            <Compass size={16} className="icon-blue" />
          </div>
          <div>
            <span className="text-dim text-2xs uppercase font-bold">{batch_id}</span>
            <h4 className="font-bold text-sm text-primary">{area_name} ({city})</h4>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="badge-count font-bold text-xs">{total_items} Returns</span>
          <span className={`priority-pill badge-risk-${highest_priority_level.toLowerCase()}`}>
            Max: {highest_priority_level} ({highest_priority_score})
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="batch-metrics-row grid grid-cols-3 gap-2 text-xs mb-3">
        <div className="batch-metric-box p-2 rounded bg-surface border border-subtle">
          <span className="text-dim text-2xs block">Route Distance:</span>
          <span className="font-bold text-secondary font-mono">{consolidated_distance_km} km</span>
          <span className="text-dim text-3xs block">~35% saved via clustering</span>
        </div>
        <div className="batch-metric-box p-2 rounded bg-surface border border-subtle">
          <span className="text-dim text-2xs block">Consolidated Cost:</span>
          <span className="font-bold text-amber-300 font-mono">{formatCurrencyINR(consolidated_cost)}</span>
          <span className="text-dim text-3xs block">Base + mileage</span>
        </div>
        <div className="batch-metric-box p-2 rounded bg-surface border border-subtle">
          <span className="text-dim text-2xs block">Emissions:</span>
          <span className="font-bold text-emerald-400 font-mono">{consolidated_co2_kg} kg CO₂</span>
          <span className="text-dim text-3xs block">Round-trip van</span>
        </div>
      </div>

      {/* Clustered Return IDs List */}
      <div className="batch-returns-list text-xs mb-3">
        <span className="text-dim text-2xs block mb-1">Clustered Return Cases in Zone:</span>
        <div className="flex flex-wrap gap-1">
          {items.map(i => (
            <button
              key={i.return_id}
              type="button"
              className="batch-item-tag-btn"
              onClick={() => onViewCase && onViewCase(i.return_id)}
              title={`${i.customer_name} • ${i.product_name}`}
            >
              <span className="font-serif-id font-bold">{i.return_id}</span>
              <span className="text-dim text-2xs">({i.priority_level})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="batch-card-footer flex items-center justify-between pt-2 border-top text-xs">
        <span className="text-dim flex items-center gap-1">
          <Calendar size={12} /> Suggested Date: <strong>{suggested_date}</strong>
        </span>

        {onScheduleBatch && (
          <button
            type="button"
            className="btn-secondary btn-xs flex items-center gap-1"
            onClick={() => onScheduleBatch(batch)}
          >
            <Truck size={12} /> Dispatch Batch &rarr;
          </button>
        )}
      </div>
    </div>
  );
}
