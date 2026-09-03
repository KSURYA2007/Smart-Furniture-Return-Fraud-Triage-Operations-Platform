import React from 'react';
import { Filter, Search, X } from 'lucide-react';

const OUTCOMES = ['All', 'Genuine', 'Confirmed Fraud', 'Pending', 'Unknown'];
const CATEGORIES = ['All', 'Sofa', 'Table', 'Chair', 'Bed', 'Wardrobe', 'Cabinet', 'Other'];

export default function ReturnFilters({
  outcomeFilter,
  onOutcomeChange,
  categoryFilter,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  totalCount,
  filteredCount
}) {
  const hasActiveFilters = outcomeFilter !== 'All' || categoryFilter !== 'All' || searchQuery.trim().length > 0;

  const handleReset = () => {
    onOutcomeChange('All');
    onCategoryChange('All');
    onSearchChange('');
  };

  return (
    <div className="table-filter-bar">
      <div className="filter-controls-row">
        {/* Search within returns */}
        <div className="filter-search-box">
          <Search size={15} className="filter-search-icon" />
          <input
            type="text"
            className="filter-search-input"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter by Return ID, Order ID, or Product..."
          />
          {searchQuery && (
            <button 
              type="button" 
              onClick={() => onSearchChange('')} 
              className="filter-search-clear"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Outcome Filter Pills */}
        <div className="filter-group">
          <span className="filter-group-label">Outcome:</span>
          <div className="filter-pills-row">
            {OUTCOMES.map((outcome) => (
              <button
                key={outcome}
                type="button"
                className={`filter-pill ${outcomeFilter === outcome ? 'active' : ''}`}
                onClick={() => onOutcomeChange(outcome)}
              >
                {outcome}
              </button>
            ))}
          </div>
        </div>

        {/* Category Select */}
        <div className="filter-group">
          <span className="filter-group-label">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="filter-select"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="filter-reset-btn"
            title="Reset return filters"
          >
            <X size={14} /> Clear Filters
          </button>
        )}
      </div>

      <div className="filter-results-counter">
        Showing <strong>{filteredCount}</strong> of <strong>{totalCount}</strong> returns
      </div>
    </div>
  );
}
