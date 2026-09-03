import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, ListChecks } from 'lucide-react';

export default function EvidenceChecklist({ checklist = [] }) {
  if (!checklist || checklist.length === 0) return null;

  const passedCount = checklist.filter(c => c.passed).length;
  const totalCount = checklist.length;
  const percentage = Math.round((passedCount / totalCount) * 100);

  return (
    <div className="evidence-checklist-card">
      <div className="checklist-header-row">
        <div className="flex items-center gap-2">
          <div className="card-header-icon bg-primary-light">
            <ListChecks size={18} className="icon-blue" />
          </div>
          <div>
            <h4 className="checklist-title">Evidence Completeness Checklist</h4>
            <p className="checklist-subtitle">Standard verification items required for operational processing</p>
          </div>
        </div>

        <div className="checklist-progress-pill">
          <span>{passedCount}/{totalCount} Passed ({percentage}%)</span>
        </div>
      </div>

      <div className="checklist-items-stack">
        {checklist.map((item) => (
          <div key={item.id} className={`checklist-item-row ${item.passed ? 'passed' : 'warning-row'}`}>
            <div className="item-icon-col">
              {item.passed ? (
                <CheckCircle2 size={17} className="text-emerald" />
              ) : (
                <AlertTriangle size={17} className="text-amber" />
              )}
            </div>

            <div className="item-text-col">
              <span className={`item-label ${item.passed ? 'text-passed' : 'text-warn'}`}>
                {item.label}
              </span>
              {item.warning && !item.passed && (
                <span className="item-warning-hint">{item.warning}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
