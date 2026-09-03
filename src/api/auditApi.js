/**
 * Module 8: Audit Log API Service
 */

import { apiClient } from './apiClient.js';

export const auditApi = {
  getAuditLog: (returnId) => apiClient.get(`/api/audit/${returnId}`),
  recordAuditEvent: (returnId, eventPayload) => apiClient.post(`/api/audit/${returnId}`, eventPayload)
};
