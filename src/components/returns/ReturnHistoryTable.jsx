import React, { useState } from 'react';
import StatusBadge from '../common/StatusBadge';
import EmptyState from '../common/EmptyState';
import ReturnFilters from './ReturnFilters';
import ReturnHistoryDetailModal from './ReturnHistoryDetailModal';
import { RotateCcw, ArrowUpDown, Image as ImageIcon, ExternalLink, Eye } from 'lucide-react';

export default function ReturnHistoryTable({ returns = [], onSelectReturn }) {
  const [outcomeFilter, setOutcomeFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('return_date');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedReturnDetail, setSelectedReturnDetail] = useState(null);

  // Filter returns
  const filteredReturns = returns.filter((item) => {
    // Outcome Filter
    if (outcomeFilter !== 'All') {
      const outcome = (item.outcome || '').toLowerCase();
      if (outcome !== outcomeFilter.toLowerCase()) return false;
    }

    // Category Filter
    if (categoryFilter !== 'All') {
      const cat = (item.category || item.order?.category || '').toLowerCase();
      if (cat !== categoryFilter.toLowerCase()) return false;
    }

    // Search Query
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const matchRetId = (item.return_id || '').toLowerCase().includes(q);
      const matchOrdId = (item.order_id || item.order?.order_id || '').toLowerCase().includes(q);
      const matchProduct = (item.product || item.order?.product_name || '').toLowerCase().includes(q);
      const matchReason = (item.reason || item.return?.reason || '').toLowerCase().includes(q);
      if (!matchRetId && !matchOrdId && !matchProduct && !matchReason) return false;
    }

    return true;
  });

  // Sort returns
  const sortedReturns = [...filteredReturns].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (sortField === 'return_date') {
      valA = new Date(valA || a.created_at || '1970-01-01').getTime();
      valB = new Date(valB || b.created_at || '1970-01-01').getTime();
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

  const handleViewDetail = (item) => {
    if (onSelectReturn) {
      onSelectReturn(item);
    } else {
      setSelectedReturnDetail(item);
    }
  };

  return (
    <div className="history-table-wrapper">
      <div className="section-header-row">
        <div>
          <h3 className="section-subheading-serif">Previous Return History</h3>
          <p className="section-subtext">Verified past return claims, damage inspection notes, and confirmed historical outcomes</p>
        </div>
      </div>

      <ReturnFilters
        outcomeFilter={outcomeFilter}
        onOutcomeChange={setOutcomeFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalCount={returns.length}
        filteredCount={sortedReturns.length}
      />

      {sortedReturns.length === 0 ? (
        <EmptyState
          icon={RotateCcw}
          title="No Return History"
          message={returns.length === 0 ? "This customer has not submitted any previous return requests." : "No returns match the selected outcome and category filters."}
          actionText={returns.length > 0 ? "Reset Filters" : undefined}
          onAction={() => {
            setOutcomeFilter('All');
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
                  <th onClick={() => handleSort('return_id')} className="sortable-th">
                    <div className="th-content">Return ID <ArrowUpDown size={12} /></div>
                  </th>
                  <th>Order ID</th>
                  <th>Product</th>
                  <th>Return Reason</th>
                  <th onClick={() => handleSort('return_date')} className="sortable-th">
                    <div className="th-content">Return Date <ArrowUpDown size={12} /></div>
                  </th>
                  <th>Condition</th>
                  <th>Evidence</th>
                  <th>Confirmed Outcome</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedReturns.map((item) => (
                  <tr key={item.return_id} className="data-table-row">
                    <td className="cell-highlight-id font-serif-id">{item.return_id}</td>
                    <td className="cell-order-link">{item.order_id || item.order?.order_id || '—'}</td>
                    <td className="cell-product">
                      <span className="product-name-cell">{item.product || item.order?.product_name || '—'}</span>
                      <span className="product-cat-sub">{item.category || item.order?.category}</span>
                    </td>
                    <td className="cell-reason">{item.reason || item.return?.reason || '—'}</td>
                    <td className="cell-date">{formatDate(item.return_date || item.created_at)}</td>
                    <td>
                      <span className="condition-cell-text">{item.condition || item.return?.condition || '—'}</span>
                    </td>
                    <td>
                      <span className="evidence-pill">
                        <ImageIcon size={12} /> {item.evidence_count || item.evidence?.length || (item.evidence_images ? item.evidence_images.length : 0)} files
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={item.outcome || 'Pending'} type="outcome" size="small" />
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        onClick={() => handleViewDetail(item)}
                        className="btn-table-action"
                        title="View full historical return record"
                      >
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="mobile-card-list">
            {sortedReturns.map((item) => (
              <div key={item.return_id} className="mobile-record-card">
                <div className="mobile-card-top">
                  <span className="cell-highlight-id font-serif-id">{item.return_id}</span>
                  <StatusBadge status={item.outcome || 'Pending'} type="outcome" size="small" />
                </div>
                <div className="mobile-product-title">{item.product || item.order?.product_name || '—'}</div>
                <div className="mobile-card-details-grid">
                  <div className="mobile-detail-item">
                    <span className="mobile-label">Order:</span>
                    <span>{item.order_id || item.order?.order_id || '—'}</span>
                  </div>
                  <div className="mobile-detail-item">
                    <span className="mobile-label">Reason:</span>
                    <span>{item.reason || item.return?.reason || '—'}</span>
                  </div>
                  <div className="mobile-detail-item">
                    <span className="mobile-label">Return Date:</span>
                    <span>{formatDate(item.return_date || item.created_at)}</span>
                  </div>
                  <div className="mobile-detail-item">
                    <span className="mobile-label">Evidence:</span>
                    <span className="evidence-pill">
                      <ImageIcon size={11} /> {item.evidence_count || item.evidence?.length || 0}
                    </span>
                  </div>
                </div>
                <div className="mobile-card-actions">
                  <button
                    type="button"
                    onClick={() => handleViewDetail(item)}
                    className="btn-secondary btn-sm w-full"
                  >
                    <Eye size={14} /> View Return Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Internal Modal when not handled externally */}
      {selectedReturnDetail && (
        <ReturnHistoryDetailModal
          returnItem={selectedReturnDetail}
          onClose={() => setSelectedReturnDetail(null)}
        />
      )}
    </div>
  );
}
