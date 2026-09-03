/**
 * Module 8: Customers API Service
 */

import { apiClient } from './apiClient.js';

export const customersApi = {
  getCustomer: (customerId) => apiClient.get(`/api/customers/${customerId}`),
  getCustomerHistory: (customerId) => apiClient.get(`/api/customers/${customerId}/history`),
  getCustomerOrders: (customerId) => apiClient.get(`/api/customers/${customerId}/orders`)
};
