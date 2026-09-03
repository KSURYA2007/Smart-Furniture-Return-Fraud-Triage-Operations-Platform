/**
 * Storage & Data Access Utility for Module 1 & Module 2
 * Stores customers, orders, and returns in localStorage with auto-seeding
 */
import { INITIAL_CUSTOMERS, INITIAL_ORDERS, INITIAL_RETURNS } from '../data/seedData.js';
import { DEMO_PICKUP_RETURNS, DEMO_PICKUP_REVIEWS } from '../data/pickupDemoData.js';
import { broadcastRealtime, REALTIME_EVENTS } from './realtimeBus.js';

const STORAGE_KEYS = {
  CUSTOMERS: 'customers',
  ORDERS: 'orders',
  RETURNS: 'return_requests',
  PICKUPS: 'return_pickups',
  PICKUP_AUDIT: 'pickup_audit_log',
  EVALUATION_LABELS: 'return_evaluation_labels',
  EXPERIMENTS: 'return_experiments',
  VALIDATION: 'return_validation',
  EVALUATION_CONFIG: 'return_evaluation_config',
  TEST_RUNS: 'return_test_runs'
};

/**
 * Initialize storage with default seed data if keys don't exist
 */
export function initializeStorage() {
  try {
    if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    }
    
    // Seed returns with initial returns + Module 6 demo cases
    const existingReturnsRaw = localStorage.getItem(STORAGE_KEYS.RETURNS);
    let allReturnsList = [];
    if (!existingReturnsRaw) {
      allReturnsList = [...INITIAL_RETURNS, ...DEMO_PICKUP_RETURNS];
      localStorage.setItem(STORAGE_KEYS.RETURNS, JSON.stringify(allReturnsList));
    } else {
      allReturnsList = JSON.parse(existingReturnsRaw);
      const existingIds = new Set(allReturnsList.map(r => r.return_id?.toUpperCase()));
      let added = false;
      DEMO_PICKUP_RETURNS.forEach(demo => {
        if (!existingIds.has(demo.return_id.toUpperCase())) {
          allReturnsList.push(demo);
          added = true;
        }
      });
      if (added) {
        localStorage.setItem(STORAGE_KEYS.RETURNS, JSON.stringify(allReturnsList));
      }
    }

    // Seed initial Module 5 reviews for demo returns if empty
    const existingReviewsRaw = localStorage.getItem('return_reviews');
    if (!existingReviewsRaw) {
      localStorage.setItem('return_reviews', JSON.stringify(DEMO_PICKUP_REVIEWS));
    } else {
      const reviewsMap = JSON.parse(existingReviewsRaw);
      let updated = false;
      Object.keys(DEMO_PICKUP_REVIEWS).forEach(k => {
        if (!reviewsMap[k]) {
          reviewsMap[k] = DEMO_PICKUP_REVIEWS[k];
          updated = true;
        }
      });
      if (updated) {
        localStorage.setItem('return_reviews', JSON.stringify(reviewsMap));
      }
    }

    // Seed initial Module 7 Ground Truth Evaluation Labels if empty
    const existingLabelsRaw = localStorage.getItem(STORAGE_KEYS.EVALUATION_LABELS);
    if (!existingLabelsRaw) {
      const initialLabels = {};
      
      // Known demo returns
      initialLabels['RET-2024-003001'] = { label: 'LEGITIMATE', fraud_loss: 0, source: 'Customer Service Review', confirmed_date: '2024-10-14', notes: 'Legitimate customer delayed by holiday rush. Genuine delivery defect.' };
      initialLabels['RET-2024-003002'] = { label: 'LEGITIMATE', fraud_loss: 0, source: 'Technician Inspection', confirmed_date: '2024-10-15', notes: 'Defective reclining hydraulic mechanism confirmed.' };
      initialLabels['RET-2024-003003'] = { label: 'LEGITIMATE', fraud_loss: 0, source: 'Transit Waybill Audit', confirmed_date: '2024-10-16', notes: 'Severe freight carrier puncture in velvet upholstery.' };
      initialLabels['RET-2024-003004'] = { label: 'FRAUD_CONFIRMED', fraud_loss: 14500, source: 'Warehouse Return Audit', confirmed_date: '2024-10-15', notes: 'Customer attempted returning unbranded broken chair instead of ordered ergonomic executive chair.' };
      initialLabels['RET-2024-003005'] = { label: 'UNKNOWN', fraud_loss: 0, source: 'Pending Documentation', confirmed_date: '', notes: 'Waiting for secondary photo proofs from customer.' };
      initialLabels['RET-2024-003006'] = { label: 'FRAUD_CONFIRMED', fraud_loss: 42000, source: 'Investigative Review', confirmed_date: '2024-10-14', notes: 'Multiple intentional incisions reported across sectional fabric.' };
      initialLabels['RET-2024-003007'] = { label: 'LEGITIMATE', fraud_loss: 0, source: 'Phone Confirmation', confirmed_date: '2024-10-15', notes: 'Customer provided alternate address.' };
      initialLabels['RET-2024-003008'] = { label: 'LEGITIMATE', fraud_loss: 0, source: 'Order Matching', confirmed_date: '2024-10-16', notes: 'Correct invoice attached.' };
      initialLabels['RET-2024-003009'] = { label: 'LEGITIMATE', fraud_loss: 0, source: 'Delivery Receipt', confirmed_date: '2024-10-16', notes: 'Table finish discoloration verified.' };

      // Also map historical returns from seedData
      allReturnsList.forEach(ret => {
        const id = ret.return_id?.toUpperCase();
        if (id && !initialLabels[id]) {
          if (ret.outcome === 'Confirmed Fraud') {
            initialLabels[id] = {
              label: 'FRAUD_CONFIRMED',
              fraud_loss: ret.product_price || ret.order?.price || 22000,
              source: 'Historical Investigation Closed',
              confirmed_date: ret.decision_date || '2024-06-12',
              notes: ret.notes || 'Confirmed return fraud pattern.'
            };
          } else if (ret.outcome === 'Genuine') {
            initialLabels[id] = {
              label: 'LEGITIMATE',
              fraud_loss: 0,
              source: 'Historical Review & Resolved',
              confirmed_date: ret.decision_date || '2024-08-11',
              notes: ret.notes || 'Genuine return claim.'
            };
          } else {
            initialLabels[id] = {
              label: 'UNKNOWN',
              fraud_loss: 0,
              source: 'Not Yet Verified',
              confirmed_date: '',
              notes: 'Pending final ground-truth resolution.'
            };
          }
        }
      });

      localStorage.setItem(STORAGE_KEYS.EVALUATION_LABELS, JSON.stringify(initialLabels));
    }
  } catch (e) {
    console.warn('LocalStorage access error in initializeStorage:', e);
  }
}

