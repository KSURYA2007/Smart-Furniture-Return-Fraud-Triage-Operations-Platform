import React from 'react';
import { Filter, Search, X } from 'lucide-react';

const CATEGORIES = ['All', 'Sofa', 'Table', 'Chair', 'Bed', 'Wardrobe', 'Cabinet', 'Other'];
const STATUSES = ['All', 'Completed', 'Returned', 'Cancelled'];

export default function OrderFilters({ 
  statusFilter, 
  onStatusChange, 
  categoryFilter, 
  onCategoryChange,
  searchQuery,
  onSearchChange,
  totalCount,
  filteredCount
}) {
  const hasActiveFilters = statusFilter !== 'All' || categoryFilter !== 'All' || searchQuery.trim().length > 0;

  const handleReset = () => {
    onStatusChange('All');
    onCategoryChange('All');
    onSearchChange('');
  };

  return (
    <div className="table-filter-bar">
      <div className="filter-controls-row">
        {/* Search within orders */}
        <div className="filter-search-box">
          <Search size={15} className="filter-search-icon" />
          <input
            type="text"
            className="filter-search-input"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter by Order ID or Product..."
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

        {/* Status Filter Buttons */}
        <div className="filter-group">
          <span className="filter-group-label">Status:</span>
          <div className="filter-pills-row">
            {STATUSES.map((status) => (
              <button
                key={status}
                type="button"
                className={`filter-pill ${statusFilter === status ? 'active' : ''}`}
                onClick={() => onStatusChange(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter Select */}
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
            title="Reset filters"
          >
            <X size={14} /> Clear Filters
          </button>
        )}
      </div>

      <div className="filter-results-counter">
        Showing <strong>{filteredCount}</strong> of <strong>{totalCount}</strong> orders
      </div>
    </div>
  );
}
