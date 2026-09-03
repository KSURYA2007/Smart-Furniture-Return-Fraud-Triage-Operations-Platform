import React from 'react';
import { 
  ShieldAlert, 
  ExternalLink, 
  History, 
  Camera, 
  Layers, 
  Clock, 
  Package, 
  FileText 
} from 'lucide-react';

export default function SupportingEvidenceCard({ 
  supportingEvidence = [], 
  onViewCustomer, 
  onViewEvidence,
  customerId,
  returnId
}) {
  if (!supportingEvidence || supportingEvidence.length === 0) {
    return null;
  }

  return (
    <div className="supporting-evidence-card">
      <div className="section-header-row mb-3">
        <div className="flex items-center gap-2">
          <div className="card-header-icon bg-amber-glow">
            <ShieldAlert size={18} className="text-amber-400" />
          </div>
          <div>
            <h4 className="checklist-title">Supporting Audit Evidence</h4>
            <p className="checklist-subtitle">Source-referenced justifications triggering high-priority operational review</p>
          </div>
        </div>
        <span className="badge-count-warning">{supportingEvidence.length} Risk Signal{supportingEvidence.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="supporting-evidence-list">
        {supportingEvidence.map((item, idx) => (
          <div key={idx} className="supporting-evidence-item">
            <div className="evidence-item-left">
              <div className="evidence-header-line">
                <span className="evidence-item-title font-semibold text-white text-sm">
                  {idx + 1}. {item.title}
                </span>
                <span className="evidence-points-chip">{item.points}</span>
              </div>
              <p className="evidence-desc-text text-secondary text-xs mt-1">
                {item.description}
              </p>
              <div className="evidence-source-meta text-dim text-xs mt-1.5 flex items-center gap-2">
                <span>Source: <strong>{item.source}</strong> ({item.sourceModule})</span>
              </div>
            </div>

            <div className="evidence-item-right">
              {item.linkContext === 'customer' && onViewCustomer && customerId && (
                <button
                  type="button"
                  onClick={() => onViewCustomer(customerId)}
                  className="btn-trace-link"
                  title="Inspect customer history in Module 2"
                >
                  <History size={12} /> View Customer
                </button>
              )}
              {item.linkContext === 'evidence' && onViewEvidence && returnId && (
                <button
                  type="button"
                  onClick={() => onViewEvidence(returnId)}
                  className="btn-trace-link"
                  title="Inspect photo evidence in Module 3"
                >
                  <Camera size={12} /> View Evidence
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
