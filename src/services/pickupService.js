/**
 * Module 6: Pickup Prioritisation & Operations Decision Engine Service
 * 
 * Implements deterministic, explainable priority calculation, operational trade-offs,
 * SLA monitoring, route clustering, and scheduling workflows.
 */

import { PICKUP_CONFIG } from '../config/pickupRules.js';
import { 
  getAllReturns, 
  getStoredReview, 
  getStoredPickup, 
  saveStoredPickup, 
  addPickupAuditEntry, 
  getPickupAuditLog 
} from '../utils/storage.js';
import { calculateCustomerHistoryStats } from '../utils/customerHistory.js';
import { analyzeReturnEvidence } from '../utils/evidenceAnalysis.js';
import { calculateRisk } from './riskEngine.js';

/**
 * Calculate the 8-Factor Explainable Pickup Priority Score (0–100)
 */
export function calculatePickupPriority(returnRecord, triageResult, humanReview, evidenceAnalysis) {
  if (!returnRecord) return null;

  const now = Date.now();
  const createdTimestamp = new Date(returnRecord.created_at || returnRecord.return_date || now).getTime();
  const daysWaiting = Math.max(1, Math.floor((now - createdTimestamp) / (1000 * 60 * 60 * 24)));

  const orderPrice = returnRecord.order?.price !== undefined 
    ? returnRecord.order.price 
    : (returnRecord.product_price !== undefined ? returnRecord.product_price : null);

  const humanDecision = humanReview?.decision?.decision_type || humanReview?.review_status || 'PENDING';
  const isApproved = humanDecision === 'APPROVE_PICKUP' || humanDecision === 'APPROVED';

  // Stored pickup overrides if any
  const storedPickup = getStoredPickup(returnRecord.return_id);

  // 1. Eligibility determination (Section 4)
  let eligibility = 'NOT_ELIGIBLE';
  let operationalStatus = 'AWAITING_REVIEW';

  if (humanDecision === 'REJECT_RETURN' || humanReview?.review_status === 'REJECTED') {
    eligibility = 'REJECTED';
    operationalStatus = 'REJECTED';
  } else if (humanDecision === 'REQUEST_MORE_EVIDENCE' || humanReview?.review_status === 'WAITING_FOR_EVIDENCE') {
    eligibility = 'WAITING_FOR_EVIDENCE';
    operationalStatus = 'WAITING_FOR_EVIDENCE';
  } else if (humanDecision === 'ESCALATE' || humanReview?.review_status === 'ESCALATED') {
    eligibility = 'ESCALATED';
    operationalStatus = 'ESCALATED';
  } else if (isApproved) {
    eligibility = 'ELIGIBLE';
    operationalStatus = storedPickup?.status || 'READY';
  }

  // 2. SLA Monitoring (Section 19 & 20)
  let slaStatus = 'ON_TRACK';
  let slaLabel = 'On Track (< 5 days)';

  const preferredDate = returnRecord.pickup?.preferred_date ? new Date(returnRecord.pickup.preferred_date) : null;
  const isPreferredDatePassed = preferredDate && preferredDate.getTime() < now;

  if (isPreferredDatePassed || daysWaiting > PICKUP_CONFIG.sla.atRiskMaxDays) {
    slaStatus = 'OVERDUE';
    slaLabel = isPreferredDatePassed ? 'OVERDUE — Scheduled date passed' : 'OVERDUE — Exceeded 7-day SLA';
  } else if (daysWaiting >= 5) {
    slaStatus = 'AT_RISK';
    slaLabel = 'AT RISK — Approaching 7-day SLA';
  }

  // 3. Legitimate Customer Service Protection Rule (Section 7 & 26)
  const evidenceStrength = evidenceAnalysis?.evidence_strength || 'MEDIUM';
  const conditionConsistency = evidenceAnalysis?.condition_consistency || 'CONSISTENT';
  const isLegitimateCustomerWaiting = isApproved && 
    (evidenceStrength === 'HIGH' || evidenceStrength === 'MEDIUM') && 
    conditionConsistency === 'CONSISTENT' && 
    daysWaiting >= 5;

  // Factor 1: Customer / SLA Urgency (Max 25 pts)
  let customerUrgencyPoints = 5;
  let customerUrgencyExplanation = `Customer waiting ${daysWaiting} day${daysWaiting !== 1 ? 's' : ''}`;
  for (const rule of PICKUP_CONFIG.customerUrgencyRules) {
    if (daysWaiting <= rule.maxDays) {
      customerUrgencyPoints = rule.points;
      customerUrgencyExplanation = `${rule.label} (${daysWaiting} days)`;
      break;
    }
  }
  if (isLegitimateCustomerWaiting) {
    customerUrgencyPoints = Math.min(25, customerUrgencyPoints + 5);
    customerUrgencyExplanation += ' • Boosted by Customer Service Urgency protection';
  }

  // Factor 2: Return Age / Delay (Max 20 pts)
  let returnAgePoints = 4;
  let returnAgeExplanation = `Created ${daysWaiting} days ago`;
  for (const rule of PICKUP_CONFIG.returnAgeRules) {
    if (daysWaiting <= rule.maxDays) {
      returnAgePoints = rule.points;
      returnAgeExplanation = rule.label;
      break;
    }
  }

  // Factor 3: Financial Exposure (Max 15 pts) - Handles Edge Case 2 (Missing order value)
  let financialPoints = 0;
  let financialExplanation = 'Financial exposure unavailable (missing price)';
  if (orderPrice !== null && !isNaN(orderPrice)) {
    for (const rule of PICKUP_CONFIG.financialExposureRules) {
      if (orderPrice <= rule.maxPrice) {
        financialPoints = rule.points;
        financialExplanation = `${rule.label} (₹${orderPrice.toLocaleString('en-IN')})`;
        break;
      }
    }
  }

  // Factor 4: Fraud-Loss Protection (Max 15 pts) - Handles Edge Case 3
  const riskCategory = triageResult?.risk_category || 'MEDIUM';
  const fraudRule = PICKUP_CONFIG.fraudExposureRules[riskCategory] || PICKUP_CONFIG.fraudExposureRules.MEDIUM;
  const fraudPoints = fraudRule.points;
  let fraudExplanation = fraudRule.label;
  if (riskCategory === 'CRITICAL' && daysWaiting <= 2) {
    fraudExplanation = 'Critical fraud risk indicator; customer service urgency currently low (waiting 1–2 days)';
  }

  // Factor 5: Route & Geographic Efficiency (Max 10 pts) - Handles Edge Case 1 (Missing location)
  const pickupLocation = returnRecord.pickup?.city ? `${returnRecord.pickup.address || ''}, ${returnRecord.pickup.city}` : null;
  const areaCluster = returnRecord.pickup?.area_cluster;
  let routePoints = 4;
  let routeExplanation = 'Standard service corridor (moderate transit)';

  if (!returnRecord.pickup || !returnRecord.pickup.city) {
    routePoints = PICKUP_CONFIG.routeEfficiencyRules.UNKNOWN.points;
    routeExplanation = 'Route efficiency unavailable (customer address missing)';
  } else if (areaCluster === 'BLR-EAST') {
    routePoints = PICKUP_CONFIG.routeEfficiencyRules.SAME_AREA_SCHEDULED.points;
    routeExplanation = 'High route density: Same zone as active scheduled run (BLR-EAST)';
  } else if (areaCluster === 'BLR-SOUTH' || areaCluster === 'BLR-CENTRAL') {
    routePoints = PICKUP_CONFIG.routeEfficiencyRules.NEARBY_AREA.points;
    routeExplanation = 'Nearby cluster: Adjacent to daily route (< 10 km)';
  } else if (areaCluster === 'BLR-TECH' || areaCluster === 'BLR-NORTH') {
    routePoints = PICKUP_CONFIG.routeEfficiencyRules.MODERATE_DISTANCE.points;
    routeExplanation = 'Outlying cluster: Grouping recommended for Whitefield/Hebbal run';
  }

  // Factor 6: Environmental Impact & Distance (Max 5 pts)
  const distanceKm = returnRecord.pickup?.distance_km !== undefined 
    ? returnRecord.pickup.distance_km 
    : (returnRecord.pickup ? 12.0 : null);

  let envPoints = 3;
  let envExplanation = 'Medium transit distance (~12 km)';
  if (distanceKm !== null) {
    for (const rule of PICKUP_CONFIG.environmentalRules) {
      if (distanceKm <= rule.maxKm) {
        envPoints = rule.points;
        envExplanation = `${rule.label} (~${distanceKm} km)`;
        break;
      }
    }
  } else {
    envExplanation = 'Distance and emissions estimate unavailable';
  }

  // Factor 7: Evidence Readiness (Max 5 pts)
  let evidencePoints = 3;
  let evidenceExplanation = 'Moderate evidence verified by human reviewer';
  if (evidenceStrength === 'HIGH' && isApproved) {
    evidencePoints = PICKUP_CONFIG.evidenceReadinessRules.STRONG_APPROVED.points;
    evidenceExplanation = PICKUP_CONFIG.evidenceReadinessRules.STRONG_APPROVED.label;
  } else if (humanDecision === 'REQUEST_MORE_EVIDENCE') {
    evidencePoints = 0;
    evidenceExplanation = 'Pending customer photo evidence submission';
  }

  // Factor 8: Operational Constraints (Max 5 pts)
  const category = (returnRecord.category || returnRecord.order?.category || '').toLowerCase();
  const isBulkyOrHeavy = category.includes('sofa') || category.includes('table') || category.includes('bed') || category.includes('wardrobe');
  let constraintPoints = isBulkyOrHeavy ? 3 : 2;
  let constraintExplanation = isBulkyOrHeavy 
    ? 'Bulky item: Requires 2-person handling or specialized truck' 
    : 'Standard parcel/chair handling window';

  if (isPreferredDatePassed || daysWaiting >= 7) {
    constraintPoints = 5;
    constraintExplanation = 'Expiring service window: Immediate driver allocation required';
  }

  // Factors breakdown list
  const factors = [
    {
      id: 'customer_sla_urgency',
      name: 'Customer & SLA Urgency',
      points: customerUrgencyPoints,
      max_points: PICKUP_CONFIG.weights.customerSlaUrgency,
      explanation: customerUrgencyExplanation,
      source: 'Waiting Days / SLA Policy',
      value: `${daysWaiting} days`
    },
    {
      id: 'return_age_delay',
      name: 'Return Age / Service Delay',
      points: returnAgePoints,
      max_points: PICKUP_CONFIG.weights.returnAgeServiceDelay,
      explanation: returnAgeExplanation,
      source: 'Return Request Intake Date',
      value: `${daysWaiting} days`
    },
    {
      id: 'financial_exposure',
      name: 'Financial Exposure',
      points: financialPoints,
      max_points: PICKUP_CONFIG.weights.financialExposure,
      explanation: financialExplanation,
      source: 'Order Invoice Value',
      value: orderPrice !== null ? `₹${orderPrice.toLocaleString('en-IN')}` : 'Missing'
    },
    {
      id: 'fraud_loss_protection',
      name: 'Fraud-Loss Protection Indicator',
      points: fraudPoints,
      max_points: PICKUP_CONFIG.weights.fraudLossProtection,
      explanation: fraudExplanation,
      source: 'Module 4 Risk Engine',
      value: `${riskCategory} Risk (${triageResult?.risk_score ?? 50}/100)`
    },
    {
      id: 'route_efficiency',
      name: 'Route & Area Efficiency',
      points: routePoints,
      max_points: PICKUP_CONFIG.weights.routeEfficiency,
      explanation: routeExplanation,
      source: 'Pickup Geocode & Active Route',
      value: areaCluster || (pickupLocation ? 'Standard Zone' : 'Missing')
    },
    {
      id: 'environmental_impact',
      name: 'Environmental Efficiency',
      points: envPoints,
      max_points: PICKUP_CONFIG.weights.environmentalImpact,
      explanation: envExplanation,
      source: 'Fleet Transit Model',
      value: distanceKm !== null ? `${distanceKm} km` : 'Missing'
    },
    {
      id: 'evidence_readiness',
      name: 'Evidence Readiness',
      points: evidencePoints,
      max_points: PICKUP_CONFIG.weights.evidenceReadiness,
      explanation: evidenceExplanation,
      source: 'Module 3 & Module 5 Sign-off',
      value: `${evidenceStrength} / ${humanDecision}`
    },
    {
      id: 'operational_constraints',
      name: 'Operational Constraints',
      points: constraintPoints,
      max_points: PICKUP_CONFIG.weights.operationalConstraints,
      explanation: constraintExplanation,
      source: 'Dispatch & Fleet Constraints',
      value: isBulkyOrHeavy ? 'Bulky/Heavy' : 'Standard'
    }
  ];

  // Raw calculated score (0 - 100)
  const rawScore = factors.reduce((sum, f) => sum + f.points, 0);
  const calculatedScore = Math.min(100, Math.max(0, rawScore));

  // Determine Level from Thresholds
  let calculatedLevel = 'LOW';
  if (calculatedScore >= PICKUP_CONFIG.thresholds.critical) {
    calculatedLevel = 'CRITICAL';
  } else if (calculatedScore >= PICKUP_CONFIG.thresholds.high) {
    calculatedLevel = 'HIGH';
  } else if (calculatedScore >= PICKUP_CONFIG.thresholds.standard) {
    calculatedLevel = 'STANDARD';
  }

  // Handle Manual Priority Override if active
  const overrideInfo = storedPickup?.override || null;
  const isOverridden = Boolean(overrideInfo?.overridden_score !== undefined);
  const finalScore = isOverridden ? overrideInfo.overridden_score : calculatedScore;
  const finalLevel = isOverridden ? overrideInfo.overridden_level : calculatedLevel;

  // Cost & CO2 Calculations (Section 23 & 24)
  const validDistance = distanceKm !== null ? distanceKm : 12.0;
  const handlingCost = isBulkyOrHeavy 
    ? (PICKUP_CONFIG.costModel.heavyHandlingCost + PICKUP_CONFIG.costModel.twoPersonHandlingCost)
    : 0;
  const estimatedPickupCost = distanceKm !== null 
    ? Math.round(PICKUP_CONFIG.costModel.baseCost + (validDistance * PICKUP_CONFIG.costModel.perKmRate) + handlingCost)
    : null;

  const estimatedCo2Kg = distanceKm !== null 
    ? Number((validDistance * PICKUP_CONFIG.co2Model.roundTripMultiplier * PICKUP_CONFIG.co2Model.emissionFactorKgPerKm).toFixed(1))
    : null;

  // Estimated Fraud Loss Exposure (Section 25)
  const riskFactor = PICKUP_CONFIG.fraudExposureRules[riskCategory]?.factor || 0.15;
  const estimatedFraudLoss = orderPrice !== null ? Math.round(orderPrice * riskFactor) : null;

  return {
    return_id: returnRecord.return_id,
    eligibility,
    operational_status: operationalStatus,
    pickup_priority_score: finalScore,
    priority_level: finalLevel,
    calculated_score: calculatedScore,
    calculated_level: calculatedLevel,
    is_overridden: isOverridden,
    override: overrideInfo,
    factors,
    days_waiting: daysWaiting,
    sla_status: slaStatus,
    sla_label: slaLabel,
    is_customer_service_urgency: isLegitimateCustomerWaiting,
    estimated_pickup_cost: estimatedPickupCost,
    estimated_distance_km: distanceKm,
    estimated_co2_kg: estimatedCo2Kg,
    estimated_fraud_loss: estimatedFraudLoss,
    is_bulky: isBulkyOrHeavy,
    location_available: Boolean(returnRecord.pickup?.city),
    financial_exposure_available: orderPrice !== null
  };
}

