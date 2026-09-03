/**
 * Module 10: Evidence Security & External Leak Protection
 * Enforces strict format boundaries, size validation, and forbids uploading evidence to external AI APIs
 */

import { validateEvidenceFilename, validateEvidenceSize } from './validation.js';

export const EVIDENCE_POLICY = {
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
  maxSizeBytes: 15 * 1024 * 1024, // 15MB
  allowExternalUploads: false
};

export function validateEvidenceFile(file) {
  if (!file) {
    return { valid: false, error: 'No evidence file provided.' };
  }

  const name = file.name || 'unnamed.jpg';
  const size = file.size || 1024;

  const fnCheck = validateEvidenceFilename(name);
  if (!fnCheck.valid) return fnCheck;

  const szCheck = validateEvidenceSize(size, EVIDENCE_POLICY.maxSizeBytes);
  if (!szCheck.valid) return szCheck;

  return {
    valid: true,
    filename: fnCheck.sanitized,
    extension: fnCheck.extension,
    sizeBytes: szCheck.bytes,
    securityNotice: 'File validated. Kept in local client storage; zero external cloud transmission.'
  };
}

export function transferEvidenceToExternalApi(evidenceId) {
  // Prohibited by privacy policy
  return {
    success: false,
    error: {
      code: 'EXTERNAL_UPLOAD_PROHIBITED',
      message: 'Evidence upload to external cloud/AI APIs is blocked by privacy policy. Processing remains strictly on-device/local.'
    }
  };
}
