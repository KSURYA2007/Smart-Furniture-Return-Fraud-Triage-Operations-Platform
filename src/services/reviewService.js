/**
 * Module 5: Human Review & Manual Intervention Service
 * 
 * Provides:
 * - Review queue compilation combining Modules 1, 2, 3, and 4
 * - Manual override detection between system triage and human decision
 * - Prototype metrics estimation (audit costs, fraud loss prevention, logistics CO2)
 * - Review schema formatting
 */

import { getAllReturns, getCustomerById, getAllStoredReviews } from '../utils/storage.js';
import { calculateCustomerHistoryStats } from '../utils/customerHistory.js';
import { analyzeReturnEvidence } from '../utils/evidenceAnalysis.js';
import { calculateRisk } from './riskEngine.js';

export const REVIEWER_ROLES = [
  { id: 'Dispatcher', label: 'Dispatcher', title: 'Logistics Dispatcher' },
  { id: 'Operations Manager', label: 'Operations Manager', title: 'Operations Manager' },
  { id: 'Senior Operations Manager', label: 'Senior Operations Manager', title: 'Senior Operations Manager' }
];

export const HUMAN_DECISIONS = {
  APPROVE_PICKUP: {
    id: 'APPROVE_PICKUP',
    label: 'Approve Pickup',
    status: 'APPROVED',
    badgeClass: 'badge-decision-approved',
    description: 'Authorize bulky courier pickup and process standard customer refund upon receipt.'
  },
  REJECT_RETURN: {
    id: 'REJECT_RETURN',
    label: 'Reject Return',
    status: 'REJECTED',
    badgeClass: 'badge-decision-rejected',
    description: 'Decline return request due to policy violation, severe inconsistency, or verified misrepresentation.'
  },
  REQUEST_MORE_EVIDENCE: {
    id: 'REQUEST_MORE_EVIDENCE',
    label: 'Request More Evidence',
    status: 'REQUEST_MORE_EVIDENCE',
    badgeClass: 'badge-decision-evidence',
    description: 'Ask customer for specific additional photographs, serial numbers, or packaging verification.'
  },
  ESCALATE: {
    id: 'ESCALATE',
    label: 'Escalate to Management',
    status: 'ESCALATED',
    badgeClass: 'badge-decision-escalated',
    description: 'Escalate case to senior management for executive decision or legal/security review.'
  }
};

export const DECISION_REASON_CATEGORIES = [
  { id: 'STRONG_DAMAGE_EVIDENCE', label: 'Strong Evidence of Damage' },
  { id: 'EVIDENCE_INSUFFICIENT', label: 'Evidence Insufficient' },
  { id: 'EVIDENCE_INCONSISTENT', label: 'Evidence Inconsistent' },
  { id: 'CUSTOMER_HISTORY_CONSIDERED', label: 'Customer History Considered' },
  { id: 'POLICY_REQUIREMENT', label: 'Policy Requirement' },
  { id: 'OPERATIONAL_CONSTRAINT', label: 'Operational Constraint' },
  { id: 'HIGH_VALUE_AUDIT', label: 'High-Value Financial Exposure' },
  { id: 'OTHER', label: 'Other' }
];

export const EVIDENCE_REQUEST_OPTIONS = [
  { id: 'additional_damage_photos', label: 'Additional damage photos' },
  { id: 'different_angle', label: 'Different angle / close-up' },
  { id: 'product_serial_number', label: 'Product serial number / barcode tag' },
  { id: 'packaging_photos', label: 'Packaging photos (outer box / protective wraps)' },
  { id: 'delivery_condition_photos', label: 'Delivery condition / courier manifest' },
  { id: 'purchase_documentation', label: 'Purchase invoice / warranty card' },
  { id: 'other', label: 'Other specific evidence' }
];

export const ESCALATION_TARGETS = [
  { id: 'Operations Manager', label: 'Operations Manager' },
  { id: 'Senior Operations Manager', label: 'Senior Operations Manager' }
];

/**
 * Determine if human decision is a manual override against system recommendation
 */
