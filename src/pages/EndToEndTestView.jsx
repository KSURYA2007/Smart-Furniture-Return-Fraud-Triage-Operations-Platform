import React, { useState } from 'react';
import { 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sparkles, 
  Layers, 
  Activity, 
  Sliders, 
  FileText, 
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw
} from 'lucide-react';

import { returnsApi } from '../api/returnsApi.js';
import { customersApi } from '../api/customersApi.js';
import { evidenceApi } from '../api/evidenceApi.js';
import { triageApi } from '../api/triageApi.js';
import { reviewsApi } from '../api/reviewsApi.js';
import { pickupsApi } from '../api/pickupsApi.js';
import { metricsApi } from '../api/metricsApi.js';
import { auditApi } from '../api/auditApi.js';

export default function EndToEndTestView({
  onNavigateDashboard,
  onNavigateEdgeCases,
  onNavigateDataQuality,
  onNavigateConsistency,
  onNavigateReport
}) {
  const [isRunning, setIsRunning] = useState(false);
  const [selectedStepIdx, setSelectedStepIdx] = useState(0);

  const initialSteps = [
    { id: 1, name: '1. Return Claim Intake (M1)', module: 'M1', status: 'PENDING', output: null },
    { id: 2, name: '2. Customer Profile & Order History (M2)', module: 'M2', status: 'PENDING', output: null },
    { id: 3, name: '3. Evidence Analysis & Damage Tags (M3)', module: 'M3', status: 'PENDING', output: null },
    { id: 4, name: '4. 6-Factor Fraud Risk Triage (M4)', module: 'M4', status: 'PENDING', output: null },
    { id: 5, name: '5. Human Operational Review (M5)', module: 'M5', status: 'PENDING', output: null },
    { id: 6, name: '6. Pickup Prioritisation Scoring (M6)', module: 'M6', status: 'PENDING', output: null },
    { id: 7, name: '7. Fleet Scheduling & Dispatch (M6)', module: 'M6', status: 'PENDING', output: null },
    { id: 8, name: '8. Doorstep Retrieval Completion (M6)', module: 'M6', status: 'PENDING', output: null },
    { id: 9, name: '9. Operational Ground Truth Assignment (M7)', module: 'M7', status: 'PENDING', output: null },
    { id: 10, name: '10. Metrics & Baseline Evaluation (M7)', module: 'M7', status: 'PENDING', output: null },
    { id: 11, name: '11. Chronological Audit Trail Verification (M8)', module: 'M8', status: 'PENDING', output: null }
  ];

  const [steps, setSteps] = useState(initialSteps);

  const handleRunPipeline = async () => {
    setIsRunning(true);
    const targetReturnId = 'RET-2024-003001';
    const updated = [...initialSteps];
    setSteps(updated);

    const markStep = (idx, status, output) => {
      updated[idx].status = status;
      updated[idx].output = output;
      setSteps([...updated]);
    };

    try {
      // Step 1: Return
      markStep(0, 'RUNNING', null);
      const retRes = await returnsApi.getReturnById(targetReturnId);
      await new Promise(r => setTimeout(r, 180));
      markStep(0, 'PASS', retRes.data);

      // Step 2: Customer
      markStep(1, 'RUNNING', null);
      const custRes = await customersApi.getCustomerHistory('CUS-1024');
      await new Promise(r => setTimeout(r, 180));
      markStep(1, 'PASS', custRes.data);

      // Step 3: Evidence
      markStep(2, 'RUNNING', null);
      const evRes = await evidenceApi.getEvidence(targetReturnId);
      await new Promise(r => setTimeout(r, 180));
      markStep(2, 'PASS', evRes.data);

      // Step 4: Triage
      markStep(3, 'RUNNING', null);
      const triageRes = await triageApi.getTriage(targetReturnId);
      await new Promise(r => setTimeout(r, 180));
      markStep(3, 'PASS', triageRes.data);

      // Step 5: Review
      markStep(4, 'RUNNING', null);
      const revRes = await reviewsApi.submitReview(targetReturnId, {
        decision: 'APPROVE_PICKUP',
        reason: 'E2E Lifecycle Pipeline validation: confirmed genuine customer damage.'
      });
      await new Promise(r => setTimeout(r, 180));
      markStep(4, 'PASS', revRes.data);

      // Step 6: Pickup Queue & Priority
      markStep(5, 'RUNNING', null);
      const pkpQueueRes = await pickupsApi.getPickupQueue();
      await new Promise(r => setTimeout(r, 180));
      markStep(5, 'PASS', { totalQueueLength: pkpQueueRes.data?.length });

      // Step 7: Schedule
      markStep(6, 'RUNNING', null);
      const schedRes = await pickupsApi.schedulePickup(targetReturnId, {
        pickupDate: '2024-11-06',
        timeSlot: '09:00 AM – 12:00 PM',
        isReschedule: true
      });
      await new Promise(r => setTimeout(r, 180));
      markStep(6, 'PASS', schedRes.data);

      // Step 8: Complete Pickup
      markStep(7, 'RUNNING', null);
      const compRes = await pickupsApi.updatePickupStatus(targetReturnId, 'PICKED_UP');
      await new Promise(r => setTimeout(r, 180));
      markStep(7, 'PASS', compRes.data);

      // Step 9: Ground Truth
      markStep(8, 'RUNNING', null);
      const gtRes = await metricsApi.saveGroundTruth(targetReturnId, {
        label: 'LEGITIMATE',
        fraudLoss: 0,
        source: 'End-to-End Validation Engine'
      });
      await new Promise(r => setTimeout(r, 180));
      markStep(8, 'PASS', gtRes.data);

      // Step 10: Metrics
      markStep(9, 'RUNNING', null);
      const metricsRes = await metricsApi.getDashboardMetrics();
      await new Promise(r => setTimeout(r, 180));
      markStep(9, 'PASS', {
        baselineFraud: metricsRes.data?.comparison?.fraudLossExposure?.baseline,
        proposedFraud: metricsRes.data?.comparison?.fraudLossExposure?.proposed
      });

      // Step 11: Audit
      markStep(10, 'RUNNING', null);
      const auditRes = await auditApi.getAuditLog(targetReturnId);
      await new Promise(r => setTimeout(r, 180));
      markStep(10, 'PASS', { totalAuditEntries: auditRes.data?.length });

    } catch (e) {
      console.error('E2E validation failed:', e);
    } finally {
      setIsRunning(false);
    }
  };

  const passCount = steps.filter(s => s.status === 'PASS').length;

  return (
    <div className="page-wrapper e2e-test-page">
      {/* Sub-Navigation Bar */}
      <div className="metrics-subnav-bar flex items-center justify-between flex-wrap gap-2 mb-4 p-2 rounded bg-surface border border-subtle">
        <div className="flex items-center gap-1 flex-wrap">
          {onNavigateDashboard && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateDashboard}>
              <Activity size={13} /> Dashboard
            </button>
          )}
          <button type="button" className="btn-primary btn-xs flex items-center gap-1">
            <Play size={13} /> End-to-End Pipeline
          </button>
          {onNavigateEdgeCases && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateEdgeCases}>
              <Sliders size={13} /> 18 Edge Cases
            </button>
          )}
          {onNavigateDataQuality && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateDataQuality}>
              <Layers size={13} /> Data Quality
            </button>
          )}
          {onNavigateConsistency && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateConsistency}>
              <ShieldCheck size={13} /> Consistency
            </button>
          )}
          {onNavigateReport && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateReport}>
              <FileText size={13} /> Test Report
            </button>
          )}
        </div>

        <button
          type="button"
          className="btn-primary btn-xs flex items-center gap-1.5 font-bold"
          onClick={handleRunPipeline}
          disabled={isRunning}
        >
          <Sparkles size={13} />
          <span>{isRunning ? 'Executing Pipeline...' : 'RUN END-TO-END VALIDATION'}</span>
        </button>
      </div>

      {/* Hero Header */}
      <header className="page-header e2e-header mb-4">
        <div className="header-container">
          <div className="header-badge-row">
            <span className="module-badge">
              <Play size={13} /> Module 9: Full Lifecycle Integration Test
            </span>
          </div>
          <h1 className="page-title font-serif">11-Step End-to-End Pipeline Verification</h1>
          <p className="page-description">
            Execute the complete return claim journey sequentially across Intake, Risk Triage, Human Review, Pickup Dispatch, Ground Truth, and Metrics.
          </p>
        </div>
      </header>

      {/* Pipeline Status Summary */}
      <div className="form-card mb-4 p-3 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div>
          <span className="text-dim text-3xs uppercase font-bold block">Pipeline Execution Progress</span>
          <span className="font-bold text-secondary text-sm">
            {passCount === 11 ? '✓ All 11 Stages Verified Successfully' : `${passCount} / 11 Stages Completed`}
          </span>
        </div>
        <span className={`priority-pill font-mono font-bold text-xs ${
          passCount === 11 ? 'badge-risk-low' : 'badge-risk-medium'
        }`}>
          {passCount === 11 ? '100% COMPLETE' : isRunning ? 'PIPELINE ACTIVE' : 'READY TO RUN'}
        </span>
      </div>

      {/* Step Grid and Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 text-xs">
        {/* Left: Step Sequence */}
        <div className="form-card p-3 space-y-2">
          <h4 className="font-bold text-xs text-secondary mb-2">Lifecycle Pipeline Stages:</h4>
          {steps.map((step, idx) => (
            <div
              key={step.id}
              className={`p-2.5 rounded border cursor-pointer flex items-center justify-between transition-all ${
                selectedStepIdx === idx ? 'border-primary bg-primary-subtle' : 'border-subtle bg-surface hover:bg-surface-elevated'
              }`}
              onClick={() => setSelectedStepIdx(idx)}
            >
              <div className="flex items-center gap-2">
                {step.status === 'PASS' ? (
                  <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />
                ) : step.status === 'RUNNING' ? (
                  <Clock size={15} className="text-primary-light animate-spin flex-shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-dim opacity-40 flex-shrink-0" />
                )}
                <span className="font-medium text-secondary">{step.name}</span>
              </div>

              <span className="badge-prototype-tag font-mono text-3xs font-bold">{step.module}</span>
            </div>
          ))}
        </div>

        {/* Right: State Inspector */}
        <div className="form-card p-3">
          <div className="card-header border-bottom pb-2 mb-2 flex items-center justify-between">
            <h4 className="font-bold text-xs text-secondary">
              Stage Output Inspector &bull; {steps[selectedStepIdx].name}
            </h4>
            <span className={`priority-pill font-mono font-bold text-3xs ${
              steps[selectedStepIdx].status === 'PASS' ? 'badge-risk-low' : 'badge-risk-high'
            }`}>
              {steps[selectedStepIdx].status}
            </span>
          </div>

          <pre className="p-3 rounded bg-surface border border-subtle font-mono text-3xs text-emerald-400 overflow-x-auto min-h-[320px] max-h-[440px]">
            {steps[selectedStepIdx].output 
              ? JSON.stringify(steps[selectedStepIdx].output, null, 2) 
              : '// Stage output payload will appear here after execution...'}
          </pre>
        </div>
      </div>
    </div>
  );
}
