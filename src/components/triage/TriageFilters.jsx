import React from 'react';
import { Search, Filter, X, ArrowUpDown, ShieldAlert, Layers } from 'lucide-react';

export default function TriageFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedPriority,
  onPriorityChange,
  selectedEvidenceStrength,
  onEvidenceStrengthChange,
  sortBy,
  onSortByChange,
  onResetFilters,
  totalResults
}) {
  const isFiltered = (
    searchQuery.trim() !== '' ||
    selectedCategory !== 'ALL' ||
    selectedPriority !== 'ALL' ||
    selectedEvidenceStrength !== 'ALL' ||
    sortBy !== 'DEFAULT'
  );

  return (
    <div className="triage-filters-card">
      {/* Top Search & Sort Row */}
      <div className="filters-search-row">
        <div className="search-input-wrap flex-1">
          <Search size={16} className="search-icon-inside" />
          <input
            type="text"
            className="search-field"
            placeholder="Search return ID, customer name, product, or reason..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button 
              type="button" 
              onClick={() => onSearchChange('')} 
              className="search-clear-btn"
              aria-label="Clear search query"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sort Selector */}
        <div className="sort-select-wrap">
          <ArrowUpDown size={14} className="text-dim" />
          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            aria-label="Sort returns queue"
          >
            <option value="DEFAULT">Priority (High to Low)</option>
            <option value="SCORE_DESC">Risk Score: Highest First</option>
            <option value="SCORE_ASC">Risk Score: Lowest First</option>
            <option value="PRICE_DESC">Product Value: High to Low</option>
            <option value="DATE_DESC">Newest Return First</option>
          </select>
        </div>
      </div>

      {/* Pill Filters Row */}
      <div className="filters-pills-row">
        {/* Risk Categories */}
        <div className="filter-pill-group">
          <span className="filter-group-label">Risk Category:</span>
          {['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((cat) => (
            <button
              key={cat}
              type="button"
              className={`filter-pill-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => onCategoryChange(cat)}
            >
              {cat === 'ALL' ? 'All Risk' : cat}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="filter-dropdown-group">
          <span className="filter-group-label">Priority:</span>
          <select
            className="filter-select-mini"
            value={selectedPriority}
            onChange={(e) => onPriorityChange(e.target.value)}
          >
            <option value="ALL">All Priorities</option>
            <option value="FAST_TRACK">Fast Track</option>
            <option value="STANDARD_PROCESS">Standard Process</option>
            <option value="HUMAN_REVIEW">Human Review</option>
            <option value="PRIORITY_HUMAN_REVIEW">Priority Review</option>
          </select>
        </div>

        {/* Evidence Strength Filter */}
        <div className="filter-dropdown-group">
          <span className="filter-group-label">Evidence:</span>
          <select
            className="filter-select-mini"
            value={selectedEvidenceStrength}
            onChange={(e) => onEvidenceStrengthChange(e.target.value)}
          >
            <option value="ALL">All Strengths</option>
            <option value="HIGH">High Strength</option>
            <option value="MEDIUM">Medium Strength</option>
            <option value="LOW">Low Strength</option>
          </select>
        </div>

        {/* Reset Filter Action */}
        {isFiltered && (
          <button
            type="button"
            onClick={onResetFilters}
            className="btn-reset-filters text-xs text-secondary hover:text-white"
          >
            <X size={12} /> Reset Filters
          </button>
        )}
      </div>

      {/* Results Counter Bar */}
      <div className="filters-count-bar">
        <span className="text-dim text-xs">
          Showing <strong>{totalResults}</strong> evaluated return request{totalResults !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}
