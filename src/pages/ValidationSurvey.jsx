import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Star, 
  Send, 
  UserCheck, 
  HelpCircle,
  BarChart2,
  FlaskConical,
  Table,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { 
  getStoredValidationResponses, 
  saveStoredValidationResponse 
} from '../utils/storage.js';

export default function ValidationSurvey({
  onNavigateDashboard,
  onNavigateExperiment,
  onNavigateCases,
  onNavigateLimitations,
  onNavigateReport
}) {
  const [responses, setResponses] = useState([]);
  const [successNotice, setSuccessNotice] = useState(false);

  // Form State
  const [role, setRole] = useState('Dispatcher');
  const [name, setName] = useState('');
  const [ratings, setRatings] = useState({
    easeOfUse: 4,
    explanationClarity: 5,
    evidenceVisibility: 4,
    reviewUsefulness: 5,
    pickupUsefulness: 4,
    trustInSystem: 4,
    overrideConfidence: 5,
    overallUsefulness: 5
  });
  const [qualitative, setQualitative] = useState({
    q1: 'Yes, photographic damage tags and metadata consistency clearly justified the priority score.',
    q2: 'Yes, keeping risk flags separate from ground truth prevents jumping to false accusations.',
    q3: 'Yes, manual override was straightforward and required a clear reason for the audit trail.',
    q4: 'Yes, overdue legitimate cases had the customer service urgency badge.',
    q5: 'The baseline comparison table clearly showed where fleet miles were saved.',
    q6: '',
    q7: 'Integrate real vehicle GPS telemetry in Phase 2.'
  });

  const loadResponses = () => {
    setResponses(getStoredValidationResponses());
  };

  useEffect(() => {
    loadResponses();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      participant: name || role,
      role,
      ratings,
      qualitative,
      submitted_at: new Date().toISOString()
    };

    saveStoredValidationResponse(payload);
    loadResponses();
    setSuccessNotice(true);
    setTimeout(() => setSuccessNotice(false), 3500);
  };

  // Compute Averages
  const totalCount = responses.length;
  const avg = (key) => {
    if (totalCount === 0) return 'N/A';
    const sum = responses.reduce((acc, r) => acc + (r.ratings?.[key] || 0), 0);
    return (sum / totalCount).toFixed(1);
  };

  return (
    <div className="page-wrapper validation-survey-page">
      {/* Sub-Navigation Bar */}
      <div className="metrics-subnav-bar flex items-center justify-between flex-wrap gap-2 mb-4 p-2 rounded bg-surface border border-subtle">
        <div className="flex items-center gap-1 flex-wrap">
          {onNavigateDashboard && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateDashboard}>
              <BarChart2 size={13} /> Dashboard
            </button>
          )}
          {onNavigateExperiment && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateExperiment}>
              <FlaskConical size={13} /> Experiment Simulator
            </button>
          )}
          {onNavigateCases && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateCases}>
              <Table size={13} /> Evaluation Cases
            </button>
          )}
          <button type="button" className="btn-primary btn-xs flex items-center gap-1">
            <CheckCircle2 size={13} /> Stakeholder Validation
          </button>
          {onNavigateLimitations && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateLimitations}>
              <AlertTriangle size={13} /> Limitations
            </button>
          )}
          {onNavigateReport && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateReport}>
              <FileText size={13} /> Report & Export
            </button>
          )}
        </div>
      </div>

      {/* Hero Header */}
      <header className="page-header validation-header mb-4">
        <div className="header-container">
          <div className="header-badge-row">
            <span className="module-badge">
              <CheckCircle2 size={13} /> Module 7: User & Stakeholder Validation
            </span>
          </div>
          <h1 className="page-title font-serif">Operational Feedback & Usability Evaluation</h1>
          <p className="page-description">
            Structured qualitative and quantitative survey collecting usability feedback from dispatchers, warehouse managers, and evaluation auditors.
          </p>
        </div>
      </header>

      {/* Success Notification */}
      {successNotice && (
        <div className="p-3 rounded bg-emerald-bg border border-emerald-border mb-4 flex items-center gap-2 text-xs">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span className="text-emerald-300 font-semibold">
            Validation feedback recorded successfully! Survey averages updated.
          </span>
        </div>
      )}

      {/* Validation Summary Card (Section 44) */}
      <div className="validation-summary-card form-card mb-4">
        <div className="card-header border-bottom pb-2 mb-3">
          <div className="flex items-center justify-between">
            <h3 className="card-title text-base">Aggregate Validation Scores</h3>
            <span className="text-xs text-dim">{totalCount} Operator Responses Logged</span>
          </div>
        </div>

        {totalCount === 0 ? (
          <p className="text-dim text-xs p-3 text-center">No stakeholder validation responses recorded yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="stat-card p-2 rounded bg-surface border border-subtle">
              <span className="text-dim text-3xs uppercase block">Ease of Use:</span>
              <span className="font-mono font-bold text-lg text-primary">{avg('easeOfUse')} / 5.0</span>
            </div>
            <div className="stat-card p-2 rounded bg-surface border border-subtle">
              <span className="text-dim text-3xs uppercase block">Explanation Clarity:</span>
              <span className="font-mono font-bold text-lg text-primary">{avg('explanationClarity')} / 5.0</span>
            </div>
            <div className="stat-card p-2 rounded bg-surface border border-subtle">
              <span className="text-dim text-3xs uppercase block">Evidence Visibility:</span>
              <span className="font-mono font-bold text-lg text-primary">{avg('evidenceVisibility')} / 5.0</span>
            </div>
            <div className="stat-card p-2 rounded bg-surface border border-subtle">
              <span className="text-dim text-3xs uppercase block">Human Review Value:</span>
              <span className="font-mono font-bold text-lg text-emerald-400">{avg('reviewUsefulness')} / 5.0</span>
            </div>
            <div className="stat-card p-2 rounded bg-surface border border-subtle">
              <span className="text-dim text-3xs uppercase block">Prioritisation Value:</span>
              <span className="font-mono font-bold text-lg text-primary">{avg('pickupUsefulness')} / 5.0</span>
            </div>
            <div className="stat-card p-2 rounded bg-surface border border-subtle">
              <span className="text-dim text-3xs uppercase block">System Trust:</span>
              <span className="font-mono font-bold text-lg text-amber-300">{avg('trustInSystem')} / 5.0</span>
            </div>
            <div className="stat-card p-2 rounded bg-surface border border-subtle">
              <span className="text-dim text-3xs uppercase block">Override Confidence:</span>
              <span className="font-mono font-bold text-lg text-emerald-400">{avg('overrideConfidence')} / 5.0</span>
            </div>
            <div className="stat-card p-2 rounded bg-surface border border-subtle">
              <span className="text-dim text-3xs uppercase block">Overall Usefulness:</span>
              <span className="font-mono font-bold text-lg text-emerald-300">{avg('overallUsefulness')} / 5.0</span>
            </div>
          </div>
        )}
      </div>

      {/* Survey Form */}
      <form onSubmit={handleSubmit} className="form-card mb-4 text-xs">
        <div className="card-header border-bottom pb-2 mb-3">
          <h3 className="card-title text-base">Submit Stakeholder Evaluation</h3>
          <p className="card-subtitle">Provide quantitative ratings and qualitative feedback</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="form-group">
            <label className="form-label text-xs font-bold">Stakeholder Role:</label>
            <select
              className="form-select text-xs"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="Dispatcher">Dispatcher (Operations Fleet Coordinator)</option>
              <option value="Operations Manager">Operations Manager</option>
              <option value="Reviewer">Human Reviewer (Triage Specialist)</option>
              <option value="Evaluator">Evaluator / External Auditor</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label text-xs font-bold">Participant Name (Optional):</label>
            <input
              type="text"
              className="form-input text-xs"
              placeholder="e.g., S. Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        {/* Likert Ratings Grid */}
        <h4 className="font-bold text-xs text-secondary mb-2">Quantitative Likert Ratings (1 = Poor, 5 = Excellent):</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 p-3 rounded bg-surface border border-subtle">
          {Object.entries({
            easeOfUse: 'Ease of Use & Navigation',
            explanationClarity: 'Clarity of Risk Explanations',
            evidenceVisibility: 'Photographic Evidence Visibility',
            reviewUsefulness: 'Usefulness of Human-in-the-Loop Review',
            pickupUsefulness: 'Pickup Prioritisation & Route Efficiency',
            trustInSystem: 'Trust in System Recommendations',
            overrideConfidence: 'Confidence in Manual Overrides',
            overallUsefulness: 'Overall Prototype Practicality'
          }).map(([key, labelText]) => (
            <div key={key} className="flex items-center justify-between gap-2">
              <span className="text-secondary">{labelText}:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    className={`btn-xs ${ratings[key] === val ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setRatings({ ...ratings, [key]: val })}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Qualitative Questions (Section 43) */}
        <h4 className="font-bold text-xs text-secondary mb-2">Qualitative Structured Feedback:</h4>
        <div className="space-y-3 mb-4">
          <div className="form-group">
            <label className="form-label text-xs">Q1: Did the system provide enough evidence to understand why a case was prioritised?</label>
            <input
              type="text"
              className="form-input text-xs"
              value={qualitative.q1}
              onChange={(e) => setQualitative({ ...qualitative, q1: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label text-xs">Q2: Did the system help you distinguish fraud-risk indicators from confirmed fraud?</label>
            <input
              type="text"
              className="form-input text-xs"
              value={qualitative.q2}
              onChange={(e) => setQualitative({ ...qualitative, q2: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label text-xs">Q3: Could you manually override the system when necessary?</label>
            <input
              type="text"
              className="form-input text-xs"
              value={qualitative.q3}
              onChange={(e) => setQualitative({ ...qualitative, q3: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label text-xs">Q4: Did the pickup prioritisation reflect customer-service urgency?</label>
            <input
              type="text"
              className="form-input text-xs"
              value={qualitative.q4}
              onChange={(e) => setQualitative({ ...qualitative, q4: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label text-xs">Q5: Did the dashboard make cost and operational trade-offs understandable?</label>
            <input
              type="text"
              className="form-input text-xs"
              value={qualitative.q5}
              onChange={(e) => setQualitative({ ...qualitative, q5: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label text-xs">Q6: What information was missing?</label>
            <input
              type="text"
              className="form-input text-xs"
              placeholder="Any additional attributes required by dispatch..."
              value={qualitative.q6}
              onChange={(e) => setQualitative({ ...qualitative, q6: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label text-xs">Q7: What would you change before real-world deployment?</label>
            <input
              type="text"
              className="form-input text-xs"
              value={qualitative.q7}
              onChange={(e) => setQualitative({ ...qualitative, q7: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end pt-2 border-top">
          <button type="submit" className="btn-primary btn-md flex items-center gap-1.5 font-bold">
            <Send size={14} />
            <span>Submit Validation Feedback</span>
          </button>
        </div>
      </form>
    </div>
  );
}
