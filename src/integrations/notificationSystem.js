/**
 * Module 8: Customer & Dispatch Notification Adapter Stub
 */

export const notificationSystem = {
  sendPickupConfirmation: async (returnId, customerPhone, timeSlot) => {
    return {
      success: true,
      data: {
        notificationId: `NOTIF-${Date.now()}`,
        channel: 'SMS_AND_WHATSAPP',
        recipient: customerPhone || '+91 98451 00000',
        message: `Your furniture return pickup for ${returnId} is scheduled for ${timeSlot}. Our two-person crew will inspect and collect the item.`,
        sentAt: new Date().toISOString()
      }
    };
  },

  sendEvidenceRequest: async (returnId, missingItems = []) => {
    return {
      success: true,
      data: {
        notificationId: `NOTIF-${Date.now()}`,
        channel: 'EMAIL',
        subject: `Additional Evidence Needed for Return ${returnId}`,
        itemsRequested: missingItems,
        sentAt: new Date().toISOString()
      }
    };
  },

  sendReviewUpdate: async (returnId, decision) => {
    return {
      success: true,
      data: {
        notificationId: `NOTIF-${Date.now()}`,
        channel: 'CUSTOMER_PORTAL_PUSH',
        status: decision,
        sentAt: new Date().toISOString()
      }
    };
  }
};