export function checkIsOverride(systemRiskCategory, systemPriority, humanDecisionType) {
  if (!humanDecisionType || !systemRiskCategory) return false;

  const isHighOrCritical = systemRiskCategory === 'HIGH' || systemRiskCategory === 'CRITICAL' ||
    systemPriority === 'HUMAN_REVIEW' || systemPriority === 'PRIORITY_INVESTIGATION';

  const isLowOrMedium = systemRiskCategory === 'LOW' || systemRiskCategory === 'MEDIUM' ||
    systemPriority === 'LOW_TOUCH' || systemPriority === 'STANDARD_QUEUE';

  // Override 1: System flagged High/Critical, but human approves pickup
  if (isHighOrCritical && humanDecisionType === 'APPROVE_PICKUP') {
    return true;
  }

  // Override 2: System recommended Standard/Low Touch, but human rejects return
  if (isLowOrMedium && humanDecisionType === 'REJECT_RETURN') {
    return true;
  }

  return false;
}

/**
 * Calculate prototype environmental and operational metric estimates
 */
export function calculatePrototypeEstimates(orderPrice = 25000, riskScore = 50, decisionType = 'APPROVE_PICKUP') {
  const price = Number(orderPrice) || 25000;
  
  // Bulky furniture pickup cost estimate in INR
  const estimated_pickup_cost = 1450;
  
  // Prototype logistics distance and emissions
  const estimated_pickup_distance_km = 22.4;
  const estimated_co2_kg = +(estimated_pickup_distance_km * 0.24).toFixed(1); // approx diesel van emissions
  
  // Estimated review cost (manager time)
  const estimated_review_cost = 320;
  
  // Estimated fraud loss avoided or exposure
  let estimated_fraud_loss = 0;
  if (decisionType === 'REJECT_RETURN' && riskScore >= 50) {
    estimated_fraud_loss = price;
  }

  return {
    estimated_order_value: price,
    estimated_pickup_cost,
    estimated_pickup_distance_km,
    estimated_co2_kg,
    estimated_review_cost,
    estimated_fraud_loss,
    is_prototype_estimate: true
  };
}

/**
 * Build consolidated review queue combining all returns, triage risk, and stored reviews
 */
