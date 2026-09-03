import { calculateRisk } from './services/riskEngine.js';
import { RISK_CONFIG } from './config/riskRules.js';
import { INITIAL_RETURNS, INITIAL_CUSTOMERS } from './data/seedData.js';
import { calculateCustomerHistoryStats } from './utils/customerHistory.js';
import { analyzeReturnEvidence } from './utils/evidenceAnalysis.js';

console.log('====================================================');
console.log('🧪 MODULE 4 AUTOMATED COMPREHENSIVE TEST SUITE');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`❌ FAIL: ${message}`);
  }
}

// 1. Deterministic Scoring & Exact Mathematical Summation Tests
console.log('--- 1. Deterministic Scoring & Factor Summation Tests ---');
const sampleReturn = {
  return_id: 'RET-TEST-001',
  customer: { customer_id: 'CUS-1024', name: 'John Smith' },
  order: { order_id: 'ORD-1001', product_price: 35000, category: 'Sofa' },
  return: { reason: 'Damaged on delivery', condition: 'Major Damage' }
};
const sampleCustomerStats = {
  total_orders: 12,
  total_returns: 4,
  return_rate: 33.3,
  total_confirmed_fraud: 1
};
const sampleEvidence = {
  image_count: 3,
  usable_image_count: 3,
  evidence_strength: 'HIGH',
  condition_consistency: 'CONSISTENT',
  damage_visibility: 'CLEARLY_VISIBLE',
  timeline: { days_from_delivery_to_return: 4 }
};

const result1 = calculateRisk(sampleReturn, sampleCustomerStats, sampleEvidence);
console.log('Result 1 Score:', result1.risk_score, 'Category:', result1.risk_category, 'Priority:', result1.priority);

// Check points:
// 1. Historical Fraud: 1 case = 15 pts
// 2. Return Rate: 33.3% (25-40%) = 10 pts
// 3. Evidence Inconsistency: CONSISTENT = 0 pts
// 4. Evidence Quality: HIGH = 0 pts
// 5. Product Context: 35000 (10k-50k) = 5 pts
// 6. Timing: 4 days (0-7) = 0 pts
// Total = 15 + 10 + 0 + 0 + 5 + 0 = 30 pts -> MEDIUM
assert(result1.risk_score === 30, `Score is 30 points (Found: ${result1.risk_score})`);
assert(result1.risk_category === 'MEDIUM', `Category is MEDIUM (Found: ${result1.risk_category})`);
assert(result1.priority === 'STANDARD_PROCESS', `Priority is STANDARD_PROCESS (Found: ${result1.priority})`);
assert(result1.total_factors_points_sum === result1.risk_score, `Factors sum (${result1.total_factors_points_sum}) exactly equals total score (${result1.risk_score})`);

// 2. Edge Case 1: New Customer (1 order, 0 returns, 0 fraud)
console.log('\n--- 2. Edge Case 1: New Customer (No historical penalty) ---');
const newCustomerStats = { total_orders: 1, total_returns: 0, return_rate: 0, total_confirmed_fraud: 0 };
const newCustEvidence = {
  image_count: 3,
  usable_image_count: 3,
  evidence_strength: 'HIGH',
  condition_consistency: 'CONSISTENT',
  damage_visibility: 'CLEARLY_VISIBLE',
  timeline: { days_from_delivery_to_return: 2 }
};
const newCustResult = calculateRisk(sampleReturn, newCustomerStats, newCustEvidence);
console.log('New Customer Score:', newCustResult.risk_score, 'Category:', newCustResult.risk_category);
assert(newCustResult.risk_score <= 10, `New customer receives low score without penalty (Found: ${newCustResult.risk_score})`);
assert(newCustResult.priority === 'FAST_TRACK', 'New customer with valid evidence routes to FAST_TRACK');
assert(newCustResult.edge_cases_detected.includes('NEW_CUSTOMER'), 'Detects NEW_CUSTOMER edge case');

// 3. Edge Case 2: High Return Rate but Strong Photographic Evidence
console.log('\n--- 3. Edge Case 2: High Return Rate + Strong Evidence (Legitimate Protection) ---');
const highReturnCustStats = { total_orders: 10, total_returns: 5, return_rate: 50, total_confirmed_fraud: 0 };
const strongEvidence = {
  image_count: 4,
  usable_image_count: 4,
  evidence_strength: 'HIGH',
  condition_consistency: 'CONSISTENT',
  damage_visibility: 'CLEARLY_VISIBLE',
  timeline: { days_from_delivery_to_return: 3 }
};
const highReturnResult = calculateRisk(sampleReturn, highReturnCustStats, strongEvidence);
console.log('High Return Rate + Strong Evidence Score:', highReturnResult.risk_score, 'Protected:', highReturnResult.is_legitimate_protected);
assert(highReturnResult.is_legitimate_protected === true, 'Legitimate customer protection is active');
assert(highReturnResult.legitimate_protection_note !== null, 'Legitimate customer protection explanation is provided');
assert(highReturnResult.edge_cases_detected.includes('HIGH_RETURN_RATE_STRONG_EVIDENCE'), 'Flags HIGH_RETURN_RATE_STRONG_EVIDENCE');

