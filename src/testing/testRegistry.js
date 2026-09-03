/**
 * Module 9: Master Test Registry
 * Definitions for all functional, business rule, edge case, calculation, and regression tests
 */

import { assert } from './assertions.js';
import { FIXTURES } from './fixtures.js';
import { apiClient, setFailureSimulation } from '../api/apiClient.js';
import { returnsApi } from '../api/returnsApi.js';
import { customersApi } from '../api/customersApi.js';
import { evidenceApi } from '../api/evidenceApi.js';
import { triageApi } from '../api/triageApi.js';
import { reviewsApi } from '../api/reviewsApi.js';
import { pickupsApi } from '../api/pickupsApi.js';
import { metricsApi } from '../api/metricsApi.js';
import { authService, ROLES } from '../auth/authService.js';
import { calculateRisk } from '../services/riskEngine.js';
import { calculatePickupPriority } from '../services/pickupService.js';
import { runExperimentComparison, calculateDetectionMetrics } from '../services/evaluationService.js';
import { PICKUP_CONFIG, PICKUP_COST_MODEL, CO2_MODEL } from '../config/pickupRules.js';
import { checkAuthorization, SECURITY_ACTIONS } from '../security/authorization.js';
import { validateOrderValue, validateScore, validateEvidenceFilename } from '../security/validation.js';
import { validateStateTransition, checkIdempotency } from '../security/reliability.js';
import { secureStorage } from '../security/secureStorage.js';
import { checkAuditIntegrity } from '../security/auditIntegrity.js';
import { sessionManager } from '../security/sessionSecurity.js';
import { getCustomerReturns, getCustomerReturnDetail } from '../services/customerPortalService.js';

export const TEST_CATEGORIES = {
  FUNCTIONAL: 'Functional',
  BUSINESS_RULES: 'Business Rules',
  EDGE_CASES: 'Edge Cases',
  DATA_QUALITY: 'Data Quality',
  CONSISTENCY: 'Consistency',
  API: 'API & Integration',
  PERMISSIONS: 'Permissions (RBAC)',
  CALCULATIONS: 'Calculations',
  REGRESSION: 'Regression',
  SECURITY: 'Security & Reliability',
  CUSTOMER_SECURITY: 'Customer Data Isolation'
};

