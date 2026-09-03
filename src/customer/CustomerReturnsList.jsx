import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Clock, 
  Camera, 
  ArrowRight, 
  PlusCircle,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { getCustomerReturns } from '../services/customerPortalService.js';
import { subscribeRealtime } from '../utils/realtimeBus.js';

export default function CustomerReturnsList({
  activeCustomer,
  onNavigate,
  onSelectReturn
}) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [returns, setReturns] = useState(() => getCustomerReturns(activeCustomer.id));

  React.useEffect(() => {
    const refresh = () => setReturns(getCustomerReturns(activeCustomer.id));
    refresh();
    return subscribeRealtime('*', refresh);
  }, [activeCustomer.id]);

  const filtered = returns.filter(r => {
    const matchesSearch = !search || 
      r.returnId.toLowerCase().includes(search.toLowerCase()) || 
      r.productName.toLowerCase().includes(search.toLowerCase()) ||
      r.orderId.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = filterStatus === 'ALL' || 
      (filterStatus === 'REVIEW' && (r.customerStatus === 'Under Review' || r.customerStatus === 'Submitted')) ||
      (filterStatus === 'PICKUP' && (r.customerStatus === 'Pickup Scheduled' || r.customerStatus === 'Return Approved')) ||
      (filterStatus === 'COMPLETED' && r.customerStatus === 'Product Picked Up');

    return matchesSearch && matchesFilter;
  });

  const getStatusBadgeClass = (status) => {
    if (status === 'Product Picked Up') return 'crl-badge-success';
    if (status === 'Pickup Scheduled' || status === 'Return Approved') return 'crl-badge-info';
    if (status === 'Under Review' || status === 'Submitted') return 'crl-badge-warning';
    return 'crl-badge-default';
  };

  return (
    <div className="crl-root">
      {/* Header */}
      <div className="crl-header">
        <div>
          <h1 className="crl-title">My Return Requests</h1>
          <p className="crl-subtitle">
            View claim progress, upload defect evidence, and check pickup windows
          </p>
        </div>

        <button
          type="button"
          className="crl-new-btn"
          onClick={() => onNavigate('new')}
        >
          <PlusCircle size={15} />
          <span>New Return</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="crl-toolbar">
        <div className="crl-search-wrap">
          <Search size={16} className="crl-search-icon" />
          <input
            type="text"
            placeholder="Search by Return ID, Order, or Product..."
            className="crl-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="crl-filter-pills">
          {[
            { id: 'ALL', label: 'All Claims', count: returns.length },
            { id: 'REVIEW', label: 'Under Review', count: returns.filter(r => r.customerStatus === 'Under Review' || r.customerStatus === 'Submitted').length },
            { id: 'PICKUP', label: 'Pickups', count: returns.filter(r => r.customerStatus === 'Pickup Scheduled' || r.customerStatus === 'Return Approved').length },
            { id: 'COMPLETED', label: 'Completed', count: returns.filter(r => r.customerStatus === 'Product Picked Up').length }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`crl-filter-pill ${filterStatus === tab.id ? 'crl-filter-pill-active' : ''}`}
              onClick={() => setFilterStatus(tab.id)}
            >
              <span>{tab.label}</span>
              <span className="crl-filter-count">{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Returns List */}
      <div className="crl-list">
        {filtered.length === 0 ? (
          <div className="crl-empty">
            <Package size={36} className="crl-empty-icon" />
            <h3 className="crl-empty-title">No matching return claims found</h3>
            <p className="crl-empty-desc">Try clearing your search query or selecting another filter category.</p>
            {search && (
              <button 
                type="button" 
                className="crl-empty-action" 
                onClick={() => { setSearch(''); setFilterStatus('ALL'); }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          filtered.map(ret => (
            <div key={ret.returnId} className="crl-card">
              {/* Card Header */}
              <div className="crl-card-header">
                <div className="crl-card-header-left">
                  <span className="crl-return-id">{ret.returnId}</span>
                  <span className={`crl-status-badge ${getStatusBadgeClass(ret.customerStatus)}`}>
                    {ret.customerStatus}
                  </span>
                </div>
                <div className="crl-card-date">
                  <Calendar size={13} />
                  <span>Submitted on {new Date(ret.submittedDate).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Card Body - 3 Columns */}
              <div className="crl-card-body">
                {/* Col 1: Product info */}
                <div className="crl-col">
                  <span className="crl-col-label">Product Name</span>
                  <div className="crl-product-name">{ret.productName}</div>
                  <div className="crl-order-tag">Order: {ret.orderId}</div>
                </div>

                {/* Col 2: Reason & Condition */}
                <div className="crl-col">
                  <span className="crl-col-label">Reported Reason</span>
                  <div className="crl-reason-text">{ret.returnReason}</div>
                  <div className="crl-condition-tag">Condition: {ret.condition || 'Inspected'}</div>
                </div>

                {/* Col 3: Next Step */}
                <div className="crl-col">
                  <span className="crl-col-label">Next Operational Step</span>
                  <div className="crl-nextstep-text">{ret.nextStep}</div>
                  <div className="crl-status-desc">{ret.statusDescription || 'Your return claim has been registered in our system.'}</div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="crl-card-footer">
                <div className="crl-footer-actions">
                  <button
                    type="button"
                    className="crl-btn-ghost"
                    onClick={() => {
                      onSelectReturn(ret.returnId);
                      onNavigate('evidence');
                    }}
                  >
                    <Camera size={14} />
                    <span>Upload Photos</span>
                  </button>
                  <button
                    type="button"
                    className="crl-btn-primary"
                    onClick={() => {
                      onSelectReturn(ret.returnId);
                      onNavigate('status');
                    }}
                  >
                    <Clock size={14} />
                    <span>View Timeline &amp; Pickup</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
