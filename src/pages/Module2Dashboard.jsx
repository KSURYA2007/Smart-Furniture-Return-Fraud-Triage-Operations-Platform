import React, { useState, useEffect } from 'react';
import CustomerSearch from '../components/customer/CustomerSearch';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import ReturnHistoryDetailModal from '../components/returns/ReturnHistoryDetailModal';
import { 
  getAllCustomers, 
  getAllOrders, 
  getAllReturns, 
  searchReturns, 
  resetToSeedData 
} from '../utils/storage';
import { calculateSystemSummary, formatCurrencyINR } from '../utils/customerHistory';
import { subscribeRealtime } from '../utils/realtimeBus';
import { 
  Users, 
  ShoppingBag, 
  RotateCcw, 
  AlertOctagon, 
  Search, 
  ArrowRight, 
  Eye, 
  UserCheck, 
  RefreshCw, 
  Layers, 
  Sparkles,
  TrendingUp,
  FileText,
  Clock
} from 'lucide-react';

export default function Module2Dashboard({ onSelectCustomer, onSelectReturn, onAnalyzeEvidence, greeting }) {
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [summary, setSummary] = useState(null);
  
  // Return search state
  const [returnSearchQuery, setReturnSearchQuery] = useState('');
  const [filteredReturns, setFilteredReturns] = useState([]);
  
  // Active modal
  const [activeModalReturn, setActiveModalReturn] = useState(null);
  const [showResetNotice, setShowResetNotice] = useState(false);

  useEffect(() => {
    loadData();
    return subscribeRealtime('*', () => {
      loadData();
    });
  }, []);

  const loadData = () => {
    const custs = getAllCustomers();
    const ords = getAllOrders();
    const rets = getAllReturns();
    
    setCustomers(custs);
    setOrders(ords);
    setReturns(rets);
    setFilteredReturns(rets);
    setSummary(calculateSystemSummary(custs, ords, rets));
  };

  const handleReturnSearch = (query) => {
    setReturnSearchQuery(query);
    if (!query || !query.trim()) {
      setFilteredReturns(returns);
    } else {
      const matches = searchReturns(query);
      setFilteredReturns(matches);
    }
  };

  const handleResetSeed = () => {
    if (window.confirm('Reset all customers, orders, and returns to initial seed dataset?')) {
      resetToSeedData();
      loadData();
      setShowResetNotice(true);
      setTimeout(() => setShowResetNotice(false), 3000);
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
    <div className="page-wrapper module2-dashboard">
      {/* Dashboard Page Header */}
      <header className="page-header">
        <div className="header-container">
          <div className="header-badge-row">
            <span className="module-badge">
              <Layers size={13} /> Module 2: Customer & Order History
            </span>
          </div>
          {greeting && <div className="header-greeting">{greeting}</div>}
          <h1 className="page-title">Customer & Order History Hub</h1>
          <p className="page-description">
            Explore customer account profiles, lifetime order history, and previous return outcomes for complete context.
          </p>
        </div>

        <div className="demo-actions-bar">
          <button
            type="button"
            onClick={handleResetSeed}
            className="btn-secondary btn-sm"
            title="Reset storage to default 16 customers and 56 orders"
          >
            <RefreshCw size={14} /> Reset Seed Data
          </button>
        </div>
      </header>

      {showResetNotice && (
        <div className="reset-notification-toast">
          <Sparkles size={16} /> Initial seed data refreshed successfully (16 customers, 56 orders, 24 returns).
        </div>
      )}

      {/* 1. OPERATIONS SUMMARY CARDS (Factual descriptive stats only) */}
      {summary && (
        <section className="dashboard-summary-cards-section" aria-labelledby="summary-heading">
          <div className="summary-grid-4col">
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-label">Total Customers</span>
                <div className="stat-icon-wrap bg-blue-glow">
                  <Users size={18} className="text-blue" />
                </div>
              </div>
              <div className="stat-value">{summary.total_customers}</div>
              <div className="stat-subtext">Active accounts</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-label">Total Orders</span>
                <div className="stat-icon-wrap bg-purple-glow">
                  <ShoppingBag size={18} className="text-purple" />
                </div>
              </div>
              <div className="stat-value">{summary.total_orders}</div>
              <div className="stat-subtext">{formatCurrencyINR(summary.total_revenue)} revenue</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-label">Total Returns</span>
                <div className="stat-icon-wrap bg-amber-glow">
                  <RotateCcw size={18} className="text-amber" />
                </div>
              </div>
              <div className="stat-value">{summary.total_returns}</div>
              <div className="stat-subtext">{summary.total_genuine_returns} genuine outcomes</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-label">Confirmed Fraud Outcomes</span>
                <div className="stat-icon-wrap bg-red-glow">
                  <AlertOctagon size={18} className="text-red" />
                </div>
              </div>
              <div className="stat-value text-red">{summary.total_confirmed_fraud}</div>
              <div className="stat-subtext">Historical verified cases</div>
            </div>
          </div>
        </section>
      )}

      {/* 2. SEARCH WORKSPACE */}
      <section className="search-workspace-card form-card">
        <div className="card-header">
          <div className="card-header-icon">
            <Search size={20} className="icon-blue" />
          </div>
          <div>
            <h2 className="card-title">Search Directory</h2>
            <p className="card-subtitle">Quickly look up customer profiles or historical return claims</p>
          </div>
        </div>

        <div className="search-grid-2col">
          {/* Customer Search Box */}
          <div className="search-column-box">
            <label className="form-label mb-1.5 flex items-center gap-1.5">
              <Users size={14} className="text-blue" /> Search Customer Profile
            </label>
            <CustomerSearch
              onSelectCustomer={(c) => onSelectCustomer(c.customer_id)}
              placeholder="e.g. CUS-1024, John Smith, john@example.com..."
            />
            <span className="search-helper-text">
              Try searching: <code>CUS-1024</code>, <code>Priya</code>, <code>rahul.v@example.com</code>
            </span>
          </div>

          {/* Return Search Box */}
          <div className="search-column-box">
            <label className="form-label mb-1.5 flex items-center gap-1.5">
              <RotateCcw size={14} className="text-amber" /> Search Return Records
            </label>
            <div className="search-input-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                className="search-input"
                value={returnSearchQuery}
                onChange={(e) => handleReturnSearch(e.target.value)}
                placeholder="Search by Return ID (e.g. RET-2024-001021), Order ID, Product..."
              />
            </div>
            <span className="search-helper-text">
              Try searching: <code>RET-2024-001021</code>, <code>ORD-1003</code>, <code>Sofa</code>
            </span>
          </div>
        </div>
      </section>

      {/* 3. CUSTOMER DIRECTORY */}
      <section className="directory-section form-card">
        <div className="card-header">
          <div className="card-header-icon">
            <UserCheck size={20} className="icon-blue" />
          </div>
          <div className="card-header-flex">
            <div>
              <h2 className="card-title">Customer Directory</h2>
              <p className="card-subtitle">Select any customer to open their complete historical profile & statistics</p>
            </div>
            <span className="badge-count">{customers.length} Customers</span>
          </div>
        </div>

        <div className="customer-cards-grid">
          {customers.map((c) => (
            <div
              key={c.customer_id}
              className="customer-directory-card"
              onClick={() => onSelectCustomer(c.customer_id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelectCustomer(c.customer_id)}
            >
              <div className="cust-dir-top">
                <div className="cust-dir-avatar">
                  {c.name ? c.name[0].toUpperCase() : 'C'}
                </div>
                <span className="cust-dir-id">{c.customer_id}</span>
              </div>
              <h4 className="cust-dir-name">{c.name}</h4>
              <p className="cust-dir-email">{c.email}</p>
              <div className="cust-dir-bottom">
                <span className="cust-dir-city">{c.city || 'India'}</span>
                <span className="cust-dir-action">
                  View Profile <ArrowRight size={13} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. HISTORICAL RETURNS REPOSITORY */}
      <section className="returns-repository-section form-card">
        <div className="card-header">
          <div className="card-header-icon">
            <RotateCcw size={20} className="icon-blue" />
          </div>
          <div className="card-header-flex">
            <div>
              <h2 className="card-title">Recent Returns Repository</h2>
              <p className="card-subtitle">All historical intake cases with confirmed outcomes</p>
            </div>
            <span className="badge-count">{filteredReturns.length} Records</span>
          </div>
        </div>

        {filteredReturns.length === 0 ? (
          <EmptyState
            icon={RotateCcw}
            title="No Returns Found"
            message={`No return requests matched "${returnSearchQuery}".`}
            actionText="Clear Search"
            onAction={() => handleReturnSearch('')}
          />
        ) : (
          <div className="table-responsive-container">
            <table className="custom-data-table">
              <thead>
                <tr>
                  <th>Return ID</th>
                  <th>Customer</th>
                  <th>Order ID</th>
                  <th>Product</th>
                  <th>Return Date</th>
                  <th>Confirmed Outcome</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReturns.slice(0, 10).map((r) => (
                  <tr key={r.return_id} className="data-table-row">
                    <td className="cell-highlight-id font-serif-id">{r.return_id}</td>
                    <td>
                      <button
                        type="button"
                        className="customer-link-btn"
                        onClick={() => onSelectCustomer(r.customer_id || r.customer?.customer_id)}
                      >
                        {r.customer_name || r.customer?.name || r.customer_id || 'Customer'}
                      </button>
                    </td>
                    <td className="cell-order-link">{r.order_id || r.order?.order_id || '—'}</td>
                    <td>{r.product || r.order?.product_name || '—'}</td>
                    <td className="cell-date">{formatDate(r.return_date || r.created_at)}</td>
                    <td>
                      <StatusBadge status={r.outcome || 'Pending'} type="outcome" size="small" />
                    </td>
                    <td className="text-right">
                      <div className="flex gap-1.5 justify-end flex-wrap">
                        {onAnalyzeEvidence && (
                          <button
                            type="button"
                            onClick={() => onAnalyzeEvidence(r.return_id)}
                            className="btn-table-action btn-table-primary"
                            title="Analyze evidence in Module 3"
                          >
                            <Layers size={13} /> Evidence
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setActiveModalReturn(r)}
                          className="btn-table-action"
                          title="View return details"
                        >
                          <Eye size={13} /> Details
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectCustomer(r.customer_id || r.customer?.customer_id)}
                          className="btn-table-action"
                          title="Open customer profile"
                        >
                          Profile
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Return Detail Modal */}
      {activeModalReturn && (
        <ReturnHistoryDetailModal
          returnItem={activeModalReturn}
          onClose={() => setActiveModalReturn(null)}
          onAnalyzeEvidence={onAnalyzeEvidence}
        />
      )}
    </div>
  );
}
