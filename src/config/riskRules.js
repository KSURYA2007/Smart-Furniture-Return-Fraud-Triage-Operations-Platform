/**
 * Module 4: Fraud Risk & Priority Engine Configuration
 * 
 * Centralized, configurable weights, thresholds, and scoring definitions.
 * Stored as model version 'rules-v1' for transparent experiment reproducibility.
 */

export const RISK_CONFIG = {
  modelVersion: 'rules-v1',

  // Configurable Feature Weights (Total = 100 points)
  weights: {
    historicalFraud: 30,       // Max 30 pts: Confirmed past fraud outcomes
    returnBehaviour: 20,       // Max 20 pts: Lifetime return rate percentage
    evidenceInconsistency: 20, // Max 20 pts: Alignment between claim & evidence
    evidenceQuality: 10,       // Max 10 pts: Media quality & completeness strength
    productContext: 10,        // Max 10 pts: High-value exposure tier
    timingPattern: 10          // Max 10 pts: Days from delivery to return claim
  },

  // Configurable Risk Score Category Thresholds (0-100 scale)
  thresholds: {
    low: 29,     // 0 - 29 -> LOW (Fast Track)
    medium: 59,  // 30 - 59 -> MEDIUM (Standard Process)
    high: 79     // 60 - 79 -> HIGH (Human Review)
                 // 80 - 100 -> CRITICAL (Priority Human Review)
  },

  // Historical Fraud Points (Module 2)
  historicalFraudRules: [
    { count: 0, points: 0, label: '0 confirmed fraud cases' },
    { count: 1, points: 15, label: '1 confirmed fraud outcome' },
    { count: 2, points: 30, label: '>=2 confirmed fraud outcomes' }
  ],

  // Return Rate Rules (Module 2)
  returnRateRules: [
    { maxRate: 0.10, points: 0, label: '< 10% lifetime return rate' },
    { maxRate: 0.25, points: 5, label: '10% - 25% lifetime return rate' },
    { maxRate: 0.40, points: 10, label: '25% - 40% lifetime return rate' },
    { maxRate: 0.60, points: 15, label: '40% - 60% lifetime return rate' },
    { maxRate: Infinity, points: 20, label: '> 60% lifetime return rate' }
  ],

  // Evidence Inconsistency Rules (Module 3)
  evidenceInconsistencyRules: {
    CONSISTENT: { points: 0, label: 'Claim condition verified by photographic evidence' },
    PARTIALLY_CONSISTENT: { points: 10, label: 'Minor mismatch between reported condition and evidence' },
    INSUFFICIENT_EVIDENCE: { points: 15, label: 'Insufficient photographic proof to verify claim' },
    CLEAR_INCONSISTENCY: { points: 20, label: 'Clear disparity between reported defect and uploaded media' }
  },

  // Evidence Quality Rules (Module 3)
  evidenceQualityRules: {
    HIGH: { points: 0, label: 'High evidence strength (multiple clear photos)' },
    MEDIUM: { points: 5, label: 'Moderate evidence strength (usable photos)' },
    LOW: { points: 10, label: 'Low evidence strength (limited or poor photos)' }
  },

  // Product Value Exposure Rules (Module 1 / 2)
  productValueRules: [
    { maxValue: 10000, points: 0, label: 'Value < ₹10,000 (Low exposure)' },
    { maxValue: 50000, points: 5, label: 'Value ₹10,000 - ₹50,000 (Moderate exposure)' },
    { maxValue: Infinity, points: 10, label: 'Value > ₹50,000 (High financial exposure)' }
  ],

  // Timing Pattern Rules (Days from Delivery to Return)
  timingPatternRules: [
    { maxDays: 7, points: 0, label: '0 - 7 days after delivery (Immediate claim)' },
    { maxDays: 30, points: 3, label: '8 - 30 days after delivery (Standard window)' },
    { maxDays: 60, points: 7, label: '31 - 60 days after delivery (Late claim)' },
    { maxDays: Infinity, points: 10, label: '> 60 days after delivery (Extended claim)' }
  ],

  // Operational Priority Mapping
  priorityMapping: {
    LOW: {
      priority: 'FAST_TRACK',
      label: 'Fast Track',
      color: 'emerald',
      recommendation: 'Fast-track return. No additional fraud investigation is currently required.'
    },
    MEDIUM: {
      priority: 'STANDARD_PROCESS',
      label: 'Standard Process',
      color: 'blue',
      recommendation: 'Continue standard processing. Monitor the case using normal operational procedures.'
    },
    HIGH: {
      priority: 'HUMAN_REVIEW',
      label: 'Human Review',
      color: 'amber',
      recommendation: 'Human review recommended before final operational action. Do not automatically reject.'
    },
    CRITICAL: {
      priority: 'PRIORITY_HUMAN_REVIEW',
      label: 'Priority Human Review',
      color: 'red',
      recommendation: 'Priority human review required. High-priority desk investigation needed before pickup dispatch.'
    }
  },

  // Mock Operational Baseline Parameters for Impact Measurement
  baselineCostEstimates: {
    standardManualReviewCostINR: 450,    // ₹450 per manual review
    bulkyPickupCostINR: 1200,            // ₹1200 per bulky reverse logistics pickup
    avgDistanceKmPerPickup: 18,          // 18 km average route
    co2KgPerKmDieselVan: 0.21            // ~0.21 kg CO2 per km for freight van
  }
};
