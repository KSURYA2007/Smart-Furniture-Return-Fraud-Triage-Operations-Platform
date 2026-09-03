/**
 * Module 8: Human Reviews API Service
 */

import { apiClient } from './apiClient.js';

export const reviewsApi = {
  getReviewQueue: () => apiClient.get('/api/reviews'),
  getReview: (returnId) => apiClient.get(`/api/reviews/${returnId}`),
  submitReview: (returnId, decisionPayload) => apiClient.post(`/api/reviews/${returnId}/decision`, decisionPayload)
};
