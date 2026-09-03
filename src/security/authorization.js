/**
 * Module 10: Role-Based Authorization Engine
 * Integrates with M8 authService to enforce strict operational permissions
 */

import { authService, ROLES } from '../auth/authService.js';

export const SECURITY_ACTIONS = {
  VIEW_RETURNS: 'VIEW_RETURNS',
  VIEW_EVIDENCE: 'VIEW_EVIDENCE',
  SUBMIT_REVIEW: 'SUBMIT_REVIEW',
  OVERRIDE_REVIEW: 'OVERRIDE_REVIEW',
  SCHEDULE_PICKUP: 'SCHEDULE_PICKUP',
  OVERRIDE_PRIORITY: 'OVERRIDE_PRIORITY',
  MANAGE_GROUND_TRUTH: 'MANAGE_GROUND_TRUTH',
  RUN_EXPERIMENT: 'RUN_EXPERIMENT',
  VIEW_AUDIT_LOG: 'VIEW_AUDIT_LOG',
  MANAGE_SECURITY: 'MANAGE_SECURITY',
  MANAGE_CONFIGURATION: 'MANAGE_CONFIGURATION',
  RUN_SECURITY_CHECKS: 'RUN_SECURITY_CHECKS'
};

const ACTION_POLICIES = {
  [SECURITY_ACTIONS.VIEW_RETURNS]: [ROLES.REVIEWER, ROLES.DISPATCHER, ROLES.OPERATIONS_MANAGER, ROLES.SENIOR_OPERATIONS_MANAGER, ROLES.EVALUATOR, ROLES.ADMIN],
  [SECURITY_ACTIONS.VIEW_EVIDENCE]: [ROLES.REVIEWER, ROLES.DISPATCHER, ROLES.OPERATIONS_MANAGER, ROLES.SENIOR_OPERATIONS_MANAGER, ROLES.EVALUATOR, ROLES.ADMIN],
  [SECURITY_ACTIONS.SUBMIT_REVIEW]: [ROLES.REVIEWER, ROLES.OPERATIONS_MANAGER, ROLES.SENIOR_OPERATIONS_MANAGER, ROLES.ADMIN],
  [SECURITY_ACTIONS.OVERRIDE_REVIEW]: [ROLES.OPERATIONS_MANAGER, ROLES.SENIOR_OPERATIONS_MANAGER, ROLES.ADMIN],
  [SECURITY_ACTIONS.SCHEDULE_PICKUP]: [ROLES.DISPATCHER, ROLES.OPERATIONS_MANAGER, ROLES.SENIOR_OPERATIONS_MANAGER, ROLES.ADMIN],
  [SECURITY_ACTIONS.OVERRIDE_PRIORITY]: [ROLES.OPERATIONS_MANAGER, ROLES.SENIOR_OPERATIONS_MANAGER, ROLES.ADMIN],
  [SECURITY_ACTIONS.MANAGE_GROUND_TRUTH]: [ROLES.EVALUATOR, ROLES.OPERATIONS_MANAGER, ROLES.SENIOR_OPERATIONS_MANAGER, ROLES.ADMIN],
  [SECURITY_ACTIONS.RUN_EXPERIMENT]: [ROLES.EVALUATOR, ROLES.OPERATIONS_MANAGER, ROLES.SENIOR_OPERATIONS_MANAGER, ROLES.ADMIN],
  [SECURITY_ACTIONS.VIEW_AUDIT_LOG]: [ROLES.REVIEWER, ROLES.DISPATCHER, ROLES.OPERATIONS_MANAGER, ROLES.SENIOR_OPERATIONS_MANAGER, ROLES.EVALUATOR, ROLES.ADMIN],
  [SECURITY_ACTIONS.MANAGE_SECURITY]: [ROLES.ADMIN],
  [SECURITY_ACTIONS.MANAGE_CONFIGURATION]: [ROLES.ADMIN],
  [SECURITY_ACTIONS.RUN_SECURITY_CHECKS]: [ROLES.ADMIN, ROLES.OPERATIONS_MANAGER, ROLES.SENIOR_OPERATIONS_MANAGER]
};

export function checkAuthorization(action, roleOverride = null) {
  const currentRole = roleOverride || authService.getCurrentUser()?.role || ROLES.REVIEWER;
  const allowedRoles = ACTION_POLICIES[action] || [];
  const allowed = allowedRoles.includes(currentRole) || currentRole === ROLES.ADMIN;

  return {
    allowed,
    action,
    role: currentRole,
    reason: allowed 
      ? `Role "${currentRole}" is authorized for "${action}".`
      : `Access Denied: Action "${action}" requires elevated role (${allowedRoles.join(', ')}). Active role is "${currentRole}".`
  };
}

export function enforceAuthorization(action) {
  const check = checkAuthorization(action);
  if (!check.allowed) {
    const error = new Error(check.reason);
    error.code = 'FORBIDDEN';
    error.status = 403;
    throw error;
  }
  return true;
}

export function getAuthorizationMatrix() {
  const allRoles = [
    ROLES.REVIEWER,
    ROLES.DISPATCHER,
    ROLES.OPERATIONS_MANAGER,
    ROLES.SENIOR_OPERATIONS_MANAGER,
    ROLES.EVALUATOR,
    ROLES.ADMIN
  ];

  const matrix = Object.keys(SECURITY_ACTIONS).map(action => {
    const permissions = {};
    allRoles.forEach(role => {
      permissions[role] = checkAuthorization(action, role).allowed;
    });
    return {
      action,
      permissions
    };
  });

  return { roles: allRoles, matrix };
}