/**
 * Reset all data to initial seed data
 */
export function resetToSeedData() {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    localStorage.setItem(STORAGE_KEYS.RETURNS, JSON.stringify(INITIAL_RETURNS));
    return true;
  } catch (e) {
    console.error('Failed to reset seed data:', e);
    return false;
  }
}

/**
 * Get all customers
 */
export function getAllCustomers() {
  initializeStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return raw ? JSON.parse(raw) : INITIAL_CUSTOMERS;
  } catch {
    return INITIAL_CUSTOMERS;
  }
}

/**
 * Get customer by ID
 */
export function getCustomerById(customerId) {
  if (!customerId) return null;
  const customers = getAllCustomers();
  const normalizedId = customerId.trim().toUpperCase();
  return customers.find(c => c.customer_id.toUpperCase() === normalizedId) || null;
}

/**
 * Get all orders
 */
export function getAllOrders() {
  initializeStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return raw ? JSON.parse(raw) : INITIAL_ORDERS;
  } catch {
    return INITIAL_ORDERS;
  }
}

/**
 * Get all orders for a specific customer
 */
export function getOrdersByCustomerId(customerId) {
  if (!customerId) return [];
  const orders = getAllOrders();
  const normalizedId = customerId.trim().toUpperCase();
  return orders.filter(o => o.customer_id.toUpperCase() === normalizedId);
}

/**
 * Get all returns
 */
export function getAllReturns() {
  initializeStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RETURNS);
    if (!raw) return INITIAL_RETURNS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEYS.RETURNS, JSON.stringify(INITIAL_RETURNS));
      return INITIAL_RETURNS;
    }
    return parsed;
  } catch {
    return INITIAL_RETURNS;
  }
}

