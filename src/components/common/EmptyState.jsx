import React from 'react';
import { PackageOpen, SearchX, RotateCcw, AlertCircle, RefreshCw } from 'lucide-react';

export default function EmptyState({ 
  icon: Icon = PackageOpen, 
  title = 'No Data Available', 
  message = 'There are no records matching your request.', 
  actionText, 
  onAction 
}) {
  return (
    <div className="empty-state-card">
      <div className="empty-state-icon-wrap">
        <Icon size={32} className="empty-state-icon" />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{message}</p>
      {actionText && onAction && (
        <button 
          type="button" 
          onClick={onAction} 
          className="btn-secondary btn-sm mt-3"
        >
          <RefreshCw size={14} /> {actionText}
        </button>
      )}
    </div>
  );
}
