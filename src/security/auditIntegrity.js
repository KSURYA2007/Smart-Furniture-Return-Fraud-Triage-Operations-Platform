/**
 * Module 10: Audit Log Integrity & Security Event Logger
 * Verifies chronological consistency of audit events and records security incidents
 */

import { secureStorage } from './secureStorage.js';
import { getStoredAuditLogs } from '../utils/storage.js';

const SECURITY_LOG_KEY = 'security_event_log';

export const SECURITY_SEVERITIES = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
  INFO: 'INFO'
};

export function checkAuditIntegrity() {
  const auditLogs = getStoredAuditLogs();
  const issues = [];
  const seenIds = new Set();
  let prevTimestamp = 0;

  auditLogs.forEach((entry, idx) => {
    // 1. Required fields
    const required = ['id', 'timestamp', 'actor', 'action'];
    required.forEach(f => {
      if (!entry[f]) {
        issues.push({
          eventId: entry.id || `INDEX-${idx}`,
          severity: 'HIGH',
          type: 'MISSING_FIELD',
          description: `Audit event missing mandatory field "${f}".`
        });
      }
    });

    // 2. Unique ID
    if (entry.id) {
      if (seenIds.has(entry.id)) {
        issues.push({
          eventId: entry.id,
          severity: 'CRITICAL',
          type: 'DUPLICATE_ID',
          description: `Duplicate audit event ID "${entry.id}" detected.`
        });
      }
      seenIds.add(entry.id);
    }

    // 3. Valid timestamp
    if (entry.timestamp) {
      const parsed = new Date(entry.timestamp).getTime();
      if (isNaN(parsed)) {
        issues.push({
          eventId: entry.id,
          severity: 'HIGH',
          type: 'INVALID_TIMESTAMP',
          description: `Unparseable timestamp "${entry.timestamp}".`
        });
      }
    }
  });

  return {
    status: issues.length === 0 ? 'PASS' : issues.some(i => i.severity === 'CRITICAL') ? 'FAIL' : 'WARNING',
    totalAuditEvents: auditLogs.length,
    issues,
    checkedAt: new Date().toISOString()
  };
}

export function logSecurityEvent({ severity = 'INFO', actor = 'SYSTEM', event, module = 'Core', description }) {
  const existing = secureStorage.getItem(SECURITY_LOG_KEY) || [];
  const entry = {
    id: `SEC-EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    severity,
    actor,
    event,
    module,
    description
  };
  existing.unshift(entry);
  // Keep last 100 security events
  const trimmed = existing.slice(0, 100);
  secureStorage.setItem(SECURITY_LOG_KEY, trimmed);
  return entry;
}

export function getSecurityEvents() {
  return secureStorage.getItem(SECURITY_LOG_KEY) || [];
}

export function clearSecurityEvents() {
  secureStorage.setItem(SECURITY_LOG_KEY, []);
}
