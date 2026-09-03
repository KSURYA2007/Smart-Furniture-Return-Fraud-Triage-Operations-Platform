import React, { useState } from 'react';
import { Layers, Package, Tag, Filter } from 'lucide-react';
import { formatCurrencyINR } from '../../utils/customerHistory.js';

export default function EvidenceBreakdownCard({ dataset = [] }) {
  const [activeTab, setActiveTab] = useState('EVIDENCE'); // 'EVIDENCE' | 'REASON' | 'PRODUCT'

  if (!dataset || dataset.length === 0) return null;

  // 1. Evidence Quality Aggregates
  const evidenceGroups = ['HIGH', 'MEDIUM', 'LOW'].map(level => {
    const subset = dataset.filter(c => c.evidence.strength === level);
    const fraudCount = subset.filter(c => c.groundTruth.label === 'FRAUD_CONFIRMED').length;
    const legitCount = subset.filter(c => c.groundTruth.label === 'LEGITIMATE').length;
    const avgRisk = subset.length > 0 ? (subset.reduce((sum, c) => sum + c.triage.riskScore, 0) / subset.length).toFixed(1) : 0;
    const reviewedCount = subset.filter(c => c.review.humanDecision !== 'PENDING_REVIEW').length;
    const reviewRate = subset.length > 0 ? ((reviewedCount / subset.length) * 100).toFixed(0) : 0;
    return { level, total: subset.length, fraudCount, legitCount, avgRisk, reviewRate };
  });

  // 2. Reason Aggregates
  const reasonMap = {};
  dataset.forEach(c => {
    const r = c.category || 'Other';
    if (!reasonMap[r]) {
      reasonMap[r] = { name: r, total: 0, fraudCount: 0, sumRisk: 0, sumVal: 0 };
    }
    reasonMap[r].total += 1;
    if (c.groundTruth.label === 'FRAUD_CONFIRMED') reasonMap[r].fraudCount += 1;
    reasonMap[r].sumRisk += c.triage.riskScore;
    reasonMap[r].sumVal += c.orderValue;
  });
  const reasonList = Object.values(reasonMap);

  return (
    <div className="evidence-breakdown-card form-card mb-4">
      <div className="card-header border-bottom pb-2 mb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="card-header-icon bg-primary-light">
              <Layers size={16} className="icon-blue" />
            </div>
            <div>
              <h3 className="card-title text-base">Multidimensional Quality & Category Analysis</h3>
              <p className="card-subtitle">
                Evaluating triage reliability across photographic proof quality, claim reasons, and furniture categories
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              className={`btn-xs ${activeTab === 'EVIDENCE' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('EVIDENCE')}
            >
              Evidence Quality
            </button>
            <button
              type="button"
              className={`btn-xs ${activeTab === 'REASON' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('REASON')}
            >
              Product Categories
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'EVIDENCE' ? (
        <div className="pickup-table-wrapper">
          <table className="pickup-queue-table text-xs">
            <thead>
              <tr>
                <th>Evidence Strength</th>
                <th className="text-center">Total Returns</th>
                <th className="text-center">Confirmed Fraud</th>
                <th className="text-center">Confirmed Genuine</th>
                <th className="text-center">Avg Triage Risk</th>
                <th className="text-right">Review Rate %</th>
              </tr>
            </thead>
            <tbody>
              {evidenceGroups.map(grp => (
                <tr key={grp.level}>
                  <td>
                    <strong className="font-bold text-secondary font-mono">{grp.level} STRENGTH</strong>
                  </td>
                  <td className="text-center font-mono">{grp.total}</td>
                  <td className="text-center font-mono text-red-400 font-bold">{grp.fraudCount}</td>
                  <td className="text-center font-mono text-emerald-400 font-bold">{grp.legitCount}</td>
                  <td className="text-center font-mono text-primary font-bold">{grp.avgRisk}</td>
                  <td className="text-right font-mono text-dim">{grp.reviewRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="pickup-table-wrapper">
          <table className="pickup-queue-table text-xs">
            <thead>
              <tr>
                <th>Category</th>
                <th className="text-center">Total Returns</th>
                <th className="text-center">Confirmed Fraud</th>
                <th className="text-center">Avg Risk Score</th>
                <th className="text-right">Avg Order Value</th>
              </tr>
            </thead>
            <tbody>
              {reasonList.map(item => (
                <tr key={item.name}>
                  <td>
                    <strong className="text-secondary">{item.name}</strong>
                  </td>
                  <td className="text-center font-mono">{item.total}</td>
                  <td className="text-center font-mono text-amber-300 font-bold">{item.fraudCount}</td>
                  <td className="text-center font-mono text-primary">
                    {item.total > 0 ? (item.sumRisk / item.total).toFixed(1) : 0}
                  </td>
                  <td className="text-right font-mono text-secondary">
                    {formatCurrencyINR(item.total > 0 ? Math.round(item.sumVal / item.total) : 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