/**
 * Build the full Pickup Queue merging Modules 1, 2, 3, 4, 5, and 6
 */
export function buildPickupQueue(options = {}) {
  const {
    priorityFilter = 'ALL',
    humanDecisionFilter = 'ALL',
    pickupStatusFilter = 'ALL',
    slaFilter = 'ALL',
    riskFilter = 'ALL',
    areaFilter = 'ALL',
    searchQuery = '',
    sortBy = 'PRIORITY_DESC'
  } = options;

  const allReturns = getAllReturns();

  const queue = allReturns.map(ret => {
    const customerId = ret.customer_id || ret.customer?.customer_id;
    const customerStats = customerId ? calculateCustomerHistoryStats(customerId) : null;
    const evidenceAnalysis = analyzeReturnEvidence(ret);
    const triageResult = calculateRisk(ret, customerStats, evidenceAnalysis);
    const humanReview = getStoredReview(ret.return_id);
    const storedPickup = getStoredPickup(ret.return_id);

    const priorityData = calculatePickupPriority(ret, triageResult, humanReview, evidenceAnalysis);

    return {
      returnRecord: ret,
      return_id: ret.return_id,
      customer_name: ret.customer?.name || ret.customer_name || 'Customer',
      customer_id: customerId,
      product_name: ret.order?.product_name || ret.product || 'Item',
      category: ret.category || ret.order?.category || 'Furniture',
      order_id: ret.order?.order_id || ret.order_id || 'ORD-—',
      order_value: ret.order?.price !== undefined ? ret.order.price : ret.product_price,
      human_decision: humanReview?.decision?.decision_type || (humanReview?.review_status === 'APPROVED' ? 'APPROVE_PICKUP' : (humanReview?.review_status || 'PENDING')),
      human_reviewer: humanReview?.reviewer || null,
      human_review: humanReview,
      triage_risk_score: triageResult?.risk_score ?? 50,
      triage_risk_category: triageResult?.risk_category || 'MEDIUM',
      triageResult,
      evidenceAnalysis,
      storedPickup,
      ...priorityData
    };
  });

  // Filter Queue
  const filtered = queue.filter(item => {
    // 1. Text search
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match = 
        item.return_id?.toLowerCase().includes(q) ||
        item.customer_name?.toLowerCase().includes(q) ||
        item.order_id?.toLowerCase().includes(q) ||
        item.product_name?.toLowerCase().includes(q) ||
        item.returnRecord?.pickup?.city?.toLowerCase().includes(q) ||
        item.returnRecord?.pickup?.address?.toLowerCase().includes(q);
      if (!match) return false;
    }

    // 2. Priority Level filter
    if (priorityFilter !== 'ALL' && item.priority_level !== priorityFilter) {
      return false;
    }

    // 3. Human Decision filter
    if (humanDecisionFilter !== 'ALL') {
      if (humanDecisionFilter === 'APPROVED' && item.human_decision !== 'APPROVE_PICKUP') return false;
      if (humanDecisionFilter === 'REJECTED' && item.human_decision !== 'REJECT_RETURN') return false;
      if (humanDecisionFilter === 'REQUEST_MORE_EVIDENCE' && item.human_decision !== 'REQUEST_MORE_EVIDENCE') return false;
      if (humanDecisionFilter === 'ESCALATED' && item.human_decision !== 'ESCALATE') return false;
    }

    // 4. Pickup Status filter
    if (pickupStatusFilter !== 'ALL') {
      if (item.operational_status !== pickupStatusFilter) return false;
    }

    // 5. SLA Status filter
    if (slaFilter !== 'ALL' && item.sla_status !== slaFilter) {
      return false;
    }

    // 6. Risk Tier filter
    if (riskFilter !== 'ALL' && item.triage_risk_category !== riskFilter) {
      return false;
    }

    // 7. Area Cluster filter
    if (areaFilter !== 'ALL') {
      const itemArea = item.returnRecord?.pickup?.area_cluster || 'UNKNOWN';
      if (itemArea !== areaFilter) return false;
    }

    return true;
  });

  // Sort Queue
  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'PRIORITY_DESC':
        return b.pickup_priority_score - a.pickup_priority_score;
      case 'PRIORITY_ASC':
        return a.pickup_priority_score - b.pickup_priority_score;
      case 'WAITING_DESC':
        return b.days_waiting - a.days_waiting;
      case 'WAITING_ASC':
        return a.days_waiting - b.days_waiting;
      case 'VALUE_DESC':
        return (b.order_value || 0) - (a.order_value || 0);
      case 'RISK_DESC':
        return b.triage_risk_score - a.triage_risk_score;
      case 'DISTANCE_ASC':
        return (a.estimated_distance_km || 99) - (b.estimated_distance_km || 99);
      case 'COST_ASC':
        return (a.estimated_pickup_cost || 9999) - (b.estimated_pickup_cost || 9999);
      case 'CO2_ASC':
        return (a.estimated_co2_kg || 99) - (b.estimated_co2_kg || 99);
      case 'DATE_ASC':
        return new Date(a.returnRecord.created_at || 0) - new Date(b.returnRecord.created_at || 0);
      default:
        return b.pickup_priority_score - a.pickup_priority_score;
    }
  });

  return filtered;
}

