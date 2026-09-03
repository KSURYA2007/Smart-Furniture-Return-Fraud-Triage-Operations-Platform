import React, { useState } from 'react';
import { 
  Code2, 
  Terminal, 
  Database, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Truck, 
  UserCheck, 
  BarChart2, 
  Copy 
} from 'lucide-react';

export default function ApiDocs({
  onNavigateStatus,
  onNavigateTest
}) {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [copiedPath, setCopiedPath] = useState(null);

  const endpoints = [
    {
      method: 'GET',
      path: '/api/health',
      domain: 'SYSTEM',
      summary: 'System health check and mock adapter status',
      response: `{ "success": true, "data": { "status": "OK", "version": "prototype-v1" } }`
    },
    {
      method: 'GET',
      path: '/api/returns',
      domain: 'RETURNS',
      summary: 'List all return intake claims with pagination & filtering',
      response: `{ "success": true, "data": [ ... ], "meta": { "total": 12 } }`
    },
    {
      method: 'POST',
      path: '/api/returns',
      domain: 'RETURNS',
      summary: 'Submit new return intake claim',
      requestBody: `{ "customerId": "CUS-1024", "orderId": "ORD-1001", "productId": "PROD-SOFA", "returnReason": "Defective mechanism", "location": { "address": "120 Indiranagar", "city": "Bengaluru" } }`,
      response: `{ "success": true, "data": { "returnId": "RET-2024-004001", "status": "INTAKE_COMPLETED" } }`
    },
    {
      method: 'GET',
      path: '/api/returns/:returnId',
      domain: 'RETURNS',
      summary: 'Fetch full return intake claim and geocoded address',
      response: `{ "success": true, "data": { "return_id": "RET-2024-003001", "product": "Nordic Sofa", ... } }`
    },
    {
      method: 'GET',
      path: '/api/customers/:customerId/history',
      domain: 'CUSTOMERS',
      summary: 'Get customer lifetime orders, return frequency, and verified fraud history',
      response: `{ "success": true, "data": { "totalOrders": 8, "totalReturns": 2, "returnRate": "25.0%", "confirmedFraudCount": 0 } }`
    },
    {
      method: 'GET',
      path: '/api/returns/:returnId/evidence',
      domain: 'EVIDENCE',
      summary: 'Retrieve photographic proof metadata, image quality, and damage visibility',
      response: `{ "success": true, "data": { "evidence_strength": "HIGH", "damage_visibility": "CLEAR_DAMAGE", "condition_consistency": "CONSISTENT" } }`
    },
    {
      method: 'GET',
      path: '/api/returns/:returnId/triage',
      domain: 'TRIAGE',
      summary: 'Execute automated 6-factor risk triage calculation',
      response: `{ "success": true, "data": { "risk_score": 45, "risk_category": "MEDIUM", "system_recommendation": "STANDARD_REVIEW" } }`
    },
    {
      method: 'GET',
      path: '/api/triage/rules',
      domain: 'TRIAGE',
      summary: 'Get risk scoring engine weights, thresholds, and version rules',
      response: `{ "version": "rules-v1", "weights": { "historicalFraud": 30, "returnBehaviour": 20, ... } }`
    },
    {
      method: 'GET',
      path: '/api/reviews',
      domain: 'REVIEWS',
      summary: 'List human review queue with override flags and statuses',
      response: `{ "success": true, "data": { ... } }`
    },
    {
      method: 'POST',
      path: '/api/reviews/:returnId/decision',
      domain: 'REVIEWS',
      summary: 'Submit binding human operational review decision',
      requestBody: `{ "decision": "APPROVE_PICKUP", "reason": "Verified clear transit packaging tear.", "reviewer": { "name": "S. Sharma", "role": "Operations" } }`,
      response: `{ "success": true, "data": { "decision": "APPROVE_PICKUP", "recordedAt": "..." } }`
    },
    {
      method: 'GET',
      path: '/api/pickups',
      domain: 'PICKUPS',
      summary: 'List prioritised reverse logistics pickup queue',
      response: `{ "success": true, "data": [ ... ] }`
    },
    {
      method: 'POST',
      path: '/api/pickups/:returnId/schedule',
      domain: 'PICKUPS',
      summary: 'Schedule driver, vehicle, and time slot for approved return (duplicate protected)',
      requestBody: `{ "pickupDate": "2024-11-04", "timeSlot": "09:00 AM – 12:00 PM", "driver": { "id": "DRV-01" }, "vehicle": { "id": "VEH-01" } }`,
      response: `{ "success": true, "data": { "status": "SCHEDULED", "pickupId": "PKP-RET-001" } }`
    },
    {
      method: 'POST',
      path: '/api/pickups/:returnId/priority-override',
      domain: 'PICKUPS',
      summary: 'Manually adjust pickup priority with mandatory justification',
      requestBody: `{ "newScore": 85, "newLevel": "CRITICAL", "reason": "VIP corporate account escalation" }`,
      response: `{ "success": true, "data": { "overridden": true, "newScore": 85 } }`
    },
    {
      method: 'GET',
      path: '/api/pickup-batches',
      domain: 'PICKUPS',
      summary: 'Get clustered route batches by geographic corridor',
      response: `{ "success": true, "data": [ { "batch_id": "BATCH-BLR-EAST", "total_items": 3, "consolidated_distance_km": 13.6 } ] }`
    },
    {
      method: 'GET',
      path: '/api/metrics/dashboard',
      domain: 'METRICS',
      summary: 'Retrieve executive evaluation benchmark (Baseline vs Proposed)',
      response: `{ "success": true, "data": { "comparison": { ... }, "detection": { ... } } }`
    },
    {
      method: 'POST',
      path: '/api/evaluation/:returnId/ground-truth',
      domain: 'METRICS',
      summary: 'Assign verified operational ground truth label for model accuracy evaluation',
      requestBody: `{ "label": "FRAUD_CONFIRMED", "fraudLoss": 25000, "source": "Investigation" }`,
      response: `{ "success": true, "data": { "groundTruth": "FRAUD_CONFIRMED" } }`
    },
    {
      method: 'GET',
      path: '/api/audit/:returnId',
      domain: 'AUDIT',
      summary: 'Read chronological lifecycle operational audit trail',
      response: `{ "success": true, "data": [ { "action": "Return created", ... } ] }`
    }
  ];

  const filteredEndpoints = activeCategory === 'ALL'
    ? endpoints
    : endpoints.filter(e => e.domain === activeCategory);

  const handleCopy = (path) => {
    navigator.clipboard?.writeText(path);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  return (
    <div className="page-wrapper api-docs-page">
      {/* Sub-Navigation Bar */}
      <div className="metrics-subnav-bar flex items-center justify-between flex-wrap gap-2 mb-4 p-2 rounded bg-surface border border-subtle">
        <div className="flex items-center gap-1 flex-wrap">
          <button type="button" className="btn-primary btn-xs flex items-center gap-1">
            <Code2 size={13} /> API Documentation
          </button>
          {onNavigateStatus && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateStatus}>
              <CheckCircle2 size={13} /> API Status & Health
            </button>
          )}
          {onNavigateTest && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateTest}>
              <Terminal size={13} /> Interactive Test Panel
            </button>
          )}
        </div>
        <span className="badge-prototype-tag font-bold text-2xs uppercase">
          OpenAPI 3.0 Compatible REST Contract
        </span>
      </div>

      {/* Hero Header */}
      <header className="page-header api-header mb-4">
        <div className="header-container">
          <div className="header-badge-row">
            <span className="module-badge">
              <Code2 size={13} /> Module 8: REST API Architecture & Backend Stub
            </span>
          </div>
          <h1 className="page-title font-serif">Integration API Specification</h1>
          <p className="page-description">
            Complete REST API contract decoupling the React frontend from localStorage, ready for production backend microservice replacement.
          </p>
        </div>
      </header>

      {/* Module Integration Matrix (Section 64) */}
      <div className="form-card mb-4">
        <div className="card-header border-bottom pb-2 mb-3">
          <h3 className="card-title text-base">Module Integration Architecture Matrix</h3>
          <p className="card-subtitle">Mapping functional domains to decoupled API endpoints</p>
        </div>

        <div className="pickup-table-wrapper">
          <table className="pickup-queue-table text-xs">
            <thead>
              <tr>
                <th>Module</th>
                <th>API Service</th>
                <th>Primary Entities & Responsibility</th>
                <th>Integration Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>M1: Return Intake</strong></td>
                <td><code className="text-primary font-mono">returnsApi</code></td>
                <td>Return intake claim, preferred slot, address geocode</td>
                <td><span className="badge-sla-on-track font-bold">READY (Mock/API)</span></td>
              </tr>
              <tr>
                <td><strong>M2: Customer History</strong></td>
                <td><code className="text-primary font-mono">customersApi</code></td>
                <td>Lifetime orders, return rate velocity, verified fraud records</td>
                <td><span className="badge-sla-on-track font-bold">READY (Mock/API)</span></td>
              </tr>
              <tr>
                <td><strong>M3: Evidence Analysis</strong></td>
                <td><code className="text-primary font-mono">evidenceApi</code></td>
                <td>Photo proofs, damage clarity, packaging completeness</td>
                <td><span className="badge-sla-on-track font-bold">READY (Mock/API)</span></td>
              </tr>
              <tr>
                <td><strong>M4: Fraud Risk Engine</strong></td>
                <td><code className="text-primary font-mono">triageApi</code></td>
                <td>6-factor explainable risk score & system recommendations</td>
                <td><span className="badge-sla-on-track font-bold">READY (Mock/API)</span></td>
              </tr>
              <tr>
                <td><strong>M5: Human Review</strong></td>
                <td><code className="text-primary font-mono">reviewsApi</code></td>
                <td>Binding dispatcher authority, manual overrides, evidence requests</td>
                <td><span className="badge-sla-on-track font-bold">READY (Mock/API)</span></td>
              </tr>
              <tr>
                <td><strong>M6: Pickup Prioritisation</strong></td>
                <td><code className="text-primary font-mono">pickupsApi</code></td>
                <td>Priority queue, fleet scheduling, geographic route clustering</td>
                <td><span className="badge-sla-on-track font-bold">READY (Mock/API)</span></td>
              </tr>
              <tr>
                <td><strong>M7: Metrics & Evaluation</strong></td>
                <td><code className="text-primary font-mono">metricsApi</code></td>
                <td>FIFO benchmark simulation, confusion matrix, ground truth</td>
                <td><span className="badge-sla-on-track font-bold">READY (Mock/API)</span></td>
              </tr>
              <tr>
                <td><strong>M8: Audit & Systems</strong></td>
                <td><code className="text-primary font-mono">auditApi</code></td>
                <td>Append-only chronological operational audit trail</td>
                <td><span className="badge-sla-on-track font-bold">READY (Mock/API)</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 mb-3 flex-wrap text-xs">
        {['ALL', 'RETURNS', 'CUSTOMERS', 'EVIDENCE', 'TRIAGE', 'REVIEWS', 'PICKUPS', 'METRICS', 'AUDIT'].map(cat => (
          <button
            key={cat}
            type="button"
            className={`btn-xs ${activeCategory === cat ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Endpoints List */}
      <div className="space-y-3 mb-6">
        {filteredEndpoints.map((ep, idx) => (
          <div key={idx} className="endpoint-card form-card p-3 text-xs">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className={`method-badge font-mono font-bold px-2 py-0.5 rounded text-2xs ${
                  ep.method === 'GET' ? 'bg-blue-900 text-blue-200' :
                  ep.method === 'POST' ? 'bg-emerald-900 text-emerald-200' :
                  ep.method === 'PATCH' ? 'bg-amber-900 text-amber-200' : 'bg-red-900 text-red-200'
                }`}>
                  {ep.method}
                </span>
                <code className="font-mono text-primary font-bold">{ep.path}</code>
                <button
                  type="button"
                  className="btn-ghost btn-3xs text-dim"
                  onClick={() => handleCopy(ep.path)}
                  title="Copy path"
                >
                  <Copy size={11} /> {copiedPath === ep.path ? 'Copied!' : ''}
                </button>
              </div>

              <span className="text-dim text-3xs uppercase font-bold">{ep.domain}</span>
            </div>

            <p className="text-secondary text-xs mb-2">{ep.summary}</p>

            {ep.requestBody && (
              <div className="mb-2">
                <span className="text-dim text-3xs uppercase font-bold block mb-1">Request Payload Schema:</span>
                <pre className="p-2 rounded bg-surface font-mono text-3xs text-secondary overflow-x-auto border border-subtle">
                  {ep.requestBody}
                </pre>
              </div>
            )}

            <div>
              <span className="text-dim text-3xs uppercase font-bold block mb-1">Response JSON (200 OK):</span>
              <pre className="p-2 rounded bg-surface font-mono text-3xs text-emerald-400 overflow-x-auto border border-subtle">
                {ep.response}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