/**
 * Get returns for a specific customer
 */
export function getReturnsByCustomerId(customerId) {
  if (!customerId) return [];
  const returns = getAllReturns();
  const normalizedId = customerId.trim().toUpperCase();
  return returns.filter(r => (r.customer_id || r.customer?.customer_id || '').toUpperCase() === normalizedId);
}

/**
 * Get return by Return ID
 */
export function getReturnById(returnId) {
  if (!returnId) return null;
  const returns = getAllReturns();
  const normalizedId = String(returnId).trim().toUpperCase();
  return returns.find(r => (r.return_id || '').toUpperCase() === normalizedId) || null;
}

/**
 * Save new return claim to storage
 */
export function saveReturn(returnRecord) {
  if (!returnRecord || typeof localStorage === 'undefined') return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RETURNS);
    const list = raw ? JSON.parse(raw) : [];
    list.unshift(returnRecord);
    localStorage.setItem(STORAGE_KEYS.RETURNS, JSON.stringify(list));
    broadcastRealtime(REALTIME_EVENTS.RETURN_CREATED, returnRecord);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Search customers by query across ID, name, email, phone, city
 */
export function searchCustomers(query = '') {
  const customers = getAllCustomers();
  if (!query || !query.trim()) return customers;
  const q = query.trim().toLowerCase();

  return customers.filter(c => 
    c.customer_id.toLowerCase().includes(q) ||
    c.name.toLowerCase().includes(q) ||
    c.email.toLowerCase().includes(q) ||
    c.phone.toLowerCase().includes(q) ||
    (c.city && c.city.toLowerCase().includes(q))
  );
}

/**
 * Search returns across Return ID, Order ID, Customer ID, Product, Customer Name
 */
export function searchReturns(query = '') {
  const returns = getAllReturns();
  if (!query || !query.trim()) return returns;
  const q = query.trim().toLowerCase();

  return returns.filter(r => {
    const returnId = (r.return_id || '').toLowerCase();
    const orderId = (r.order_id || r.order?.order_id || '').toLowerCase();
    const customerId = (r.customer_id || r.customer?.customer_id || '').toLowerCase();
    const customerName = (r.customer_name || r.customer?.name || '').toLowerCase();
    const product = (r.product || r.order?.product_name || '').toLowerCase();

    return returnId.includes(q) || orderId.includes(q) || customerId.includes(q) || customerName.includes(q) || product.includes(q);
  });
}

const EVIDENCE_ANALYSIS_KEY = 'return_evidence_analysis';
const EVIDENCE_NOTES_KEY = 'return_evidence_review_notes';
const EVIDENCE_ANNOTATIONS_KEY = 'return_evidence_annotations';

/**
 * Get stored evidence analysis for a return ID
 */
export function getStoredEvidenceAnalysis(returnId) {
  if (!returnId) return null;
  try {
    const raw = localStorage.getItem(EVIDENCE_ANALYSIS_KEY);
    const store = raw ? JSON.parse(raw) : {};
    return store[returnId.toUpperCase()] || null;
  } catch {
    return null;
  }
}

/**
 * Save evidence analysis to localStorage
 */