/**
 * Group eligible approved returns into suggested geographic route batches
 */
export function groupPickupBatches(pickupItems) {
  const eligibleItems = pickupItems.filter(p => p.eligibility === 'ELIGIBLE' && p.operational_status !== 'PICKED_UP');
  
  const groups = {};

  eligibleItems.forEach(item => {
    const areaId = item.returnRecord?.pickup?.area_cluster || 'UNCLUSTERED';
    if (!groups[areaId]) {
      const areaMeta = PICKUP_CONFIG.knownServiceAreas.find(a => a.id === areaId) || {
        id: areaId,
        name: areaId === 'UNCLUSTERED' ? 'Unmapped / Flexible Addresses' : areaId,
        city: 'Bengaluru',
        avgDistanceKm: 14.0
      };
      groups[areaId] = {
        batch_id: `BATCH-${areaId}`,
        area_id: areaId,
        area_name: areaMeta.name,
        city: areaMeta.city,
        items: [],
        total_items: 0,
        total_value: 0,
        total_distance_km: 0,
        total_estimated_cost: 0,
        total_co2_kg: 0,
        highest_priority_score: 0,
        highest_priority_level: 'LOW',
        suggested_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        status: 'SUGGESTED'
      };
    }

    groups[areaId].items.push(item);
    groups[areaId].total_items += 1;
    groups[areaId].total_value += (item.order_value || 0);
    groups[areaId].total_distance_km += (item.estimated_distance_km || 10);
    groups[areaId].total_estimated_cost += (item.estimated_pickup_cost || 350);
    groups[areaId].total_co2_kg += (item.estimated_co2_kg || 2.5);

    if (item.pickup_priority_score > groups[areaId].highest_priority_score) {
      groups[areaId].highest_priority_score = item.pickup_priority_score;
      groups[areaId].highest_priority_level = item.priority_level;
    }

    if (item.operational_status === 'SCHEDULED') {
      groups[areaId].status = 'PARTIALLY_SCHEDULED';
    }
  });

  // Adjust combined route efficiency (clustered pickups save ~35% distance vs individual runs)
  return Object.values(groups).map(g => {
    const consolidatedKm = Number((g.total_distance_km * 0.65).toFixed(1));
    const consolidatedCost = Math.round(g.total_estimated_cost * 0.75);
    const consolidatedCo2 = Number((g.total_co2_kg * 0.65).toFixed(1));

    return {
      ...g,
      consolidated_distance_km: consolidatedKm,
      consolidated_cost: consolidatedCost,
      consolidated_co2_kg: consolidatedCo2
    };
  });
}

