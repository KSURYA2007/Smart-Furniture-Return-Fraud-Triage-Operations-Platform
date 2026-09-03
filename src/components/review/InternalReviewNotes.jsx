import React, { useState } from 'react';
import { FileText, Send, User, Clock, Check } from 'lucide-react';
import { addReviewNote } from '../../utils/storage.js';

export default function InternalReviewNotes({
  returnId,
  notes = [],
  reviewerName = 'Reviewer',
  reviewerRole = 'Dispatcher',
  onNotesUpdated
}) {
  const [newNoteText, setNewNoteText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNoteText.trim() || !returnId) return;

    setIsSaving(true);
    const success = addReviewNote(returnId, newNoteText.trim(), reviewerName, reviewerRole);
    if (success) {
      setNewNoteText('');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      if (onNotesUpdated) onNotesUpdated();
    }
    setIsSaving(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="internal-notes-card form-card mb-4">
      <div className="card-header border-bottom pb-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="card-header-icon bg-primary-light">
            <FileText size={16} className="icon-blue" />
          </div>
          <div>
            <h3 className="card-title text-base">Internal Review Notes</h3>
            <p className="card-subtitle">Permanent audit log for dispatcher observations, customer calls, and courier reports</p>
          </div>
        </div>
      </div>

      {/* Existing Notes List */}
      <div className="existing-notes-list mb-3">
        {notes.length === 0 ? (
          <p className="text-dim text-xs italic py-2">No internal review notes logged yet for this return case.</p>
        ) : (
          notes.map((note) => (
            <div key={note.id || note.timestamp} className="note-item-bubble mb-2">
              <div className="note-header-row flex items-center justify-between text-xs mb-1">
                <span className="note-author font-semibold text-primary">
                  {note.reviewer || 'Reviewer'} &bull; <span className="text-dim">{note.role || 'Dispatcher'}</span>
                </span>
                <span className="note-timestamp text-dim flex items-center gap-1">
                  <Clock size={11} /> {formatDate(note.timestamp)}
                </span>
              </div>
              <p className="note-body-text text-xs text-secondary whitespace-pre-line">
                {note.text}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Add New Note Input */}
      <form onSubmit={handleAddNote} className="add-note-form">
        <div className="form-group mb-2">
          <textarea
            rows={2}
            className="form-textarea text-xs"
            placeholder={`Log internal observation as ${reviewerName} (${reviewerRole})...`}
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-dim text-xs">Notes are permanent and cannot be overwritten.</span>
          <button
            type="submit"
            className="btn-secondary btn-sm flex items-center gap-1"
            disabled={!newNoteText.trim() || isSaving}
          >
            {saveSuccess ? (
              <>
                <Check size={13} className="text-emerald-400" />
                <span className="text-emerald-400">Note Saved</span>
              </>
            ) : (
              <>
                <Send size={13} />
                <span>Save Note</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
