import React, { useState, useEffect } from 'react';
import CustomerSummaryCard from '../components/customer/CustomerSummaryCard';
import CustomerStats from '../components/customer/CustomerStats';
import OrderHistoryTable from '../components/orders/OrderHistoryTable';
import ReturnHistoryTable from '../components/returns/ReturnHistoryTable';
import ReturnHistoryDetailModal from '../components/returns/ReturnHistoryDetailModal';
import EmptyState from '../components/common/EmptyState';
import { calculateCustomerHistoryStats } from '../utils/customerHistory';
import { getCustomerById } from '../utils/storage';
import { 
  ArrowLeft, 
  User, 
  Layers, 
  Sparkles, 
  FileText, 
  ShieldAlert, 
  Package, 
  RotateCcw,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';

export default function CustomerProfile({ customerId, currentReturnContext, onBack, onNavigateReturn }) {
  const [stats, setStats] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCustomerData();
  }, [customerId]);

  const loadCustomerData = () => {
    setLoading(true);
    setError(null);
    try {
      if (!customerId) {
        setError('No Customer ID provided.');
        setLoading(false);
        return;
      }
      const data = calculateCustomerHistoryStats(customerId);
      if (!data.customer && (!data.orders || data.orders.length === 0)) {
        // If customer ID doesn't exist in seed data, build a fallback profile object
        const fallbackCustomer = {
          customer_id: customerId,
          name: currentReturnContext?.customer?.name || 'Customer Account',
          email: currentReturnContext?.customer?.email || 'N/A',
          phone: currentReturnContext?.customer?.phone || 'N/A',
          joined_date: new Date().toISOString().split('T')[0]
        };
        data.customer = fallbackCustomer;
      }
      setStats(data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading customer history:', err);
      setError('Unable to load customer history. Please try again.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper customer-profile-page">
        <div className="loading-state-box">
          <div className="spinner-icon mb-3" />
          <p className="loading-text">Loading customer & order history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper customer-profile-page">
        <div className="error-state-box">
          <AlertCircle size={36} className="text-red mb-2" />
          <h3>Unable to load customer history</h3>
          <p className="text-muted mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button type="button" onClick={loadCustomerData} className="btn-primary">
              Try Again
            </button>
            {onBack && (
              <button type="button" onClick={onBack} className="btn-secondary">
                <ArrowLeft size={15} /> Back
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper customer-profile-page">
      {/* Top Navigation & Breadcrumbs */}
      <div className="profile-top-bar">
        {onBack && (
          <button type="button" onClick={onBack} className="btn-back-link">
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
        )}
        <div className="module-badge">
          <Layers size={13} /> Module 2: Customer & Order History
        </div>
      </div>

      {/* Customer Summary Banner */}
      <CustomerSummaryCard customer={stats.customer} stats={stats} />

      {/* CURRENT RETURN CONTEXT (If navigating from Module 1 Return Request) */}
      {currentReturnContext && (
        <section className="current-return-context-card" aria-labelledby="current-return-title">
          <div className="context-card-header">
            <div className="flex items-center gap-2">
              <div className="context-pulse-indicator" />
              <h3 id="current-return-title" className="context-card-title">
                Current Return Request Context
              </h3>
            </div>
            <span className="context-badge-id font-serif-id">
              {currentReturnContext.return_id}
            </span>
          </div>

          <div className="context-grid">
            <div className="context-item">
              <span className="context-label">Product Name</span>
              <span className="context-val font-semibold">
                {currentReturnContext.order?.product_name || currentReturnContext.product || '—'}
              </span>
            </div>
            <div className="context-item">
              <span className="context-label">Claim Reason</span>
              <span className="context-val">
                {currentReturnContext.return?.reason || currentReturnContext.reason || '—'}
              </span>
            </div>
            <div className="context-item">
              <span className="context-label">Product Condition</span>
              <span className="context-val">
                {currentReturnContext.return?.condition || currentReturnContext.condition || '—'}
              </span>
            </div>
            <div className="context-item">
              <span className="context-label">Evidence Uploaded</span>
              <span className="context-val flex items-center gap-1.5 text-primary-light">
                <ImageIcon size={14} /> 
                {currentReturnContext.evidence?.length || currentReturnContext.evidence_count || 0} Photos
              </span>
            </div>
          </div>
          <div className="context-footer-note">
            <span>Historical summary below provides factual context for this intake request.</span>
          </div>
        </section>
      )}

      {/* Factual Statistics Section */}
      <section className="profile-section" aria-labelledby="stats-heading">
        <div className="section-title-wrap">
          <h3 id="stats-heading" className="section-subheading-serif">Customer Statistics</h3>
          <p className="section-subtext">Verified factual metrics aggregated across lifetime account activity</p>
        </div>
        <CustomerStats stats={stats} />
      </section>

      {/* Order History Section */}
      <section className="profile-section" aria-labelledby="orders-heading">
        <OrderHistoryTable orders={stats.orders} />
      </section>

      {/* Previous Return History Section */}
      <section className="profile-section" aria-labelledby="returns-heading">
        <ReturnHistoryTable 
          returns={stats.returns} 
          onSelectReturn={(ret) => setSelectedReturn(ret)}
        />
      </section>

      {/* Modal for viewing detailed past return record */}
      {selectedReturn && (
        <ReturnHistoryDetailModal
          returnItem={selectedReturn}
          onClose={() => setSelectedReturn(null)}
        />
      )}
    </div>
  );
}
