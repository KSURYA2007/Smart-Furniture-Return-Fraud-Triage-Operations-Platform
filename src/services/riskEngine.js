/**
 * Module 4: Fraud Risk & Priority Engine Service
 * 
 * Reusable, deterministic decision-support scoring engine.
 * Combines data from Module 1 (Return Intake), Module 2 (Customer History),
 * and Module 3 (Evidence Analysis) into an auditable 0-100 score and priority.
 * 
 * IMPORTANT SAFETY RULES:
 * - Decision-support only (NEVER automatically reject returns).
 * - Transparent points arithmetic (Total score matches sum of factors).
 * - Every point has an audit source reference.
 * - Protect legitimate customers with verified damage proof.
 */

import { RISK_CONFIG } from '../config/riskRules.js';

/**
 * Calculate deterministic fraud risk score and triage priority
 */
export function calculateRisk(returnRecord, customerHistoryStats, evidenceAnalysis) {
  if (!returnRecord) return null;

  const returnId = returnRecord.return_id || 'UNKNOWN';
  const order = returnRecord.order || {};
  const returnInfo = returnRecord.return || {};
  const customer = returnRecord.customer || {};

  const factors = [];
  const edgeCasesDetected = [];

  // =========================================================================
  // 1. FEATURE: Historical Fraud History (Max 30 pts)
  // =========================================================================
  let fraudPoints = 0;
  let fraudExplanation = '';
  let fraudValue = '0 confirmed cases';
  const confirmedFraudCases = customerHistoryStats?.total_confirmed_fraud || 0;

  if (customerHistoryStats === null || customerHistoryStats === undefined) {
    fraudPoints = 0;
    fraudValue = 'History unavailable';
    fraudExplanation = 'Historical record not accessible. Neutral baseline applied (0 pts).';
    edgeCasesDetected.push('MISSING_HISTORY');
  } else if (confirmedFraudCases >= 2) {
    fraudPoints = RISK_CONFIG.weights.historicalFraud; // 30
    fraudValue = `${confirmedFraudCases} confirmed fraud outcomes`;
    fraudExplanation = `${confirmedFraudCases} historical returns were previously confirmed as fraudulent by operations review.`;
  } else if (confirmedFraudCases === 1) {
    fraudPoints = 15;
    fraudValue = '1 confirmed fraud outcome';
    fraudExplanation = 'One previous return by this customer account was verified as fraudulent.';
  } else {
    fraudPoints = 0;
    fraudValue = '0 confirmed fraud cases';
    fraudExplanation = 'No prior confirmed fraud cases found in customer account history.';
  }

  factors.push({
    id: 'historical_fraud',
    name: 'Historical Fraud History',
    value: fraudValue,
    points: fraudPoints,
    max_points: RISK_CONFIG.weights.historicalFraud,
    source: 'Customer Lifetime Profile',
    source_reference: customer.customer_id || 'CUS-UNKNOWN',
    source_module: 'Module 2',
    explanation: fraudExplanation
  });

  // =========================================================================
  // 2. FEATURE: Return Behaviour / Lifetime Return Rate (Max 20 pts)
  // (Avoid double-counting: only measures return frequency, not fraud outcomes)
  // =========================================================================
  let returnRatePoints = 0;
  let returnRateExplanation = '';
  let returnRateValue = '0%';
  const totalOrders = customerHistoryStats?.total_orders || 0;
  const totalReturns = customerHistoryStats?.total_returns || 0;
  const returnRate = customerHistoryStats?.return_rate !== undefined 
    ? (customerHistoryStats.return_rate / 100) 
    : (totalOrders > 0 ? totalReturns / totalOrders : 0);

  if (totalOrders <= 1 && totalReturns <= 1) {
    returnRatePoints = 0;
    returnRateValue = `${Math.round(returnRate * 100)}% (First/New Customer)`;
    returnRateExplanation = 'Limited customer history (1 order). No return frequency penalty assigned.';
    edgeCasesDetected.push('NEW_CUSTOMER');
  } else if (returnRate > 0.60) {
    returnRatePoints = 20;
    returnRateValue = `${Math.round(returnRate * 100)}% (${totalReturns}/${totalOrders} orders)`;
    returnRateExplanation = 'Customer return rate exceeds 60% of total lifetime purchases.';
  } else if (returnRate >= 0.40) {
    returnRatePoints = 15;
    returnRateValue = `${Math.round(returnRate * 100)}% (${totalReturns}/${totalOrders} orders)`;
    returnRateExplanation = 'Customer return rate is between 40% and 60% of total purchases.';
  } else if (returnRate >= 0.25) {
    returnRatePoints = 10;
    returnRateValue = `${Math.round(returnRate * 100)}% (${totalReturns}/${totalOrders} orders)`;
    returnRateExplanation = 'Customer return rate is elevated (25% - 40%).';
  } else if (returnRate >= 0.10) {
    returnRatePoints = 5;
    returnRateValue = `${Math.round(returnRate * 100)}% (${totalReturns}/${totalOrders} orders)`;
    returnRateExplanation = 'Customer return rate is within moderate operational variance (10% - 25%).';
  } else {
    returnRatePoints = 0;
    returnRateValue = `${Math.round(returnRate * 100)}% (${totalReturns}/${totalOrders} orders)`;
    returnRateExplanation = 'Low return rate (< 10%). Healthy customer purchase pattern.';
  }

  factors.push({
    id: 'return_behaviour',
    name: 'Return Frequency Behaviour',
    value: returnRateValue,
    points: returnRatePoints,
    max_points: RISK_CONFIG.weights.returnBehaviour,
    source: 'Order History Ledger',
    source_reference: `${totalReturns} returns of ${totalOrders} orders`,
    source_module: 'Module 2',
    explanation: returnRateExplanation
  });

  // =========================================================================
  // 3. FEATURE: Evidence Inconsistency (Max 20 pts)
  // =========================================================================
  let inconsistencyPoints = 0;
  let inconsistencyExplanation = '';
  let inconsistencyValue = 'Consistent';
  const consistencyStatus = evidenceAnalysis?.condition_consistency || 'CONSISTENT';

  if (!evidenceAnalysis || evidenceAnalysis.image_count === 0) {
    inconsistencyPoints = 15;
    inconsistencyValue = 'No photographic evidence';
    inconsistencyExplanation = 'No evidence photos uploaded with return claim; physical defect unverified.';
    edgeCasesDetected.push('MISSING_EVIDENCE');
  } else if (consistencyStatus === 'CLEAR_INCONSISTENCY') {
    inconsistencyPoints = 20;
    inconsistencyValue = 'Clear Discrepancy';
    inconsistencyExplanation = 'Direct contradiction between customer damage statement and visual photos.';
  } else if (consistencyStatus === 'INSUFFICIENT_EVIDENCE') {
    inconsistencyPoints = 15;
    inconsistencyValue = 'Insufficient Evidence';
    inconsistencyExplanation = 'Uploaded photos do not clearly capture the reported defect component.';
  } else if (consistencyStatus === 'PARTIALLY_CONSISTENT') {
    inconsistencyPoints = 10;
    inconsistencyValue = 'Partially Consistent';
    inconsistencyExplanation = evidenceAnalysis.consistency_explanation || 'Minor variance between reported condition tier and photo evidence.';
  } else {
    inconsistencyPoints = 0;
    inconsistencyValue = 'Consistent';
    inconsistencyExplanation = 'Reported defect and condition match photographic evidence observations.';
  }

  factors.push({
    id: 'evidence_inconsistency',
    name: 'Claim & Evidence Consistency',
    value: inconsistencyValue,
    points: inconsistencyPoints,
    max_points: RISK_CONFIG.weights.evidenceInconsistency,
    source: 'Condition Consistency Audit',
    source_reference: returnInfo.condition || 'Customer Intake',
    source_module: 'Module 3',
    explanation: inconsistencyExplanation
  });

  // =========================================================================
  // 4. FEATURE: Evidence Quality & Completeness (Max 10 pts)
  // =========================================================================
  let qualityPoints = 0;
  let qualityExplanation = '';
  let qualityValue = 'High';
  const evidenceStrength = evidenceAnalysis?.evidence_strength || 'MEDIUM';

  if (!evidenceAnalysis || evidenceAnalysis.image_count === 0) {
    qualityPoints = 10;
    qualityValue = 'Low (0 photos)';
    qualityExplanation = 'Zero evidence media submitted with intake request.';
  } else if (evidenceStrength === 'LOW') {
    qualityPoints = 10;
    qualityValue = `Low (${evidenceAnalysis.image_count} photos, poor visibility)`;
    qualityExplanation = 'Photos are low-resolution, poorly lit, or single angle only.';
  } else if (evidenceStrength === 'MEDIUM') {
    qualityPoints = 5;
    qualityValue = `Medium (${evidenceAnalysis.image_count} photos)`;
    qualityExplanation = 'Moderate evidence coverage; sufficient for initial review but missing secondary angles.';
  } else {
    qualityPoints = 0;
    qualityValue = `High (${evidenceAnalysis.image_count} photos, verified)`;
    qualityExplanation = 'Multi-angle high clarity photographs submitted; defect clearly identifiable.';
  }

  factors.push({
    id: 'evidence_quality',
    name: 'Evidence Media Quality',
    value: qualityValue,
    points: qualityPoints,
    max_points: RISK_CONFIG.weights.evidenceQuality,
    source: 'Media Quality Assessment',
    source_reference: `${evidenceAnalysis?.usable_image_count || 0} usable images`,
    source_module: 'Module 3',
    explanation: qualityExplanation
  });

  // =========================================================================
  // 5. FEATURE: Product Context / Financial Exposure (Max 10 pts)
  // =========================================================================
  let productPoints = 0;
  let productExplanation = '';
  let productValue = '₹0';
  const productPrice = Number(order.product_price || order.price || returnRecord.product_price || 0);

  if (productPrice > 50000) {
    productPoints = 10;
    productValue = `₹${productPrice.toLocaleString('en-IN')} (High Exposure)`;
    productExplanation = 'High-value bulky furniture item (> ₹50,000); higher financial exposure upon return.';
  } else if (productPrice >= 10000) {
    productPoints = 5;
    productValue = `₹${productPrice.toLocaleString('en-IN')} (Moderate Exposure)`;
    productExplanation = 'Standard furniture value bracket (₹10,000 - ₹50,000).';
  } else {
    productPoints = 0;
    productValue = `₹${productPrice.toLocaleString('en-IN')} (Low Exposure)`;
    productExplanation = 'Lower financial exposure item (< ₹10,000).';
  }

  factors.push({
    id: 'product_context',
    name: 'Product Value Financial Exposure',
    value: productValue,
    points: productPoints,
    max_points: RISK_CONFIG.weights.productContext,
    source: 'Order Transaction Value',
    source_reference: order.order_id || 'ORD-UNKNOWN',
    source_module: 'Module 1 / 2',
    explanation: productExplanation
  });

  // =========================================================================
  // 6. FEATURE: Timing Pattern / Days After Delivery (Max 10 pts)
  // =========================================================================
  let timingPoints = 0;
  let timingExplanation = '';
  let timingValue = 'N/A';
  const daysSinceDelivery = evidenceAnalysis?.timeline?.days_from_delivery_to_return !== undefined
    ? evidenceAnalysis.timeline.days_from_delivery_to_return
    : null;

  if (daysSinceDelivery === null) {
    timingPoints = 0;
    timingValue = 'Delivery date not recorded';
    timingExplanation = 'Delivery date unavailable; no timing penalty assigned.';
  } else if (daysSinceDelivery > 60) {
    timingPoints = 10;
    timingValue = `${daysSinceDelivery} days after delivery`;
    timingExplanation = `Claim submitted ${daysSinceDelivery} days post-delivery (extended return window).`;
  } else if (daysSinceDelivery >= 31) {
    timingPoints = 7;
    timingValue = `${daysSinceDelivery} days after delivery`;
    timingExplanation = `Claim submitted ${daysSinceDelivery} days post-delivery (late claim pattern).`;
  } else if (daysSinceDelivery >= 8) {
    timingPoints = 3;
    timingValue = `${daysSinceDelivery} days after delivery`;
    timingExplanation = `Claim submitted ${daysSinceDelivery} days post-delivery (standard operational window).`;
  } else {
    timingPoints = 0;
    timingValue = `${daysSinceDelivery} day${daysSinceDelivery !== 1 ? 's' : ''} after delivery`;
    timingExplanation = `Prompt return submission (${daysSinceDelivery} days post-delivery).`;
  }

  factors.push({
    id: 'timing_pattern',
    name: 'Delivery-to-Return Timing Pattern',
    value: timingValue,
    points: timingPoints,
    max_points: RISK_CONFIG.weights.timingPattern,
    source: 'Factual Intake Timeline',
    source_reference: `${daysSinceDelivery ?? '—'} days`,
    source_module: 'Module 3',
    explanation: timingExplanation
  });

  // =========================================================================
  // TOTAL SCORE & CATEGORY CALCULATION
  // =========================================================================
  const totalScore = factors.reduce((sum, f) => sum + f.points, 0);

  let category = 'LOW';
  if (totalScore > RISK_CONFIG.thresholds.high) {
    category = 'CRITICAL';
  } else if (totalScore > RISK_CONFIG.thresholds.medium) {
    category = 'HIGH';
  } else if (totalScore > RISK_CONFIG.thresholds.low) {
    category = 'MEDIUM';
  } else {
    category = 'LOW';
  }

  const priorityMeta = RISK_CONFIG.priorityMapping[category];

  // =========================================================================
  // LEGITIMATE CUSTOMER PROTECTION RULE
  // If strong evidence + consistent defect + visible damage, protect from false positive delays
  // =========================================================================
  const isLegitimateProtected = (
    evidenceStrength === 'HIGH' &&
    consistencyStatus === 'CONSISTENT' &&
    (evidenceAnalysis?.damage_visibility === 'CLEARLY_VISIBLE' || evidenceAnalysis?.image_count >= 2)
  );

  let legitimateProtectionNote = null;
  if (isLegitimateProtected) {
    legitimateProtectionNote = 'Strong photographic evidence of reported damage verified. Recommended to avoid unnecessary processing delays.';
    if (returnRatePoints > 0 && confirmedFraudCases === 0) {
      edgeCasesDetected.push('HIGH_RETURN_RATE_STRONG_EVIDENCE');
    }
    if (confirmedFraudCases > 0) {
      edgeCasesDetected.push('PREVIOUS_FRAUD_STRONG_CURRENT_EVIDENCE');
    }
  }

  // =========================================================================
  // SUPPORTING EVIDENCE COMPILATION FOR HIGH & CRITICAL CASES
  // =========================================================================
  const supportingEvidence = [];
  if (category === 'HIGH' || category === 'CRITICAL') {
    if (confirmedFraudCases > 0) {
      supportingEvidence.push({
        title: 'Historical Confirmed Fraud',
        description: `${confirmedFraudCases} confirmed fraud outcome(s) recorded on account`,
        points: `+${fraudPoints} pts`,
        source: 'Customer History',
        sourceModule: 'Module 2',
        linkContext: 'customer'
      });
    }
    if (returnRatePoints >= 10) {
      supportingEvidence.push({
        title: 'Elevated Return Frequency',
        description: `Lifetime return rate of ${Math.round(returnRate * 100)}% (${totalReturns} of ${totalOrders} orders)`,
        points: `+${returnRatePoints} pts`,
        source: 'Order History',
        sourceModule: 'Module 2',
        linkContext: 'customer'
      });
    }
    if (inconsistencyPoints >= 10) {
      supportingEvidence.push({
        title: 'Evidence Inconsistency / Insufficiency',
        description: inconsistencyExplanation,
        points: `+${inconsistencyPoints} pts`,
        source: 'Evidence Analysis',
        sourceModule: 'Module 3',
        linkContext: 'evidence'
      });
    }
    if (qualityPoints >= 5) {
      supportingEvidence.push({
        title: 'Media Quality Notice',
        description: qualityExplanation,
        points: `+${qualityPoints} pts`,
        source: 'Evidence Gallery',
        sourceModule: 'Module 3',
        linkContext: 'evidence'
      });
    }
    if (productPoints >= 10) {
      supportingEvidence.push({
        title: 'High Financial Exposure',
        description: `Item price ₹${productPrice.toLocaleString('en-IN')} represents significant return exposure`,
        points: `+${productPoints} pts`,
        source: 'Order Ledger',
        sourceModule: 'Module 1',
        linkContext: 'order'
      });
    }
    if (timingPoints >= 7) {
      supportingEvidence.push({
        title: 'Delayed Return Claim Window',
        description: `Submitted ${daysSinceDelivery} days after delivery completion`,
        points: `+${timingPoints} pts`,
        source: 'Intake Timeline',
        sourceModule: 'Module 3',
        linkContext: 'timeline'
      });
    }
  }

  // =========================================================================
  // BASELINE & COST AWARENESS FIELDS
  // =========================================================================
  const estimated_review_cost = (category === 'HIGH' || category === 'CRITICAL') 
    ? RISK_CONFIG.baselineCostEstimates.standardManualReviewCostINR 
    : 0;
  const estimated_pickup_cost = RISK_CONFIG.baselineCostEstimates.bulkyPickupCostINR;
  const estimated_pickup_distance_km = RISK_CONFIG.baselineCostEstimates.avgDistanceKmPerPickup;
  const estimated_co2_kg = Math.round(estimated_pickup_distance_km * RISK_CONFIG.baselineCostEstimates.co2KgPerKmDieselVan * 10) / 10;
  const estimated_potential_loss = (category === 'HIGH' || category === 'CRITICAL') ? productPrice : 0;

  return {
    return_id: returnId,
    model_version: RISK_CONFIG.modelVersion,
    assessed_at: new Date().toISOString(),

    // Core Output
    risk_score: totalScore,
    risk_category: category,
    priority: priorityMeta.priority,
    priority_label: priorityMeta.label,
    priority_color: priorityMeta.color,
    recommendation: priorityMeta.recommendation,

    // Factor Breakdown & Math Check
    factors,
    total_factors_points_sum: totalScore, // Guarantees exact mathematical equivalence

    // Legitimate Customer Protection
    is_legitimate_protected: isLegitimateProtected,
    legitimate_protection_note: legitimateProtectionNote,
    edge_cases_detected: edgeCasesDetected,

    // Supporting Evidence Audit List
    supporting_evidence: supportingEvidence,

    // Baseline Impact & Sustainability Metrics
    baseline_metrics: {
      estimated_order_value: productPrice,
      estimated_potential_fraud_loss: estimated_potential_loss,
      estimated_review_cost: estimated_review_cost,
      estimated_pickup_cost: estimated_pickup_cost,
      estimated_pickup_distance_km: estimated_pickup_distance_km,
      estimated_co2_kg: estimated_co2_kg
    },

    // Prepared Structure for Module 5 Manual Human Review Override
    human_review_status: {
      human_decision: null,       // 'APPROVED' | 'REJECTED' | 'MODIFIED_PRIORITY'
      human_reason: null,
      reviewed_by: null,
      reviewed_at: null,
      override_applied: false
    }
  };
}
