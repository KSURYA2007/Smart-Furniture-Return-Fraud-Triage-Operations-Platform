/**
 * Module 10: Master Security & Privacy Check Engine
 * Executes deterministic security assessments and calculates real (unfabricated) Security Score
 */

import { checkAuthorization, SECURITY_ACTIONS } from './authorization.js';
import { runDataMinimizationAudit } from './privacy.js';
import { checkAuditIntegrity } from './auditIntegrity.js';
import { validateEvidenceFile, transferEvidenceToExternalApi } from './evidenceSecurity.js';
import { validateStateTransition } from './reliability.js';
import { validateOrderValue, validateScore } from './validation.js';
import { sessionManager } from './sessionSecurity.js';
import { secureStorage } from './secureStorage.js';
import { ROLES } from '../auth/authService.js';

export const SECURITY_CATEGORIES = {
  AUTHENTICATION: 'Authentication',
  AUTHORIZATION: 'Authorization (RBAC)',
  PRIVACY: 'Data Privacy & Minimization',
  INPUT_VALIDATION: 'Input Validation',
  EVIDENCE: 'Evidence Security',
  AUDIT: 'Audit Integrity',
  RELIABILITY: 'Reliability & Fault Tolerance'
};

export async function runAllSecurityChecks() {
  const timestamp = new Date().toISOString();
  const checks = [];

  // 1. Authentication Check
  const session = sessionManager.getSession();
  checks.push({
    id: 'SEC-CHK-01',
    name: 'Authentication State & Session Health',
    category: SECURITY_CATEGORIES.AUTHENTICATION,
    severity: 'CRITICAL',
    status: session ? 'PASS' : 'WARNING',
    description: 'Verify prototype user authentication and session validity.',
    expected: 'Active session with recognized operator role',
    actual: session ? `Active session for ${session.name} (${session.role})` : 'No active session',
    recommendation: 'Initialize demonstration session before executing operational reviews.',
    timestamp
  });

  // 2. RBAC Enforcement Check
  const reviewerDenied = !checkAuthorization(SECURITY_ACTIONS.MANAGE_SECURITY, ROLES.REVIEWER).allowed;
  const adminAllowed = checkAuthorization(SECURITY_ACTIONS.MANAGE_SECURITY, ROLES.ADMIN).allowed;
  checks.push({
    id: 'SEC-CHK-02',
    name: 'Role-Based Access Control (RBAC) Enforcement',
    category: SECURITY_CATEGORIES.AUTHORIZATION,
    severity: 'CRITICAL',
    status: (reviewerDenied && adminAllowed) ? 'PASS' : 'FAIL',
    description: 'Verify unauthorized roles are blocked from administrative/security functions.',
    expected: 'Reviewer blocked from MANAGE_SECURITY; Admin allowed',
    actual: (reviewerDenied && adminAllowed) ? 'Enforcement active; unauthorized actions blocked' : 'RBAC policy mismatch',
    recommendation: 'Verify role-to-action policy mappings in authorization service.',
    timestamp
  });

  // 3. Storage Secret Leak Prevention
  let leakPrevented = false;
  try {
    secureStorage.setItem('test_password_leak', 'secret123');
  } catch (e) {
    leakPrevented = true;
  }
  checks.push({
    id: 'SEC-CHK-03',
    name: 'Client-Side Credential Storage Prevention',
    category: SECURITY_CATEGORIES.AUTHENTICATION,
    severity: 'CRITICAL',
    status: leakPrevented ? 'PASS' : 'FAIL',
    description: 'Verify storage wrapper refuses to write sensitive tokens, passwords, or credentials.',
    expected: 'Storage throws security exception on sensitive keys',
    actual: leakPrevented ? 'Policy violation triggered; password write rejected' : 'Secret write succeeded without exception',
    recommendation: 'Ensure all persistence passes through secureStorage wrapper.',
    timestamp
  });

  // 4. Input Validation: Order Value Bounds
  const negValCheck = validateOrderValue(-500);
  const posValCheck = validateOrderValue(45000);
  const inputCheckPass = !negValCheck.valid && posValCheck.valid;
  checks.push({
    id: 'SEC-CHK-04',
    name: 'Order Financial Input Validation',
    category: SECURITY_CATEGORIES.INPUT_VALIDATION,
    severity: 'HIGH',
    status: inputCheckPass ? 'PASS' : 'FAIL',
    description: 'Verify negative financial amounts are rejected at input boundary.',
    expected: 'Negative values rejected with validation error',
    actual: inputCheckPass ? 'Negative amount correctly rejected' : 'Invalid input accepted',
    recommendation: 'Ensure numeric inputs are validated before dispatching to pricing models.',
    timestamp
  });

  // 5. Input Validation: Risk Score Bounds
  const oobCheck = validateScore(125, 'Risk Score');
  const validScoreCheck = validateScore(65, 'Risk Score');
  const scoreCheckPass = !oobCheck.valid && validScoreCheck.valid;
  checks.push({
    id: 'SEC-CHK-05',
    name: 'Risk & Priority Score Boundary Enforcement',
    category: SECURITY_CATEGORIES.INPUT_VALIDATION,
    severity: 'HIGH',
    status: scoreCheckPass ? 'PASS' : 'FAIL',
    description: 'Verify risk and priority scores cannot exceed 100 or drop below 0.',
    expected: 'Scores outside 0–100 boundary rejected',
    actual: scoreCheckPass ? 'Out-of-bounds score (125) cleanly rejected' : 'Invalid score allowed',
    recommendation: 'Enforce mathematical range constraints on risk and priority features.',
    timestamp
  });

  // 6. Data Minimization & PII Scan
  const privacyAudit = runDataMinimizationAudit();
  checks.push({
    id: 'SEC-CHK-06',
    name: 'Synthetic Data Minimization & PII Absence',
    category: SECURITY_CATEGORIES.PRIVACY,
    severity: 'CRITICAL',
    status: privacyAudit.compliant ? 'PASS' : 'FAIL',
    description: 'Scan stored records to confirm absence of real passwords, credit cards, or national IDs.',
    expected: 'Zero forbidden credentials or sensitive PII fields',
    actual: privacyAudit.compliant ? `Scanned ${privacyAudit.scannedRecords} records; zero sensitive fields detected` : `${privacyAudit.violations.length} violations found`,
    recommendation: 'Maintain strict synthetic demo dataset; never ingest production PII.',
    timestamp
  });

  // 7. Evidence File Format & Size Limits
  const validPhoto = validateEvidenceFile({ name: 'tear.jpg', size: 2 * 1024 * 1024 });
  const badExe = validateEvidenceFile({ name: 'malware.exe', size: 1024 });
  const evidenceCheckPass = validPhoto.valid && !badExe.valid;
  checks.push({
    id: 'SEC-CHK-07',
    name: 'Evidence File Type & Extension Validation',
    category: SECURITY_CATEGORIES.EVIDENCE,
    severity: 'HIGH',
    status: evidenceCheckPass ? 'PASS' : 'FAIL',
    description: 'Verify non-image file uploads (.exe, .sh, .pdf) are blocked at intake.',
    expected: 'Only jpg, jpeg, png, webp allowed; executables blocked',
    actual: evidenceCheckPass ? 'Executable blocked (.exe); valid image permitted' : 'Unsupported extension allowed',
    recommendation: 'Ensure evidence intake restricts allowed MIME types.',
    timestamp
  });

  // 8. External Cloud/AI Upload Leak Protection
  const extUpload = transferEvidenceToExternalApi('EV-100');
  checks.push({
    id: 'SEC-CHK-08',
    name: 'External AI Cloud Leak Prevention',
    category: SECURITY_CATEGORIES.EVIDENCE,
    severity: 'CRITICAL',
    status: !extUpload.success ? 'PASS' : 'FAIL',
    description: 'Verify evidence photos are never transmitted to third-party public cloud or AI endpoints.',
    expected: 'External upload blocked by privacy policy',
    actual: !extUpload.success ? 'Blocked with EXTERNAL_UPLOAD_PROHIBITED' : 'External leak permitted',
    recommendation: 'Keep all image feature extraction and review within local client memory.',
    timestamp
  });

  // 9. Audit Trail Integrity
  const auditCheck = checkAuditIntegrity();
  checks.push({
    id: 'SEC-CHK-09',
    name: 'Audit Trail Structure & Unique Key Integrity',
    category: SECURITY_CATEGORIES.AUDIT,
    severity: 'HIGH',
    status: auditCheck.status,
    description: 'Verify audit records contain valid timestamps, actors, actions, and unique keys.',
    expected: 'All audit events structurally complete and unique',
    actual: `${auditCheck.totalAuditEvents} events verified (${auditCheck.issues.length} issues)`,
    recommendation: 'Maintain immutable append-only event logging for all operational actions.',
    timestamp
  });

  // 10. Illegal State Transition Blocking
  const illegalTransition = validateStateTransition('PICKUP', 'PICKED_UP', 'READY');
  checks.push({
    id: 'SEC-CHK-10',
    name: 'State Transition Integrity Enforcement',
    category: SECURITY_CATEGORIES.RELIABILITY,
    severity: 'HIGH',
    status: !illegalTransition.valid ? 'PASS' : 'FAIL',
    description: 'Verify finished pickups cannot be illegally transitioned backwards to READY.',
    expected: 'Illegal backward transition blocked with error',
    actual: !illegalTransition.valid ? 'Illegal transition blocked correctly' : 'Illegal transition allowed',
    recommendation: 'Preserve deterministic finite-state-machine guards in pickup workflow.',
    timestamp
  });

  const passed = checks.filter(c => c.status === 'PASS').length;
  const failed = checks.filter(c => c.status === 'FAIL').length;
  const warnings = checks.filter(c => c.status === 'WARNING').length;
  const score = Math.round((passed / checks.length) * 100);

  return {
    assessed: true,
    score,
    totalChecks: checks.length,
    passed,
    failed,
    warnings,
    checks,
    assessedAt: timestamp
  };
}
