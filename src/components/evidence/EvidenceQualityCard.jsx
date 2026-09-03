import React from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  FileCheck, 
  Eye, 
  Layers, 
  Camera, 
  Activity 
} from 'lucide-react';

export default function EvidenceQualityCard({ analysis }) {
  if (!analysis) return null;

  const {
    image_quality,
    damage_visibility,
    evidence_completeness,
    evidence_coverage,
    coverage_label,
    evidence_strength,
    usable_image_count,
    image_count
  } = analysis;

  const getStrengthClass = (strength) => {
    switch (strength) {
      case 'HIGH': return 'strength-high';
      case 'MEDIUM': return 'strength-medium';
      case 'LOW': return 'strength-low';
      default: return 'strength-medium';
    }
  };

  const getQualityBadgeClass = (val) => {
    const v = (val || '').toLowerCase();
    if (v.includes('excellent') || v.includes('complete') || v.includes('clear')) return 'badge-quality-good';
    if (v.includes('good') || v.includes('moderate') || v.includes('partially')) return 'badge-quality-moderate';
    return 'badge-quality-low';
  };

  return (
    <div className="evidence-quality-container">
      <div className="section-header-row mb-3">
        <div>
          <h3 className="section-subheading-serif">Evidence Quality & Strength</h3>
          <p className="section-subtext">Deterministic structural verification of submitted image clarity and coverage</p>
        </div>
      </div>

      {/* Main Evidence Strength Hero Banner (NOT FRAUD SCORE) */}
      <div className={`evidence-strength-banner ${getStrengthClass(evidence_strength)}`}>
        <div className="strength-banner-left">
          <span className="strength-badge-label">Evidence Strength Level</span>
          <div className="strength-display-row">
            <span className="strength-title-text">{evidence_strength}</span>
            <span className="strength-sub-pill">{coverage_label}</span>
          </div>
        </div>

        <div className="strength-banner-right">
          <div className="strength-rule-note">
            <span className="font-semibold text-white">Rule-based Evaluation:</span>
            {evidence_strength === 'HIGH' && (
              <p>Multiple clear photos provided, component clearly visible, and description aligns with intake.</p>
            )}
            {evidence_strength === 'MEDIUM' && (
              <p>Sufficient photos provided for triage; minor missing perspectives or partial angle visibility.</p>
            )}
            {evidence_strength === 'LOW' && (
              <p>Limited or low-resolution image coverage; damage area requires follow-up technician inquiry.</p>
            )}
          </div>
        </div>
      </div>

      {/* Quality Matrix Grid */}
      <div className="quality-metrics-grid">
        {/* Image Quality */}
        <div className="quality-metric-item">
          <div className="metric-icon-wrap bg-blue-glow">
            <Camera size={16} className="text-blue" />
          </div>
          <div className="metric-info">
            <span className="metric-title">Image Quality</span>
            <span className={`metric-pill ${getQualityBadgeClass(image_quality)}`}>
              {image_quality}
            </span>
          </div>
        </div>

        {/* Damage Visibility */}
        <div className="quality-metric-item">
          <div className="metric-icon-wrap bg-purple-glow">
            <Eye size={16} className="text-purple" />
          </div>
          <div className="metric-info">
            <span className="metric-title">Damage Visibility</span>
            <span className={`metric-pill ${getQualityBadgeClass(damage_visibility)}`}>
              {String(damage_visibility || 'CLEARLY_VISIBLE').replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* Evidence Completeness */}
        <div className="quality-metric-item">
          <div className="metric-icon-wrap bg-emerald-glow">
            <FileCheck size={16} className="text-emerald" />
          </div>
          <div className="metric-info">
            <span className="metric-title">Completeness</span>
            <span className={`metric-pill ${getQualityBadgeClass(evidence_completeness)}`}>
              {String(evidence_completeness || 'COMPLETE').replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* Usable Images Ratio */}
        <div className="quality-metric-item">
          <div className="metric-icon-wrap bg-amber-glow">
            <Activity size={16} className="text-amber" />
          </div>
          <div className="metric-info">
            <span className="metric-title">Usable Images</span>
            <span className="metric-count-text">
              <strong>{usable_image_count}</strong> of {image_count} valid
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
