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
export const DEMO_RETURN_IDS = new Set([
  'RET-2024-001021', 'RET-2024-001022', 'RET-2024-001023', 'RET-2024-001024',
  'RET-2024-001025', 'RET-2024-001026', 'RET-2024-001027', 'RET-2024-001028',
  'RET-2024-001029', 'RET-2024-001030', 'RET-2024-003001', 'RET-2024-003002',
  'RET-2024-003003', 'RET-2024-003004', 'RET-2024-003005', 'RET-2024-003006',
  'RET-2024-003007', 'RET-2024-003008', 'RET-2024-003009'
]);

/**
 * Initialize storage without demo returns.
 * Cleans out any stale pre-seeded demo records so only real user claims exist.
 */
export function initializeStorage() {
  try {
    const PURGE_SEED_KEY = 'fur_demo_data_purged_v3';
    if (!localStorage.getItem(PURGE_SEED_KEY)) {
      localStorage.setItem(STORAGE_KEYS.RETURNS, JSON.stringify([]));
      localStorage.setItem('return_reviews', JSON.stringify({}));
      localStorage.setItem(STORAGE_KEYS.PICKUPS, JSON.stringify({}));
      localStorage.setItem('pickup_audit_log', JSON.stringify({}));
      localStorage.setItem('return_evidence_analysis', JSON.stringify({}));
      localStorage.setItem('return_triage_assessments', JSON.stringify({}));
      localStorage.setItem('fur_customer_support_tickets', JSON.stringify([]));
      localStorage.setItem('fur_customer_notifications', JSON.stringify([]));
      localStorage.setItem(PURGE_SEED_KEY, 'true');
    }

    if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    }
    
    // Clean out all demo returns from storage
    const existingReturnsRaw = localStorage.getItem(STORAGE_KEYS.RETURNS);
    if (!existingReturnsRaw) {
      localStorage.setItem(STORAGE_KEYS.RETURNS, JSON.stringify([]));
    } else {
      try {
        const parsed = JSON.parse(existingReturnsRaw);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(r => !DEMO_RETURN_IDS.has((r.return_id || '').toUpperCase()));
          localStorage.setItem(STORAGE_KEYS.RETURNS, JSON.stringify(cleaned));
        }
      } catch {
        localStorage.setItem(STORAGE_KEYS.RETURNS, JSON.stringify([]));
      }
    }

    // Clean out demo reviews
    const existingReviewsRaw = localStorage.getItem('return_reviews');
    if (existingReviewsRaw) {
      try {
        const reviewsMap = JSON.parse(existingReviewsRaw);
        DEMO_RETURN_IDS.forEach(id => {
          delete reviewsMap[id];
        });
        localStorage.setItem('return_reviews', JSON.stringify(reviewsMap));
      } catch {
        localStorage.setItem('return_reviews', JSON.stringify({}));
      }
    } else {
      localStorage.setItem('return_reviews', JSON.stringify({}));
    }

    // Clean out demo pickups
    const existingPickupsRaw = localStorage.getItem(STORAGE_KEYS.PICKUPS);
    if (existingPickupsRaw) {
      try {
        const pickupsMap = JSON.parse(existingPickupsRaw);
        DEMO_RETURN_IDS.forEach(id => {
          delete pickupsMap[id];
        });
        localStorage.setItem(STORAGE_KEYS.PICKUPS, JSON.stringify(pickupsMap));
      } catch {
        localStorage.setItem(STORAGE_KEYS.PICKUPS, JSON.stringify({}));
      }
    } else {
      localStorage.setItem(STORAGE_KEYS.PICKUPS, JSON.stringify({}));
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
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
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





