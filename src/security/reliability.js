/**
 * Module 10: System Reliability, State Transition Guards, Retry & Rate Limiter
 * Implements fault tolerance, sliding window rate-limiting, and idempotency protection
 */

import { checkSystemHealth } from '../testing/systemHealth.js';

// Idempotency cache for duplicate request prevention (Section 21)
const idempotencyStore = new Map();

// Rate limiter state (Section 26)
let rateLimitMaxPerMinute = 30;
const rateLimitWindow = [];

export const ALLOWED_REVIEW_TRANSITIONS = {
  'PENDING': ['IN_REVIEW', 'APPROVED', 'REJECTED', 'REQUEST_MORE_EVIDENCE', 'ESCALATED'],
  'IN_REVIEW': ['APPROVED', 'REJECTED', 'REQUEST_MORE_EVIDENCE', 'ESCALATED'],
  'REQUEST_MORE_EVIDENCE': ['IN_REVIEW', 'APPROVED', 'REJECTED'],
  'ESCALATED': ['IN_REVIEW', 'APPROVED', 'REJECTED'],
  'APPROVED': ['APPROVED'], // Terminal unless re-audited
  'REJECTED': ['REJECTED']  // Terminal
};

export const ALLOWED_PICKUP_TRANSITIONS = {
  'READY': ['SCHEDULED'],
  'SCHEDULED': ['PICKED_UP', 'CANCELLED'],
  'PICKED_UP': ['PICKED_UP'], // Terminal: cannot transition backwards
  'CANCELLED': ['READY', 'SCHEDULED']
};

export function validateStateTransition(entityType, fromState, toState) {
  const transitions = entityType === 'PICKUP' ? ALLOWED_PICKUP_TRANSITIONS : ALLOWED_REVIEW_TRANSITIONS;
  const allowedNext = transitions[fromState] || [];
  
  if (!allowedNext.includes(toState)) {
    return {
      valid: false,
      error: `Illegal state transition for ${entityType}: Cannot transition from "${fromState}" to "${toState}".`
    };
  }
  return { valid: true };
}

export function checkIdempotency(actionKey) {
  const now = Date.now();
  const existing = idempotencyStore.get(actionKey);
  
  if (existing && (now - existing.timestamp) < 60000) { // 60-second duplicate lock
    return {
      isDuplicate: true,
      error: 'This action has already been processed within the last 60 seconds.'
    };
  }

  idempotencyStore.set(actionKey, { timestamp: now });
  return { isDuplicate: false };
}

export async function retryWithBackoff(asyncFn, maxAttempts = 3, initialDelayMs = 50) {
  let attempt = 0;
  let delay = initialDelayMs;

  while (attempt < maxAttempts) {
    try {
      attempt++;
      return await asyncFn();
    } catch (err) {
      if (attempt >= maxAttempts) {
        throw err;
      }
      await new Promise(r => setTimeout(r, delay));
      delay *= 2; // Exponential backoff
    }
  }
}

export function simulateRateLimit() {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;
  
  // Clear old timestamps
  while (rateLimitWindow.length > 0 && rateLimitWindow[0] < oneMinuteAgo) {
    rateLimitWindow.shift();
  }

  if (rateLimitWindow.length >= rateLimitMaxPerMinute) {
    return {
      allowed: false,
      status: 429,
      error: 'RATE_LIMITED: Too many requests in this minute window. Prototype mock security control active.'
    };
  }

  rateLimitWindow.push(now);
  return {
    allowed: true,
    remaining: rateLimitMaxPerMinute - rateLimitWindow.length,
    limit: rateLimitMaxPerMinute
  };
}

export function setRateLimitMax(limit) {
  rateLimitMaxPerMinute = Math.max(5, limit);
}

export function getRateLimitMax() {
  return rateLimitMaxPerMinute;
}

export async function getReliabilityStatus() {
  const health = await checkSystemHealth();
  return {
    overallStatus: health.overallStatus,
    apiAvailability: '100% (Local Dispatcher)',
    storageStatus: 'NORMAL',
    lastHealthCheck: new Date().toISOString(),
    subsystems: health.components
  };
}
