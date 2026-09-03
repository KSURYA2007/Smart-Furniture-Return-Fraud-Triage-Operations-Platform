import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Server, 
  Settings, 
  Sliders, 
  Code2, 
  Terminal 
} from 'lucide-react';
import { 
  getApiMode, 
  setApiMode, 
  getFailureSimulation, 
  setFailureSimulation, 
  apiClient 
} from '../api/apiClient.js';
import { API_MODES } from '../api/contracts.js';

export default function ApiStatus({
  onNavigateDocs,
  onNavigateTest
}) {
  const [mode, setMode] = useState(getApiMode());
  const [simFailure, setSimFailure] = useState(getFailureSimulation() || 'NONE');
  const [healthData, setHealthData] = useState(null);
  const [pingLatency, setPingLatency] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkHealth = async () => {
    setIsChecking(true);
    const start = performance.now();
    try {
      const res = await apiClient.get('/api/health');
      const elapsed = Math.round(performance.now() - start);
      setPingLatency(elapsed);
      setHealthData(res);
    } catch (e) {
      setHealthData({ success: false, error: { message: e.message } });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, [mode, simFailure]);

  const handleToggleMode = (newMode) => {
    setApiMode(newMode);
    setMode(newMode);
  };

  const handleSimFailureChange = (val) => {
    const sim = val === 'NONE' ? null : val;
    setFailureSimulation(sim);
    setSimFailure(val);
  };

  const isHealthy = healthData?.success && healthData?.data?.status === 'OK';

  return (
    <div className="page-wrapper api-status-page">
      {/* Sub-Navigation Bar */}
      <div className="metrics-subnav-bar flex items-center justify-between flex-wrap gap-2 mb-4 p-2 rounded bg-surface border border-subtle">
        <div className="flex items-center gap-1 flex-wrap">
          {onNavigateDocs && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateDocs}>
              <Code2 size={13} /> API Documentation
            </button>
          )}
          <button type="button" className="btn-primary btn-xs flex items-center gap-1">
            <CheckCircle2 size={13} /> API Status & Health
          </button>
          {onNavigateTest && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateTest}>
              <Terminal size={13} /> Interactive Test Panel
            </button>
          )}
        </div>

        <button
          type="button"
          className="btn-secondary btn-xs flex items-center gap-1"
          onClick={checkHealth}
          disabled={isChecking}
        >
          <RefreshCw size={11} className={isChecking ? 'animate-spin' : ''} />
          <span>Ping API Health</span>
        </button>
      </div>

      {/* Hero Header */}
      <header className="page-header status-header mb-4">
        <div className="header-container">
          <div className="header-badge-row">
            <span className="module-badge">
              <Server size={13} /> Module 8: Health & Runtime Monitoring
            </span>
          </div>
          <h1 className="page-title font-serif">API Integration Health & Failure Injection</h1>
          <p className="page-description">
            Live health verification, offline mock adapter controls, and synthetic failure simulation for integration robustness testing.
          </p>
        </div>
      </header>

      {/* Failure Simulation Banner if active */}
      {simFailure !== 'NONE' && (
        <div className="p-3 rounded bg-amber-bg border border-amber-border mb-4 text-xs flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-400 flex-shrink-0" />
          <span className="text-amber-200">
            <strong>Active Synthetic Failure Injection:</strong> All API requests will intentionally return simulated <code>{simFailure}</code>. Disable below to restore normal responses.
          </span>
        </div>
      )}

      {/* Main Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-xs">
        {/* Connection Status Card */}
        <div className={`form-card p-3 ${isHealthy ? 'border-emerald' : 'border-red'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-dim uppercase font-bold text-3xs">API Connection</span>
            {isHealthy ? <Wifi size={16} className="text-emerald-400" /> : <WifiOff size={16} className="text-red-400" />}
          </div>
          <div className={`text-xl font-bold font-mono ${isHealthy ? 'text-emerald-400' : 'text-red-400'}`}>
            {isHealthy ? 'CONNECTED' : 'DISRUPTED'}
          </div>
          <p className="text-dim text-3xs mt-1">
            Endpoint ping latency: <strong>{pingLatency !== null ? `${pingLatency}ms` : '---'}</strong>
          </p>
        </div>

        {/* API Mode Card */}
        <div className="form-card p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-dim uppercase font-bold text-3xs">Operating Mode</span>
            <Server size={16} className="text-primary-light" />
          </div>
          <div className="text-xl font-bold font-mono text-primary uppercase">
            {mode === API_MODES.MOCK ? 'MOCK ADAPTER' : 'LIVE REST API'}
          </div>
          <div className="flex gap-1.5 mt-2">
            <button
              type="button"
              className={`btn-xs ${mode === API_MODES.MOCK ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => handleToggleMode(API_MODES.MOCK)}
            >
              MOCK Mode
            </button>
            <button
              type="button"
              className={`btn-xs ${mode === API_MODES.API ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => handleToggleMode(API_MODES.API)}
            >
              API Mode
            </button>
          </div>
        </div>

        {/* Runtime Version Card */}
        <div className="form-card p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-dim uppercase font-bold text-3xs">API Contract Version</span>
            <Code2 size={16} className="text-secondary" />
          </div>
          <div className="text-xl font-bold font-mono text-secondary">
            prototype-v1
          </div>
          <p className="text-dim text-3xs mt-1">
            OpenAPI Decoupled Layer Active
          </p>
        </div>
      </div>

      {/* Section 56: Failure Simulation Controls */}
      <div className="form-card mb-4 text-xs">
        <div className="card-header border-bottom pb-2 mb-3">
          <div className="flex items-center gap-2">
            <Sliders size={16} className="text-amber-400" />
            <h3 className="card-title text-base">Synthetic Failure Simulator (Development & Resilience Testing)</h3>
          </div>
          <p className="card-subtitle">
            Force the API client to return artificial network errors or HTTP failure codes to verify graceful error boundaries
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap mb-2">
          {[
            { id: 'NONE', label: 'Disable Simulation (Normal 200 OK)' },
            { id: 'NETWORK_ERROR', label: 'Simulate Network Disconnection' },
            { id: 'TIMEOUT', label: 'Simulate Gateway Timeout (10s)' },
            { id: '401', label: 'Simulate 401 Unauthorized' },
            { id: '403', label: 'Simulate 403 Forbidden' },
            { id: '404', label: 'Simulate 404 Not Found' },
            { id: '409', label: 'Simulate 409 Conflict' },
            { id: '422', label: 'Simulate 422 Validation Error' },
            { id: '500', label: 'Simulate 500 Server Error' }
          ].map(opt => (
            <button
              key={opt.id}
              type="button"
              className={`btn-xs ${simFailure === opt.id ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => handleSimFailureChange(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Raw Health Check Response */}
      <div className="form-card text-xs">
        <h4 className="font-bold text-xs text-secondary mb-2">Raw Health Ping Response (/api/health):</h4>
        <pre className="p-3 rounded bg-surface border border-subtle font-mono text-3xs text-emerald-400 overflow-x-auto">
          {JSON.stringify(healthData, null, 2)}
        </pre>
      </div>
    </div>
  );
}
