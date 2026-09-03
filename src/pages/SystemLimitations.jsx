import React from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  HelpCircle, 
  FileText,
  BarChart2,
  FlaskConical,
  Table,
  CheckCircle2
} from 'lucide-react';

export default function SystemLimitations({
  onNavigateDashboard,
  onNavigateExperiment,
  onNavigateCases,
  onNavigateValidation,
  onNavigateReport
}) {
  const limitations = [
    {
      title: '1. Small Prototype Dataset',
      description: 'The current proof-of-concept operates across a curated cohort of prototype returns. While sufficient to validate logical rule behavior, metrics cannot be extrapolated directly to enterprise scale without larger field testing.'
    },
    {
      title: '2. Synthetic & Demo Return Data',
      description: 'Customer profiles, delivery addresses, and photo proofs are synthetic representations designed for safe demonstration. No personally identifiable information (PII) or confidential carrier data is stored.'
    },
    {
      title: '3. Deterministic Rule-Based Engine (No Machine Learning)',
      description: 'Risk assessment is calculated through transparent arithmetic weights rather than deep learning or statistical probability models. The system guarantees explainability, but does not self-adapt to novel fraud evasion patterns without manual weight updates.'
    },
    {
      title: '4. Estimated Financial Loss Exposures',
      description: 'Financial exposure metrics assume total item invoice loss for confirmed fraud. In real-world salvage operations, partial secondary liquidation or parts recovery may offset net loss.'
    },
    {
      title: '5. Prototype Carbon (CO₂) and Mileage Model',
      description: 'Carbon emissions are calculated using a static conversion factor (0.27 kg CO₂/km for light cargo vans). Traffic congestion, cold starts, and multi-drop delivery topologies are simplified.'
    },
    {
      title: '6. Human Review Subjectivity & Discretion',
      description: 'Human decision-making can vary between dispatchers. While operational rules provide guidelines, human-in-the-loop decisions remain subject to individual discretion and fatigue.'
    },
    {
      title: '7. Ground Truth Latency & Imperfection',
      description: 'In live retail reverse logistics, confirmed fraud is often discovered weeks post-pickup following technical depot tear-downs. Ground truth in the prototype is managed manually by evaluators.'
    },
    {
      title: '8. Simplified Fleet & Routing Constraints',
      description: 'Route clustering groups returns by municipal area corridors (e.g., Indiranagar, Whitefield) rather than solving a live Traveling Salesperson Problem (TSP) with dynamic traffic constraints.'
    },
    {
      title: '9. Non-Causal Prototype Simulation',
      description: 'Comparative benchmark gains against FIFO are simulated based on queue arrival positions and clustering efficiencies. It demonstrates operational mechanics but does not constitute a randomized controlled trial (RCT).'
    },
    {
      title: '10. Mandatory Human-in-the-Loop Safeguard',
      description: 'The automated engine is strictly assistive. To prevent discriminatory or unfair customer harm, the platform never automatically denies returns or cancels pickups without authorized human review.'
    }
  ];

  return (
    <div className="page-wrapper limitations-page">
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
          {onNavigateValidation && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateValidation}>
              <CheckCircle2 size={13} /> Stakeholder Validation
            </button>
          )}
          <button type="button" className="btn-primary btn-xs flex items-center gap-1">
            <AlertTriangle size={13} /> Limitations
          </button>
          {onNavigateReport && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateReport}>
              <FileText size={13} /> Report & Export
            </button>
          )}
        </div>
      </div>

      {/* Hero Header */}
      <header className="page-header limitations-header mb-4">
        <div className="header-container">
          <div className="header-badge-row">
            <span className="module-badge">
              <AlertTriangle size={13} /> Module 7: Scientific Integrity & System Limitations
            </span>
          </div>
          <h1 className="page-title font-serif">Prototype Boundaries & Model Limitations</h1>
          <p className="page-description">
            Transparent disclosure of experimental assumptions, simulation simplifications, and real-world deployment considerations.
          </p>
        </div>
      </header>

      {/* Limitations List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {limitations.map((lim, index) => (
          <div key={index} className="form-card p-3">
            <h4 className="font-bold text-xs text-amber-300 mb-1 flex items-center gap-1.5">
              <AlertTriangle size={13} className="text-amber-400" />
              <span>{lim.title}</span>
            </h4>
            <p className="text-dim text-xs leading-relaxed">
              {lim.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