/**
 * Schedule a Pickup (Section 16 & 17)
 */
export function schedulePickup(returnId, scheduleData, scheduledBy = 'Operator') {
  if (!returnId || !scheduleData) return false;

  const existingPickup = getStoredPickup(returnId) || {};
  
  // Edge Case 10: Check if already scheduled
  const wasAlreadyScheduled = existingPickup.status === 'SCHEDULED';

  const updated = {
    ...existingPickup,
    return_id: returnId.toUpperCase(),
    status: 'SCHEDULED',
    scheduled_date: scheduleData.date,
    scheduled_time_slot: scheduleData.timeSlot,
    driver: scheduleData.driver,
    vehicle: scheduleData.vehicle,
    special_handling: scheduleData.specialHandling || [],
    scheduled_by: scheduledBy,
    scheduled_at: new Date().toISOString()
  };

  const success = saveStoredPickup(returnId, updated);
  if (success) {
    const actionDesc = wasAlreadyScheduled 
      ? `Pickup schedule updated for ${scheduleData.date} (${scheduleData.timeSlot}) with ${scheduleData.driver.name}`
      : `Pickup scheduled for ${scheduleData.date} (${scheduleData.timeSlot}) assigned to ${scheduleData.driver.name} [${scheduleData.vehicle.name}]`;

    addPickupAuditEntry(
      returnId,
      actionDesc,
      scheduledBy,
      'Dispatch Coordinator',
      `Vehicle: ${scheduleData.vehicle.name}, Special Handling: ${scheduleData.specialHandling?.join(', ') || 'None'}`
    );
  }
  return success;
}

