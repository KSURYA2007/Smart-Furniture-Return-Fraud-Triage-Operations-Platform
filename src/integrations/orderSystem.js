/**
 * Module 8: External ERP / Order Management System Adapter Stub
 */

export const orderSystem = {
  getOrder: async (orderId) => {
    // Mock response simulating ERP query
    return {
      success: true,
      data: {
        orderId,
        customerId: 'CUS-1024',
        productId: 'PROD-SOFA-01',
        productName: 'Nordic Velvet 3-Seater Recliner',
        orderValue: 45000,
        orderDate: '2024-09-15',
        deliveryDate: '2024-09-20',
        status: 'DELIVERED',
        carrierTrackingNumber: 'TRK-IND-994821',
        paymentMethod: 'CREDIT_CARD'
      },
      meta: { source: 'MOCK_ERP_CONNECTOR' }
    };
  },

  getInventory: async (productId) => {
    return {
      success: true,
      data: {
        productId,
        warehouseStock: 14,
        returnInspectionDepot: 'Bengaluru Central Depot WH-02',
        restockEligibility: true
      }
    };
  }
};
