import React from 'react';
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Link, 
  ExternalLink, 
  Search, 
  Layers 
} from 'lucide-react';

export default function EvidenceFindingsPanel({ findings = [], warnings = [] }) {
  return (
    <div className="evidence-findings-card">
      <div className="section-header-row mb-3">
        <div>
          <h3 className="section-subheading-serif">Evidence Findings & Traceability</h3>
          <p className="section-subtext">Source-referenced factual observations derived from uploaded media and customer intake</p>
        </div>
      </div>

      <div className="findings-content-layout">
        {/* Verified Observations List */}
        <div className="findings-sub-panel">
          <h4 className="findings-panel-header text-emerald">
            <CheckCircle2 size={16} /> Verified Evidence Observations ({findings.length})
          </h4>

          <div className="findings-items-list">
            {findings.length > 0 ? (
              findings.map((item, idx) => (
                <div key={idx} className="finding-item-box">
                  <div className="finding-text-row">
                    <span className="finding-bullet">&bull;</span>
                    <span className="finding-text">{item.text}</span>
                  </div>
                  <div className="finding-source-tag">
                    <Link size={12} />
                    <span>Source: <strong>{item.source}</strong></span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted text-sm p-3">No observations recorded.</p>
            )}
          </div>
        </div>

        {/* Warnings & Notices Panel */}
        <div className="findings-sub-panel warnings-sub-panel">
          <h4 className="findings-panel-header text-amber">
            <AlertTriangle size={16} /> Evidence Notices & Warnings ({warnings.length})
          </h4>

          <div className="findings-items-list">
            {warnings.length > 0 ? (
              warnings.map((warn, idx) => (
                <div key={idx} className="finding-item-box warning-box">
                  <div className="finding-text-row">
                    <span className="finding-bullet text-amber">&bull;</span>
                    <span className="finding-text">{warn.text}</span>
                  </div>
                  {warn.source && (
                    <div className="finding-source-tag text-amber">
                      <Link size={12} />
                      <span>Source: <strong>{warn.source}</strong></span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-warnings-box">
                <CheckCircle2 size={16} className="text-emerald" />
                <span className="text-sm text-secondary">Zero file or metadata warnings detected.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
