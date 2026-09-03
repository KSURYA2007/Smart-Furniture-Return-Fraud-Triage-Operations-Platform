import React, { useState, useEffect, useMemo } from 'react';
import TriageFilters from '../components/triage/TriageFilters';
import TriageTable from '../components/triage/TriageTable';
import BaselineImpactCard from '../components/triage/BaselineImpactCard';
import EmptyState from '../components/common/EmptyState';
import { getAllReturns, getCustomerById, getOrdersByCustomerId, getReturnsByCustomerId, saveStoredTriageAssessment } from '../utils/storage';
import { calculateCustomerHistoryStats } from '../utils/customerHistory';
import { analyzeReturnEvidence } from '../utils/evidenceAnalysis';
import { calculateRisk } from '../services/riskEngine';
import { subscribeRealtime } from '../utils/realtimeBus';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Layers, 
  Zap, 
  Activity, 
  AlertTriangle, 
  Filter, 
  RefreshCw, 
  ArrowRight,
  RotateCcw
} from 'lucide-react';

export default function TriageDashboard({
  onSelectCase,
  onViewEvidence,
  onViewCustomer,
  greeting
}) {
  const [returnsList, setReturnsList] = useState([]);
  const [evaluatedCases, setEvaluatedCases] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedEvidenceStrength, setSelectedEvidenceStrength] = useState('ALL');
  const [sortBy, setSortBy] = useState('DEFAULT');

  // Load and evaluate all returns with realtime updates
  const loadAndEvaluate = () => {
    const all = getAllReturns();
    setReturnsList(all);

    const evaluated = all.map((returnRecord) => {
      const customerId = returnRecord.customer_id || returnRecord.customer?.customer_id;
      let customerHistoryStats = null;
      if (customerId) {
        customerHistoryStats = calculateCustomerHistoryStats(customerId);
      }

      const evidenceAnalysis = analyzeReturnEvidence(returnRecord);
      const triage = calculateRisk(returnRecord, customerHistoryStats, evidenceAnalysis);

      // Persist triage assessment in storage
      if (returnRecord.return_id && triage) {
        saveStoredTriageAssessment(returnRecord.return_id, triage);
      }

      return {
        returnRecord,
        customerHistoryStats,
        evidenceAnalysis,
        triage
      };
    });

    setEvaluatedCases(evaluated);
  };

  useEffect(() => {
    loadAndEvaluate();
    // Subscribe to realtime updates when returns, reviews, or evidence change
    const unsubscribe = subscribeRealtime('*', () => {
      loadAndEvaluate();
    });
    return unsubscribe;
  }, []);

  // Filter & Sort Logic
  const filteredAndSortedCases = useMemo(() => {
    return evaluatedCases.filter((item) => {
      const { returnRecord, triage, evidenceAnalysis } = item;
      const q = searchQuery.trim().toLowerCase();

      // Search query across ID, customer, product, reason
      if (q) {
        const retId = (returnRecord.return_id || '').toLowerCase();
        const custName = (returnRecord.customer_name || returnRecord.customer?.name || '').toLowerCase();
        const prod = (returnRecord.product || returnRecord.order?.product_name || '').toLowerCase();
        const reason = (returnRecord.reason || returnRecord.return?.reason || '').toLowerCase();
        if (!retId.includes(q) && !custName.includes(q) && !prod.includes(q) && !reason.includes(q)) {
          return false;
        }
      }

      // Risk category filter
      if (selectedCategory !== 'ALL' && triage.risk_category !== selectedCategory) {
        return false;
      }

      // Priority filter
      if (selectedPriority !== 'ALL' && triage.priority !== selectedPriority) {
        return false;
      }

      // Evidence strength filter
      if (selectedEvidenceStrength !== 'ALL') {
        const strength = evidenceAnalysis?.evidence_strength || 'MEDIUM';
        if (strength !== selectedEvidenceStrength) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'SCORE_DESC') {
        return b.triage.risk_score - a.triage.risk_score;
      }
      if (sortBy === 'SCORE_ASC') {
        return a.triage.risk_score - b.triage.risk_score;
      }
      if (sortBy === 'PRICE_DESC') {
        const priceA = Number(a.returnRecord.order?.product_price || a.returnRecord.order?.price || 0);
        const priceB = Number(b.returnRecord.order?.product_price || b.returnRecord.order?.price || 0);
        return priceB - priceA;
      }
      if (sortBy === 'DATE_DESC') {
        const dateA = new Date(a.returnRecord.return_date || a.returnRecord.created_at || 0);
        const dateB = new Date(b.returnRecord.return_date || b.returnRecord.created_at || 0);
        return dateB - dateA;
      }
      // DEFAULT: Priority order (Critical -> High -> Medium -> Low)
      const priorityRank = {
        PRIORITY_HUMAN_REVIEW: 4,
        HUMAN_REVIEW: 3,
        STANDARD_PROCESS: 2,
        FAST_TRACK: 1
      };
      const rankDiff = (priorityRank[b.triage.priority] || 0) - (priorityRank[a.triage.priority] || 0);
      if (rankDiff !== 0) return rankDiff;
      return b.triage.risk_score - a.triage.risk_score;
    });
  }, [evaluatedCases, searchQuery, selectedCategory, selectedPriority, selectedEvidenceStrength, sortBy]);

  // Aggregate Stats for Dashboard Header & Baseline Card
  const stats = useMemo(() => {
    const totalEvaluated = evaluatedCases.length;
    let fastTrackCount = 0;
    let standardCount = 0;
    let humanReviewCount = 0;
    let priorityReviewCount = 0;
    let totalPotentialLossSaved = 0;
    let estimatedTotalCo2Saved = 0;

    evaluatedCases.forEach((item) => {
      const p = item.triage?.priority;
      if (p === 'FAST_TRACK') fastTrackCount++;
      else if (p === 'STANDARD_PROCESS') standardCount++;
      else if (p === 'HUMAN_REVIEW') humanReviewCount++;
      else if (p === 'PRIORITY_HUMAN_REVIEW') priorityReviewCount++;

      totalPotentialLossSaved += item.triage?.baseline_metrics?.estimated_potential_fraud_loss || 0;
      estimatedTotalCo2Saved += item.triage?.baseline_metrics?.estimated_co2_kg || 0;
    });

    return {
      totalEvaluated,
      fastTrackCount,
      standardCount,
      humanReviewCount,
      priorityReviewCount,
      totalPotentialLossSaved,
      estimatedTotalCo2Saved: Math.round(estimatedTotalCo2Saved)
    };
  }, [evaluatedCases]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedPriority('ALL');
    setSelectedEvidenceStrength('ALL');
    setSortBy('DEFAULT');
  };

  return (
    <div className="page-wrapper triage-dashboard-page">
      {/* Page Header Hero */}
      <header className="page-header triage-header-banner">
        <div className="header-container">
          <div className="header-badge-row">
            <span className="module-badge">
              <ShieldAlert size={13} /> Module 4: Fraud Risk & Priority Engine
            </span>
          </div>
          <h1 className="page-title font-serif">Return Fraud Risk & Triage Queue</h1>
          <p className="page-description">
            Transparent, explainable risk scoring and operational routing. Fast-tracks verified genuine claims while prioritizing high-risk cases for specialized desk review.
          </p>
        </div>

        {greeting && (
          <div className="dashboard-greeting-pill">
            <span className="greeting-label">Active Operator</span>
            <span className="greeting-name">{greeting}</span>
          </div>
        )}
      </header>

      {/* 4 Summary Stat Cards */}
      <div className="summary-cards-grid triage-stats-grid mb-4">
        {/* Total Cases */}
        <div className="summary-stat-card">
          <div className="stat-icon-wrapper bg-blue-glow">
            <Activity size={20} className="icon-blue" />
          </div>
          <div className="stat-details">
            <span className="stat-label">Total Claims Evaluated</span>
            <span className="stat-number font-serif">{stats.totalEvaluated}</span>
            <span className="stat-subtext">100% Deterministic</span>
          </div>
        </div>

        {/* Fast Track (Low Risk) */}
        <div 
          className="summary-stat-card cursor-pointer hover:border-emerald-500 transition-colors"
          onClick={() => { setSelectedCategory('LOW'); setSelectedPriority('ALL'); }}
        >
          <div className="stat-icon-wrapper bg-emerald-glow">
            <Zap size={20} className="icon-emerald" />
          </div>
          <div className="stat-details">
            <span className="stat-label">Fast Track (Low Risk)</span>
            <span className="stat-number font-serif text-emerald">{stats.fastTrackCount}</span>
            <span className="stat-subtext">Immediate fulfillment</span>
          </div>
        </div>

        {/* Standard Process (Medium Risk) */}
        <div 
          className="summary-stat-card cursor-pointer hover:border-blue-500 transition-colors"
          onClick={() => { setSelectedCategory('MEDIUM'); setSelectedPriority('ALL'); }}
        >
          <div className="stat-icon-wrapper bg-blue-glow">
            <ShieldCheck size={20} className="icon-blue" />
          </div>
          <div className="stat-details">
            <span className="stat-label">Standard Process</span>
            <span className="stat-number font-serif text-blue">{stats.standardCount}</span>
            <span className="stat-subtext">Normal operations</span>
          </div>
        </div>

        {/* Human Review Required (High/Critical) */}
        <div 
          className="summary-stat-card cursor-pointer hover:border-amber-500 transition-colors"
          onClick={() => { setSelectedCategory('HIGH'); setSelectedPriority('ALL'); }}
        >
          <div className="stat-icon-wrapper bg-amber-glow">
            <AlertTriangle size={20} className="icon-amber" />
          </div>
          <div className="stat-details">
            <span className="stat-label">Human Review Required</span>
            <span className="stat-number font-serif text-amber">
              {stats.humanReviewCount + stats.priorityReviewCount}
            </span>
            <span className="stat-subtext">Prioritized for Module 5</span>
          </div>
        </div>
      </div>

      {/* Baseline Impact & Trade-Off Comparison Card */}
      <section className="mb-4">
        <BaselineImpactCard triageStats={stats} />
      </section>

      {/* Main Triage Queue Section */}
      <section className="triage-queue-section form-card">
        <div className="card-header">
          <div className="card-header-icon">
            <Filter size={20} className="icon-blue" />
          </div>
          <div className="card-header-flex">
            <div>
              <h2 className="card-title">Operational Triage Queue</h2>
              <p className="card-subtitle">
                Filter and inspect claims by risk level, operational priority, and evidence strength
              </p>
            </div>
          </div>
        </div>

        <TriageFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedPriority={selectedPriority}
          onPriorityChange={setSelectedPriority}
          selectedEvidenceStrength={selectedEvidenceStrength}
          onEvidenceStrengthChange={setSelectedEvidenceStrength}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          onResetFilters={handleResetFilters}
          totalResults={filteredAndSortedCases.length}
        />

        <TriageTable
          triageList={filteredAndSortedCases}
          onSelectCase={onSelectCase}
          onViewEvidence={onViewEvidence}
          onViewCustomer={onViewCustomer}
        />
      </section>
    </div>
  );
}
