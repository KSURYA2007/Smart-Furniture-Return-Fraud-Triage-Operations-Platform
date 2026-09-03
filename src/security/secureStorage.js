/**
 * Module 10: Secure Storage Wrapper
 * Handles quota limits, malformed JSON recovery, and forbids storing secrets or credentials
 */

const memoryFallback = {};

// Forbidden sensitive keys to prevent credential leaks (Section 28)
const FORBIDDEN_SECRET_PATTERNS = [
  /password/i,
  /secret/i,
  /private_key/i,
  /token/i,
  /credit_card/i,
  /cvv/i,
  /ssn/i,
  /pin/i
];

export const secureStorage = {
  getItem: (key) => {
    try {
      if (typeof localStorage !== 'undefined' && localStorage) {
        const item = localStorage.getItem(key);
        if (!item) return null;
        try {
          return JSON.parse(item);
        } catch {
          return item; // Raw string if not JSON
        }
      }
    } catch (e) {
      console.warn(`[SecureStorage] Error reading "${key}":`, e);
    }
    return memoryFallback[key] || null;
  },

  setItem: (key, value) => {
    // 1. Guard against secret leakage
    for (const pattern of FORBIDDEN_SECRET_PATTERNS) {
      if (pattern.test(key)) {
        console.error(`[SecureStorage] SECURITY VIOLATION: Attempted to store sensitive credential "${key}" in local storage.`);
        throw new Error(`Security Policy Violation: Storing "${key}" in client storage is prohibited.`);
      }
    }

    const serialized = typeof value === 'string' ? value : JSON.stringify(value);

    try {
      if (typeof localStorage !== 'undefined' && localStorage) {
        localStorage.setItem(key, serialized);
        return true;
      }
    } catch (e) {
      console.warn(`[SecureStorage] Quota exceeded or storage unavailable for "${key}". Falling back to memory store:`, e);
    }

    memoryFallback[key] = value;
    return true;
  },

  removeItem: (key) => {
    try {
      if (typeof localStorage !== 'undefined' && localStorage) {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn(`[SecureStorage] Error removing "${key}":`, e);
    }
    delete memoryFallback[key];
    return true;
  },

  clearNonEssential: () => {
    // Keeps core data, clears temporary sessions or logs
    try {
      if (typeof localStorage !== 'undefined' && localStorage) {
        localStorage.removeItem('active_prototype_session');
        localStorage.removeItem('security_event_log');
      }
    } catch (e) {}
    delete memoryFallback['active_prototype_session'];
    delete memoryFallback['security_event_log'];
    return true;
  }
};
