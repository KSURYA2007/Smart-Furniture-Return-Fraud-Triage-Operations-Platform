import React from 'react';
import { Search, X, ArrowUpDown, Shield, AlertTriangle, CheckCircle2, RotateCcw } from 'lucide-react';

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
    <div className="tf-container">
      {/* Row 1: Search Bar & Sorting */}
      <div className="tf-top-row">
        <div className="tf-search-wrap">
          <Search size={16} className="tf-search-icon" />
          <input
            type="text"
            className="tf-search-input"
            placeholder="Search return ID, customer name, product, or return reason..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button 
              type="button" 
              onClick={() => onSearchChange('')} 
              className="tf-search-clear"
              title="Clear search query"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sort Selector */}
        <div className="tf-sort-wrap">
          <ArrowUpDown size={14} className="tf-sort-icon" />
          <select
            className="tf-sort-select"
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

      {/* Row 2: Filter Segmented Controls & Dropdowns */}
      <div className="tf-controls-row">
        {/* Risk Category Segmented Pills */}
        <div className="tf-filter-group">
          <span className="tf-filter-label">Risk Category</span>
          <div className="tf-pills-wrap">
            {[
              { id: 'ALL', label: 'All Risk' },
              { id: 'LOW', label: 'Low', color: 'emerald' },
              { id: 'MEDIUM', label: 'Medium', color: 'blue' },
              { id: 'HIGH', label: 'High', color: 'amber' },
              { id: 'CRITICAL', label: 'Critical', color: 'rose' }
            ].map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  className={`tf-pill-btn ${isActive ? `tf-pill-active tf-pill-${cat.color || 'indigo'}` : ''}`}
                  onClick={() => onCategoryChange(cat.id)}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Priority Dropdown */}
        <div className="tf-filter-group">
          <span className="tf-filter-label">Priority</span>
          <select
            className="tf-select"
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

        {/* Evidence Strength Dropdown */}
        <div className="tf-filter-group">
          <span className="tf-filter-label">Evidence</span>
          <select
            className="tf-select"
            value={selectedEvidenceStrength}
            onChange={(e) => onEvidenceStrengthChange(e.target.value)}
          >
            <option value="ALL">All Strengths</option>
            <option value="HIGH">High Strength</option>
            <option value="MEDIUM">Medium Strength</option>
            <option value="LOW">Low Strength</option>
          </select>
        </div>

        {/* Reset Filter Button */}
        {isFiltered && (
          <button
            type="button"
            onClick={onResetFilters}
            className="tf-reset-btn"
            title="Reset all search and filter options"
          >
            <RotateCcw size={13} />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Row 3: Results Summary Count */}
      <div className="tf-count-row">
        <div className="tf-count-badge">
          <span>Showing</span>
          <strong className="tf-count-number">{totalResults}</strong>
          <span>evaluated return claim{totalResults !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
}
