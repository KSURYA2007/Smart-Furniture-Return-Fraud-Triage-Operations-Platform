/**
 * Module 8: Mock Backend Server Adapter
 * Realistic local REST simulation enforcing API validation, eligibility checks, duplicate locks, and audit logging
 */

import { ERROR_CODES, createSuccessResponse, createErrorResponse } from '../contracts.js';
import { 
  getAllReturns, 
  getReturnById, 
  saveReturn,
  getCustomerById, 
  getOrdersByCustomerId as getCustomerOrders,
  getStoredReview,
  saveStoredReview,
  getAllStoredReviews,
  getStoredPickup,
  saveStoredPickup,
  getAllStoredPickups,
  addPickupAuditEntry,
  getPickupAuditLog,
  getStoredEvaluationLabels,
  saveStoredEvaluationLabel,
  getStoredExperiments,
  saveStoredExperiment
} from '../../utils/storage.js';

import { calculateCustomerHistoryStats } from '../../utils/customerHistory.js';
import { analyzeReturnEvidence } from '../../utils/evidenceAnalysis.js';
import { calculateRisk } from '../../services/riskEngine.js';
import { calculatePickupPriority, buildPickupQueue, groupPickupBatches, schedulePickup, completePickup, overridePickupPriority } from '../../services/pickupService.js';
import { runExperimentComparison, buildEvaluationDataset, calculateThresholdTradeoffs, validateDataQuality } from '../../services/evaluationService.js';
import { PICKUP_CONFIG } from '../../config/pickupRules.js';

