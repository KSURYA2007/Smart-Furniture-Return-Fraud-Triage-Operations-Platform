/**
 * Module 8: Triage API Service
 */

import { apiClient } from './apiClient.js';

export const triageApi = {
  getTriage: (returnId) => apiClient.get(`/api/returns/${returnId}/triage`),
  getRiskRules: () => apiClient.get('/api/triage/rules')
};
