/**
 * Module 10: Input Validation & Sanitization Engine
 * Protects against malformed data, dangerous script injection, and out-of-range parameters
 */

export const ALLOWED_REVIEW_DECISIONS = ['APPROVE_PICKUP', 'REJECT_RETURN', 'REQUEST_MORE_EVIDENCE', 'ESCALATE'];
export const ALLOWED_GROUND_TRUTHS = ['LEGITIMATE', 'FRAUD_CONFIRMED', 'UNKNOWN'];
export const ALLOWED_EVIDENCE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

export function sanitizeString(val) {
  if (typeof val !== 'string') return '';
  return val
    .replace(/[<>]/g, '') // Strip basic HTML tags
    .trim();
}

export function validateReturnId(id) {
  if (!id || typeof id !== 'string') {
    return { valid: false, error: 'Return ID must be a non-empty string.' };
  }
  const clean = sanitizeString(id);
  if (!/^RET-[\w-]+$/i.test(clean)) {
    return { valid: false, error: 'Invalid Return ID format. Expected prefix "RET-".' };
  }
  return { valid: true, sanitized: clean };
}

export function validateCustomerId(id) {
  if (!id || typeof id !== 'string') {
    return { valid: false, error: 'Customer ID must be a non-empty string.' };
  }
  const clean = sanitizeString(id);
  if (!/^CUS-[\w-]+$/i.test(clean)) {
    return { valid: false, error: 'Invalid Customer ID format. Expected prefix "CUS-".' };
  }
  return { valid: true, sanitized: clean };
}

export function validateOrderValue(val) {
  const num = Number(val);
  if (isNaN(num)) {
    return { valid: false, error: 'Order value must be a valid numeric amount.' };
  }
  if (num < 0) {
    return { valid: false, error: 'Order value cannot be negative.' };
  }
  if (num > 10000000) {
    return { valid: false, error: 'Order value exceeds maximum allowable threshold (₹10,000,000).' };
  }
  return { valid: true, sanitized: Math.round(num * 100) / 100 };
}

export function validateScore(val, fieldName = 'Score') {
  const num = Number(val);
  if (isNaN(num)) {
    return { valid: false, error: `${fieldName} must be a number.` };
  }
  if (num < 0 || num > 100) {
    return { valid: false, error: `${fieldName} must be bounded between 0 and 100.` };
  }
  return { valid: true, sanitized: Math.round(num) };
}

export function validateDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') {
    return { valid: false, error: 'Date must be provided as a string.' };
  }
  const parsed = Date.parse(dateStr);
  if (isNaN(parsed)) {
    return { valid: false, error: 'Invalid date format. Expected standard ISO or YYYY-MM-DD format.' };
  }
  return { valid: true, sanitized: new Date(parsed).toISOString() };
}

export function validateReviewDecision(decision) {
  if (!decision || !ALLOWED_REVIEW_DECISIONS.includes(decision)) {
    return { 
      valid: false, 
      error: `Invalid review decision. Allowed values: ${ALLOWED_REVIEW_DECISIONS.join(', ')}` 
    };
  }
  return { valid: true, sanitized: decision };
}

export function validateGroundTruth(gt) {
  if (!gt || !ALLOWED_GROUND_TRUTHS.includes(gt)) {
    return { 
      valid: false, 
      error: `Invalid ground truth label. Allowed values: ${ALLOWED_GROUND_TRUTHS.join(', ')}` 
    };
  }
  return { valid: true, sanitized: gt };
}

export function validateEvidenceFilename(filename) {
  if (!filename || typeof filename !== 'string') {
    return { valid: false, error: 'Evidence filename is required.' };
  }
  const parts = filename.split('.');
  const ext = parts[parts.length - 1]?.toLowerCase();
  if (!ALLOWED_EVIDENCE_EXTENSIONS.includes(ext)) {
    return { 
      valid: false, 
      error: `Unsupported evidence file type ".${ext}". Allowed extensions: ${ALLOWED_EVIDENCE_EXTENSIONS.join(', ')}` 
    };
  }
  return { valid: true, extension: ext, sanitized: sanitizeString(filename) };
}

export function validateEvidenceSize(bytes, maxBytes = 15 * 1024 * 1024) {
  const num = Number(bytes);
  if (isNaN(num) || num <= 0) {
    return { valid: false, error: 'Invalid file size.' };
  }
  if (num > maxBytes) {
    return { 
      valid: false, 
      error: `Evidence file size (${(num / (1024 * 1024)).toFixed(1)}MB) exceeds maximum limit (${maxBytes / (1024 * 1024)}MB).` 
    };
  }
  return { valid: true, bytes: num };
}
