import React, { useState, useEffect } from 'react';
import BaselineComparisonTable from '../components/metrics/BaselineComparisonTable.jsx';
import { 
  runExperimentComparison, 
  buildEvaluationDataset 
} from '../services/evaluationService.js';
import { 
  getStoredExperiments, 
  saveStoredExperiment, 
  getStoredEvaluationConfig, 
  saveStoredEvaluationConfig 
} from '../utils/storage.js';

import { 
  FlaskConical, 
  Play, 
  History, 
  CheckCircle2, 
  RotateCcw, 
  ArrowLeft, 
  Sliders, 
  Settings,
  Calendar,
  Layers,
  BarChart2,
  Table,
  AlertTriangle,
  FileText
} from 'lucide-react';

export default function ExperimentRunner({
  onBackToDashboard,
  onNavigateDashboard,
  onNavigateCases,
  onNavigateValidation,
  onNavigateLimitations,
  onNavigateReport
}) {
  const [config, setConfig] = useState(() => getStoredEvaluationConfig());
  const [activeResults, setActiveResults] = useState(null);
  const [history, setHistory] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [runNotice, setRunNotice] = useState(false);

  useEffect(() => {
    setHistory(getStoredExperiments());
    // Auto-run baseline comparison with current config on load
    const initialRun = runExperimentComparison(config);
    setActiveResults(initialRun);
  }, []);

  const handleRunExperiment = () => {
    setIsRunning(true);
    saveStoredEvaluationConfig(config);

    // Deterministic simulation
    setTimeout(() => {
      const results = runExperimentComparison(config);
      setActiveResults(results);

      // Save to experiment history (Section 38 & 39)
      const experimentRecord = {
        experiment_id: `EXP-${Date.now()}`,
        dataset_id: config.datasetMode || 'CURRENT',
        baseline: 'FIFO Baseline',
        proposed_strategy: 'Risk-Aware Triage + Operations',
        configuration: config,
        results: results
      };
      saveStoredExperiment(experimentRecord);
      setHistory(getStoredExperiments());

      setIsRunning(false);
      setRunNotice(true);
      setTimeout(() => setRunNotice(false), 3500);
    }, 400);
  };

  const handleLoadPastExperiment = (exp) => {
    if (exp && exp.results) {
      setActiveResults(exp.results);
      if (exp.configuration) setConfig(exp.configuration);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="page-wrapper experiment-runner-page">
      {/* Sub-Navigation Bar */}
      <div className="metrics-subnav-bar flex items-center justify-between flex-wrap gap-2 mb-4 p-2 rounded bg-surface border border-subtle">
        <div className="flex items-center gap-1 flex-wrap">
          {onNavigateDashboard && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateDashboard}>
              <BarChart2 size={13} /> Dashboard
            </button>
          )}
          <button type="button" className="btn-primary btn-xs flex items-center gap-1">
            <FlaskConical size={13} /> Experiment Simulator
          </button>
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
      </div>

      {/* Hero Header */}
      <header className="page-header experiment-header mb-4">
        <div className="header-container">
          <div className="header-badge-row">
            <span className="module-badge">
              <FlaskConical size={13} /> Module 7: Deterministic Experiment Simulator
            </span>
          </div>
          <h1 className="page-title font-serif">A/B Baseline Experiment Runner</h1>
          <p className="page-description">
            Run deterministic comparisons between standard First-In-First-Out (FIFO) queue processing and multi-objective Risk-Aware Triage across identical returns.
          </p>
        </div>
      </header>

      {/* Success Notification */}
      {runNotice && (
        <div className="p-3 rounded bg-emerald-bg border border-emerald-border mb-4 flex items-center gap-2 text-xs">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span className="text-emerald-300 font-semibold">
            Experiment executed successfully! Results saved in experiment run history.
          </span>
        </div>
      )}

      {/* Experiment Controls Form Card (Section 10 & 36) */}
      <div className="experiment-controls-card form-card mb-4">
        <div className="card-header border-bottom pb-2 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="card-header-icon bg-primary-light">
                <Settings size={16} className="icon-blue" />
              </div>
              <div>
                <h3 className="card-title text-base">Experiment Configuration & Scenario Controls</h3>
                <p className="card-subtitle">Adjust operational parameters and observe simulated outcomes</p>
              </div>
            </div>
            <span className="badge-prototype-tag uppercase font-bold text-2xs">Scenario Simulation</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mb-4">
          <div className="form-group">
            <label className="form-label text-xs font-bold">Evaluation Dataset:</label>
            <select
              className="form-select text-xs"
              value={config.datasetMode || 'CURRENT'}
              onChange={(e) => setConfig({ ...config, datasetMode: e.target.value })}
            >
              <option value="CURRENT">Current Operational Returns (Intake + Seed)</option>
              <option value="DEMO">Demo Cases Only (Cases A through I)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label text-xs font-bold">Target SLA Window (Days):</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="14"
                className="w-full"
                value={config.targetSlaDays || 7}
                onChange={(e) => setConfig({ ...config, targetSlaDays: Number(e.target.value) })}
              />
              <span className="font-mono font-bold text-sm w-12 text-primary">{config.targetSlaDays || 7}d</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label text-xs font-bold">Enhanced Review Risk Cutoff:</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="20"
                max="80"
                step="5"
                className="w-full"
                value={config.enhancedReviewThreshold || 50}
                onChange={(e) => setConfig({ ...config, enhancedReviewThreshold: Number(e.target.value) })}
              />
              <span className="font-mono font-bold text-sm w-12 text-primary">{config.enhancedReviewThreshold || 50}</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label text-xs font-bold">Fleet Cost per KM (₹):</label>
            <input
              type="number"
              min="10"
              max="50"
              className="form-input text-xs font-mono"
              value={config.costPerKm || 18}
              onChange={(e) => setConfig({ ...config, costPerKm: Number(e.target.value) })}
            />
          </div>

          <div className="form-group">
            <label className="form-label text-xs font-bold">CO₂ Factor (kg/km):</label>
            <input
              type="number"
              step="0.01"
              min="0.10"
              max="1.00"
              className="form-input text-xs font-mono"
              value={config.co2EmissionFactor || 0.27}
              onChange={(e) => setConfig({ ...config, co2EmissionFactor: Number(e.target.value) })}
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              className="btn-primary btn-md w-full flex items-center justify-center gap-2 font-bold"
              onClick={handleRunExperiment}
              disabled={isRunning}
            >
              <Play size={15} />
              <span>{isRunning ? 'Calculating...' : 'Run Deterministic Experiment'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Experiment Results Table */}
      {activeResults && (
        <BaselineComparisonTable comparison={activeResults.comparison} />
      )}

      {/* Experiment History Section (Section 39) */}
      <div className="experiment-history-card form-card mb-4">
        <div className="card-header border-bottom pb-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="card-header-icon bg-primary-light">
              <History size={16} className="icon-blue" />
            </div>
            <div>
              <h3 className="card-title text-base">Experiment Run History</h3>
              <p className="card-subtitle">Stored historical benchmark runs in localStorage</p>
            </div>
          </div>
        </div>

        {history.length === 0 ? (
          <p className="text-dim text-xs p-3 text-center">No previous experiment runs recorded yet.</p>
        ) : (
          <div className="pickup-table-wrapper">
            <table className="pickup-queue-table text-xs">
              <thead>
                <tr>
                  <th>Experiment ID</th>
                  <th>Date & Time</th>
                  <th>Dataset</th>
                  <th>SLA Target</th>
                  <th>Fraud Loss Change</th>
                  <th>SLA Delta</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {history.map(item => (
                  <tr key={item.experiment_id}>
                    <td className="font-serif-id font-bold text-primary">{item.experiment_id}</td>
                    <td className="text-dim">{new Date(item.created_at).toLocaleString('en-IN')}</td>
                    <td>{item.dataset_id}</td>
                    <td className="font-mono">{item.configuration?.targetSlaDays || 7} days</td>
                    <td className="font-mono text-emerald-400 font-bold">
                      {item.results?.comparison?.fraudLossExposure?.percentageChange || 'N/A'}
                    </td>
                    <td className="font-mono text-emerald-300">
                      {item.results?.comparison?.slaCompliance?.difference || '0%'}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-ghost btn-xs"
                        onClick={() => handleLoadPastExperiment(item)}
                      >
                        View Results &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