/**
 * Mark Pickup as Completed (Section 18)
 */
export function completePickup(returnId, completionData, completedBy = 'Driver / Dispatcher') {
  if (!returnId) return false;

  const existing = getStoredPickup(returnId) || {};
  const updated = {
    ...existing,
    return_id: returnId.toUpperCase(),
    status: 'PICKED_UP',
    completed_at: new Date().toISOString(),
    completed_by: completedBy,
    completion_notes: completionData?.notes || 'Item retrieved in good order.',
    packaging_intact: completionData?.packagingIntact ?? true
  };

  const success = saveStoredPickup(returnId, updated);
  if (success) {
    addPickupAuditEntry(
      returnId,
      `Item successfully collected by driver. Status updated to PICKED UP.`,
      completedBy,
      'Field Driver / Operator',
      completionData?.notes || 'Collection manifest signed.'
    );
  }
  return success;
}

/**
 * Manual Priority Override (Section 28)
 */
export function overridePickupPriority(returnId, originalScore, originalLevel, newScore, newLevel, reason, overriddenBy = 'Operations Manager') {
  if (!returnId || newScore === undefined || !reason?.trim()) return false;

  const existing = getStoredPickup(returnId) || {};
  const overrideRecord = {
    original_priority_score: originalScore,
    original_priority_level: originalLevel,
    overridden_score: Number(newScore),
    overridden_level: newLevel,
    override_reason: reason.trim(),
    overridden_by: overriddenBy,
    overridden_at: new Date().toISOString()
  };

  const updated = {
    ...existing,
    return_id: returnId.toUpperCase(),
    override: overrideRecord
  };

  const success = saveStoredPickup(returnId, updated);
  if (success) {
    addPickupAuditEntry(
      returnId,
      `Manual Priority Override: Changed score from ${originalScore} (${originalLevel}) to ${newScore} (${newLevel})`,
      overriddenBy,
      'Operations Manager',
      `Override Rationale: "${reason.trim()}"`
    );
  }
  return success;
}