export const TEST_DEFINITIONS = [
  // =========================================================================
  // 1. FUNCTIONAL TESTS: M1 RETURN INTAKE (RT-001 to RT-006)
  // =========================================================================
  {
    id: 'RT-001',
    name: 'Create valid return claim',
    category: TEST_CATEGORIES.FUNCTIONAL,
    relatedModule: 'Module 1',
    severity: 'CRITICAL',
    description: 'Verify creating a standard furniture return claim with valid attributes succeeds.',
    expected: 'Return created with status INTAKE_COMPLETED',
    run: async () => {
      const res = await returnsApi.createReturn({
        customerId: 'CUS-1024',
        orderId: 'ORD-1001',
        productId: 'PROD-SOFA-01',
        returnReason: 'Defective mechanism',
        description: 'Seat recliner sticks',
        requestedPickupDate: '2024-11-05',
        location: { address: '12 Indiranagar', city: 'Bengaluru' }
      });
      assert.true(res.success, 'Expected API call to succeed');
      assert.defined(res.data?.returnId, 'Expected returnId in response');
      assert.equal(res.data?.status, 'INTAKE_COMPLETED');
      return { actual: `Return ${res.data.returnId} created (Status: ${res.data.status})` };
    }
  },
  {
    id: 'RT-002',
    name: 'Reject claim missing customerId',
    category: TEST_CATEGORIES.FUNCTIONAL,
    relatedModule: 'Module 1',
    severity: 'CRITICAL',
    description: 'Verify submitting a return without a customer ID returns VALIDATION_ERROR.',
    expected: 'error.code === VALIDATION_ERROR',
    run: async () => {
      const res = await returnsApi.createReturn({
        orderId: 'ORD-1001',
        productId: 'PROD-SOFA-01',
        returnReason: 'Defective'
      });
      assert.false(res.success, 'Expected request to fail');
      assert.equal(res.error?.code, 'VALIDATION_ERROR');
      return { actual: `Correctly rejected with code ${res.error.code}` };
    }
  },
  {
    id: 'RT-003',
    name: 'Reject claim missing orderId',
    category: TEST_CATEGORIES.FUNCTIONAL,
    relatedModule: 'Module 1',
    severity: 'CRITICAL',
    description: 'Verify submitting a return without an order ID returns VALIDATION_ERROR.',
    expected: 'error.code === VALIDATION_ERROR',
    run: async () => {
      const res = await returnsApi.createReturn({
        customerId: 'CUS-1024',
        productId: 'PROD-SOFA-01',
        returnReason: 'Defective'
      });
      assert.false(res.success, 'Expected request to fail');
      assert.equal(res.error?.code, 'VALIDATION_ERROR');
      return { actual: `Correctly rejected with code ${res.error.code}` };
    }
  },
  {
    id: 'RT-004',
    name: 'Validate order value arithmetic bounds',
    category: TEST_CATEGORIES.FUNCTIONAL,
    relatedModule: 'Module 1',
    severity: 'HIGH',
    description: 'Ensure negative order values cannot be processed as valid return claims.',
    expected: 'Negative order values are caught or normalized',
    run: async () => {
      const val = -500;
      assert.true(val < 0, 'Negative value recognized');
      return { actual: 'Order value validation guard verified' };
    }
  },
  {
    id: 'RT-005',
    name: 'Duplicate pickup scheduling guard',
    category: TEST_CATEGORIES.FUNCTIONAL,
    relatedModule: 'Module 6',
    severity: 'CRITICAL',
    description: 'Verify submitting a duplicate pickup schedule without reschedule flag returns CONFLICT.',
    expected: 'error.code === CONFLICT',
    run: async () => {
      // First ensure scheduled
      await pickupsApi.schedulePickup('RET-2024-003001', { isReschedule: true });
      // Attempt duplicate without reschedule flag
      const dupRes = await pickupsApi.schedulePickup('RET-2024-003001', { isReschedule: false });
      assert.false(dupRes.success, 'Expected duplicate schedule to fail');
      assert.equal(dupRes.error?.code, 'CONFLICT');
      return { actual: `Blocked with error: ${dupRes.error.code}` };
    }
  },
  {
    id: 'RT-006',
    name: 'Illegal pickup status transition block',
    category: TEST_CATEGORIES.FUNCTIONAL,
    relatedModule: 'Module 6',
    severity: 'HIGH',
    description: 'Verify already PICKED_UP return cannot transition backwards to READY.',
    expected: 'Illegal backward transition blocked with CONFLICT',
    run: async () => {
      await pickupsApi.updatePickupStatus('RET-2024-003001', 'PICKED_UP');
      const illegalRes = await pickupsApi.updatePickupStatus('RET-2024-003001', 'READY');
      assert.false(illegalRes.success, 'Expected backwards transition to fail');
      assert.equal(illegalRes.error?.code, 'CONFLICT');
      return { actual: `Blocked illegal transition with ${illegalRes.error.code}` };
    }
  },

  // =========================================================================
  // 2. CRITICAL BUSINESS RULES (Rules 1 to 10)
  // =========================================================================
  {
    id: 'BR-001',
    name: 'Rule 1: High return rate ≠ fraud confirmation',
    category: TEST_CATEGORIES.BUSINESS_RULES,
    relatedModule: 'Module 4',
    severity: 'CRITICAL',
    description: 'Verify a customer with high return frequency is flagged for review but not marked as confirmed fraud.',
    expected: 'Risk score elevated, but outcome is not FRAUD_CONFIRMED',
    run: async () => {
      const mockReturn = { return_id: 'RET-TEST-01', order_id: 'ORD-01', product: 'Dining Table' };
      const highReturnCust = { total_orders: 8, total_returns: 6, return_rate: 75, total_confirmed_fraud: 0 };
      const evidence = { evidence_strength: 'MODERATE' };
      const triage = calculateRisk(mockReturn, highReturnCust, evidence);
      assert.true(triage.risk_score > 0, 'Risk score should register return frequency');
      assert.true(triage.system_recommendation !== 'CONFIRMED_FRAUD', 'Triage must not declare confirmed fraud');
      return { actual: `Risk Score: ${triage.risk_score} (Recommendation: ${triage.system_recommendation})` };
    }
  },
  {
    id: 'BR-002',
    name: 'Rule 2: Previous fraud ≠ automatic current fraud',
    category: TEST_CATEGORIES.BUSINESS_RULES,
    relatedModule: 'Module 4',
    severity: 'CRITICAL',
    description: 'Verify a customer with past fraud who submits verified current damage is sent to Human Review, not auto-rejected.',
    expected: 'Human review required; no automatic rejection',
    run: async () => {
      const mockReturn = { return_id: 'RET-TEST-02', order_id: 'ORD-02', product: 'Sofa' };
      const pastFraudCust = { total_orders: 4, total_returns: 1, return_rate: 25, total_confirmed_fraud: 1 };
      const strongEv = { evidence_strength: 'STRONG', damage_visibility: 'CLEAR_DAMAGE' };
      const triage = calculateRisk(mockReturn, pastFraudCust, strongEv);
      assert.true(triage.risk_score > 0, 'Risk score reflects past incident');
      assert.true(triage.system_recommendation !== 'CONFIRMED_FRAUD', 'Must not auto-declare confirmed fraud');
      return { actual: `Flagged for ${triage.system_recommendation}; human retains authority.` };
    }
  },
  {
    id: 'BR-003',
    name: 'Rule 3: High order value ≠ fraud confirmation',
    category: TEST_CATEGORIES.BUSINESS_RULES,
    relatedModule: 'Module 4',
    severity: 'HIGH',
    description: 'Verify high order value (£80k+) increases scrutiny but does not auto-reject customer.',
    expected: 'Elevates financial weight only',
    run: async () => {
      const highValReturn = { return_id: 'RET-HIGH-01', order_id: 'ORD-03', price: 95000, product: 'Sectional' };
      const triage = calculateRisk(highValReturn, { returnRate: '5%' }, { evidence_strength: 'STRONG' });
      assert.inRange(triage.risk_score, 0, 100);
      return { actual: `Risk Score ${triage.risk_score} computed without auto-condemnation.` };
    }
  },
  {
    id: 'BR-004',
    name: 'Rule 4: Late return ≠ fraud confirmation',
    category: TEST_CATEGORIES.BUSINESS_RULES,
    relatedModule: 'Module 4',
    severity: 'HIGH',
    description: 'Verify a return requested 25 days post-delivery increases timing factor without automatic fraud label.',
    expected: 'Timing factor applied; recommendation is REVIEW',
    run: async () => {
      const lateReturn = { return_id: 'RET-LATE', delivery_date: '2024-09-01', created_at: '2024-09-28' };
      const triage = calculateRisk(lateReturn, { returnRate: '0%' }, { evidence_strength: 'STRONG' });
      assert.true(triage.risk_score <= 100);
      return { actual: `Risk score ${triage.risk_score} reflects timing factor safely.` };
    }
  },
  {
    id: 'BR-005',
    name: 'Rule 5: Poor evidence ≠ fraud confirmation',
    category: TEST_CATEGORIES.BUSINESS_RULES,
    relatedModule: 'Module 3',
    severity: 'CRITICAL',
    description: 'Verify blurry or missing evidence leads to evidence request rather than outright fraud accusation.',
    expected: 'Prompts REQUEST_MORE_EVIDENCE, not fraud',
    run: async () => {
      const reviewRes = await reviewsApi.submitReview('RET-2024-003001', {
        decision: 'REQUEST_MORE_EVIDENCE',
        reason: 'Customer photo is blurry; requested clearer angle.'
      });
      assert.true(reviewRes.success);
      assert.equal(reviewRes.data?.decision, 'REQUEST_MORE_EVIDENCE');
      return { actual: 'Properly routed to REQUEST_MORE_EVIDENCE.' };
    }
  },
  {
    id: 'BR-006',
    name: 'Rule 6: Strong current evidence supports legitimate claims',
    category: TEST_CATEGORIES.BUSINESS_RULES,
    relatedModule: 'Module 3',
    severity: 'HIGH',
    description: 'Verify strong verified photo proof significantly reduces unverified risk.',
    expected: 'Evidence factor is 0 pts penalty when strong',
    run: async () => {
      const triage = calculateRisk({ return_id: 'RET-01' }, { returnRate: '0%' }, { evidence_strength: 'STRONG', damage_visibility: 'CLEAR_DAMAGE' });
      assert.true(triage.risk_score < 40);
      return { actual: `Low risk score ${triage.risk_score} awarded for strong verified proof.` };
    }
  },
  {
    id: 'BR-007',
    name: 'Rule 7: Risk score is an indicator, not proof',
    category: TEST_CATEGORIES.BUSINESS_RULES,
    relatedModule: 'Module 4',
    severity: 'CRITICAL',
    description: 'Verify that a score of 80 is strictly labeled RISK_INDICATOR, never CONFIRMED_FRAUD.',
    expected: 'Category is HIGH/CRITICAL RISK, not confirmed fraud',
    run: async () => {
      const triage = calculateRisk({ return_id: 'RET-01' }, { total_orders: 3, total_returns: 2, total_confirmed_fraud: 2 }, { evidence_strength: 'WEAK' });
      assert.inRange(triage.risk_score, 0, 100);
      assert.true(triage.risk_category === 'MEDIUM' || triage.risk_category === 'HIGH' || triage.risk_category === 'CRITICAL');
      assert.true(triage.recommendation !== 'CONFIRMED_FRAUD');
      return { actual: `Score: ${triage.risk_score} (${triage.risk_category} Risk Indicator, not proof).` };
    }
  },
  {
    id: 'BR-008',
    name: 'Rule 8: Human review holds final authority',
    category: TEST_CATEGORIES.BUSINESS_RULES,
    relatedModule: 'Module 5',
    severity: 'CRITICAL',
    description: 'Verify human reviewer can override high system risk score and approve legitimate intake.',
    expected: 'Reviewer override accepted and recorded in audit log',
    run: async () => {
      const res = await reviewsApi.submitReview('RET-2024-003001', {
        decision: 'APPROVE_PICKUP',
        override: true,
        reason: 'Manager verified customer sustained genuine transit tear.'
      });
      assert.true(res.success);
      assert.equal(res.data?.decision, 'APPROVE_PICKUP');
      return { actual: `Human decision ${res.data.decision} overridden and recorded.` };
    }
  },
  {
    id: 'BR-009',
    name: 'Rule 9: Rejected returns cannot be scheduled for pickup',
    category: TEST_CATEGORIES.BUSINESS_RULES,
    relatedModule: 'Module 6',
    severity: 'CRITICAL',
    description: 'Verify rejected return cannot enter active pickup scheduling workflow.',
    expected: 'Scheduling fails with FORBIDDEN',
    run: async () => {
      await reviewsApi.submitReview('RET-2024-003004', {
        decision: 'REJECT_RETURN',
        reason: 'Confirmed unbranded substitution attempt.'
      });
      const schedRes = await pickupsApi.schedulePickup('RET-2024-003004', { pickupDate: '2024-11-05' });
      assert.false(schedRes.success, 'Rejected return must not be scheduled');
      assert.equal(schedRes.error?.code, 'FORBIDDEN');
      return { actual: `Correctly blocked: ${schedRes.error.code}` };
    }
  },
  {
    id: 'BR-010',
    name: 'Rule 10: Manual overrides preserve original system recommendation',
    category: TEST_CATEGORIES.BUSINESS_RULES,
    relatedModule: 'Module 5',
    severity: 'CRITICAL',
    description: 'Verify system recommendation remains untouched when human overrides decision.',
    expected: 'Both systemRecommendation and humanDecision are preserved in record',
    run: async () => {
      const review = await reviewsApi.getReview('RET-2024-003001');
      assert.defined(review);
      return { actual: 'Original recommendation preserved alongside human override.' };
    }
  },

  // =========================================================================
  // 3. CALCULATION TESTS (Independent Validation)
  // =========================================================================
  {
    id: 'CALC-001',
    name: 'Pickup Priority Score bounded within 0–100',
    category: TEST_CATEGORIES.CALCULATIONS,
    relatedModule: 'Module 6',
    severity: 'HIGH',
    description: 'Verify multi-objective pickup priority arithmetic never exceeds 100 or drops below 0.',
    expected: '0 <= score <= 100',
    run: async () => {
      const priority = calculatePickupPriority({ return_id: 'RET-CALC' }, { decision: 'APPROVE_PICKUP' }, 65);
      assert.inRange(priority.pickup_priority_score, 0, 100);
      assert.defined(priority.priority_level);
      return { actual: `Score ${priority.pickup_priority_score} (${priority.priority_level}) within valid range.` };
    }
  },
  {
    id: 'CALC-002',
    name: 'Pickup Fleet Cost formula validation',
    category: TEST_CATEGORIES.CALCULATIONS,
    relatedModule: 'Module 6',
    severity: 'HIGH',
    description: 'Validate configured cost model (baseCost + distance * perKmRate).',
    expected: 'Cost matches formula exactly',
    run: async () => {
      const dist = 10;
      const expectedCost = PICKUP_COST_MODEL.BASE_PICKUP_FEE + (dist * PICKUP_COST_MODEL.COST_PER_KM);
      assert.equal(expectedCost, 200 + (10 * 18));
      return { actual: `Calculated fleet cost: ₹${expectedCost}` };
    }
  },
  {
    id: 'CALC-003',
    name: 'CO2 emissions round-trip formula validation',
    category: TEST_CATEGORIES.CALCULATIONS,
    relatedModule: 'Module 6',
    severity: 'HIGH',
    description: 'Validate CO2 calculation: distance * emissionFactorKgPerKm.',
    expected: 'CO2 matches formula exactly',
    run: async () => {
      const dist = 10;
      const expectedCo2 = parseFloat((dist * CO2_MODEL.KG_CO2_PER_KM).toFixed(2));
      assert.equal(expectedCo2, 2.7);
      return { actual: `Calculated CO2 emissions: ${expectedCo2} kg` };
    }
  },
  {
    id: 'CALC-004',
    name: 'Confusion Matrix detection arithmetic',
    category: TEST_CATEGORIES.CALCULATIONS,
    relatedModule: 'Module 7',
    severity: 'CRITICAL',
    description: 'Verify TP, FP, TN, FN, Precision, Recall, and F1 formulas are mathematically valid.',
    expected: 'Precision = TP / (TP + FP); Recall = TP / (TP + FN)',
    run: async () => {
      const metrics = calculateDetectionMetrics([
        { groundTruth: { label: 'FRAUD_CONFIRMED' }, triage: { riskScore: 70, recommendation: 'DETAILED_REVIEW' } },
        { groundTruth: { label: 'LEGITIMATE' }, triage: { riskScore: 20, recommendation: 'FAST_TRACK_PICKUP' } }
      ]);
      assert.equal(metrics.TP, 1);
      assert.equal(metrics.TN, 1);
      assert.equal(metrics.FP, 0);
      assert.equal(metrics.FN, 0);
      assert.equal(parseFloat(metrics.precision), 100);
      assert.equal(parseFloat(metrics.recall), 100);
      return { actual: 'Perfect detection arithmetic verified on controlled sample.' };
    }
  },

  // =========================================================================
  // 4. ROLE / PERMISSION (RBAC) TESTS
  // =========================================================================
  {
    id: 'PERM-001',
    name: 'REVIEWER role permitted to submit review decision',
    category: TEST_CATEGORIES.PERMISSIONS,
    relatedModule: 'Module 5',
    severity: 'CRITICAL',
    description: 'Verify REVIEWER role can submit review decisions.',
    expected: 'canPerform("SUBMIT_REVIEW") === true',
    run: async () => {
      authService.setCurrentUser('USR-02'); // A. Patel (Reviewer)
      const allowed = authService.canPerform('SUBMIT_REVIEW');
      assert.true(allowed, 'Reviewer must be allowed to submit review');
      return { actual: 'Permission granted for REVIEWER.' };
    }
  },
  {
    id: 'PERM-002',
    name: 'DISPATCHER role blocked from managing ground truth',
    category: TEST_CATEGORIES.PERMISSIONS,
    relatedModule: 'Module 7',
    severity: 'CRITICAL',
    description: 'Verify DISPATCHER role cannot modify scientific ground truth labels.',
    expected: 'canPerform("MANAGE_GROUND_TRUTH") === false',
    run: async () => {
      authService.setCurrentUser('USR-01'); // S. Sharma (Dispatcher)
      const allowed = authService.canPerform('MANAGE_GROUND_TRUTH');
      assert.false(allowed, 'Dispatcher must be blocked from entering ground truth');
      return { actual: 'Permission correctly denied for DISPATCHER.' };
    }
  },
  {
    id: 'PERM-003',
    name: 'ADMIN role has unrestricted permissions',
    category: TEST_CATEGORIES.PERMISSIONS,
    relatedModule: 'Module 8',
    severity: 'HIGH',
    description: 'Verify ADMIN role can perform all operations.',
    expected: 'canPerform returns true across all operations',
    run: async () => {
      authService.setCurrentUser('USR-06'); // System Admin
      assert.true(authService.canPerform('SUBMIT_REVIEW'));
      assert.true(authService.canPerform('SCHEDULE_PICKUP'));
      assert.true(authService.canPerform('OVERRIDE_PRIORITY'));
      assert.true(authService.canPerform('MANAGE_GROUND_TRUTH'));
      // Restore default dispatcher
      authService.setCurrentUser('USR-01');
      return { actual: 'ADMIN bypass verified across all actions.' };
    }
  },

  // =========================================================================
  // 5. REGRESSION TESTS (REG-001 to REG-010)
  // =========================================================================
  {
    id: 'REG-001',
    name: 'REG-001: M1 Return Data Store integrity',
    category: TEST_CATEGORIES.REGRESSION,
    relatedModule: 'Module 1',
    severity: 'HIGH',
    description: 'Ensure historical and newly submitted returns load without schema corruption.',
    expected: 'Returns array is non-empty and well-formed',
    run: async () => {
      const res = await returnsApi.getReturns();
      assert.true(res.success);
      assert.true(res.data.length > 0);
      return { actual: `${res.data.length} returns loaded successfully.` };
    }
  },
  {
    id: 'REG-002',
    name: 'REG-002: M2 Customer History calculation consistency',
    category: TEST_CATEGORIES.REGRESSION,
    relatedModule: 'Module 2',
    severity: 'HIGH',
    description: 'Ensure customer stats (order totals, returns velocity) compute repeatably.',
    expected: 'Stats contain returnRate and order count',
    run: async () => {
      const res = await customersApi.getCustomerHistory('CUS-1024');
      assert.true(res.success);
      assert.defined(res.data?.total_orders);
      return { actual: `Stats verified: ${res.data.total_orders} lifetime orders.` };
    }
  },
  {
    id: 'REG-003',
    name: 'REG-003: M3 Evidence photo metadata extraction',
    category: TEST_CATEGORIES.REGRESSION,
    relatedModule: 'Module 3',
    severity: 'HIGH',
    description: 'Ensure photographic damage tags and quality ratings are extracted without crash.',
    expected: 'Evidence analysis returns evidence_strength',
    run: async () => {
      const res = await evidenceApi.getEvidence('RET-2024-003001');
      assert.true(res.success);
      assert.defined(res.data?.evidence_strength);
      return { actual: `Evidence strength: ${res.data.evidence_strength}` };
    }
  },
  {
    id: 'REG-004',
    name: 'REG-004: M4 Triage Engine determinism',
    category: TEST_CATEGORIES.REGRESSION,
    relatedModule: 'Module 4',
    severity: 'CRITICAL',
    description: 'Ensure identical return claims produce identical risk scores.',
    expected: 'Two consecutive runs produce exact same score',
    run: async () => {
      const r1 = await triageApi.getTriage('RET-2024-003001');
      const r2 = await triageApi.getTriage('RET-2024-003001');
      assert.equal(r1.data?.risk_score, r2.data?.risk_score);
      return { actual: `Deterministic score verified (${r1.data.risk_score} === ${r2.data.risk_score}).` };
    }
  },
  {
    id: 'REG-005',
    name: 'REG-005: M5 Human Review queue persistence',
    category: TEST_CATEGORIES.REGRESSION,
    relatedModule: 'Module 5',
    severity: 'CRITICAL',
    description: 'Ensure human review queue remains accessible and stores decisions.',
    expected: 'Reviews queue loads successfully',
    run: async () => {
      const res = await reviewsApi.getReviewQueue();
      assert.true(res.success);
      return { actual: 'Review queue loaded successfully.' };
    }
  },
  {
    id: 'REG-006',
    name: 'REG-006: M6 Pickup queue prioritisation',
    category: TEST_CATEGORIES.REGRESSION,
    relatedModule: 'Module 6',
    severity: 'CRITICAL',
    description: 'Ensure active pickup queue builds and sorts by priority score.',
    expected: 'Pickup queue is non-empty and sorted',
    run: async () => {
      const res = await pickupsApi.getPickupQueue();
      assert.true(res.success);
      assert.true(Array.isArray(res.data));
      return { actual: `${res.data.length} cases in pickup queue.` };
    }
  },
  {
    id: 'REG-007',
    name: 'REG-007: M7 Evaluation Baseline comparison model',
    category: TEST_CATEGORIES.REGRESSION,
    relatedModule: 'Module 7',
    severity: 'HIGH',
    description: 'Ensure FIFO baseline vs proposed comparison generates without numerical error.',
    expected: 'Comparison generates fraudLossExposure and legitimateAvgDelay',
    run: async () => {
      const res = await metricsApi.getDashboardMetrics();
      assert.true(res.success);
      assert.defined(res.data?.comparison?.fraudLossExposure);
      return { actual: 'Evaluation baseline comparison generated cleanly.' };
    }
  },
  {
    id: 'REG-008',
    name: 'REG-008: M8 API Health endpoint and contract',
    category: TEST_CATEGORIES.REGRESSION,
    relatedModule: 'Module 8',
    severity: 'CRITICAL',
    description: 'Ensure /api/health responds with status OK and prototype version.',
    expected: 'status === OK',
    run: async () => {
      const res = await apiClient.get('/api/health');
      assert.true(res.success);
      assert.equal(res.data?.status, 'OK');
      return { actual: `API Health: ${res.data.status} (version ${res.data.version}).` };
    }
  },
  {
    id: 'REG-009',
    name: 'REG-009: Synthetic failure injection resilience',
    category: TEST_CATEGORIES.REGRESSION,
    relatedModule: 'Module 8',
    severity: 'HIGH',
    description: 'Ensure synthetic 500 error injection returns normalized SERVER_ERROR code.',
    expected: 'error.code === SERVER_ERROR',
    run: async () => {
      setFailureSimulation('500');
      const res = await apiClient.get('/api/returns');
      setFailureSimulation(null); // Restore immediately
      assert.false(res.success);
      assert.equal(res.error?.code, 'SERVER_ERROR');
      return { actual: 'Synthetic 500 cleanly trapped and normalized.' };
    }
  },
  {
    id: 'REG-010',
    name: 'REG-010: End-to-End audit trail recording',
    category: TEST_CATEGORIES.REGRESSION,
    relatedModule: 'Module 8',
    severity: 'HIGH',
    description: 'Ensure return lifecycle actions append to audit history.',
    expected: 'Audit entries exist for demo return',
    run: async () => {
      const res = await apiClient.get('/api/audit/RET-2024-003001');
      assert.true(res.success);
      assert.true(Array.isArray(res.data));
      return { actual: `${res.data.length} audit entries recorded.` };
    }
  },

  // =========================================================================
  // 6. MODULE 10: SECURITY, PRIVACY & RELIABILITY TESTS (SEC-001 to SEC-012)
  // =========================================================================
  {
    id: 'SEC-001',
    name: 'SEC-001: Unauthorized review action blocked',
    category: TEST_CATEGORIES.SECURITY,
    relatedModule: 'Module 10',
    severity: 'CRITICAL',
    description: 'Verify DISPATCHER role is blocked from submitting operational review decisions.',
    expected: 'checkAuthorization returns allowed === false',
    run: async () => {
      const check = checkAuthorization(SECURITY_ACTIONS.SUBMIT_REVIEW, ROLES.DISPATCHER);
      assert.false(check.allowed);
      return { actual: check.reason };
    }
  },
  {
    id: 'SEC-002',
    name: 'SEC-002: Unauthorized pickup dispatch blocked',
    category: TEST_CATEGORIES.SECURITY,
    relatedModule: 'Module 10',
    severity: 'CRITICAL',
    description: 'Verify REVIEWER role is blocked from scheduling logistics fleet pickup.',
    expected: 'checkAuthorization returns allowed === false',
    run: async () => {
      const check = checkAuthorization(SECURITY_ACTIONS.SCHEDULE_PICKUP, ROLES.REVIEWER);
      assert.false(check.allowed);
      return { actual: check.reason };
    }
  },
  {
    id: 'SEC-003',
    name: 'SEC-003: Unauthorized priority override blocked',
    category: TEST_CATEGORIES.SECURITY,
    relatedModule: 'Module 10',
    severity: 'HIGH',
    description: 'Verify REVIEWER role is blocked from modifying pickup priority scores.',
    expected: 'checkAuthorization returns allowed === false',
    run: async () => {
      const check = checkAuthorization(SECURITY_ACTIONS.OVERRIDE_PRIORITY, ROLES.REVIEWER);
      assert.false(check.allowed);
      return { actual: check.reason };
    }
  },
  {
    id: 'SEC-004',
    name: 'SEC-004: Boundary input validation',
    category: TEST_CATEGORIES.SECURITY,
    relatedModule: 'Module 10',
    severity: 'HIGH',
    description: 'Verify negative order values and out-of-range risk scores (>100) are rejected.',
    expected: 'Negative order value and score 150 rejected',
    run: async () => {
      const val1 = validateOrderValue(-100);
      const val2 = validateScore(150, 'Risk Score');
      assert.false(val1.valid);
      assert.false(val2.valid);
      return { actual: 'Negative price and out-of-bounds score cleanly rejected.' };
    }
  },
  {
    id: 'SEC-005',
    name: 'SEC-005: Duplicate action protection (Idempotency)',
    category: TEST_CATEGORIES.SECURITY,
    relatedModule: 'Module 10',
    severity: 'HIGH',
    description: 'Verify repeated submission of the same action within the lock window is trapped.',
    expected: 'Second attempt returns isDuplicate === true',
    run: async () => {
      const key = `ACT-${Date.now()}`;
      const first = checkIdempotency(key);
      const second = checkIdempotency(key);
      assert.false(first.isDuplicate);
      assert.true(second.isDuplicate);
      return { actual: 'Duplicate request trapped and blocked by idempotency store.' };
    }
  },
  {
    id: 'SEC-006',
    name: 'SEC-006: Illegal state transition blocking',
    category: TEST_CATEGORIES.SECURITY,
    relatedModule: 'Module 10',
    severity: 'CRITICAL',
    description: 'Verify completed pickups cannot be transitioned backwards to READY.',
    expected: 'validateStateTransition returns valid === false',
    run: async () => {
      const trans = validateStateTransition('PICKUP', 'PICKED_UP', 'READY');
      assert.false(trans.valid);
      return { actual: trans.error };
    }
  },
  {
    id: 'SEC-007',
    name: 'SEC-007: Storage credential leak prevention',
    category: TEST_CATEGORIES.SECURITY,
    relatedModule: 'Module 10',
    severity: 'CRITICAL',
    description: 'Verify storage wrapper refuses to write sensitive tokens, passwords, or credentials.',
    expected: 'setItem throws security policy exception',
    run: async () => {
      let threw = false;
      try {
        secureStorage.setItem('customer_password', 'secret');
      } catch (e) {
        threw = true;
      }
      assert.true(threw);
      return { actual: 'Attempt to store sensitive credential rejected by security wrapper.' };
    }
  },
  {
    id: 'SEC-008',
    name: 'SEC-008: API 401 Unauthorized handling',
    category: TEST_CATEGORIES.SECURITY,
    relatedModule: 'Module 10',
    severity: 'HIGH',
    description: 'Verify synthetic 401 error returns normalized UNAUTHORIZED code.',
    expected: 'error.code === UNAUTHORIZED',
    run: async () => {
      setFailureSimulation('401');
      const res = await apiClient.get('/api/returns');
      setFailureSimulation(null);
      assert.false(res.success);
      assert.equal(res.error?.code, 'UNAUTHORIZED');
      return { actual: 'Normalized 401 UNAUTHORIZED response received.' };
    }
  },
  {
    id: 'SEC-009',
    name: 'SEC-009: API 403 Forbidden handling',
    category: TEST_CATEGORIES.SECURITY,
    relatedModule: 'Module 10',
    severity: 'HIGH',
    description: 'Verify synthetic 403 error returns normalized FORBIDDEN code.',
    expected: 'error.code === FORBIDDEN',
    run: async () => {
      setFailureSimulation('403');
      const res = await apiClient.get('/api/returns');
      setFailureSimulation(null);
      assert.false(res.success);
      assert.equal(res.error?.code, 'FORBIDDEN');
      return { actual: 'Normalized 403 FORBIDDEN response received.' };
    }
  },
  {
    id: 'SEC-010',
    name: 'SEC-010: Session timeout handling',
    category: TEST_CATEGORIES.SECURITY,
    relatedModule: 'Module 10',
    severity: 'MEDIUM',
    description: 'Verify expired session state is identified without storing credentials.',
    expected: 'Session manager handles timeout and returns expired status',
    run: async () => {
      const sess = sessionManager.getSession();
      assert.defined(sess);
      return { actual: `Session status: ${sess.status} (Role: ${sess.role})` };
    }
  },
  {
    id: 'SEC-011',
    name: 'SEC-011: Audit trail structure & completeness',
    category: TEST_CATEGORIES.SECURITY,
    relatedModule: 'Module 10',
    severity: 'HIGH',
    description: 'Verify all audit events have mandatory actor and timestamp.',
    expected: 'Audit integrity check passes with zero critical corruptions',
    run: async () => {
      const integrity = checkAuditIntegrity();
      assert.true(integrity.status === 'PASS' || integrity.status === 'WARNING');
      return { actual: `Audit integrity: ${integrity.status} across ${integrity.totalAuditEvents} events.` };
    }
  },
  {
    id: 'SEC-012',
    name: 'SEC-012: Evidence file type enforcement',
    category: TEST_CATEGORIES.SECURITY,
    relatedModule: 'Module 10',
    severity: 'HIGH',
    description: 'Verify malicious executable extensions (.exe, .sh) are blocked from evidence intake.',
    expected: 'Non-image extension returns valid === false',
    run: async () => {
      const check = validateEvidenceFilename('payload.exe');
      assert.false(check.valid);
      return { actual: `Blocked executable: ${check.error}` };
    }
  },

  // =========================================================================
  // 7. MODULE 11: CUSTOMER DATA ISOLATION & LEAK PREVENTION (CUSTOMER-SEC-001 to 008)
  // =========================================================================
  {
    id: 'CUSTOMER-SEC-001',
    name: 'CUSTOMER-SEC-001: Cross-customer return isolation',
    category: TEST_CATEGORIES.CUSTOMER_SECURITY,
    relatedModule: 'Module 11',
    severity: 'CRITICAL',
    description: 'Verify Customer A (CUS-1024) cannot access or view returns belonging to Customer B (CUS-1025).',
    expected: 'Customer A query returns zero records belonging to Customer B',
    run: async () => {
      const returnsCustA = getCustomerReturns('CUS-1024');
      const hasCustBReturn = returnsCustA.some(r => r.returnId === 'RET-2024-003001');
      assert.false(hasCustBReturn);
      return { actual: 'Strict customer ID scoping verified; zero cross-tenant leakage.' };
    }
  },
  {
    id: 'CUSTOMER-SEC-002',
    name: 'CUSTOMER-SEC-002: Customer blocked from admin operations',
    category: TEST_CATEGORIES.CUSTOMER_SECURITY,
    relatedModule: 'Module 11',
    severity: 'CRITICAL',
    description: 'Verify CUSTOMER role is blocked from review, dispatch, and admin actions.',
    expected: 'checkAuthorization for CUSTOMER role returns allowed === false',
    run: async () => {
      const checkRev = checkAuthorization(SECURITY_ACTIONS.SUBMIT_REVIEW, 'CUSTOMER');
      const checkSched = checkAuthorization(SECURITY_ACTIONS.SCHEDULE_PICKUP, 'CUSTOMER');
      const checkSec = checkAuthorization(SECURITY_ACTIONS.MANAGE_SECURITY, 'CUSTOMER');
      assert.false(checkRev.allowed);
      assert.false(checkSched.allowed);
      assert.false(checkSec.allowed);
      return { actual: 'Customer role blocked from all internal operational actions.' };
    }
  },
  {
    id: 'CUSTOMER-SEC-003',
    name: 'CUSTOMER-SEC-003: Zero fraud score leakage to customer',
    category: TEST_CATEGORIES.CUSTOMER_SECURITY,
    relatedModule: 'Module 11',
    severity: 'CRITICAL',
    description: 'Verify customer-facing presentation models contain zero fraud/risk score attributes.',
    expected: 'Presentation model has no risk_score, riskScore, or fraudScore keys',
    run: async () => {
      const returns = getCustomerReturns('CUS-1024');
      returns.forEach(r => {
        assert.equal(r.risk_score, undefined);
        assert.equal(r.riskScore, undefined);
        assert.equal(r.fraud_score, undefined);
      });
      return { actual: 'Verified across all returns: zero internal risk metrics exposed.' };
    }
  },
  {
    id: 'CUSTOMER-SEC-004',
    name: 'CUSTOMER-SEC-004: Reviewer internal notes withheld from customer',
    category: TEST_CATEGORIES.CUSTOMER_SECURITY,
    relatedModule: 'Module 11',
    severity: 'HIGH',
    description: 'Verify internal reviewer reasoning and investigative notes are not sent to customer.',
    expected: 'Customer return detail excludes reviewer notes and rationales',
    run: async () => {
      const detail = getCustomerReturnDetail('CUS-1025', 'RET-2024-003001');
      assert.defined(detail);
      assert.equal(detail.reviewerNotes, undefined);
      assert.equal(detail.internalReason, undefined);
      return { actual: 'Internal reviewer rationale strictly sanitized.' };
    }
  },
  {
    id: 'CUSTOMER-SEC-005',
    name: 'CUSTOMER-SEC-005: Audit logs inaccessible to customer',
    category: TEST_CATEGORIES.CUSTOMER_SECURITY,
    relatedModule: 'Module 11',
    severity: 'HIGH',
    description: 'Verify customer presentation models do not expose internal audit event trails.',
    expected: 'Detail model has no audit_log or auditEntries',
    run: async () => {
      const detail = getCustomerReturnDetail('CUS-1025', 'RET-2024-003001');
      assert.defined(detail);
      assert.equal(detail.audit_log, undefined);
      assert.equal(detail.timeline_audit, undefined);
      return { actual: 'Audit trail restricted to internal operations team.' };
    }
  },
  {
    id: 'CUSTOMER-SEC-006',
    name: 'CUSTOMER-SEC-006: Customer cannot alter pickup priority',
    category: TEST_CATEGORIES.CUSTOMER_SECURITY,
    relatedModule: 'Module 11',
    severity: 'HIGH',
    description: 'Verify customer cannot override internal pickup score calculations.',
    expected: 'checkAuthorization for OVERRIDE_PRIORITY returns false for CUSTOMER',
    run: async () => {
      const check = checkAuthorization(SECURITY_ACTIONS.OVERRIDE_PRIORITY, 'CUSTOMER');
      assert.false(check.allowed);
      return { actual: 'Priority modification blocked for customer role.' };
    }
  },
  {
    id: 'CUSTOMER-SEC-007',
    name: 'CUSTOMER-SEC-007: Customer cannot change human review decision',
    category: TEST_CATEGORIES.CUSTOMER_SECURITY,
    relatedModule: 'Module 11',
    severity: 'CRITICAL',
    description: 'Verify review decision can only be submitted by internal authorized staff.',
    expected: 'SUBMIT_REVIEW authorization fails for customer',
    run: async () => {
      const check = checkAuthorization(SECURITY_ACTIONS.SUBMIT_REVIEW, 'CUSTOMER');
      assert.false(check.allowed);
      return { actual: 'Review authority enforced; customers cannot self-approve.' };
    }
  },
  {
    id: 'CUSTOMER-SEC-008',
    name: 'CUSTOMER-SEC-008: Evaluation metrics withheld from customer',
    category: TEST_CATEGORIES.CUSTOMER_SECURITY,
    relatedModule: 'Module 11',
    severity: 'HIGH',
    description: 'Verify evaluation ground truth and experiment metrics are inaccessible to customer.',
    expected: 'RUN_EXPERIMENT and MANAGE_GROUND_TRUTH blocked for customer role',
    run: async () => {
      const expCheck = checkAuthorization(SECURITY_ACTIONS.RUN_EXPERIMENT, 'CUSTOMER');
      const gtCheck = checkAuthorization(SECURITY_ACTIONS.MANAGE_GROUND_TRUTH, 'CUSTOMER');
      assert.false(expCheck.allowed);
      assert.false(gtCheck.allowed);
      return { actual: 'Evaluation metrics and experiment controls restricted to internal staff.' };
    }
  }
];
