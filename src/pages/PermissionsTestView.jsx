import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  UserCheck, 
  Users, 
  Activity, 
  Play, 
  Sliders, 
  Layers, 
  FileText 
} from 'lucide-react';
import { authService, ROLES } from '../auth/authService.js';

export default function PermissionsTestView({
  onNavigateDashboard,
  onNavigateEndToEnd,
  onNavigateEdgeCases,
  onNavigateDataQuality,
  onNavigateConsistency,
  onNavigateReport
}) {
  const users = authService.getAvailableUsers();
  const [selectedUserId, setSelectedUserId] = useState(users[0].id);

  const currentUser = users.find(u => u.id === selectedUserId) || users[0];

  const actions = [
    { id: 'VIEW_RETURNS', label: 'View Return Claim Queues', expectedAllowed: true },
    { id: 'SUBMIT_REVIEW', label: 'Submit Human Review Decision (M5)', expectedRoles: [ROLES.REVIEWER, ROLES.OPERATIONS_MANAGER, ROLES.SENIOR_OPERATIONS_MANAGER, ROLES.ADMIN] },
    { id: 'SCHEDULE_PICKUP', label: 'Schedule Driver & Vehicle Dispatch (M6)', expectedRoles: [ROLES.DISPATCHER, ROLES.OPERATIONS_MANAGER, ROLES.SENIOR_OPERATIONS_MANAGER, ROLES.ADMIN] },
    { id: 'OVERRIDE_PRIORITY', label: 'Override Pickup Priority Score (M6)', expectedRoles: [ROLES.OPERATIONS_MANAGER, ROLES.SENIOR_OPERATIONS_MANAGER, ROLES.ADMIN] },
    { id: 'MANAGE_GROUND_TRUTH', label: 'Assign Ground Truth Evaluation Label (M7)', expectedRoles: [ROLES.EVALUATOR, ROLES.SENIOR_OPERATIONS_MANAGER, ROLES.OPERATIONS_MANAGER, ROLES.ADMIN] },
    { id: 'RUN_EXPERIMENT', label: 'Execute Baseline Simulation Experiment (M7)', expectedRoles: [ROLES.EVALUATOR, ROLES.SENIOR_OPERATIONS_MANAGER, ROLES.OPERATIONS_MANAGER, ROLES.ADMIN] },
    { id: 'VIEW_AUDIT_LOG', label: 'Read Chronological Audit Log (M8)', expectedAllowed: true }
  ];

  return (
    <div className="page-wrapper permissions-test-page">
      {/* Sub-Navigation Bar */}
      <div className="metrics-subnav-bar flex items-center justify-between flex-wrap gap-2 mb-4 p-2 rounded bg-surface border border-subtle">
        <div className="flex items-center gap-1 flex-wrap">
          {onNavigateDashboard && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateDashboard}>
              <Activity size={13} /> Dashboard
            </button>
          )}
          {onNavigateEndToEnd && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateEndToEnd}>
              <Play size={13} /> End-to-End Pipeline
            </button>
          )}
          {onNavigateEdgeCases && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateEdgeCases}>
              <Sliders size={13} /> 18 Edge Cases
            </button>
          )}
          {onNavigateDataQuality && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateDataQuality}>
              <Layers size={13} /> Data Quality
            </button>
          )}
          {onNavigateConsistency && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateConsistency}>
              <ShieldCheck size={13} /> Consistency
            </button>
          )}
          <button type="button" className="btn-primary btn-xs flex items-center gap-1">
            <CheckCircle2 size={13} /> Permissions (RBAC)
          </button>
          {onNavigateReport && (
            <button type="button" className="btn-ghost btn-xs flex items-center gap-1" onClick={onNavigateReport}>
              <FileText size={13} /> Test Report
            </button>
          )}
        </div>
      </div>

      {/* Hero Header */}
      <header className="page-header perm-header mb-4">
        <div className="header-container">
          <div className="header-badge-row">
            <span className="module-badge">
              <CheckCircle2 size={13} /> Module 9: Role-Based Access Control (RBAC) Verification
            </span>
          </div>
          <h1 className="page-title font-serif">Role Permissions & Authorization Matrix</h1>
          <p className="page-description">
            Verify permission boundaries across Reviewer, Dispatcher, Operations Manager, Senior Manager, Evaluator, and Admin roles.
          </p>
        </div>
      </header>

      {/* Role Selection Toolbar */}
      <div className="form-card mb-4 p-3 text-xs">
        <span className="text-dim text-3xs uppercase font-bold block mb-2">Simulate Active User Role:</span>
        <div className="flex items-center gap-2 flex-wrap">
          {users.map(u => (
            <button
              key={u.id}
              type="button"
              className={`btn-xs flex items-center gap-1.5 ${
                selectedUserId === u.id ? 'btn-primary' : 'btn-ghost'
              }`}
              onClick={() => {
                authService.setCurrentUser(u.id);
                setSelectedUserId(u.id);
              }}
            >
              <UserCheck size={12} />
              <span>{u.name} ({u.role})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Permission Verification Table */}
      <div className="form-card mb-4">
        <div className="card-header border-bottom pb-2 mb-3">
          <div className="flex items-center justify-between">
            <h3 className="card-title text-base">
              Authorization Matrix for {currentUser.name} &bull; <span className="font-mono text-primary">{currentUser.role}</span>
            </h3>
            <span className="text-dim text-xs">{currentUser.department}</span>
          </div>
        </div>

        <div className="pickup-table-wrapper">
          <table className="pickup-queue-table text-xs">
            <thead>
              <tr>
                <th>Operational Action</th>
                <th>Required Role Criteria</th>
                <th className="text-center">Expected Permission</th>
                <th className="text-center">Actual System Check</th>
                <th className="text-right">Policy Status</th>
              </tr>
            </thead>
            <tbody>
              {actions.map(act => {
                // Test permission against authService
                authService.setCurrentUser(currentUser.id);
                const actualAllowed = authService.canPerform(act.id);
                const expectedAllowed = act.expectedAllowed || act.expectedRoles.includes(currentUser.role) || currentUser.role === ROLES.ADMIN;
                const matches = actualAllowed === expectedAllowed;

                return (
                  <tr key={act.id}>
                    <td className="font-medium text-secondary">{act.label}</td>
                    <td className="text-dim font-mono text-3xs">
                      {act.expectedAllowed ? 'ALL_ROLES' : act.expectedRoles.join(', ')}
                    </td>
                    <td className="text-center">
                      <span className={`priority-pill font-mono font-bold text-3xs ${
                        expectedAllowed ? 'badge-risk-low' : 'badge-risk-critical'
                      }`}>
                        {expectedAllowed ? 'ALLOWED' : 'FORBIDDEN'}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className={`priority-pill font-mono font-bold text-3xs ${
                        actualAllowed ? 'badge-risk-low' : 'badge-risk-critical'
                      }`}>
                        {actualAllowed ? 'ALLOWED' : 'FORBIDDEN'}
                      </span>
                    </td>
                    <td className="text-right">
                      {matches ? (
                        <span className="badge-sla-on-track font-bold text-3xs inline-flex items-center gap-1">
                          <CheckCircle2 size={11} /> PASS
                        </span>
                      ) : (
                        <span className="badge-risk-critical font-bold text-3xs inline-flex items-center gap-1">
                          <XCircle size={11} /> VIOLATION
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
