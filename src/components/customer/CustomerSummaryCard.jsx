import React from 'react';
import { User, Mail, Phone, MapPin, Calendar, CreditCard, ShieldAlert, Award } from 'lucide-react';
import { formatCurrencyINR } from '../../utils/customerHistory';

export default function CustomerSummaryCard({ customer, stats }) {
  if (!customer) return null;

  return (
    <div className="customer-summary-card">
      <div className="customer-avatar-badge">
        <span className="customer-avatar-initials">
          {customer.name ? customer.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'CU'}
        </span>
      </div>

      <div className="customer-info-content">
        <div className="customer-title-row">
          <h2 className="customer-name-heading">{customer.name}</h2>
          <span className="customer-id-tag">{customer.customer_id}</span>
        </div>

        <div className="customer-meta-grid">
          <div className="meta-item">
            <Mail size={14} className="meta-icon" />
            <span>{customer.email}</span>
          </div>
          <div className="meta-item">
            <Phone size={14} className="meta-icon" />
            <span>{customer.phone}</span>
          </div>
          {(customer.city || customer.state) && (
            <div className="meta-item">
              <MapPin size={14} className="meta-icon" />
              <span>{[customer.city, customer.state].filter(Boolean).join(', ')}</span>
            </div>
          )}
          {customer.joined_date && (
            <div className="meta-item">
              <Calendar size={14} className="meta-icon" />
              <span>Customer since {new Date(customer.joined_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
            </div>
          )}
        </div>
      </div>

      <div className="customer-spending-highlight">
        <span className="spending-label">Lifetime Total Spend</span>
        <span className="spending-amount">{formatCurrencyINR(stats?.total_spending || 0)}</span>
        <span className="spending-orders">{stats?.total_orders || 0} lifetime orders</span>
      </div>
    </div>
  );
}
