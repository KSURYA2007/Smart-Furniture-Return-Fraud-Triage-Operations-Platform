import React, { useState } from 'react';
import StatusBadge from '../common/StatusBadge';
import EmptyState from '../common/EmptyState';
import OrderFilters from './OrderFilters';
import { formatCurrencyINR } from '../../utils/customerHistory';
import { ShoppingBag, ArrowUpDown, Calendar, Package } from 'lucide-react';

export default function OrderHistoryTable({ orders = [] }) {
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('order_date');
  const [sortAsc, setSortAsc] = useState(false);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    // Status Filter
    if (statusFilter !== 'All') {
      const status = (order.order_status || order.outcome || '').toLowerCase();
      if (statusFilter.toLowerCase() === 'completed' && status !== 'completed') return false;
      if (statusFilter.toLowerCase() === 'returned' && (order.return_status || '').toLowerCase() !== 'returned') return false;
      if (statusFilter.toLowerCase() === 'cancelled' && status !== 'cancelled') return false;
    }

    // Category Filter
    if (categoryFilter !== 'All') {
      if ((order.category || '').toLowerCase() !== categoryFilter.toLowerCase()) return false;
    }

    // Search Query
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const matchId = (order.order_id || '').toLowerCase().includes(q);
      const matchProduct = (order.product_name || '').toLowerCase().includes(q);
      if (!matchId && !matchProduct) return false;
    }

    return true;
  });

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (sortField === 'price') {
      valA = Number(valA) || 0;
      valB = Number(valB) || 0;
    } else if (sortField === 'order_date' || sortField === 'delivery_date') {
      valA = new Date(valA || '1970-01-01').getTime();
      valB = new Date(valB || '1970-01-01').getTime();
    } else {
      valA = (valA || '').toString().toLowerCase();
      valB = (valB || '').toString().toLowerCase();
    }

    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="history-table-wrapper">
      <div className="section-header-row">
        <div>
          <h3 className="section-subheading-serif">Order History</h3>
          <p className="section-subtext">Complete chronological list of purchases, delivery conditions, and return outcomes</p>
        </div>
      </div>

      <OrderFilters
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalCount={orders.length}
        filteredCount={sortedOrders.length}
      />

      {sortedOrders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No Orders Found"
          message={orders.length === 0 ? "This customer has no historical orders recorded." : "No orders match the selected filters."}
          actionText={orders.length > 0 ? "Reset Filters" : undefined}
          onAction={() => {
            setStatusFilter('All');
            setCategoryFilter('All');
            setSearchQuery('');
          }}
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="table-responsive-container desktop-table-view">
            <table className="custom-data-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('order_id')} className="sortable-th">
                    <div className="th-content">Order ID <ArrowUpDown size={12} /></div>
                  </th>
                  <th onClick={() => handleSort('product_name')} className="sortable-th">
                    <div className="th-content">Product <ArrowUpDown size={12} /></div>
                  </th>
                  <th>Category</th>
                  <th onClick={() => handleSort('price')} className="sortable-th text-right">
                    <div className="th-content justify-end">Order Value <ArrowUpDown size={12} /></div>
                  </th>
                  <th onClick={() => handleSort('order_date')} className="sortable-th">
                    <div className="th-content">Order Date <ArrowUpDown size={12} /></div>
                  </th>
                  <th>Delivery Date</th>
                  <th>Condition</th>
                  <th>Return Status</th>
                  <th>Outcome</th>
                </tr>
              </thead>
              <tbody>
                {sortedOrders.map((order) => (
                  <tr key={order.order_id} className="data-table-row">
                    <td className="cell-highlight-id">{order.order_id}</td>
                    <td className="cell-product">
                      <span className="product-name-cell">{order.product_name}</span>
                    </td>
                    <td>
                      <span className="category-pill">{order.category}</span>
                    </td>
                    <td className="text-right font-semibold text-primary-light">
                      {formatCurrencyINR(order.price)}
                    </td>
                    <td className="cell-date">{formatDate(order.order_date)}</td>
                    <td className="cell-date">{formatDate(order.delivery_date)}</td>
                    <td>
                      <span className="condition-cell-text">{order.condition || '—'}</span>
                    </td>
                    <td>
                      <StatusBadge status={order.return_status} type="return" size="small" />
                    </td>
                    <td>
                      <StatusBadge status={order.outcome} type="outcome" size="small" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="mobile-card-list">
            {sortedOrders.map((order) => (
              <div key={order.order_id} className="mobile-record-card">
                <div className="mobile-card-top">
                  <span className="cell-highlight-id">{order.order_id}</span>
                  <StatusBadge status={order.outcome} type="outcome" size="small" />
                </div>
                <div className="mobile-product-title">{order.product_name}</div>
                <div className="mobile-card-details-grid">
                  <div className="mobile-detail-item">
                    <span className="mobile-label">Category:</span>
                    <span>{order.category}</span>
                  </div>
                  <div className="mobile-detail-item">
                    <span className="mobile-label">Value:</span>
                    <span className="font-semibold text-primary-light">{formatCurrencyINR(order.price)}</span>
                  </div>
                  <div className="mobile-detail-item">
                    <span className="mobile-label">Order Date:</span>
                    <span>{formatDate(order.order_date)}</span>
                  </div>
                  <div className="mobile-detail-item">
                    <span className="mobile-label">Delivery:</span>
                    <span>{formatDate(order.delivery_date)}</span>
                  </div>
                  <div className="mobile-detail-item">
                    <span className="mobile-label">Condition:</span>
                    <span>{order.condition || '—'}</span>
                  </div>
                  <div className="mobile-detail-item">
                    <span className="mobile-label">Return Status:</span>
                    <StatusBadge status={order.return_status} type="return" size="small" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
