import React, { useState, useEffect } from 'react';
import { FileEdit, Save, Check, Clock } from 'lucide-react';
import { getEvidenceReviewNotes, saveEvidenceReviewNotes } from '../../utils/storage';

export default function EvidenceReviewNotes({ returnId }) {
  const [notes, setNotes] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);

  useEffect(() => {
    if (returnId) {
      const stored = getEvidenceReviewNotes(returnId);
      setNotes(stored || '');
      if (stored) {
        setLastSavedTime('Loaded from storage');
      }
    }
  }, [returnId]);

  const handleSave = () => {
    saveEvidenceReviewNotes(returnId, notes);
    setIsSaved(true);
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLastSavedTime(`Saved at ${now}`);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="evidence-review-notes-card">
      <div className="section-header-row mb-2">
        <div className="flex items-center gap-2">
          <div className="card-header-icon bg-primary-light">
            <FileEdit size={18} className="icon-blue" />
          </div>
          <div>
            <h4 className="checklist-title">Operations Reviewer Notes</h4>
            <p className="checklist-subtitle">Record physical inspection notes, technician findings, and evidence clarity details</p>
          </div>
        </div>
      </div>

      <div className="notes-editor-box">
        <textarea
          className="form-textarea notes-textarea"
          rows={4}
          placeholder="e.g. Damage is clearly visible in images 2 and 3. Structural fracture on left frame verified against customer claim. Ready for triage assessment..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="notes-actions-bar">
          <div className="notes-timestamp-info">
            {lastSavedTime && (
              <span className="flex items-center gap-1 text-dim text-xs">
                <Clock size={12} /> {lastSavedTime}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="btn-primary btn-sm"
          >
            {isSaved ? (
              <>
                <Check size={14} className="text-emerald" /> Notes Saved!
              </>
            ) : (
              <>
                <Save size={14} /> Save Review Notes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
