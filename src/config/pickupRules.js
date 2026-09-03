/**
 * Module 6: Pickup Prioritisation & Operations Decision Engine Configuration
 * 
 * Centralized, explainable weights, thresholds, cost models, and SLA targets.
 * All estimations are deterministic prototype models.
 */

export const PICKUP_CONFIG = {
  version: 'pickup-v1',

  // 1. Configurable Feature Weights (Total = 100 points)
  weights: {
    customerSlaUrgency: 25,     // Max 25 pts: Customer waiting time / SLA target
    returnAgeServiceDelay: 20,  // Max 20 pts: Total days since return was requested
    financialExposure: 15,      // Max 15 pts: Order value / potential financial exposure
    fraudLossProtection: 15,    // Max 15 pts: Risk score indicator from Module 4
    routeEfficiency: 10,        // Max 10 pts: Geographic cluster proximity to existing route
    environmentalImpact: 5,     // Max 5 pts: Distance & CO2 emissions efficiency
    evidenceReadiness: 5,       // Max 5 pts: Evidence strength & condition verification
    operationalConstraints: 5   // Max 5 pts: Pickup slot expiring / vehicle capacity
  },

  // 2. Priority Level Thresholds (0–100 Scale)
  thresholds: {
    critical: 80,  // 80 - 100 -> CRITICAL
    high: 60,      // 60 - 79  -> HIGH
    standard: 30,  // 30 - 59  -> STANDARD
    low: 0         // 0  - 29  -> LOW
  },

  // 3. Prototype SLA Configuration
  sla: {
    targetDays: 7,
    onTrackMaxDays: 4,     // < 5 days -> ON TRACK
    atRiskMaxDays: 7,      // 5 - 7 days -> AT RISK
    // > 7 days -> OVERDUE
  },

  // 4. Customer Waiting Rules (Max 25 pts)
  customerUrgencyRules: [
    { maxDays: 2, points: 5, label: 'Waiting <= 2 days (Standard intake)' },
    { maxDays: 5, points: 10, label: 'Waiting 3–5 days (Within target)' },
    { maxDays: 7, points: 15, label: 'Waiting 6–7 days (Approaching SLA threshold)' },
    { maxDays: 14, points: 20, label: 'Waiting 8–14 days (Overdue customer delay)' },
    { maxDays: Infinity, points: 25, label: 'Waiting > 14 days (Critical service delay)' }
  ],

  // 5. Return Age / Delay Rules (Max 20 pts)
  returnAgeRules: [
    { maxDays: 3, points: 4, label: 'Requested <= 3 days ago' },
    { maxDays: 7, points: 8, label: 'Requested 4–7 days ago' },
    { maxDays: 12, points: 14, label: 'Requested 8–12 days ago' },
    { maxDays: Infinity, points: 20, label: 'Requested > 12 days ago' }
  ],

  // 6. Financial Exposure Rules (Max 15 pts)
  financialExposureRules: [
    { maxPrice: 10000, points: 3, label: '< ₹10,000 order value (Low financial exposure)' },
    { maxPrice: 25000, points: 7, label: '₹10,000–₹25,000 order value (Moderate exposure)' },
    { maxPrice: 50000, points: 11, label: '₹25,000–₹50,000 order value (Significant exposure)' },
    { maxPrice: Infinity, points: 15, label: '> ₹50,000 order value (High financial exposure)' }
  ],

  // 7. Fraud-Loss Exposure Rules (Max 15 pts)
  // IMPORTANT: Clearly labeled as operational protection factor, NOT customer fraud guilt.
  fraudExposureRules: {
    LOW: { points: 0, factor: 0.05, label: 'Low risk tier (Minimal fraud-loss exposure)' },
    MEDIUM: { points: 5, factor: 0.15, label: 'Medium risk tier (Standard loss mitigation)' },
    HIGH: { points: 10, factor: 0.35, label: 'High risk tier (Substantial loss exposure)' },
    CRITICAL: { points: 15, factor: 0.60, label: 'Critical risk tier (Maximum loss exposure)' }
  },

  // 8. Route / Area Efficiency Rules (Max 10 pts)
  routeEfficiencyRules: {
    SAME_AREA_SCHEDULED: { points: 10, label: 'Same cluster area as already-scheduled pickup' },
    NEARBY_AREA: { points: 7, label: 'Adjacent service cluster (< 8 km from active run)' },
    MODERATE_DISTANCE: { points: 4, label: 'Standard suburban zone (8–18 km)' },
    LONG_DISTANCE: { points: 1, label: 'Outlying suburban zone (> 18 km)' },
    UNKNOWN: { points: 3, label: 'Location pending or address unmapped' }
  },

  // 9. Environmental Impact & Distance Rules (Max 5 pts)
  environmentalRules: [
    { maxKm: 8, points: 5, label: '<= 8 km short transit run (Minimal carbon impact)' },
    { maxKm: 15, points: 3, label: '9–15 km medium transit run' },
    { maxKm: Infinity, points: 1, label: '> 15 km long transit run (Higher carbon footprint)' }
  ],

  // 10. Evidence Readiness Rules (Max 5 pts)
  evidenceReadinessRules: {
    STRONG_APPROVED: { points: 5, label: 'Strong verified evidence with human sign-off' },
    MODERATE_APPROVED: { points: 3, label: 'Adequate evidence with operational approval' },
    WEAK_APPROVED: { points: 1, label: 'Minimal evidence approved with operational override' },
    PENDING_EVIDENCE: { points: 0, label: 'Awaiting customer evidence submission' }
  },

  // 11. Operational Constraints Rules (Max 5 pts)
  constraintRules: {
    SLOT_EXPIRING: { points: 5, label: 'Preferred customer slot expiring today/tomorrow' },
    BULKY_TWO_MAN: { points: 3, label: 'Two-person heavy bulky retrieval requirement' },
    STANDARD_SLOT: { points: 2, label: 'Standard flexible pickup window' }
  },

  // 12. Prototype Cost Model (₹ INR)
  costModel: {
    baseCost: 200,
    perKmRate: 15,
    heavyHandlingCost: 150,
    twoPersonHandlingCost: 250
  },

  // 13. Prototype CO2 Emission Model
  co2Model: {
    emissionFactorKgPerKm: 0.18, // 180g CO2 per km for delivery van
    roundTripMultiplier: 2
  },

  // 14. Mock Operations Fleet Assets
  mockFleet: {
    drivers: [
      { id: 'DRV-01', name: 'Ramesh Kumar', phone: '+91 98451 22301', vehicle: 'Van 01 (MH-02-AB-1024)', zone: 'Indiranagar / Koramangala' },
      { id: 'DRV-02', name: 'Anand Verma', phone: '+91 98452 44912', vehicle: 'Van 02 (MH-02-CD-5811)', zone: 'Whitefield / Marathahalli' },
      { id: 'DRV-03', name: 'Vikram Singh', phone: '+91 98453 88123', vehicle: 'Truck 01 (KA-01-EE-9012)', zone: 'HSR Layout / Electronic City' },
      { id: 'DRV-04', name: 'Deepak Rao', phone: '+91 98454 11847', vehicle: 'Truck 02 (KA-01-FF-3341)', zone: 'Jayanagar / JP Nagar' }
    ],
    vehicles: [
      { id: 'VEH-VAN-01', name: 'Van 01', type: 'Light Cargo Van', capacityKg: 800, isTwoPerson: false },
      { id: 'VEH-VAN-02', name: 'Van 02', type: 'Light Cargo Van', capacityKg: 800, isTwoPerson: false },
      { id: 'VEH-TRK-01', name: 'Truck 01', type: 'Heavy Furniture Truck', capacityKg: 2500, isTwoPerson: true },
      { id: 'VEH-TRK-02', name: 'Truck 02', type: 'Heavy Furniture Truck', capacityKg: 2500, isTwoPerson: true }
    ],
    timeSlots: [
      '09:00 AM – 12:00 PM',
      '12:00 PM – 03:00 PM',
      '03:00 PM – 06:00 PM',
      '06:00 PM – 08:00 PM'
    ]
  },

  // 15. Known Geographic Service Areas for Route Grouping
  knownServiceAreas: [
    { id: 'BLR-EAST', name: 'Indiranagar & Domlur', city: 'Bengaluru', avgDistanceKm: 6.5 },
    { id: 'BLR-TECH', name: 'Whitefield & Marathahalli', city: 'Bengaluru', avgDistanceKm: 18.2 },
    { id: 'BLR-SOUTH', name: 'Koramangala & HSR Layout', city: 'Bengaluru', avgDistanceKm: 9.4 },
    { id: 'BLR-CENTRAL', name: 'Jayanagar & JP Nagar', city: 'Bengaluru', avgDistanceKm: 12.1 },
    { id: 'BLR-NORTH', name: 'Hebbal & Yelahanka', city: 'Bengaluru', avgDistanceKm: 21.5 },
    { id: 'BOM-WEST', name: 'Andheri & Juhu', city: 'Mumbai', avgDistanceKm: 11.0 },
    { id: 'BOM-SOUTH', name: 'Bandra & Worli', city: 'Mumbai', avgDistanceKm: 14.2 }
  ]
};

export const PICKUP_COST_MODEL = {
  BASE_PICKUP_FEE: 200,
  COST_PER_KM: 18
};

export const CO2_MODEL = {
  KG_CO2_PER_KM: 0.27
};

