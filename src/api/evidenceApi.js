/**
 * Module 8: Evidence API Service
 */

import { apiClient } from './apiClient.js';

export const evidenceApi = {
  getEvidence: (returnId) => apiClient.get(`/api/returns/${returnId}/evidence`),
  uploadEvidence: (returnId, payload) => apiClient.post(`/api/returns/${returnId}/evidence`, payload)
};
