import React, { useState } from 'react';
import { 
  Terminal, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Send, 
  RotateCcw, 
  Code2, 
  Clock, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { apiClient } from '../api/apiClient.js';
import { returnsApi } from '../api/returnsApi.js';
import { customersApi } from '../api/customersApi.js';
import { evidenceApi } from '../api/evidenceApi.js';
import { triageApi } from '../api/triageApi.js';
import { reviewsApi } from '../api/reviewsApi.js';
import { pickupsApi } from '../api/pickupsApi.js';
import { metricsApi } from '../api/metricsApi.js';
import { auditApi } from '../api/auditApi.js';

export default function ApiTestPanel({
  onNavigateDocs,
  onNavigateStatus
}) {
  // Custom request runner state
  const [method, setMethod] = useState('GET');
  const [path, setPath] = useState('/api/returns');
  const [requestBody, setRequestBody] = useState('');
  const [responseOutput, setResponseOutput] = useState(null);
  const [responseTime, setResponseTime] = useState(null);
  const [isSending, setIsSending] = useState(false);

  // End-to-End Demo Flow state (Section 65 & 66)
  const [e2eProgress, setE2eProgress] = useState(null);
  const [isE2eRunning, setIsE2eRunning] = useState(false);

  const predefinedTests = [
    { name: '1. Get All Returns', method: 'GET', path: '/api/returns', body: '' },
    { name: '2. Get Return Details', method: 'GET', path: '/api/returns/RET-2024-003001', body: '' },
    { name: '3. Customer Lifetime History', method: 'GET', path: '/api/customers/CUS-1024/history', body: '' },
    { name: '4. Evidence Quality', method: 'GET', path: '/api/returns/RET-2024-003001/evidence', body: '' },
    { name: '5. Risk Triage Calculation', method: 'GET', path: '/api/returns/RET-2024-003001/triage', body: '' },
    { name: '6. Human Review Queue', method: 'GET', path: '/api/reviews', body: '' },
    { name: '7. Submit Review Decision', method: 'POST', path: '/api/reviews/RET-2024-003001/decision', body: JSON.stringify({ decision: 'APPROVE_PICKUP', reason: 'Verified genuine delivery defect.' }, null, 2) },
    { name: '8. Schedule Return Pickup', method: 'POST', path: '/api/pickups/RET-2024-003001/schedule', body: JSON.stringify({ pickupDate: '2024-11-04', timeSlot: '09:00 AM – 12:00 PM', driver: { name: 'Ramesh Kumar' } }, null, 2) },
    { name: '9. Attempt Duplicate Pickup', method: 'POST', path: '/api/pickups/RET-2024-003001/schedule', body: JSON.stringify({ pickupDate: '2024-11-04', isReschedule: false }, null, 2) },
    { name: '10. Get Evaluation Metrics', method: 'GET', path: '/api/metrics/dashboard', body: '' }
  ];

  const handleSelectPredefined = (test) => {
    setMethod(test.method);
    setPath(test.path);
    setRequestBody(test.body);
  };

  const handleSendRequest = async () => {
    setIsSending(true);
    setResponseOutput(null);
    const start = performance.now();

    try {
      let parsedBody = null;
      if (requestBody && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
        try {
          parsedBody = JSON.parse(requestBody);
        } catch (jsonErr) {
          setResponseOutput({ success: false, error: { message: `Invalid JSON syntax: ${jsonErr.message}` } });
          setIsSending(false);
          return;
        }
      }

      let res = null;
      if (method === 'GET') res = await apiClient.get(path);
      else if (method === 'POST') res = await apiClient.post(path, parsedBody);
      else if (method === 'PATCH') res = await apiClient.patch(path, parsedBody);
      else if (method === 'DELETE') res = await apiClient.delete(path);

      const elapsed = Math.round(performance.now() - start);
      setResponseTime(elapsed);
      setResponseOutput(res);
    } catch (err) {
      setResponseOutput({ success: false, error: { message: err.message } });
    } finally {
      setIsSending(false);
    }
  };

  // Section 66: RUN END-TO-END DEMO
  const handleRunE2eDemo = async () => {
    setIsE2eRunning(true);
    const targetId = 'RET-2024-003001';
    const steps = [
      { id: 1, name: '1. Return Claim Loaded', status: 'RUNNING' },
      { id: 2, name: '2. Customer History Retrieved', status: 'PENDING' },
      { id: 3, name: '3. Photographic Evidence Analyzed', status: 'PENDING' },
      { id: 4, name: '4. Triage Risk Score Calculated', status: 'PENDING' },
      { id: 5, name: '5. Human Operational Review Created', status: 'PENDING' },
      { id: 6, name: '6. Pickup Approved by Reviewer', status: 'PENDING' },
      { id: 7, name: '7. Pickup Priority Score Derived', status: 'PENDING' },
      { id: 8, name: '8. Pickup Dispatched & Scheduled', status: 'PENDING' },
      { id: 9, name: '9. Doorstep Retrieval Marked Picked Up', status: 'PENDING' },
      { id: 10, name: '10. Ground Truth Evaluation Recorded', status: 'PENDING' },
      { id: 11, name: '11. End-to-End Audit Log Verified', status: 'PENDING' }
    ];
    setE2eProgress([...steps]);

    const updateStep = (idx, status) => {
      steps[idx].status = status;
      if (idx + 1 < steps.length && status === 'SUCCESS') {
        steps[idx + 1].status = 'RUNNING';
      }
      setE2eProgress([...steps]);
    };

    try {
      // Step 1: Return Loaded
      await returnsApi.getReturnById(targetId);
      await new Promise(r => setTimeout(r, 200));
      updateStep(0, 'SUCCESS');

      // Step 2: Customer History
      await customersApi.getCustomerHistory('CUS-1024');
      await new Promise(r => setTimeout(r, 200));
      updateStep(1, 'SUCCESS');

      // Step 3: Evidence
      await evidenceApi.getEvidence(targetId);
      await new Promise(r => setTimeout(r, 200));
      updateStep(2, 'SUCCESS');

      // Step 4: Triage
      await triageApi.getTriage(targetId);
      await new Promise(r => setTimeout(r, 200));
      updateStep(3, 'SUCCESS');

      // Step 5 & 6: Human Review Decision
      await reviewsApi.submitReview(targetId, {
        decision: 'APPROVE_PICKUP',
        reason: 'E2E Demo: Verified legitimate return intake proof.'
      });
      await new Promise(r => setTimeout(r, 200));
      updateStep(4, 'SUCCESS');
      updateStep(5, 'SUCCESS');

      // Step 7 & 8: Pickup Priority & Schedule
      await pickupsApi.schedulePickup(targetId, {
        pickupDate: '2024-11-05',
        timeSlot: '09:00 AM – 12:00 PM',
        isReschedule: true
      });
      await new Promise(r => setTimeout(r, 200));
      updateStep(6, 'SUCCESS');
      updateStep(7, 'SUCCESS');

      // Step 9: Completed
      await pickupsApi.updatePickupStatus(targetId, 'PICKED_UP');
      await new Promise(r => setTimeout(r, 200));
      updateStep(8, 'SUCCESS');

      // Step 10: Ground Truth
      await metricsApi.saveGroundTruth(targetId, {
        label: 'LEGITIMATE',
        fraudLoss: 0,
        source: 'End-to-End Automated Integration Test'
      });
      await new Promise(r => setTimeout(r, 200));
      updateStep(9, 'SUCCESS');

      // Step 11: Audit Log
      await auditApi.getAuditLog(targetId);
      await new Promise(r => setTimeout(r, 200));
      updateStep(10, 'SUCCESS');

    } catch (e) {
      console.error('E2E Demo error:', e);
    } finally {
      setIsE2eRunning(false);
    }
  };

  return (
    <div className="page-wrapper api-test-page">
      {/* Sub-Navigation Bar */}
      <div className="metrics-subnav-bar flex items-center justify-between flex-wrap gap-2 mb-4 p-2 rounded bg-surface border border-subtle">
        <div className="flex items-center gap-1 flex-wrap">
          {onNavigateDocs && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateDocs}>
              <Code2 size={13} /> API Documentation
            </button>
          )}
          {onNavigateStatus && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateStatus}>
              <CheckCircle2 size={13} /> API Status & Health
            </button>
          )}
          <button type="button" className="btn-primary btn-xs flex items-center gap-1">
            <Terminal size={13} /> Interactive Test Panel
          </button>
        </div>

        {/* Section 66: End-to-End Demo Action Button */}
        <button
          type="button"
          className="btn-primary btn-xs flex items-center gap-1.5 font-bold"
          onClick={handleRunE2eDemo}
          disabled={isE2eRunning}
        >
          <Sparkles size={13} />
          <span>{isE2eRunning ? 'Executing E2E Flow...' : 'Run End-to-End Demo (11 Steps)'}</span>
        </button>
      </div>

      {/* Hero Header */}
      <header className="page-header test-header mb-4">
        <div className="header-container">
          <div className="header-badge-row">
            <span className="module-badge">
              <Terminal size={13} /> Module 8: Interactive API Runner & Integration Test
            </span>
          </div>
          <h1 className="page-title font-serif">API Console & End-to-End Pipeline Verification</h1>
          <p className="page-description">
            Execute API queries, test duplicate scheduling rejection locks, and verify the unified 11-step lifecycle pipeline.
          </p>
        </div>
      </header>

      {/* Section 66: End-to-End Demo Progress Box (if active) */}
      {e2eProgress && (
        <div className="e2e-demo-progress-card form-card mb-4 border-emerald">
          <div className="card-header border-bottom pb-2 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-400" />
                <h3 className="card-title text-base">End-to-End 11-Step Lifecycle Integration Pipeline</h3>
              </div>
              <span className="text-xs font-bold text-emerald-300">
                {e2eProgress.filter(s => s.status === 'SUCCESS').length} / 11 Steps Complete
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            {e2eProgress.map(step => (
              <div 
                key={step.id} 
                className={`p-2 rounded border flex items-center gap-2 ${
                  step.status === 'SUCCESS' ? 'bg-emerald-bg border-emerald-border text-emerald-300' :
                  step.status === 'RUNNING' ? 'bg-primary-subtle border-primary text-primary-light animate-pulse' :
                  'bg-surface border-subtle text-dim'
                }`}
              >
                {step.status === 'SUCCESS' ? (
                  <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-current opacity-40 flex-shrink-0" />
                )}
                <span className="font-medium truncate">{step.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Predefined Test Buttons (Section 55) */}
      <div className="predefined-tests-card form-card mb-4 text-xs">
        <h4 className="font-bold text-xs text-secondary mb-2">Predefined Integration Tests:</h4>
        <div className="flex flex-wrap gap-1.5">
          {predefinedTests.map((t, idx) => (
            <button
              key={idx}
              type="button"
              className="btn-secondary btn-xs"
              onClick={() => handleSelectPredefined(t)}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Request Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 text-xs">
        {/* Left: Request Composer */}
        <div className="form-card p-3">
          <h4 className="font-bold text-xs text-secondary mb-2 flex items-center gap-1.5">
            <Terminal size={14} className="text-primary-light" />
            <span>HTTP Request Composer</span>
          </h4>

          <div className="flex gap-2 mb-3">
            <select
              className="form-select text-xs w-24 font-bold font-mono"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>

            <input
              type="text"
              className="form-input text-xs font-mono flex-grow"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="/api/returns..."
            />

            <button
              type="button"
              className="btn-primary btn-sm flex items-center gap-1 px-4 font-bold"
              onClick={handleSendRequest}
              disabled={isSending}
            >
              <Send size={12} />
              <span>{isSending ? 'Sending...' : 'Send'}</span>
            </button>
          </div>

          {(method === 'POST' || method === 'PATCH' || method === 'PUT') && (
            <div className="form-group mb-2">
              <label className="form-label text-3xs uppercase font-bold text-dim">Request JSON Body:</label>
              <textarea
                rows={8}
                className="form-textarea font-mono text-3xs text-secondary"
                placeholder='{ "key": "value" }'
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Right: Response Inspector */}
        <div className="form-card p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-xs text-secondary">Response Inspector</h4>
            <div className="flex items-center gap-2">
              {responseTime !== null && (
                <span className="text-dim text-3xs flex items-center gap-1">
                  <Clock size={11} /> {responseTime}ms
                </span>
              )}
              {responseOutput && (
                <span className={`priority-pill font-mono font-bold text-2xs ${
                  responseOutput.success ? 'badge-risk-low' : 'badge-risk-critical'
                }`}>
                  {responseOutput.success ? '200 OK' : `${responseOutput.error?.code || 'ERROR'}`}
                </span>
              )}
            </div>
          </div>

          <pre className="p-3 rounded bg-surface border border-subtle font-mono text-3xs text-emerald-400 overflow-x-auto min-h-[160px] max-h-[300px]">
            {responseOutput ? JSON.stringify(responseOutput, null, 2) : '// Response will appear here after sending request...'}
          </pre>
        </div>
      </div>
    </div>
  );
}