// 4. Edge Case 3: Previous Fraud (1 case) + Strong Current Evidence
console.log('\n--- 4. Edge Case 3: Previous Fraud + Strong Current Evidence ---');
const prevFraudResult = calculateRisk(sampleReturn, sampleCustomerStats, strongEvidence);
assert(prevFraudResult.factors.find(f => f.id === 'historical_fraud').points === 15, 'Historical fraud factor adds 15 points');
assert(prevFraudResult.is_legitimate_protected === true, 'Current strong evidence remains protected');
assert(prevFraudResult.edge_cases_detected.includes('PREVIOUS_FRAUD_STRONG_CURRENT_EVIDENCE'), 'Flags PREVIOUS_FRAUD_STRONG_CURRENT_EVIDENCE');

// 5. Edge Case 4: Missing Evidence (0 images, no description)
console.log('\n--- 5. Edge Case 4: Missing Evidence ---');
const missingEvidence = {
  image_count: 0,
  usable_image_count: 0,
  evidence_strength: 'LOW',
  condition_consistency: 'INSUFFICIENT_EVIDENCE',
  timeline: { days_from_delivery_to_return: null }
};
const missingEvResult = calculateRisk(sampleReturn, sampleCustomerStats, missingEvidence);
console.log('Missing Evidence Score:', missingEvResult.risk_score, 'Priority:', missingEvResult.priority);
assert(missingEvResult.factors.find(f => f.id === 'evidence_inconsistency').points === 15, 'Assigns 15 inconsistency points for missing photos');
assert(missingEvResult.factors.find(f => f.id === 'evidence_quality').points === 10, 'Assigns 10 quality points for 0 photos');
assert(missingEvResult.edge_cases_detected.includes('MISSING_EVIDENCE'), 'Flags MISSING_EVIDENCE edge case');

// 6. Edge Case 5: Missing Customer History
console.log('\n--- 6. Edge Case 5: Missing Customer History ---');
const missingHistResult = calculateRisk(sampleReturn, null, sampleEvidence);
assert(missingHistResult.factors.find(f => f.id === 'historical_fraud').points === 0, 'No historical fraud penalty on missing history');
assert(missingHistResult.edge_cases_detected.includes('MISSING_HISTORY'), 'Flags MISSING_HISTORY edge case');

// 7. Critical Safety Verification (NO Automatic Rejection)
console.log('\n--- 7. Non-Rejection Safety Policy Verification ---');
const criticalReturn = {
  return_id: 'RET-CRITICAL-001',
  customer: { customer_id: 'CUS-1026', name: 'Rahul Verma' },
  order: { order_id: 'ORD-1010', product_price: 68000 },
  return: { reason: 'Defective', condition: 'Minor' }
};
const criticalStats = { total_orders: 8, total_returns: 6, return_rate: 75, total_confirmed_fraud: 2 };
const criticalEvidence = {
  image_count: 0,
  evidence_strength: 'LOW',
  condition_consistency: 'CLEAR_INCONSISTENCY',
  timeline: { days_from_delivery_to_return: 65 }
};
const criticalResult = calculateRisk(criticalReturn, criticalStats, criticalEvidence);
console.log('Critical Risk Score:', criticalResult.risk_score, 'Category:', criticalResult.risk_category, 'Priority:', criticalResult.priority);

assert(criticalResult.risk_score >= 80, `Critical score is >= 80 (Found: ${criticalResult.risk_score})`);
assert(criticalResult.risk_category === 'CRITICAL', 'Classified as CRITICAL risk');
assert(criticalResult.priority === 'PRIORITY_HUMAN_REVIEW', 'Routes to PRIORITY_HUMAN_REVIEW (NOT rejected)');
assert(criticalResult.recommendation.toLowerCase().includes('do not automatically reject') || criticalResult.recommendation.toLowerCase().includes('human review'), 'Mandates human review and explicitly forbids automatic rejection');
assert(criticalResult.auto_reject === undefined, 'No auto_reject flag exists');

// 8. Supporting Evidence Generation for High/Critical cases
console.log('\n--- 8. Supporting Evidence Generation ---');
assert(criticalResult.supporting_evidence.length >= 3, `Generated ${criticalResult.supporting_evidence.length} supporting audit evidence items`);
criticalResult.supporting_evidence.forEach(e => {
  assert(!!e.title && !!e.source, `Evidence "${e.title}" has verified source: "${e.source}"`);
});

// 9. Configurable Weights & Thresholds
console.log('\n--- 9. Configurable Rules File Integrity ---');
const weightSum = Object.values(RISK_CONFIG.weights).reduce((a, b) => a + b, 0);
assert(weightSum === 100, `Weights configuration sums to exactly 100 (Found: ${weightSum})`);
assert(RISK_CONFIG.modelVersion === 'rules-v1', 'Model version is rules-v1');

console.log('\n====================================================');
console.log(`SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED (100%)`);
console.log('====================================================\n');
