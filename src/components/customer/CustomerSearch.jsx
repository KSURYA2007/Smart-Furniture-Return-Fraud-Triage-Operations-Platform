import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Phone, Mail, X, ArrowRight, Check } from 'lucide-react';
import { searchCustomers } from '../../utils/storage';

export default function CustomerSearch({ onSelectCustomer, selectedCustomerId, placeholder = 'Search by Customer ID, Name, Email, or Phone...' }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (query.trim().length > 0) {
      const matches = searchCustomers(query);
      setResults(matches);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (customer) => {
    setQuery(`${customer.name} (${customer.customer_id})`);
    setIsOpen(false);
    onSelectCustomer(customer);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="search-component-wrapper" ref={wrapperRef}>
      <div className="search-input-box">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim().length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          aria-label="Search customers"
        />
        {query && (
          <button 
            type="button" 
            onClick={handleClear} 
            className="search-clear-btn"
            title="Clear search"
            aria-label="Clear search"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Autocomplete Results Dropdown */}
      {isOpen && (
        <div className="search-results-dropdown" role="listbox">
          {results.length > 0 ? (
            results.map((c) => {
              const isSelected = selectedCustomerId === c.customer_id;
              return (
                <div
                  key={c.customer_id}
                  className={`search-result-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(c)}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="result-avatar">
                    {c.name ? c.name[0].toUpperCase() : 'C'}
                  </div>
                  <div className="result-info">
                    <div className="result-title-row">
                      <span className="result-name">{c.name}</span>
                      <span className="result-badge-id">{c.customer_id}</span>
                    </div>
                    <div className="result-meta-row">
                      <span><Mail size={12} /> {c.email}</span>
                      <span><Phone size={12} /> {c.phone}</span>
                    </div>
                  </div>
                  <ArrowRight size={16} className="result-arrow" />
                </div>
              );
            })
          ) : (
            <div className="search-no-results">
              <p className="no-res-title">No customers found</p>
              <p className="no-res-desc">Try another customer ID, name, email, or phone number.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
