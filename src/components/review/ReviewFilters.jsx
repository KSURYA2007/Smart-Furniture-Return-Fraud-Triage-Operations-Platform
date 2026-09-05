import React from 'react';
import { Search, X, ShieldAlert, Layers, CheckCircle2, RotateCcw, Filter } from 'lucide-react';

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
    <div className="rq-filters-card">
      {/* 1. Queue Preset Tabs */}
      <div className="rq-preset-tabs" role="tablist" aria-label="Review Queue Presets">
        <button
          type="button"
          role="tab"
          aria-selected={queueTab === 'PRIMARY'}
          className={`rq-tab ${queueTab === 'PRIMARY' ? 'rq-tab-active rq-tab-primary' : ''}`}
          onClick={() => onQueueTabChange('PRIMARY')}
        >
          <ShieldAlert size={15} className="rq-tab-icon" />
          <span className="rq-tab-label">Primary Queue (High &amp; Critical)</span>
          <span className="rq-count-badge rq-count-high">
            {counts.primary || 0}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={queueTab === 'PENDING'}
          className={`rq-tab ${queueTab === 'PENDING' ? 'rq-tab-active rq-tab-pending' : ''}`}
          onClick={() => onQueueTabChange('PENDING')}
        >
          <Layers size={15} className="rq-tab-icon" />
          <span className="rq-tab-label">All Pending Decisions</span>
          <span className="rq-count-badge">
            {counts.pending || 0}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={queueTab === 'RESOLVED'}
          className={`rq-tab ${queueTab === 'RESOLVED' ? 'rq-tab-active rq-tab-resolved' : ''}`}
          onClick={() => onQueueTabChange('RESOLVED')}
        >
          <CheckCircle2 size={15} className="rq-tab-icon" />
          <span className="rq-tab-label">Completed / Decided</span>
          <span className="rq-count-badge rq-count-resolved">
            {counts.resolved || 0}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={queueTab === 'ALL'}
          className={`rq-tab ${queueTab === 'ALL' ? 'rq-tab-active' : ''}`}
          onClick={() => onQueueTabChange('ALL')}
        >
          <span className="rq-tab-label">All Returns (All Levels)</span>
          <span className="rq-count-badge">
            {counts.all || 0}
          </span>
        </button>
      </div>

      {/* 2. Search & Dropdown Filter Row */}
      <div className="rq-filter-row">
        {/* Search Input */}
        <div className="rq-search-box">
          <Search size={16} className="rq-search-icon" />
          <input
            type="text"
            className="rq-search-input"
            placeholder="Search return ID, customer, order ID, product..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search review cases"
          />
          {searchQuery && (
            <button
              type="button"
              className="rq-clear-search"
              onClick={() => onSearchChange('')}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="rq-dropdowns-group">
          {/* Risk Category */}
          <div className="rq-select-wrap">
            <span className="rq-select-lbl">Risk Category</span>
            <select
              className="rq-select"
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

          {/* Review Status */}
          <div className="rq-select-wrap">
            <span className="rq-select-lbl">Review Status</span>
            <select
              className="rq-select"
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Review</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="REQUEST_MORE_EVIDENCE">More Evidence</option>
              <option value="ESCALATED">Escalated</option>
            </select>
          </div>

          {/* Reviewer Role */}
          <div className="rq-select-wrap">
            <span className="rq-select-lbl">Reviewer Role</span>
            <select
              className="rq-select"
              value={reviewerFilter}
              onChange={(e) => onReviewerFilterChange(e.target.value)}
            >
              <option value="ALL">All Roles</option>
              <option value="Dispatcher">Dispatcher</option>
              <option value="Operations Manager">Operations Manager</option>
              <option value="Senior Operations Manager">Senior Operations Manager</option>
            </select>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              className="rq-reset-btn"
              onClick={handleClearFilters}
              title="Reset all search filters"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
