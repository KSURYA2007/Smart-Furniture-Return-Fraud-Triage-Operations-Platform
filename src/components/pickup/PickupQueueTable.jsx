import React from 'react';
import { 
  ArrowUpDown, 
  AlertTriangle, 
  Clock, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  MapPin, 
  ShieldAlert, 
  Leaf, 
  DollarSign, 
  ArrowRight,
  Eye,
  Sliders
} from 'lucide-react';
import { formatCurrencyINR } from '../../utils/customerHistory.js';

export default function PickupQueueTable({
  cases = [],
  sortBy,
  onSortChange,
  onSelectCase,
  onScheduleCase
}) {
  const getPriorityBadgeClass = (level) => {
    switch (level) {
      case 'CRITICAL': return 'badge-risk-critical';
      case 'HIGH': return 'badge-risk-high';
      case 'STANDARD': return 'badge-risk-medium';
      case 'LOW': return 'badge-risk-low';
      default: return 'badge-neutral';
    }
  };

  const getSlaBadge = (status) => {
    switch (status) {
      case 'OVERDUE':
        return <span className="badge-sla-overdue flex items-center gap-1"><AlertTriangle size={11} /> OVERDUE</span>;
      case 'AT_RISK':
        return <span className="badge-sla-at-risk flex items-center gap-1"><Clock size={11} /> AT RISK</span>;
      default:
        return <span className="badge-sla-on-track flex items-center gap-1"><CheckCircle2 size={11} /> ON TRACK</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'READY':
        return <span className="badge-pickup-ready">READY FOR PICKUP</span>;
      case 'SCHEDULED':
        return <span className="badge-pickup-scheduled">SCHEDULED</span>;
      case 'PICKED_UP':
        return <span className="badge-pickup-completed">PICKED UP</span>;
      case 'WAITING_FOR_EVIDENCE':
        return <span className="badge-pickup-waiting">WAITING EVIDENCE</span>;
      case 'ESCALATED':
        return <span className="badge-pickup-escalated">ESCALATED</span>;
      case 'REJECTED':
        return <span className="badge-pickup-rejected">REJECTED</span>;
      default:
        return <span className="badge-neutral">{status?.replace('_', ' ')}</span>;
    }
  };

  const getDecisionBadge = (decision) => {
    switch (decision) {
      case 'APPROVE_PICKUP':
        return <span className="text-emerald-400 font-bold text-xs">APPROVED</span>;
      case 'REJECT_RETURN':
        return <span className="text-red-400 font-bold text-xs">REJECTED</span>;
      case 'REQUEST_MORE_EVIDENCE':
        return <span className="text-blue-400 font-bold text-xs">MORE EVIDENCE</span>;
      case 'ESCALATE':
        return <span className="text-amber-400 font-bold text-xs">ESCALATED</span>;
      default:
        return <span className="text-dim text-xs">PENDING</span>;
    }
  };

  if (cases.length === 0) {
    return (
      <div className="empty-queue-box text-center p-8 bg-surface rounded border border-card">
        <Truck size={36} className="text-dim mx-auto mb-2 opacity-50" />
        <h4 className="font-bold text-sm text-primary mb-1">No Return Pickups Match Current Criteria</h4>
        <p className="text-xs text-dim max-w-sm mx-auto">
          Adjust the priority, status, area, or search filters above to view active pickup operational cases.
        </p>
      </div>
    );
  }

  return (
    <div className="pickup-table-wrapper overflow-x-auto">
      <table className="pickup-queue-table w-full text-xs">
        <thead>
          <tr>
            <th className="th-sortable" onClick={() => onSortChange(sortBy === 'PRIORITY_DESC' ? 'PRIORITY_ASC' : 'PRIORITY_DESC')}>
              <div className="flex items-center gap-1">
                <span>Priority</span>
                <ArrowUpDown size={11} className="text-dim" />
              </div>
            </th>
            <th>Return ID</th>
            <th>Customer</th>
            <th>Product</th>
            <th className="th-sortable text-right" onClick={() => onSortChange('VALUE_DESC')}>
              <div className="flex items-center justify-end gap-1">
                <span>Value</span>
                <ArrowUpDown size={11} className="text-dim" />
              </div>
            </th>
            <th>Human Decision</th>
            <th className="th-sortable" onClick={() => onSortChange('RISK_DESC')}>
              <div className="flex items-center gap-1">
                <span>Fraud Risk</span>
                <ArrowUpDown size={11} className="text-dim" />
              </div>
            </th>
            <th className="th-sortable" onClick={() => onSortChange(sortBy === 'WAITING_DESC' ? 'WAITING_ASC' : 'WAITING_DESC')}>
              <div className="flex items-center gap-1">
                <span>Waiting</span>
                <ArrowUpDown size={11} className="text-dim" />
              </div>
            </th>
            <th>Location</th>
            <th className="th-sortable text-right" onClick={() => onSortChange('DISTANCE_ASC')}>
              <div className="flex items-center justify-end gap-1">
                <span>Dist.</span>
                <ArrowUpDown size={11} className="text-dim" />
              </div>
            </th>
            <th className="th-sortable text-right" onClick={() => onSortChange('COST_ASC')}>
              <div className="flex items-center justify-end gap-1">
                <span>Est. Cost</span>
                <ArrowUpDown size={11} className="text-dim" />
              </div>
            </th>
            <th className="th-sortable text-right" onClick={() => onSortChange('CO2_ASC')}>
              <div className="flex items-center justify-end gap-1">
                <span>Est. CO₂</span>
                <ArrowUpDown size={11} className="text-dim" />
              </div>
            </th>
            <th>Preferred Date</th>
            <th>SLA Status</th>
            <th>Pickup Status</th>
            <th className="text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((item) => {
            const isEligible = item.eligibility === 'ELIGIBLE';
            const isScheduled = item.operational_status === 'SCHEDULED';
            const isOverdue = item.sla_status === 'OVERDUE';

            return (
              <tr 
                key={item.return_id} 
                className={`pickup-row ${isOverdue ? 'row-overdue-alert' : ''}`}
                onClick={() => onSelectCase(item.return_id)}
              >
                {/* 1. Priority Score & Level */}
                <td>
                  <div className="flex items-center gap-1.5">
                    <span className="font-serif font-bold text-sm text-primary">
                      {item.pickup_priority_score}
                    </span>
                    <span className={`priority-pill ${getPriorityBadgeClass(item.priority_level)}`}>
                      {item.priority_level}
                    </span>
                  </div>
                  {item.is_overridden && (
                    <span className="badge-overridden-mini" title={`Manually changed from original score: ${item.override?.original_priority_score}`}>
                      OVERRIDDEN
                    </span>
                  )}
                  {item.is_customer_service_urgency && (
                    <div className="service-urgency-mini-tag" title="Prioritized to prevent unnecessary legitimate customer delay">
                      SERVICE URGENCY
                    </div>
                  )}
                </td>

                {/* 2. Return ID */}
                <td className="font-serif-id font-bold text-primary">
                  {item.return_id}
                </td>

                {/* 3. Customer */}
                <td>
                  <div className="font-medium text-secondary">{item.customer_name}</div>
                  <div className="text-dim text-2xs">{item.customer_id || 'ID: CUS-—'}</div>
                </td>

                {/* 4. Product */}
                <td>
                  <div className="font-medium text-secondary max-w-xs truncate" title={item.product_name}>
                    {item.product_name}
                  </div>
                  <div className="text-dim text-2xs">{item.category}</div>
                </td>

                {/* 5. Order Value */}
                <td className="text-right font-medium">
                  {item.order_value !== null && item.order_value !== undefined 
                    ? formatCurrencyINR(item.order_value) 
                    : <span className="text-dim italic">Unavailable</span>}
                </td>

                {/* 6. Human Decision (Module 5) */}
                <td>
                  {getDecisionBadge(item.human_decision)}
                  {item.human_review?.decision?.override && (
                    <span className="text-amber-400 text-2xs block">Manual Override</span>
                  )}
                </td>

                {/* 7. Fraud Risk (Module 4) */}
                <td>
                  <span className={`badge-risk-${item.triage_risk_category?.toLowerCase() || 'medium'}`}>
                    {item.triage_risk_category} ({item.triage_risk_score})
                  </span>
                </td>

                {/* 8. Waiting Days */}
                <td>
                  <span className={`font-semibold ${item.days_waiting >= 7 ? 'text-red-400' : (item.days_waiting >= 5 ? 'text-amber-400' : 'text-secondary')}`}>
                    {item.days_waiting} day{item.days_waiting !== 1 ? 's' : ''}
                  </span>
                </td>

                {/* 9. Location */}
                <td>
                  {item.location_available ? (
                    <div>
                      <div className="text-secondary truncate max-w-36" title={item.returnRecord?.pickup?.address}>
                        {item.returnRecord?.pickup?.city || 'Bengaluru'}
                      </div>
                      <span className="text-dim text-2xs">{item.returnRecord?.pickup?.area_cluster || 'Zone unmapped'}</span>
                    </div>
                  ) : (
                    <span className="text-amber-400 italic text-2xs flex items-center gap-0.5">
                      <AlertTriangle size={10} /> Location unavailable
                    </span>
                  )}
                </td>

                {/* 10. Distance */}
                <td className="text-right">
                  {item.estimated_distance_km !== null 
                    ? `${item.estimated_distance_km} km` 
                    : <span className="text-dim">—</span>}
                </td>

                {/* 11. Estimated Cost */}
                <td className="text-right font-mono">
                  {item.estimated_pickup_cost !== null 
                    ? `₹${item.estimated_pickup_cost}` 
                    : <span className="text-dim">—</span>}
                </td>

                {/* 12. Estimated CO2 */}
                <td className="text-right text-emerald-300 font-mono">
                  {item.estimated_co2_kg !== null 
                    ? `${item.estimated_co2_kg} kg` 
                    : <span className="text-dim">—</span>}
                </td>

                {/* 13. Preferred Date */}
                <td>
                  <span className="text-dim">
                    {item.returnRecord?.pickup?.preferred_date || 'Standard slot'}
                  </span>
                </td>

                {/* 14. SLA Status */}
                <td>
                  {getSlaBadge(item.sla_status)}
                </td>

                {/* 15. Pickup Status */}
                <td>
                  {getStatusBadge(item.operational_status)}
                </td>

                {/* 16. Action */}
                <td className="text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    {isEligible && item.operational_status === 'READY' && (
                      <button
                        type="button"
                        className="btn-primary btn-xs flex items-center gap-1"
                        onClick={() => onScheduleCase(item)}
                        title="Schedule driver and vehicle for pickup"
                      >
                        <Calendar size={11} /> Schedule
                      </button>
                    )}

                    <button
                      type="button"
                      className="btn-ghost btn-xs flex items-center gap-1"
                      onClick={() => onSelectCase(item.return_id)}
                      title="Open case detail workspace"
                    >
                      <Eye size={11} /> Details
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
