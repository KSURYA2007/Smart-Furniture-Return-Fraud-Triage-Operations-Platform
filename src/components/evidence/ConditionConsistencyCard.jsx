import React from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Tag, 
  FileText, 
  Layers, 
  Cpu 
} from 'lucide-react';

export default function ConditionConsistencyCard({ analysis }) {
  if (!analysis) return null;

  const {
    condition_consistency,
    consistency_explanation,
    detected_damage_areas = [],
    detected_damage_types = [],
    returnInfo = {},
    order = {}
  } = analysis;

  const getConsistencyBadge = (status) => {
    switch (status) {
      case 'CONSISTENT':
        return (
          <span className="consistency-badge badge-consistent">
            <CheckCircle2 size={14} /> Consistent
          </span>
        );
      case 'PARTIALLY_CONSISTENT':
        return (
          <span className="consistency-badge badge-partial">
            <AlertCircle size={14} /> Partially Consistent
          </span>
        );
      case 'INSUFFICIENT_EVIDENCE':
      default:
        return (
          <span className="consistency-badge badge-insufficient">
            <HelpCircle size={14} /> Insufficient Evidence
          </span>
        );
    }
  };

  return (
    <div className="condition-consistency-card">
      <div className="section-header-row mb-3">
        <div>
          <h3 className="section-subheading-serif">Product Condition & Consistency</h3>
          <p className="section-subtext">Comparison between customer-selected condition and structured evidence extraction</p>
        </div>
      </div>

      <div className="consistency-main-box">
        <div className="consistency-status-header">
          <div className="consistency-title-col">
            <span className="consistency-label">Consistency Alignment</span>
            <div className="mt-1">{getConsistencyBadge(condition_consistency)}</div>
          </div>
          <p className="consistency-explanation-text">
            {consistency_explanation}
          </p>
        </div>

        {/* 3-Column Comparative Matrix */}
        <div className="consistency-matrix-grid">
          {/* Customer Reported */}
          <div className="matrix-column">
            <div className="matrix-col-header">
              <span className="matrix-col-title">Customer Reported</span>
              <span className="matrix-col-source">Module 1 Form</span>
            </div>
            <div className="matrix-col-body">
              <div className="matrix-row">
                <span className="matrix-lbl">Condition:</span>
                <span className="matrix-val font-semibold">{returnInfo.condition || 'Not specified'}</span>
              </div>
              <div className="matrix-row">
                <span className="matrix-lbl">Claim Reason:</span>
                <span className="matrix-val">{returnInfo.reason || 'Not specified'}</span>
              </div>
            </div>
          </div>

          {/* Rule-Based Extraction */}
          <div className="matrix-column highlighted-rule-col">
            <div className="matrix-col-header">
              <span className="matrix-col-title flex items-center gap-1">
                <Cpu size={13} className="text-primary-light" /> Rule-Based Extraction
              </span>
              <span className="matrix-col-source">Keyword Parser</span>
            </div>
            <div className="matrix-col-body">
              <div className="matrix-row">
                <span className="matrix-lbl">Damage Area:</span>
                <div className="matrix-tags-wrap">
                  {detected_damage_areas.map((area, idx) => (
                    <span key={idx} className="damage-tag-pill">{area}</span>
                  ))}
                </div>
              </div>
              <div className="matrix-row mt-2">
                <span className="matrix-lbl">Damage Type:</span>
                <div className="matrix-tags-wrap">
                  {detected_damage_types.map((type, idx) => (
                    <span key={idx} className="damage-tag-pill tag-type">{type}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Product Category Context */}
          <div className="matrix-column">
            <div className="matrix-col-header">
              <span className="matrix-col-title">Target Item</span>
              <span className="matrix-col-source">Order Record</span>
            </div>
            <div className="matrix-col-body">
              <div className="matrix-row">
                <span className="matrix-lbl">Product:</span>
                <span className="matrix-val font-semibold">{order.product_name || 'Furniture Item'}</span>
              </div>
              <div className="matrix-row">
                <span className="matrix-lbl">Category:</span>
                <span className="matrix-val">{order.category || 'Bulky Item'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
