/**
 * Module 10: Data Privacy & Classification Service
 * Enforces data minimization, labels data sensitivity, and verifies no real PII/credentials exist
 */

import { getAllReturns } from '../utils/storage.js';

export const DATA_CLASSIFICATIONS = {
  PUBLIC: {
    level: 'PUBLIC',
    color: 'emerald',
    description: 'General product specifications and standard return policy guidelines.'
  },
  INTERNAL: {
    level: 'INTERNAL',
    color: 'blue',
    description: 'Internal operational routing, route clusters, return IDs, and order dates.'
  },
  CONFIDENTIAL: {
    level: 'CONFIDENTIAL',
    color: 'amber',
    description: 'Customer order values, historical return frequency, and 6-factor fraud risk scores.'
  },
  SENSITIVE: {
    level: 'SENSITIVE',
    color: 'red',
    description: 'Customer-submitted photographic evidence, damage classification tags, and session tokens.'
  }
};

export const FIELD_CLASSIFICATIONS = {
  'product.name': DATA_CLASSIFICATIONS.PUBLIC,
  'product.category': DATA_CLASSIFICATIONS.PUBLIC,
  'return.return_id': DATA_CLASSIFICATIONS.INTERNAL,
  'pickup.city': DATA_CLASSIFICATIONS.INTERNAL,
  'pickup.area_cluster': DATA_CLASSIFICATIONS.INTERNAL,
  'order.price': DATA_CLASSIFICATIONS.CONFIDENTIAL,
  'customer.return_rate': DATA_CLASSIFICATIONS.CONFIDENTIAL,
  'triage.risk_score': DATA_CLASSIFICATIONS.CONFIDENTIAL,
  'evidence.photos': DATA_CLASSIFICATIONS.SENSITIVE,
  'evidence.damage_tags': DATA_CLASSIFICATIONS.SENSITIVE
};

const STRICT_FORBIDDEN_PII_FIELDS = [
  'password',
  'credit_card',
  'cvv',
  'bank_account',
  'routing_number',
  'ssn',
  'national_id',
  'passport',
  'auth_secret'
];

export function runDataMinimizationAudit() {
  const returns = getAllReturns();
  const violations = [];
  let scannedRecords = 0;

  returns.forEach(r => {
    scannedRecords++;
    const flatKeys = Object.keys(r);
    
    // Check top level and nested order/customer keys
    const allKeys = [
      ...flatKeys,
      ...Object.keys(r.order || {}),
      ...Object.keys(r.customer || {})
    ];

    allKeys.forEach(k => {
      const lower = k.toLowerCase();
      if (STRICT_FORBIDDEN_PII_FIELDS.some(f => lower.includes(f))) {
        violations.push({
          returnId: r.return_id,
          field: k,
          severity: 'CRITICAL',
          issue: `Detected forbidden PII/credential field "${k}" in return store.`
        });
      }
    });
  });

  return {
    compliant: violations.length === 0,
    scannedRecords,
    violations,
    demoEnvironmentNotice: 'DEMO ENVIRONMENT: All records are synthetic demonstrations. No real customer PII or payment credentials are stored.',
    dataRetentionPolicy: 'In-memory / LocalStorage retention only. Cleared upon demo state reset.'
  };
}
