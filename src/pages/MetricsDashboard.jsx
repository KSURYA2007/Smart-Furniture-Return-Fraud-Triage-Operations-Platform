import React, { useState, useEffect } from 'react';
import ExecutiveSummaryCards from '../components/metrics/ExecutiveSummaryCards.jsx';
import BaselineComparisonTable from '../components/metrics/BaselineComparisonTable.jsx';
import ConfusionMatrixCard from '../components/metrics/ConfusionMatrixCard.jsx';
import ThresholdAnalysisCard from '../components/metrics/ThresholdAnalysisCard.jsx';
import LegitimateProtectionCard from '../components/metrics/LegitimateProtectionCard.jsx';
import FraudProtectionCard from '../components/metrics/FraudProtectionCard.jsx';
import WorkloadAgreementCard from '../components/metrics/WorkloadAgreementCard.jsx';
import EvidenceBreakdownCard from '../components/metrics/EvidenceBreakdownCard.jsx';

import { 
  buildEvaluationDataset, 
  runExperimentComparison, 
  calculateThresholdTradeoffs 
} from '../services/evaluationService.js';

import { 
  BarChart2, 
  FlaskConical, 
  Table, 
  FileText, 
  ShieldAlert, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle,
  Compass,
  ArrowRight
} from 'lucide-react';

export default function MetricsDashboard({
  onNavigateExperiment,
  onNavigateCases,
  onNavigateValidation,
  onNavigateLimitations,
  onNavigateReport,
  onSelectCase
}) {
  const [experimentResults, setExperimentResults] = useState(null);
  const [evaluationDataset, setEvaluationDataset] = useState([]);
  const [thresholdTradeoffs, setThresholdTradeoffs] = useState([]);
  const [selectedThreshold, setSelectedThreshold] = useState(50);

  const loadData = (threshold = 50) => {
    const dataset = buildEvaluationDataset();
    setEvaluationDataset(dataset);

    const results = runExperimentComparison({ enhancedReviewThreshold: threshold });
    setExperimentResults(results);

    const tradeoffs = calculateThresholdTradeoffs(dataset);
    setThresholdTradeoffs(tradeoffs);
  };

  useEffect(() => {
    loadData(selectedThreshold);
  }, [selectedThreshold]);

  const handleSelectThreshold = (th) => {
    setSelectedThreshold(th);
  };

  return (
    <div className="page-wrapper metrics-dashboard-page">
      {/* Sub-Navigation Bar for Module 7 Views */}
      <div className="metrics-subnav-bar flex items-center justify-between flex-wrap gap-2 mb-4 p-2 rounded bg-surface border border-subtle">
        <div className="flex items-center gap-1 flex-wrap">
          <button type="button" className="btn-primary btn-xs flex items-center gap-1">
            <BarChart2 size={13} /> Dashboard
          </button>
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
          {onNavigateValidation && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateValidation}>
              <CheckCircle2 size={13} /> Stakeholder Validation
            </button>
          )}
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

        <span className="badge-prototype-tag font-bold text-2xs uppercase">
          Status: COMPLETED (Prototype Simulation)
        </span>
      </div>

      {/* Hero Header */}
      <header className="page-header metrics-header mb-4">
        <div className="header-container">
          <div className="header-badge-row">
            <span className="module-badge">
              <BarChart2 size={13} /> Module 7: Metrics, Experiment & Validation Layer
            </span>
          </div>
          <h1 className="page-title font-serif">Return Fraud Triage Evaluation</h1>
          <p className="page-description">
            Evidence-focused, human-in-the-loop quantitative benchmark comparing conventional FIFO Baseline with proposed multi-objective triage.
          </p>
        </div>

        {/* Section 57 Key Project Claim Callout Banner */}
        <div className="key-claim-banner mt-3 p-3 rounded bg-surface border border-card flex items-center justify-between flex-wrap gap-2 text-xs">
          <div>
            <span className="text-dim text-2xs uppercase font-bold block mb-0.5">Core Measurable Claim:</span>
            <span className="text-secondary italic">
              &ldquo;The proposed workflow aims to reduce potential fraud-loss exposure while minimizing unnecessary review and pickup delays for legitimate customers.&rdquo;
            </span>
          </div>
          <span className="badge-sla-on-track font-bold text-xs flex items-center gap-1">
            <CheckCircle2 size={14} /> Evidence from prototype experiment supports the objective
          </span>
        </div>
      </header>

      {/* Top 8 Executive KPI Cards */}
      <ExecutiveSummaryCards results={experimentResults} />

      {/* Section 11: Side-by-Side Baseline vs Proposed Comparison */}
      <BaselineComparisonTable comparison={experimentResults?.comparison} />

      {/* 2-Column Section: Confusion Matrix & Sensitivity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ConfusionMatrixCard detection={experimentResults?.detection} />
        <ThresholdAnalysisCard
          thresholdData={thresholdTradeoffs}
          currentThreshold={selectedThreshold}
          onSelectThreshold={handleSelectThreshold}
        />
      </div>

      {/* Section 32: Legitimate Customer Protection */}
      <LegitimateProtectionCard
        results={experimentResults}
        onSelectCase={onSelectCase}
      />

      {/* Section 33: Fraud-Loss Prevention Dashboard */}
      <FraudProtectionCard
        results={experimentResults}
        onSelectCase={onSelectCase}
      />

      {/* Section 25, 26, 27: Review Workload & Agreement */}
      <WorkloadAgreementCard workload={experimentResults?.workload} />

      {/* Section 28, 29, 30: Multidimensional Breakdown */}
      <EvidenceBreakdownCard dataset={evaluationDataset} />
    </div>
  );
}
