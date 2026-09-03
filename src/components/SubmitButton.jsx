import React from 'react';
import { Send, Loader2 } from 'lucide-react';

export default function SubmitButton({ isSubmitting = false, onClick, disabled = false }) {
  return (
    <button
      type="submit"
      onClick={onClick}
      disabled={isSubmitting || disabled}
      className={`btn-primary btn-submit ${isSubmitting ? 'btn-submitting' : ''}`}
      aria-busy={isSubmitting}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="spinner-icon" size={18} />
          <span>Submitting...</span>
        </>
      ) : (
        <>
          <Send size={18} className="btn-icon" />
          <span>Submit Return Request</span>
        </>
      )}
    </button>
  );
}
