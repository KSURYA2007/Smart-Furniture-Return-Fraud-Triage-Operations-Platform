import React from 'react';
import { Search, Filter, X, ShieldAlert, Layers, CheckCircle2, RotateCcw } from 'lucide-react';

export default function ReviewFilters({
  searchQuery,
  onSearchChange,
  riskFilter,
  onRiskFilterChange,
  statusFilter,
  onStatusFilterChange,
  reviewerFilter,
  onReviewerFilterChange,
  queueTab,
  onQueueTabChange,
  counts = {}
}) {
  const hasActiveFilters = searchQuery || riskFilter !== 'ALL' || statusFilter !== 'ALL' || reviewerFilter !== 'ALL';

  const handleClearFilters = () => {
    onSearchChange('');
    onRiskFilterChange('ALL');
    onStatusFilterChange('ALL');
    onReviewerFilterChange('ALL');
  };

  return (
    <div className="review-filters-card form-card mb-4">
      {/* Top Queue Preset Tabs */}
      <div className="review-queue-preset-tabs" role="tablist" aria-label="Review Queue Presets">
        <button
          type="button"
          role="tab"
          aria-selected={queueTab === 'PRIMARY'}
          className={`queue-preset-tab ${queueTab === 'PRIMARY' ? 'active' : ''}`}
          onClick={() => onQueueTabChange('PRIMARY')}
        >
          <ShieldAlert size={15} className="text-red-400" />
          <span>Primary Queue (High & Critical)</span>
          <span className="preset-count-badge badge-high-count">
            {counts.primary || 0}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={queueTab === 'PENDING'}
          className={`queue-preset-tab ${queueTab === 'PENDING' ? 'active' : ''}`}
          onClick={() => onQueueTabChange('PENDING')}
        >
          <Layers size={15} className="text-amber-400" />
          <span>All Pending Decisions</span>
          <span className="preset-count-badge">
            {counts.pending || 0}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={queueTab === 'RESOLVED'}
          className={`queue-preset-tab ${queueTab === 'RESOLVED' ? 'active' : ''}`}
          onClick={() => onQueueTabChange('RESOLVED')}
        >
          <CheckCircle2 size={15} className="text-emerald-400" />
          <span>Completed / Decided</span>
          <span className="preset-count-badge badge-resolved-count">
            {counts.resolved || 0}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={queueTab === 'ALL'}
          className={`queue-preset-tab ${queueTab === 'ALL' ? 'active' : ''}`}
          onClick={() => onQueueTabChange('ALL')}
        >
          <span>All Returns (All Risk Levels)</span>
          <span className="preset-count-badge">
            {counts.all || 0}
          </span>
        </button>
      </div>

      {/* Main Search & Dropdown Filter Row */}
      <div className="review-filter-inputs-grid">
        {/* Search Input */}
        <div className="filter-search-wrapper">
          <Search size={16} className="search-icon text-dim" />
          <input
            type="text"
            className="filter-input search-input"
            placeholder="Search by Return ID, Customer, Order ID, or Product..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search review cases"
          />
          {searchQuery && (
            <button
              type="button"
              className="btn-clear-search"
              onClick={() => onSearchChange('')}
              title="Clear search query"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Risk Category Filter */}
        <div className="filter-select-group">
          <label htmlFor="risk-select" className="filter-select-label">Risk Category:</label>
          <select
            id="risk-select"
            className="filter-select"
            value={riskFilter}
            onChange={(e) => onRiskFilterChange(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            <option value="CRITICAL">Critical Risk (70–100)</option>
            <option value="HIGH">High Risk (50–69)</option>
            <option value="MEDIUM">Medium Risk (25–49)</option>
            <option value="LOW">Low Risk (0–24)</option>
          </select>
        </div>

        {/* Review Status Filter */}
        <div className="filter-select-group">
          <label htmlFor="status-select" className="filter-select-label">Review Status:</label>
          <select
            id="status-select"
            className="filter-select"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="APPROVED">Approved (Pickup Scheduled)</option>
            <option value="REJECTED">Rejected</option>
            <option value="REQUEST_MORE_EVIDENCE">More Evidence Requested</option>
            <option value="ESCALATED">Escalated to Management</option>
          </select>
        </div>

        {/* Reviewer Role Filter */}
        <div className="filter-select-group">
          <label htmlFor="reviewer-select" className="filter-select-label">Reviewer Role:</label>
          <select
            id="reviewer-select"
            className="filter-select"
            value={reviewerFilter}
            onChange={(e) => onReviewerFilterChange(e.target.value)}
          >
            <option value="ALL">All Roles</option>
            <option value="Dispatcher">Dispatcher</option>
            <option value="Operations Manager">Operations Manager</option>
            <option value="Senior Operations Manager">Senior Operations Manager</option>
          </select>
        </div>

        {/* Reset Filters button */}
        {hasActiveFilters && (
          <button
            type="button"
            className="btn-ghost btn-sm btn-reset-filters"
            onClick={handleClearFilters}
            title="Reset all search filters"
          >
            <RotateCcw size={13} /> Reset Filters
          </button>
        )}
      </div>
    </div>
  );
}
