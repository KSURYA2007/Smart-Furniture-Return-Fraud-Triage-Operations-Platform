import React, { useState, useEffect } from 'react';
import ReviewQueueTable from '../components/review/ReviewQueueTable.jsx';
import ReviewFilters from '../components/review/ReviewFilters.jsx';
import { buildReviewQueue } from '../services/reviewService.js';
import { getAllReturns, getAllStoredReviews } from '../utils/storage.js';
import { subscribeRealtime } from '../utils/realtimeBus.js';
import { 
  UserCheck, 
  ShieldAlert, 
  CheckCircle2, 
  Layers, 
  Clock, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function ReviewQueue({ onSelectCase, greeting }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [reviewerFilter, setReviewerFilter] = useState('ALL');
  const [queueTab, setQueueTab] = useState('PRIMARY'); // 'PRIMARY' | 'PENDING' | 'RESOLVED' | 'ALL'

  const [queueCases, setQueueCases] = useState([]);
  const [queueCounts, setQueueCounts] = useState({
    primary: 0,
    pending: 0,
    resolved: 0,
    all: 0
  });

  const loadQueue = () => {
    // 1. Calculate counts across all tabs
    const allCases = buildReviewQueue({ queueTab: 'ALL' });
    const primaryCases = buildReviewQueue({ queueTab: 'PRIMARY' });
    const pendingCases = buildReviewQueue({ queueTab: 'PENDING' });
    const resolvedCases = buildReviewQueue({ queueTab: 'RESOLVED' });

    setQueueCounts({
      all: allCases.length,
      primary: primaryCases.length,
      pending: pendingCases.length,
      resolved: resolvedCases.length
    });

    // 2. Filter current active queue
    const currentList = buildReviewQueue({
      searchQuery,
      riskFilter,
      statusFilter,
      reviewerFilter,
      queueTab
    });

    setQueueCases(currentList);
  };

  useEffect(() => {
    loadQueue();
  }, [searchQuery, riskFilter, statusFilter, reviewerFilter, queueTab]);

  useEffect(() => {
    return subscribeRealtime('*', () => {
      loadQueue();
    });
  }, []);

  return (
    <div className="page-wrapper review-queue-page">
      {/* Page Header */}
      <header className="page-header review-queue-header">
        <div className="header-container">
          <div className="header-badge-row">
            <span className="module-badge">
              <UserCheck size={13} /> Module 5: Human Review & Manual Intervention
            </span>
          </div>
          {greeting && <div className="header-greeting">{greeting}</div>}
          <h1 className="page-title font-serif">Human-in-the-Loop Operations Queue</h1>
          <p className="page-description">
            Inspect prioritized return cases, review multimodal damage evidence, and authorize operational decisions with complete auditability.
          </p>
        </div>

        {/* Header Stats Strip */}
        <div className="queue-header-stats-grid">
          <div className="queue-stat-card">
            <span className="queue-stat-lbl">Action Required (High & Crit)</span>
            <span className="queue-stat-val text-red-400 font-serif">{queueCounts.primary}</span>
            <span className="queue-stat-sub">Prioritized by Risk Engine</span>
          </div>
          <div className="queue-stat-card">
            <span className="queue-stat-lbl">Total Pending Reviews</span>
            <span className="queue-stat-val text-amber-400 font-serif">{queueCounts.pending}</span>
            <span className="queue-stat-sub">Across all risk tiers</span>
          </div>
          <div className="queue-stat-card">
            <span className="queue-stat-lbl">Completed / Decided</span>
            <span className="queue-stat-val text-emerald-400 font-serif">{queueCounts.resolved}</span>
            <span className="queue-stat-sub">Approved / Rejected / Esc.</span>
          </div>
        </div>
      </header>

      {/* Filter and Search Controls */}
      <ReviewFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        riskFilter={riskFilter}
        onRiskFilterChange={setRiskFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        reviewerFilter={reviewerFilter}
        onReviewerFilterChange={setReviewerFilter}
        queueTab={queueTab}
        onQueueTabChange={setQueueTab}
        counts={queueCounts}
      />

      {/* Main Operations Review Queue Table */}
      <div className="review-queue-content">
        <ReviewQueueTable
          cases={queueCases}
          onSelectCase={onSelectCase}
        />
      </div>
    </div>
  );
}
