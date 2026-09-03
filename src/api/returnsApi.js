/**
 * Module 8: Returns API Service
 */

import { apiClient } from './apiClient.js';

export const returnsApi = {
  getReturns: () => apiClient.get('/api/returns'),
  getReturnById: (returnId) => apiClient.get(`/api/returns/${returnId}`),
  createReturn: (data) => apiClient.post('/api/returns', data),
  getReturnStatus: (returnId) => apiClient.get(`/api/returns/${returnId}/status`)
};
