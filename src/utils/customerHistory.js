/**
 * Customer Historical Statistics Utility for Module 2
 * Computes factual metrics and summaries for a customer based on orders and returns.
 * 
 * IMPORTANT: This utility only calculates factual historical metrics.
 * It does NOT perform fraud prediction, scoring, or automated decisions.
 */
import { getOrdersByCustomerId, getReturnsByCustomerId, getCustomerById } from './storage.js';

/**
 * Format currency in Indian Rupees (₹) format (e.g. ₹32,500)
 */
export function formatCurrencyINR(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  const rounded = Math.round(amount);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(rounded);
}

/**
 * Calculate full factual historical statistics for a customer
 */
export function calculateCustomerHistoryStats(customerId) {
  const customer = getCustomerById(customerId);
  const orders = getOrdersByCustomerId(customerId);
  const returns = getReturnsByCustomerId(customerId);

  const total_orders = orders.length;
  const total_returns = returns.length;
  
  // Total cancellations
  const total_cancellations = orders.filter(o => 
    (o.order_status || '').toLowerCase() === 'cancelled' || 
    (o.outcome || '').toLowerCase() === 'cancelled'
  ).length;

  // Total completed orders (intact orders without returns)
  const total_completed_orders = orders.filter(o => 
    (o.order_status || '').toLowerCase() === 'completed' && 
    (o.return_status || '').toLowerCase() !== 'returned'
  ).length;

  // Confirmed fraud cases from historical returns
  const total_confirmed_fraud = returns.filter(r => 
    (r.outcome || '').toLowerCase() === 'confirmed fraud'
  ).length;

  // Confirmed genuine returns
  const total_genuine_returns = returns.filter(r => 
    (r.outcome || '').toLowerCase() === 'genuine'
  ).length;

  // Pending returns
  const total_pending_returns = returns.filter(r => 
    (r.outcome || '').toLowerCase() === 'pending'
  ).length;

  // Unknown returns
  const total_unknown_returns = returns.filter(r => 
    (r.outcome || '').toLowerCase() === 'unknown'
  ).length;

  // Spending calculations (sum of non-cancelled orders)
  const validOrders = orders.filter(o => (o.order_status || '').toLowerCase() !== 'cancelled');
  const total_spending = validOrders.reduce((sum, o) => sum + (Number(o.price) || 0), 0);
  const average_order_value = validOrders.length > 0 ? total_spending / validOrders.length : 0;

  // Dates
  const sortedOrders = [...orders]
    .filter(o => o.order_date)
    .sort((a, b) => new Date(a.order_date) - new Date(b.order_date));

  const first_order_date = sortedOrders.length > 0 ? sortedOrders[0].order_date : null;
  const most_recent_order_date = sortedOrders.length > 0 ? sortedOrders[sortedOrders.length - 1].order_date : null;

  // Return rate (percentage of orders returned)
  const return_rate = total_orders > 0 ? ((total_returns / total_orders) * 100).toFixed(1) : '0.0';

  // Days since last order
  let days_since_last_order = null;
  if (most_recent_order_date) {
    const diffTime = Math.abs(new Date() - new Date(most_recent_order_date));
    days_since_last_order = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Days since last return
  let days_since_last_return = null;
  if (returns.length > 0) {
    const sortedReturns = [...returns]
      .filter(r => r.return_date)
      .sort((a, b) => new Date(b.return_date) - new Date(a.return_date));
    
    if (sortedReturns.length > 0 && sortedReturns[0].return_date) {
      const diffTime = Math.abs(new Date() - new Date(sortedReturns[0].return_date));
      days_since_last_return = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
  }

  return {
    customer,
    customerId,
    total_orders,
    total_returns,
    total_cancellations,
    total_completed_orders,
    total_confirmed_fraud,
    total_genuine_returns,
    total_pending_returns,
    total_unknown_returns,
    total_spending,
    average_order_value,
    first_order_date,
    most_recent_order_date,
    return_rate,
    days_since_last_order,
    days_since_last_return,
    orders,
    returns
  };
}

/**
 * Calculate system-wide summary metrics for operations dashboard
 */
export function calculateSystemSummary(customers = [], orders = [], returns = []) {
  const total_customers = customers.length;
  const total_orders = orders.length;
  const total_returns = returns.length;

  const total_confirmed_fraud = returns.filter(r => 
    (r.outcome || '').toLowerCase() === 'confirmed fraud'
  ).length;

  const total_genuine_returns = returns.filter(r => 
    (r.outcome || '').toLowerCase() === 'genuine'
  ).length;

  const total_pending_returns = returns.filter(r => 
    (r.outcome || '').toLowerCase() === 'pending'
  ).length;

  const total_revenue = orders
    .filter(o => (o.order_status || '').toLowerCase() !== 'cancelled')
    .reduce((sum, o) => sum + (Number(o.price) || 0), 0);

  return {
    total_customers,
    total_orders,
    total_returns,
    total_confirmed_fraud,
    total_genuine_returns,
    total_pending_returns,
    total_revenue
  };
}