export function buildReviewQueue({ 
  searchQuery = '', 
  riskFilter = 'ALL', 
  statusFilter = 'ALL',
  reviewerFilter = 'ALL',
  queueTab = 'PRIMARY' // 'PRIMARY' (High & Critical) | 'ALL' | 'RESOLVED' | 'PENDING'
} = {}) {
  const returns = getAllReturns();
  const storedReviews = getAllStoredReviews();

  const queueItems = returns.map(ret => {
    const returnId = ret.return_id;
    const customerId = ret.customer_id || ret.customer?.customer_id;
    
    // Get customer lifetime stats from Module 2
    let customerStats = null;
    if (customerId) {
      customerStats = calculateCustomerHistoryStats(customerId);
    }
    
    // Get forensic evidence metrics from Module 3
    const evidenceAnalysis = analyzeReturnEvidence(ret);
    
    // Get risk score from Module 4
    const triage = calculateRisk(ret, customerStats, evidenceAnalysis);

    // Get any stored human review from Module 5
    const storedReview = storedReviews[returnId?.toUpperCase()] || null;

    const reviewStatus = storedReview?.decision?.status || storedReview?.review_status || 'PENDING';
    const humanDecision = storedReview?.decision?.decision_type || null;
    const isOverridden = storedReview?.decision?.override || false;
    const reviewer = storedReview?.reviewer || null;

    const orderValue = Number(ret.order?.price || ret.order?.product_price || ret.product_price || ret.price || 0);

    return {
      return_id: returnId,
      customer_id: customerId,
      customer_name: ret.customer?.name || ret.customer_name || 'Customer',
      product_name: ret.order?.product_name || ret.product || 'Furniture Item',
      category: ret.order?.category || ret.category || 'Bulky Furniture',
      order_id: ret.order?.order_id || ret.order_id || 'ORD-UNKNOWN',
      order_value: orderValue,
      submitted_date: ret.created_at || ret.return_date || '2026-09-01',
      pickup_date: ret.pickup?.preferred_date || null,
      
      // Module 3 Evidence highlights
      evidence_strength: evidenceAnalysis?.evidence_strength || 'LIMITED',
      evidence_count: evidenceAnalysis?.image_count || (ret.evidence ? ret.evidence.length : 0),
      condition_consistency: evidenceAnalysis?.condition_consistency || 'CONSISTENT',
      detected_damage_areas: evidenceAnalysis?.detected_damage_areas || [],
      
      // Module 4 Triage highlights
      risk_score: triage?.risk_score ?? 50,
      risk_category: triage?.risk_category || 'MEDIUM',
      priority: triage?.priority || 'HUMAN_REVIEW',
      priority_label: triage?.priority_label || 'Human Review',
      recommendation: triage?.recommendation || 'Review required',
      factors: triage?.factors || [],
      
      // Module 5 Review state
      review_status: reviewStatus,
      human_decision: humanDecision,
      is_overridden: isOverridden,
      reviewer,
      reviewed_at: storedReview?.reviewed_at || null,
      
      // Complete data packages
      raw_return: ret,
      customer_stats: customerStats,
      evidence_analysis: evidenceAnalysis,
      triage_result: triage,
      stored_review: storedReview
    };
  });

  // Filter based on criteria
  const filtered = queueItems.filter(item => {
    // 1. Queue Tab filter
    if (queueTab === 'PRIMARY') {
      // Primary queue: HIGH and CRITICAL cases requiring review, plus any pending case
      const isHighOrCritical = item.risk_category === 'HIGH' || item.risk_category === 'CRITICAL';
      const isPendingOrInReview = item.review_status === 'PENDING' || item.review_status === 'IN_REVIEW' || item.review_status === 'REQUEST_MORE_EVIDENCE';
      if (!isHighOrCritical && queueTab === 'PRIMARY') return false;
      if (!isPendingOrInReview) return false;
    } else if (queueTab === 'RESOLVED') {
      const isResolved = item.review_status === 'APPROVED' || item.review_status === 'REJECTED' || item.review_status === 'ESCALATED';
      if (!isResolved) return false;
    } else if (queueTab === 'PENDING') {
      if (item.review_status !== 'PENDING' && item.review_status !== 'IN_REVIEW') return false;
    }

    // 2. Risk Filter
    if (riskFilter !== 'ALL' && item.risk_category.toUpperCase() !== riskFilter.toUpperCase()) {
      return false;
    }

    // 3. Review Status Filter
    if (statusFilter !== 'ALL' && item.review_status.toUpperCase() !== statusFilter.toUpperCase()) {
      return false;
    }

    // 4. Reviewer Filter
    if (reviewerFilter !== 'ALL') {
      const role = item.reviewer?.role || '';
      if (!role.toLowerCase().includes(reviewerFilter.toLowerCase())) {
        return false;
      }
    }

    // 5. Search Query
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const match = (
        item.return_id.toLowerCase().includes(q) ||
        item.customer_id.toLowerCase().includes(q) ||
        item.customer_name.toLowerCase().includes(q) ||
        item.order_id.toLowerCase().includes(q) ||
        item.product_name.toLowerCase().includes(q)
      );
      if (!match) return false;
    }

    return true;
  });

  // Sort queue: Primary sort by Pending first, then highest risk score, then newest date
  filtered.sort((a, b) => {
    const isPendingA = a.review_status === 'PENDING' || a.review_status === 'IN_REVIEW' ? 1 : 0;
    const isPendingB = b.review_status === 'PENDING' || b.review_status === 'IN_REVIEW' ? 1 : 0;
    if (isPendingB !== isPendingA) return isPendingB - isPendingA;

    // Highest risk score first
    if (b.risk_score !== a.risk_score) return b.risk_score - a.risk_score;

    // Most recent date
    return new Date(b.submitted_date) - new Date(a.submitted_date);
  });

  return filtered;
}
