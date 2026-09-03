/**
 * Module 8: Pickup Operations API Service
 */

import { apiClient } from './apiClient.js';

export const pickupsApi = {
  getPickupQueue: () => apiClient.get('/api/pickups'),
  schedulePickup: (returnId, schedulePayload) => apiClient.post(`/api/pickups/${returnId}/schedule`, schedulePayload),
  updatePickupStatus: (returnId, status) => apiClient.patch(`/api/pickups/${returnId}/status`, { status }),
  overridePickupPriority: (returnId, overridePayload) => apiClient.post(`/api/pickups/${returnId}/priority-override`, overridePayload),
  getPickupBatches: () => apiClient.get('/api/pickup-batches')
};
