import React from 'react';
import { 
  ShoppingBag, 
  RotateCcw, 
  XCircle, 
  AlertOctagon, 
  TrendingUp, 
  CreditCard, 
  Calendar,
  Clock
} from 'lucide-react';
import { formatCurrencyINR } from '../../utils/customerHistory';

/**
 * Factual Customer Statistics Cards
 * IMPORTANT: Displays factual counts only, no fraud score or risk calculation.
 */
export default function CustomerStats({ stats }) {
  if (!stats) return null;

  return (
    <div className="customer-stats-grid">
      {/* Total Orders */}
      <div className="stat-card">
        <div className="stat-card-header">
          <span className="stat-label">Total Orders</span>
          <div className="stat-icon-wrap bg-blue-glow">
            <ShoppingBag size={18} className="text-blue" />
          </div>
        </div>
        <div className="stat-value">{stats.total_orders}</div>
        <div className="stat-subtext">
          <span>{stats.total_completed_orders} completed</span>
        </div>
      </div>

      {/* Total Returns */}
      <div className="stat-card">
        <div className="stat-card-header">
          <span className="stat-label">Total Returns</span>
          <div className="stat-icon-wrap bg-amber-glow">
            <RotateCcw size={18} className="text-amber" />
          </div>
        </div>
        <div className="stat-value">{stats.total_returns}</div>
        <div className="stat-subtext">
          <span>{stats.return_rate}% return rate</span>
        </div>
      </div>

      {/* Confirmed Fraud Cases (Factual) */}
      <div className="stat-card">
        <div className="stat-card-header">
          <span className="stat-label">Confirmed Fraud Cases</span>
          <div className="stat-icon-wrap bg-red-glow">
            <AlertOctagon size={18} className="text-red" />
          </div>
        </div>
        <div className="stat-value text-red">{stats.total_confirmed_fraud}</div>
        <div className="stat-subtext">
          <span>{stats.total_genuine_returns} confirmed genuine</span>
        </div>
      </div>

      {/* Cancellations */}
      <div className="stat-card">
        <div className="stat-card-header">
          <span className="stat-label">Cancellations</span>
          <div className="stat-icon-wrap bg-slate-glow">
            <XCircle size={18} className="text-slate" />
          </div>
        </div>
        <div className="stat-value">{stats.total_cancellations}</div>
        <div className="stat-subtext">
          <span>Before dispatch</span>
        </div>
      </div>

      {/* Average Order Value */}
      <div className="stat-card">
        <div className="stat-card-header">
          <span className="stat-label">Avg Order Value</span>
          <div className="stat-icon-wrap bg-emerald-glow">
            <TrendingUp size={18} className="text-emerald" />
          </div>
        </div>
        <div className="stat-value font-serif-stat">{formatCurrencyINR(stats.average_order_value)}</div>
        <div className="stat-subtext">
          <span>Per valid order</span>
        </div>
      </div>

      {/* Total Customer Spending */}
      <div className="stat-card">
        <div className="stat-card-header">
          <span className="stat-label">Total Spending</span>
          <div className="stat-icon-wrap bg-purple-glow">
            <CreditCard size={18} className="text-purple" />
          </div>
        </div>
        <div className="stat-value font-serif-stat">{formatCurrencyINR(stats.total_spending)}</div>
        <div className="stat-subtext">
          <span>Gross value</span>
        </div>
      </div>

      {/* First Order Date */}
      <div className="stat-card">
        <div className="stat-card-header">
          <span className="stat-label">First Order</span>
          <div className="stat-icon-wrap bg-slate-glow">
            <Calendar size={18} className="text-slate" />
          </div>
        </div>
        <div className="stat-value stat-value-sm">
          {stats.first_order_date ? new Date(stats.first_order_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
        </div>
        <div className="stat-subtext">
          <span>Initial purchase</span>
        </div>
      </div>

      {/* Most Recent Order Date */}
      <div className="stat-card">
        <div className="stat-card-header">
          <span className="stat-label">Recent Order</span>
          <div className="stat-icon-wrap bg-blue-glow">
            <Clock size={18} className="text-blue" />
          </div>
        </div>
        <div className="stat-value stat-value-sm">
          {stats.most_recent_order_date ? new Date(stats.most_recent_order_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
        </div>
        <div className="stat-subtext">
          <span>{stats.days_since_last_order !== null ? `${stats.days_since_last_order} days ago` : 'No orders'}</span>
        </div>
      </div>
    </div>
  );
}