export function saveStoredEvidenceAnalysis(returnId, analysisData) {
  if (!returnId || !analysisData) return false;
  try {
    const raw = localStorage.getItem(EVIDENCE_ANALYSIS_KEY);
    const store = raw ? JSON.parse(raw) : {};
    store[returnId.toUpperCase()] = {
      ...analysisData,
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(EVIDENCE_ANALYSIS_KEY, JSON.stringify(store));
    broadcastRealtime(REALTIME_EVENTS.EVIDENCE_UPLOADED, { returnId, analysisData });
    return true;
  } catch (e) {
    console.error('Error saving evidence analysis:', e);
    return false;
  }
}

/**
 * Get reviewer notes for a return ID
 */
export function getEvidenceReviewNotes(returnId) {
  if (!returnId) return '';
  try {
    const raw = localStorage.getItem(EVIDENCE_NOTES_KEY);
    const store = raw ? JSON.parse(raw) : {};
    return store[returnId.toUpperCase()] || '';
  } catch {
    return '';
  }
}

/**
 * Save reviewer notes for a return ID
 */
export function saveEvidenceReviewNotes(returnId, notes) {
  if (!returnId) return false;
  try {
    const raw = localStorage.getItem(EVIDENCE_NOTES_KEY);
    const store = raw ? JSON.parse(raw) : {};
    store[returnId.toUpperCase()] = notes;
    localStorage.setItem(EVIDENCE_NOTES_KEY, JSON.stringify(store));
    return true;
  } catch (e) {
    console.error('Error saving review notes:', e);
    return false;
  }
}

/**
 * Get manual evidence annotations for an image in a return
 */
export function getEvidenceAnnotations(returnId, imageKey) {
  if (!returnId || !imageKey) return [];
  try {
    const raw = localStorage.getItem(EVIDENCE_ANNOTATIONS_KEY);
    const store = raw ? JSON.parse(raw) : {};
    const returnStore = store[returnId.toUpperCase()] || {};
    return returnStore[imageKey] || [];
  } catch {
    return [];
  }
}

/**
 * Save manual evidence annotations for an image in a return
 */
export function saveEvidenceAnnotations(returnId, imageKey, annotations) {
  if (!returnId || !imageKey) return false;
  try {
    const raw = localStorage.getItem(EVIDENCE_ANNOTATIONS_KEY);
    const store = raw ? JSON.parse(raw) : {};
    if (!store[returnId.toUpperCase()]) {
      store[returnId.toUpperCase()] = {};
    }
    store[returnId.toUpperCase()][imageKey] = annotations;
    localStorage.setItem(EVIDENCE_ANNOTATIONS_KEY, JSON.stringify(store));
    return true;
  } catch (e) {
    console.error('Error saving evidence annotations:', e);
    return false;
  }
}

const TRIAGE_ASSESSMENTS_KEY = 'return_triage_assessments';

/**
 * Get stored triage risk assessment for a return ID
 */
export function getStoredTriageAssessment(returnId) {
  if (!returnId) return null;
  try {
    const raw = localStorage.getItem(TRIAGE_ASSESSMENTS_KEY);
    const store = raw ? JSON.parse(raw) : {};
    return store[returnId.toUpperCase()] || null;
  } catch {
    return null;
  }
}

/**
 * Save triage risk assessment to localStorage
 */
export function saveStoredTriageAssessment(returnId, triageData) {
  if (!returnId || !triageData) return false;
  try {
    const raw = localStorage.getItem(TRIAGE_ASSESSMENTS_KEY);
    const store = raw ? JSON.parse(raw) : {};
    store[returnId.toUpperCase()] = {
      ...triageData,
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(TRIAGE_ASSESSMENTS_KEY, JSON.stringify(store));
    return true;
  } catch (e) {
    console.error('Error saving triage assessment:', e);
    return false;
  }
}

/**
 * Get all stored triage assessments
 */
export function getAllStoredTriageAssessments() {
  try {
    const raw = localStorage.getItem(TRIAGE_ASSESSMENTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// =========================================================================
// MODULE 5: HUMAN REVIEW & MANUAL INTERVENTION STORAGE
// =========================================================================
const REVIEWS_KEY = 'return_reviews';

/**
 * Get stored human review for a specific return ID
 */
export function getStoredReview(returnId) {
  if (!returnId) return null;
  try {
    const raw = localStorage.getItem(REVIEWS_KEY);
    const store = raw ? JSON.parse(raw) : {};
    return store[returnId.toUpperCase()] || null;
  } catch (e) {
    console.error('Error fetching review from storage:', e);
    return null;
  }
}

/**
 * Save or update a human review record
 */
export function saveStoredReview(returnId, reviewData) {
  if (!returnId || !reviewData) return false;
  try {
    const raw = localStorage.getItem(REVIEWS_KEY);
    const store = raw ? JSON.parse(raw) : {};
    const existing = store[returnId.toUpperCase()] || {};
    
    store[returnId.toUpperCase()] = {
      ...existing,
      ...reviewData,
      return_id: returnId.toUpperCase(),
      updated_at: new Date().toISOString()
    };
    
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(store));
    broadcastRealtime(REALTIME_EVENTS.REVIEW_UPDATED, { returnId, reviewData: store[returnId.toUpperCase()] });
    return true;
  } catch (e) {
    console.error('Error saving review to storage:', e);
    return false;
  }
}

/**
 * Get all stored reviews
 */
export function getAllStoredReviews() {
  try {
    const raw = localStorage.getItem(REVIEWS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Append an audit entry to a review's timeline
 */
export function addReviewAuditEntry(returnId, actionText, user = 'Operator', role = 'Dispatcher', details = null) {
  if (!returnId) return false;
  try {
    const review = getStoredReview(returnId) || {
      return_id: returnId.toUpperCase(),
      review_status: 'PENDING',
      timeline: []
    };

    const timeline = Array.isArray(review.timeline) ? review.timeline : [];
    timeline.push({
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      action: actionText,
      user,
      role,
      details
    });

    review.timeline = timeline;
    return saveStoredReview(returnId, review);
  } catch (e) {
    console.error('Error adding review audit entry:', e);
    return false;
  }
}

/**
 * Append an internal note to a review without overwriting previous notes
 */
export function addReviewNote(returnId, noteText, reviewerName = 'Reviewer', reviewerRole = 'Dispatcher') {
  if (!returnId || !noteText?.trim()) return false;
  try {
    const review = getStoredReview(returnId) || {
      return_id: returnId.toUpperCase(),
      review_status: 'PENDING',
      notes: [],
      timeline: []
    };

    const notes = Array.isArray(review.notes) ? review.notes : [];
    const newNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      text: noteText.trim(),
      reviewer: reviewerName,
      role: reviewerRole
    };
    notes.push(newNote);
    review.notes = notes;

    // Also record note addition in timeline
    const timeline = Array.isArray(review.timeline) ? review.timeline : [];
    timeline.push({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: `Internal note added by ${reviewerName} (${reviewerRole})`,
      user: reviewerName,
      role: reviewerRole
    });
    review.timeline = timeline;

    return saveStoredReview(returnId, review);
  } catch (e) {
    console.error('Error adding review note:', e);
    return false;
  }
}

// =========================================================================
// MODULE 6: PICKUP PRIORITISATION & OPERATIONS DECISION ENGINE STORAGE
// =========================================================================
const PICKUPS_KEY = 'return_pickups';
const PICKUP_AUDIT_KEY = 'pickup_audit_log';

/**
 * Get stored pickup operations data for a specific return ID
 */
export function getStoredPickup(returnId) {
  if (!returnId || typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PICKUPS_KEY);
    const store = raw ? JSON.parse(raw) : {};
    return store[returnId.toUpperCase()] || null;
  } catch (e) {
    return null;
  }
}

/**
 * Save or update pickup operations record
 */
export function saveStoredPickup(returnId, pickupData) {
  if (!returnId || !pickupData || typeof localStorage === 'undefined') return false;
  try {
    const raw = localStorage.getItem(PICKUPS_KEY);
    const store = raw ? JSON.parse(raw) : {};
    const existing = store[returnId.toUpperCase()] || {};

    store[returnId.toUpperCase()] = {
      ...existing,
      ...pickupData,
      return_id: returnId.toUpperCase(),
      updated_at: new Date().toISOString()
    };

    localStorage.setItem(PICKUPS_KEY, JSON.stringify(store));
    broadcastRealtime(REALTIME_EVENTS.PICKUP_UPDATED, { returnId, pickupData: store[returnId.toUpperCase()] });
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Get all stored pickup records as a map or array
 */
export function getAllStoredPickups() {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(PICKUPS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

/**
 * Append an audit entry to the pickup operational audit log
 */
export function addPickupAuditEntry(returnId, actionText, user = 'Operator', role = 'Logistics Coordinator', details = '') {
  if (!returnId || !actionText || typeof localStorage === 'undefined') return false;
  try {
    const raw = localStorage.getItem(PICKUP_AUDIT_KEY);
    const store = raw ? JSON.parse(raw) : {};
    const timeline = Array.isArray(store[returnId.toUpperCase()]) ? store[returnId.toUpperCase()] : [];

    timeline.push({
      id: `pickup_audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      action: actionText,
      user,
      role,
      details
    });

    store[returnId.toUpperCase()] = timeline;
    localStorage.setItem(PICKUP_AUDIT_KEY, JSON.stringify(store));

    // Also update timeline on the pickup record itself if it exists
    const pickup = getStoredPickup(returnId);
    if (pickup) {
      pickup.timeline = timeline;
      saveStoredPickup(returnId, pickup);
    }

    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Get the full audit log for a specific return pickup
 */
export function getPickupAuditLog(returnId) {
  if (!returnId || typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PICKUP_AUDIT_KEY);
    const store = raw ? JSON.parse(raw) : {};
    return store[returnId.toUpperCase()] || [];
  } catch (e) {
    return [];
  }
}

/**
 * Get all stored audit log entries across all returns
 */
export function getStoredAuditLogs() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PICKUP_AUDIT_KEY);
    if (!raw) return [];
    const store = JSON.parse(raw);
    const all = [];
    Object.values(store).forEach(list => {
      if (Array.isArray(list)) all.push(...list);
    });
    return all;
  } catch (e) {
    return [];
  }
}


/* ==========================================================================
   MODULE 7: EVALUATION, GROUND TRUTH, EXPERIMENTS & VALIDATION STORAGE
   ========================================================================== */

export function getStoredEvaluationLabels() {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVALUATION_LABELS);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function getStoredEvaluationLabel(returnId) {
  if (!returnId || typeof localStorage === 'undefined') return null;
  try {
    const labels = getStoredEvaluationLabels();
    return labels[returnId.toUpperCase()] || null;
  } catch (e) {
    return null;
  }
}

export function saveStoredEvaluationLabel(returnId, labelData) {
  if (!returnId || !labelData || typeof localStorage === 'undefined') return false;
  try {
    const labels = getStoredEvaluationLabels();
    labels[returnId.toUpperCase()] = {
      ...labels[returnId.toUpperCase()],
      ...labelData,
      return_id: returnId.toUpperCase(),
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.EVALUATION_LABELS, JSON.stringify(labels));
    return true;
  } catch (e) {
    return false;
  }
}

export function getStoredExperiments() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXPERIMENTS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveStoredExperiment(experimentData) {
  if (!experimentData || typeof localStorage === 'undefined') return false;
  try {
    const list = getStoredExperiments();
    list.unshift({
      ...experimentData,
      experiment_id: experimentData.experiment_id || `EXP-${Date.now()}`,
      created_at: new Date().toISOString()
    });
    localStorage.setItem(STORAGE_KEYS.EXPERIMENTS, JSON.stringify(list));
    return true;
  } catch (e) {
    return false;
  }
}

export function getStoredValidationResponses() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VALIDATION);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveStoredValidationResponse(responseData) {
  if (!responseData || typeof localStorage === 'undefined') return false;
  try {
    const list = getStoredValidationResponses();
    list.unshift({
      ...responseData,
      response_id: `VAL-${Date.now()}`,
      submitted_at: new Date().toISOString()
    });
    localStorage.setItem(STORAGE_KEYS.VALIDATION, JSON.stringify(list));
    return true;
  } catch (e) {
    return false;
  }
}

export function getStoredEvaluationConfig() {
  const defaults = {
    targetSlaDays: 7,
    enhancedReviewThreshold: 50,
    costPerKm: 18,
    co2EmissionFactor: 0.27,
    datasetMode: 'CURRENT'
  };
  if (typeof localStorage === 'undefined') return defaults;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVALUATION_CONFIG);
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch (e) {
    return defaults;
  }
}

export function saveStoredEvaluationConfig(configData) {
  if (!configData || typeof localStorage === 'undefined') return false;
  try {
    localStorage.setItem(STORAGE_KEYS.EVALUATION_CONFIG, JSON.stringify(configData));
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Module 9: Test Runs Storage Helpers
 */
export function getStoredTestRuns() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEST_RUNS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveStoredTestRun(runRecord) {
  if (!runRecord || typeof localStorage === 'undefined') return false;
  try {
    const runs = getStoredTestRuns();
    runs.unshift(runRecord);
    // Keep last 25 test runs
    if (runs.length > 25) runs.length = 25;
    localStorage.setItem(STORAGE_KEYS.TEST_RUNS, JSON.stringify(runs));
    return true;
  } catch (e) {
    return false;
  }
}

export function clearStoredTestRuns() {
  if (typeof localStorage === 'undefined') return false;
  try {
    localStorage.removeItem(STORAGE_KEYS.TEST_RUNS);
    return true;
  } catch (e) {
    return false;
  }
}





