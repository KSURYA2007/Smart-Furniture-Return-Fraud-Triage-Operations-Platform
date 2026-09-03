/**
 * Module 9: Deterministic Test Fixtures & Edge Case Library (EDGE-001 to EDGE-018)
 */

export const FIXTURES = {
  // --- Standard Customer Scenarios ---
  newCustomer: {
    customer_id: 'CUS-TEST-NEW-01',
    name: 'Aanya Sen',
    email: 'aanya.sen@example.in',
    phone: '+91 98451 99001',
    address: '42 Lavelle Road, Bengaluru',
    created_at: '2024-10-01T00:00:00Z',
    orders_count: 1,
    returns_count: 0
  },

  highReturnCustomer: {
    customer_id: 'CUS-TEST-FREQ-02',
    name: 'Karan Malhotra',
    email: 'karan.m@example.in',
    phone: '+91 98452 88122',
    address: '88 MG Road, Bengaluru',
    created_at: '2023-01-15T00:00:00Z',
    orders_count: 8,
    returns_count: 6 // 75% return velocity
  },

  previousFraudCustomer: {
    customer_id: 'CUS-TEST-FRAUD-03',
    name: 'Vikram Chawla',
    email: 'vikram.c@example.in',
    phone: '+91 98453 77233',
    address: '14 Residency Road, Bengaluru',
    created_at: '2022-06-10T00:00:00Z',
    orders_count: 5,
    returns_count: 3,
    confirmed_fraud_count: 1
  },

  // --- Standard Evidence Scenarios ---
  strongEvidence: [
    {
      id: 'EV-STR-01',
      file_name: 'seat_cushion_tear_angle1.jpg',
      file_size_mb: 2.8,
      resolution: '4032x3024',
      damage_visible: true,
      packaging_visible: true,
      lighting_quality: 'HIGH',
      tags: ['FABRIC_TEAR', 'TRANSIT_DAMAGE']
    },
    {
      id: 'EV-STR-02',
      file_name: 'seat_cushion_tear_closeup.jpg',
      file_size_mb: 3.1,
      resolution: '4032x3024',
      damage_visible: true,
      packaging_visible: false,
      lighting_quality: 'HIGH',
      tags: ['CLOSEUP_TEAR']
    }
  ],

  weakEvidence: [
    {
      id: 'EV-WEAK-01',
      file_name: 'blurry_photo_dark.jpg',
      file_size_mb: 0.2,
      resolution: '640x480',
      damage_visible: false,
      packaging_visible: false,
      lighting_quality: 'POOR',
      tags: ['BLURRY']
    }
  ],

  missingEvidence: [],

  // --- Complete 18 Edge Cases (EDGE-001 to EDGE-018) ---
  edgeCases: {
    'EDGE-001': {
      id: 'EDGE-001',
      name: 'New customer with strong evidence',
      category: 'EDGE_CASE',
      description: 'First-time buyer with 1 order submitting return with 2 high-res photos showing transit tears.',
      returnId: 'RET-EDGE-001',
      customer: { customer_id: 'CUS-EDGE-01', orders_count: 1, returns_count: 0 },
      evidence: 'STRONG',
      orderValue: 18500,
      expectedOutcome: 'Triage risk should remain LOW/STANDARD; evidence validates intake claim without penalizing new account status.'
    },

    'EDGE-002': {
      id: 'EDGE-002',
      name: 'High-frequency returner with strong current evidence',
      category: 'EDGE_CASE',
      description: 'Customer with 75% return velocity submitting verified manufacturer defect with sharp photographic evidence.',
      returnId: 'RET-EDGE-002',
      customer: { customer_id: 'CUS-EDGE-02', orders_count: 8, returns_count: 6 },
      evidence: 'STRONG',
      orderValue: 24000,
      expectedOutcome: 'Rule 1 applies: High return rate increases review attention but strong photo proof prevents automatic fraud assumption.'
    },

    'EDGE-003': {
      id: 'EDGE-003',
      name: 'Previous confirmed fraud with strong current evidence',
      category: 'EDGE_CASE',
      description: 'Customer with historical fraud incident on record submitting legitimate delivery breakage with clear serial tag.',
      returnId: 'RET-EDGE-003',
      customer: { customer_id: 'CUS-EDGE-03', orders_count: 4, returns_count: 2, confirmed_fraud_count: 1 },
      evidence: 'STRONG',
      orderValue: 32000,
      expectedOutcome: 'Rule 2 applies: Flagged for mandatory Human Review (M5), but human reviewer can verify genuine photos and approve pickup.'
    },

    'EDGE-004': {
      id: 'EDGE-004',
      name: 'No evidence uploaded',
      category: 'EDGE_CASE',
      description: 'Customer claims defective mechanism but uploads 0 photo proofs.',
      returnId: 'RET-EDGE-004',
      customer: { customer_id: 'CUS-EDGE-04', orders_count: 2, returns_count: 0 },
      evidence: 'MISSING',
      orderValue: 12000,
      expectedOutcome: 'Evidence completeness is 0; reviewer should trigger REQUEST_MORE_EVIDENCE, not reject without cause.'
    },

    'EDGE-005': {
      id: 'EDGE-005',
      name: 'Single poor-quality thumbnail image',
      category: 'EDGE_CASE',
      description: 'Low-res blurry 640x480 photo where damage cannot be determined.',
      returnId: 'RET-EDGE-005',
      customer: { customer_id: 'CUS-EDGE-05', orders_count: 3, returns_count: 1 },
      evidence: 'WEAK',
      orderValue: 15000,
      expectedOutcome: 'Evidence score penalized for low quality; prompt reviewer for clearer documentation.'
    },

    'EDGE-006': {
      id: 'EDGE-006',
      name: 'High-value luxury furniture with legitimate evidence',
      category: 'EDGE_CASE',
      description: 'Order value ₹95,000 (Italian Leather Sectional) with verified frame fracture sustained in transit.',
      returnId: 'RET-EDGE-006',
      customer: { customer_id: 'CUS-EDGE-06', orders_count: 5, returns_count: 0 },
      evidence: 'STRONG',
      orderValue: 95000,
      expectedOutcome: 'Rule 3 applies: High value increases financial scrutiny but legitimate proof justifies approved pickup.'
    },

    'EDGE-007': {
      id: 'EDGE-007',
      name: 'Low-value furniture with suspicious evidence',
      category: 'EDGE_CASE',
      description: 'Order value ₹4,500 (Footstool) with stock Internet photo submitted instead of real product.',
      returnId: 'RET-EDGE-007',
      customer: { customer_id: 'CUS-EDGE-07', orders_count: 1, returns_count: 0 },
      evidence: 'SUSPICIOUS',
      orderValue: 4500,
      expectedOutcome: 'Inconsistency detected; system flags potential metadata mismatch regardless of low price.'
    },

    'EDGE-008': {
      id: 'EDGE-008',
      name: 'Legitimate return waiting beyond SLA threshold',
      category: 'EDGE_CASE',
      description: 'Approved genuine claim waiting 12 days for carrier collection (> 7 days SLA target).',
      returnId: 'RET-EDGE-008',
      customer: { customer_id: 'CUS-EDGE-08', orders_count: 4, returns_count: 1 },
      evidence: 'STRONG',
      waitingDays: 12,
      orderValue: 28000,
      expectedOutcome: 'Service Protection Rule: Customer Service Urgency badge awarded, pickup priority elevated to CRITICAL.'
    },

    'EDGE-009': {
      id: 'EDGE-009',
      name: 'High-risk return with missing pickup location',
      category: 'EDGE_CASE',
      description: 'Risk score 82, but address street and city fields are empty.',
      returnId: 'RET-EDGE-009',
      location: null,
      expectedOutcome: 'System prevents dispatch scheduling until complete geo-address is provided.'
    },

    'EDGE-010': {
      id: 'EDGE-010',
      name: 'Approved pickup with duplicate scheduling request',
      category: 'EDGE_CASE',
      description: 'Pickup already in SCHEDULED state receives a secondary concurrent schedule request without reschedule flag.',
      returnId: 'RET-EDGE-010',
      isReschedule: false,
      expectedOutcome: 'Returns 409 CONFLICT; prevents fleet dispatch duplicate double-booking.'
    },

    'EDGE-011': {
      id: 'EDGE-011',
      name: 'Rejected return attempting pickup scheduling',
      category: 'EDGE_CASE',
      description: 'Human reviewer decided REJECT_RETURN, but logistics tries to invoke schedulePickup.',
      returnId: 'RET-EDGE-011',
      reviewDecision: 'REJECT_RETURN',
      expectedOutcome: 'Returns 403 FORBIDDEN; Rule 9 strictly enforced.'
    },

    'EDGE-012': {
      id: 'EDGE-012',
      name: 'Missing order value attribute',
      category: 'EDGE_CASE',
      description: 'Return claim where order price is undefined or null.',
      returnId: 'RET-EDGE-012',
      orderValue: null,
      expectedOutcome: 'Graceful fallback to default category value; does not crash triage or evaluation.'
    },

    'EDGE-013': {
      id: 'EDGE-013',
      name: 'Missing customer historical profile',
      category: 'EDGE_CASE',
      description: 'Claim referencing non-existent customer ID in database.',
      returnId: 'RET-EDGE-013',
      customerId: 'CUS-NON-EXISTENT-999',
      expectedOutcome: 'System treats as new customer with 0 history without throwing unhandled exception.'
    },

    'EDGE-014': {
      id: 'EDGE-014',
      name: 'Conflicting evidence tags vs customer reason',
      category: 'EDGE_CASE',
      description: 'Customer claims "Stained Fabric", but photo analysis reveals "Cracked Timber Leg".',
      returnId: 'RET-EDGE-014',
      reason: 'Stained Fabric',
      damageTag: 'Cracked Timber Leg',
      expectedOutcome: 'Condition consistency marked INCONSISTENT; risk score elevated for explanation.'
    },

    'EDGE-015': {
      id: 'EDGE-015',
      name: 'Simulated API network disconnection',
      category: 'EDGE_CASE',
      description: 'Simulating offline carrier network when dispatching pickup.',
      simCode: 'NETWORK_ERROR',
      expectedOutcome: 'Normalized NETWORK_ERROR caught; user alerted with retry guidance.'
    },

    'EDGE-016': {
      id: 'EDGE-016',
      name: 'Unauthorized operator role action',
      category: 'EDGE_CASE',
      description: 'DISPATCHER attempts to enter ground truth evaluation label (requires EVALUATOR).',
      role: 'DISPATCHER',
      action: 'MANAGE_GROUND_TRUTH',
      expectedOutcome: 'Permission check blocks action with FORBIDDEN response.'
    },

    'EDGE-017': {
      id: 'EDGE-017',
      name: 'Concurrent duplicate review decision submission',
      category: 'EDGE_CASE',
      description: 'Two dispatchers submit contradictory decisions simultaneously.',
      returnId: 'RET-EDGE-017',
      expectedOutcome: 'Audit log records both timestamps and maintains chronological review history.'
    },

    'EDGE-018': {
      id: 'EDGE-018',
      name: 'Completed pickup receives re-schedule request',
      category: 'EDGE_CASE',
      description: 'Return status is already PICKED_UP at doorstep, attempt made to re-schedule.',
      returnId: 'RET-EDGE-018',
      currentStatus: 'PICKED_UP',
      expectedOutcome: 'Status transition guard blocks action (409 CONFLICT); completed items cannot be re-scheduled.'
    }
  }
};
