/**
 * Module 8: Metrics & Evaluation API Service
 */

import { apiClient } from './apiClient.js';

export const metricsApi = {
  getDashboardMetrics: () => apiClient.get('/api/metrics/dashboard'),
  runExperiment: (config) => apiClient.post('/api/metrics/experiments', config),
  getExperimentHistory: () => apiClient.get('/api/metrics/experiments'),
  getDataQuality: () => apiClient.get('/api/metrics/data-quality'),
  saveGroundTruth: (returnId, labelPayload) => apiClient.post(`/api/evaluation/${returnId}/ground-truth`, labelPayload)
};
