/**
 * Module 8: External Fleet & Carrier Logistics Adapter Stub
 */

export const logisticsSystem = {
  createPickupRequest: async (dispatchPayload) => {
    return {
      success: true,
      data: {
        consignmentId: `CNS-${Date.now().toString().slice(-6)}`,
        status: 'DISPATCH_COMMITTED',
        assignedDriver: dispatchPayload.driver?.name || 'Assigned Carrier Driver',
        estimatedPickupWindow: dispatchPayload.timeSlot || '09:00 AM – 12:00 PM',
        trackingUrl: 'https://carrier.furnilogistics.internal/track/mock'
      },
      meta: { channel: 'MOCK_FLEET_TELEMATICS' }
    };
  },

  getPickupStatus: async (consignmentId) => {
    return {
      success: true,
      data: {
        consignmentId,
        transitStatus: 'IN_ROUTE',
        gpsCoordinates: { lat: 12.9716, lng: 77.5946 },
        lastMilestone: 'Driver en route to pickup address'
      }
    };
  },

  cancelPickup: async (consignmentId) => {
    return {
      success: true,
      data: {
        consignmentId,
        cancelled: true,
        reason: 'Customer initiated cancellation'
      }
    };
  }
};
