import React from 'react';
import { 
  CheckCircle2, 
  AlertOctagon, 
  Clock, 
  HelpCircle, 
  Check, 
  XCircle, 
  RotateCcw, 
  PackageCheck 
} from 'lucide-react';

/**
 * Clean semantic status badge for Orders, Returns, and Historical Outcomes
 */
export default function StatusBadge({ status, type = 'outcome', size = 'normal' }) {
  if (!status) return null;

  const normalized = status.trim().toLowerCase();
  const sizeClass = size === 'small' ? 'badge-sm' : '';

  // Return Outcomes
  if (type === 'outcome') {
    switch (normalized) {
      case 'genuine':
        return (
          <span className={`status-badge badge-genuine ${sizeClass}`}>
            <CheckCircle2 size={12} /> Genuine
          </span>
        );
      case 'confirmed fraud':
        return (
          <span className={`status-badge badge-fraud ${sizeClass}`}>
            <AlertOctagon size={12} /> Confirmed Fraud
          </span>
        );
      case 'pending':
        return (
          <span className={`status-badge badge-pending ${sizeClass}`}>
            <Clock size={12} /> Pending
          </span>
        );
      case 'unknown':
        return (
          <span className={`status-badge badge-unknown ${sizeClass}`}>
            <HelpCircle size={12} /> Unknown
          </span>
        );
      case 'completed':
        return (
          <span className={`status-badge badge-completed ${sizeClass}`}>
            <Check size={12} /> Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className={`status-badge badge-cancelled ${sizeClass}`}>
            <XCircle size={12} /> Cancelled
          </span>
        );
      default:
        return (
          <span className={`status-badge badge-neutral ${sizeClass}`}>
            {status}
          </span>
        );
    }
  }

  // Order Status
  if (type === 'order') {
    switch (normalized) {
      case 'completed':
        return (
          <span className={`status-badge badge-completed ${sizeClass}`}>
            <PackageCheck size={12} /> Completed
          </span>
        );
      case 'returned':
        return (
          <span className={`status-badge badge-returned ${sizeClass}`}>
            <RotateCcw size={12} /> Returned
          </span>
        );
      case 'cancelled':
        return (
          <span className={`status-badge badge-cancelled ${sizeClass}`}>
            <XCircle size={12} /> Cancelled
          </span>
        );
      default:
        return (
          <span className={`status-badge badge-neutral ${sizeClass}`}>
            {status}
          </span>
        );
    }
  }

  // Return Status
  if (type === 'return') {
    switch (normalized) {
      case 'returned':
        return (
          <span className={`status-badge badge-returned ${sizeClass}`}>
            <RotateCcw size={12} /> Returned
          </span>
        );
      case 'no return':
        return (
          <span className={`status-badge badge-no-return ${sizeClass}`}>
            No Return
          </span>
        );
      case 'submitted':
        return (
          <span className={`status-badge badge-pending ${sizeClass}`}>
            <Clock size={12} /> Submitted
          </span>
        );
      default:
        return (
          <span className={`status-badge badge-neutral ${sizeClass}`}>
            {status}
          </span>
        );
    }
  }

  return (
    <span className={`status-badge badge-neutral ${sizeClass}`}>
      {status}
    </span>
  );
}