export async function handleMockRequest(method, path, body = null, options = {}) {
  // Simulate lightweight network latency (20ms)
  await new Promise(r => setTimeout(r, 20));

  const cleanPath = path.replace(/^\/api\/?/, '/');
  const [pathOnly, queryString] = cleanPath.split('?');
  const segments = pathOnly.split('/').filter(Boolean);

  try {
    // --- 1. HEALTH CHECK ---
    if (pathOnly === '/health' && method === 'GET') {
      return createSuccessResponse({
        status: 'OK',
        version: 'prototype-v1',
        mode: 'MOCK_ADAPTER',
        timestamp: new Date().toISOString()
      });
    }

    // --- 2. RETURNS ENDPOINTS ---
    if (segments[0] === 'returns') {
      // GET /api/returns
      if (segments.length === 1 && method === 'GET') {
        const returns = getAllReturns();
        return createSuccessResponse(returns, { total: returns.length });
      }

      // POST /api/returns
      if (segments.length === 1 && method === 'POST') {
        if (!body || !body.customerId || !body.orderId || !body.productId || !body.returnReason) {
          return createErrorResponse(
            ERROR_CODES.VALIDATION_ERROR,
            'Missing required return claim attributes: customerId, orderId, productId, and returnReason are required.'
          );
        }

        const newReturn = {
          return_id: `RET-${Date.now().toString().slice(-6)}`,
          customer_id: body.customerId,
          order_id: body.orderId,
          product: body.productId,
          reason: body.returnReason,
          condition: body.description || 'Customer Reported Issue',
          created_at: new Date().toISOString(),
          pickup: {
            preferred_date: body.requestedPickupDate || '2024-11-01',
            time_slot: body.preferredPickupSlot || '09:00 AM – 12:00 PM',
            address: body.location?.address || '102 Indiranagar 100ft Rd',
            city: body.location?.city || 'Bengaluru',
            postal_code: body.location?.postalCode || '560038'
          }
        };

        saveReturn(newReturn);
        addPickupAuditEntry(newReturn.return_id, 'Return claim created via API', 'API Client', 'Customer Portal');

        return createSuccessResponse({
          returnId: newReturn.return_id,
          status: 'INTAKE_COMPLETED',
          createdAt: newReturn.created_at
        });
      }

      // Specific return: /api/returns/:returnId
      const returnId = segments[1]?.toUpperCase();
      const rec = getReturnById(returnId);
      if (!rec) {
        return createErrorResponse(ERROR_CODES.NOT_FOUND, `Return claim "${returnId}" not found.`);
      }

      // GET /api/returns/:returnId
      if (segments.length === 2 && method === 'GET') {
        return createSuccessResponse(rec);
      }

      // GET /api/returns/:returnId/status
      if (segments[2] === 'status' && method === 'GET') {
        const review = getStoredReview(returnId);
        const pickup = getStoredPickup(returnId);
        return createSuccessResponse({
          returnId,
          reviewStatus: review?.decision?.decision_type || 'AWAITING_REVIEW',
          pickupStatus: pickup?.status || 'NOT_SCHEDULED'
        });
      }

      // GET /api/returns/:returnId/triage
      if (segments[2] === 'triage' && method === 'GET') {
        const custStats = calculateCustomerHistoryStats(rec.customer_id || rec.customer?.customer_id);
        const evidence = analyzeReturnEvidence(rec);
        const triage = calculateRisk(rec, custStats, evidence);
        return createSuccessResponse(triage);
      }

      // GET /api/returns/:returnId/evidence
      if (segments[2] === 'evidence' && method === 'GET') {
        const evidence = analyzeReturnEvidence(rec);
        return createSuccessResponse(evidence);
      }
    }

    // --- 3. CUSTOMERS ENDPOINTS ---
    if (segments[0] === 'customers') {
      const customerId = segments[1]?.toUpperCase();
      if (!customerId) {
        return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, 'Customer ID required.');
      }
      const customer = getCustomerById(customerId);
      if (!customer) {
        return createErrorResponse(ERROR_CODES.NOT_FOUND, `Customer "${customerId}" not found.`);
      }

      if (segments.length === 2 && method === 'GET') {
        return createSuccessResponse(customer);
      }

      if (segments[2] === 'history' && method === 'GET') {
        const historyStats = calculateCustomerHistoryStats(customerId);
        return createSuccessResponse(historyStats);
      }

      if (segments[2] === 'orders' && method === 'GET') {
        const orders = getCustomerOrders(customerId);
        return createSuccessResponse(orders);
      }
    }

    // --- 4. TRIAGE RULES ENDPOINT ---
    if (segments[0] === 'triage') {
      if (segments[1] === 'rules' && method === 'GET') {
        return createSuccessResponse({
          version: 'rules-v1',
          weights: {
            historicalFraud: 30,
            returnBehaviour: 20,
            evidenceInconsistency: 20,
            evidenceQuality: 10,
            productContext: 10,
            timing: 10
          },
          thresholds: {
            low: 29,
            medium: 59,
            high: 79
          }
        });
      }
    }

    // --- 5. HUMAN REVIEWS ENDPOINTS ---
    if (segments[0] === 'reviews') {
      // GET /api/reviews
      if (segments.length === 1 && method === 'GET') {
        const allReviews = getAllStoredReviews();
        return createSuccessResponse(allReviews);
      }

      const returnId = segments[1]?.toUpperCase();
      const rec = getReturnById(returnId);
      if (!rec) {
        return createErrorResponse(ERROR_CODES.NOT_FOUND, `Return "${returnId}" not found for review.`);
      }

      // GET /api/reviews/:returnId
      if (segments.length === 2 && method === 'GET') {
        const review = getStoredReview(returnId);
        return createSuccessResponse(review || { review_status: 'AWAITING_REVIEW' });
      }

      // POST /api/reviews/:returnId/decision
      if (segments[2] === 'decision' && method === 'POST') {
        if (!body || !body.decision) {
          return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, 'Decision type required.');
        }

        const validDecisions = ['APPROVE_PICKUP', 'REJECT_RETURN', 'REQUEST_MORE_EVIDENCE', 'ESCALATE'];
        if (!validDecisions.includes(body.decision)) {
          return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, `Invalid decision: ${body.decision}`);
        }

        // Rule: Rejection or override requires a reason
        if (body.decision === 'REJECT_RETURN' && (!body.reason || body.reason.trim().length < 5)) {
          return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, 'A detailed reason is mandatory when rejecting a customer return.');
        }

        const reviewPayload = {
          decision: {
            decision_type: body.decision,
            reason: body.reason || 'Operational review confirmed.',
            reason_category: body.reasonCategory || 'STANDARD_INSPECTION',
            override: Boolean(body.override),
            status: body.decision === 'APPROVE_PICKUP' ? 'APPROVED' : body.decision
          },
          reviewer: body.reviewer || { id: 'REV-01', name: 'Dispatcher S. Sharma', role: 'Operations' },
          review_completed_at: new Date().toISOString()
        };

        saveStoredReview(returnId, reviewPayload);
        addPickupAuditEntry(returnId, `Human review completed: ${body.decision}`, reviewPayload.reviewer.name, reviewPayload.reviewer.role, body.reason);

        return createSuccessResponse({
          returnId,
          decision: body.decision,
          recordedAt: reviewPayload.review_completed_at
        });
      }
    }

    // --- 6. PICKUP OPERATIONS ENDPOINTS ---
    if (segments[0] === 'pickups') {
      // GET /api/pickups
      if (segments.length === 1 && method === 'GET') {
        const queue = buildPickupQueue();
        return createSuccessResponse(queue);
      }

      const returnId = segments[1]?.toUpperCase();

      // Specific pickup scheduling: POST /api/pickups/:returnId/schedule
      if (segments[2] === 'schedule' && method === 'POST') {
        const review = getStoredReview(returnId);
        if (review?.decision?.decision_type !== 'APPROVE_PICKUP') {
          return createErrorResponse(
            ERROR_CODES.FORBIDDEN,
            `Cannot schedule pickup: case review decision is "${review?.decision?.decision_type || 'AWAITING_REVIEW'}". Only APPROVE_PICKUP cases are eligible.`
          );
        }

        const existingPickup = getStoredPickup(returnId);
        // Duplicate scheduling protection (Section 23)
        if (existingPickup?.status === 'SCHEDULED' && !body.isReschedule) {
          return createErrorResponse(
            ERROR_CODES.CONFLICT,
            `Pickup is already scheduled for return ${returnId}. Reschedule flag required to update.`
          );
        }

        const schedulePayload = {
          date: body.pickupDate || new Date().toISOString().split('T')[0],
          timeSlot: body.timeSlot || '09:00 AM – 12:00 PM',
          driver: body.driver || { id: 'DRV-01', name: 'Ramesh Kumar', phone: '+91 98451 22301' },
          vehicle: body.vehicle || { id: 'VEH-01', name: 'Van 01', type: 'Light Cargo Van' },
          specialHandling: body.specialHandling || []
        };

        const success = schedulePickup(returnId, schedulePayload, body.scheduledBy || 'Dispatcher');
        if (!success) {
          return createErrorResponse(ERROR_CODES.SERVER_ERROR, 'Failed to save scheduled pickup.');
        }

        return createSuccessResponse({
          pickupId: `PKP-${returnId}`,
          returnId,
          status: 'SCHEDULED',
          scheduledAt: new Date().toISOString()
        });
      }

      // Update pickup status: PATCH /api/pickups/:returnId/status
      if (segments[2] === 'status' && method === 'PATCH') {
        const validStatuses = ['READY', 'SCHEDULED', 'PICKED_UP', 'CANCELLED'];
        if (!validStatuses.includes(body.status)) {
          return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, `Invalid status: ${body.status}`);
        }

        const current = getStoredPickup(returnId);
        // Prevent invalid backward transitions
        if (current?.status === 'PICKED_UP' && body.status === 'READY') {
          return createErrorResponse(ERROR_CODES.CONFLICT, 'Illegal transition: Completed pickups cannot be reset to READY.');
        }

        if (body.status === 'PICKED_UP') {
          completePickup(returnId, { notes: body.notes || 'Item retrieved at doorstep.' });
        } else {
          saveStoredPickup(returnId, { status: body.status });
        }

        return createSuccessResponse({ returnId, status: body.status });
      }

      // Priority Override: POST /api/pickups/:returnId/priority-override
      if (segments[2] === 'priority-override' && method === 'POST') {
        if (!body.reason || body.reason.trim().length < 5) {
          return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, 'Mandatory explanation required for priority override.');
        }

        overridePickupPriority(
          returnId,
          body.originalScore || 50,
          body.originalLevel || 'STANDARD',
          body.newScore || 85,
          body.newLevel || 'CRITICAL',
          body.reason,
          body.overriddenBy || 'Operations Manager'
        );

        return createSuccessResponse({ returnId, overridden: true, newScore: body.newScore });
      }
    }

    // --- 7. PICKUP BATCHES ---
    if (segments[0] === 'pickup-batches' && method === 'GET') {
      const queue = buildPickupQueue();
      const batches = groupPickupBatches(queue);
      return createSuccessResponse(batches);
    }

    // --- 8. METRICS & EXPERIMENTS ENDPOINTS ---
    if (segments[0] === 'metrics') {
      if (segments[1] === 'dashboard' && method === 'GET') {
        const results = runExperimentComparison();
        return createSuccessResponse(results);
      }

      if (segments[1] === 'experiments' && method === 'POST') {
        const results = runExperimentComparison(body || {});
        const record = {
          experiment_id: `EXP-${Date.now()}`,
          configuration: body || {},
          results
        };
        saveStoredExperiment(record);
        return createSuccessResponse(record);
      }

      if (segments[1] === 'experiments' && method === 'GET') {
        const exps = getStoredExperiments();
        return createSuccessResponse(exps);
      }

      if (segments[1] === 'data-quality' && method === 'GET') {
        const dataset = buildEvaluationDataset();
        const quality = validateDataQuality(dataset);
        return createSuccessResponse(quality);
      }
    }

    // --- 9. EVALUATION GROUND TRUTH ---
    if (segments[0] === 'evaluation' && segments[2] === 'ground-truth' && method === 'POST') {
      const returnId = segments[1]?.toUpperCase();
      if (!body.label || !['FRAUD_CONFIRMED', 'LEGITIMATE', 'UNKNOWN'].includes(body.label)) {
        return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, 'Valid ground truth label (FRAUD_CONFIRMED, LEGITIMATE, UNKNOWN) required.');
      }

      saveStoredEvaluationLabel(returnId, {
        label: body.label,
        fraud_loss: body.fraudLoss || 0,
        source: body.source || 'Investigative Review',
        confirmed_date: body.confirmationDate || new Date().toISOString().split('T')[0]
      });

      return createSuccessResponse({ returnId, groundTruth: body.label });
    }

    // --- 10. AUDIT LOG ---
    if (segments[0] === 'audit') {
      const returnId = segments[1]?.toUpperCase();
      if (method === 'GET') {
        const log = getPickupAuditLog(returnId);
        return createSuccessResponse(log);
      }
      if (method === 'POST') {
        addPickupAuditEntry(returnId, body.action, body.actor?.name, body.actor?.role, body.details);
        return createSuccessResponse({ recorded: true });
      }
    }

    return createErrorResponse(ERROR_CODES.NOT_FOUND, `Route not found: ${method} ${path}`);
  } catch (error) {
    return createErrorResponse(ERROR_CODES.SERVER_ERROR, 'Internal mock backend error.', error.message);
  }
}
