/**
 * Module 8: Lightweight Authentication & Role-Based Access Control (RBAC)
 */

export const ROLES = {
  REVIEWER: 'REVIEWER',
  DISPATCHER: 'DISPATCHER',
  OPERATIONS_MANAGER: 'OPERATIONS_MANAGER',
  SENIOR_OPERATIONS_MANAGER: 'SENIOR_OPERATIONS_MANAGER',
  EVALUATOR: 'EVALUATOR',
  ADMIN: 'ADMIN'
};

const MOCK_USERS = [
  { id: 'USR-01', name: 'S. Sharma', role: ROLES.DISPATCHER, department: 'Logistics Fleet Operations' },
  { id: 'USR-02', name: 'A. Patel', role: ROLES.REVIEWER, department: 'Return Claims Triage' },
  { id: 'USR-03', name: 'R. Mehta', role: ROLES.OPERATIONS_MANAGER, department: 'Regional Logistics Center' },
  { id: 'USR-04', name: 'V. Sundaram', role: ROLES.SENIOR_OPERATIONS_MANAGER, department: 'Executive Logistics Command' },
  { id: 'USR-05', name: 'Dr. K. Iyer', role: ROLES.EVALUATOR, department: 'Risk Analytics & Audit' },
  { id: 'USR-06', name: 'System Admin', role: ROLES.ADMIN, department: 'IT Infrastructure' }
];

let currentUser = MOCK_USERS[0]; // Default logged-in user: S. Sharma (Dispatcher)

export const authService = {
  getCurrentUser: () => currentUser,
  
  setCurrentUser: (userId) => {
    const found = MOCK_USERS.find(u => u.id === userId);
    if (found) currentUser = found;
    return currentUser;
  },

  getAvailableUsers: () => MOCK_USERS,

  hasRole: (requiredRole) => {
    if (currentUser.role === ROLES.ADMIN) return true;
    return currentUser.role === requiredRole;
  },

  canPerform: (action) => {
    const role = currentUser.role;
    if (role === ROLES.ADMIN) return true;

    switch (action) {
      case 'SUBMIT_REVIEW':
        return [ROLES.REVIEWER, ROLES.OPERATIONS_MANAGER, ROLES.SENIOR_OPERATIONS_MANAGER].includes(role);
      case 'SCHEDULE_PICKUP':
        return [ROLES.DISPATCHER, ROLES.OPERATIONS_MANAGER, ROLES.SENIOR_OPERATIONS_MANAGER].includes(role);
      case 'OVERRIDE_PRIORITY':
        return [ROLES.OPERATIONS_MANAGER, ROLES.SENIOR_OPERATIONS_MANAGER].includes(role);
      case 'MANAGE_GROUND_TRUTH':
      case 'RUN_EXPERIMENT':
        return [ROLES.EVALUATOR, ROLES.SENIOR_OPERATIONS_MANAGER, ROLES.OPERATIONS_MANAGER].includes(role);
      default:
        return true;
    }
  }
};
