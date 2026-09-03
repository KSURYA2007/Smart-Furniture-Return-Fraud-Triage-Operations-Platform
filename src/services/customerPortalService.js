/**
 * Module 11: Customer Portal Service & Data Isolation Adapter
 * Scopes data strictly to the authenticated customer and strips all internal fraud/risk/audit data
 */

import { getAllReturns, getCustomerById, saveReturn, getStoredPickup, getStoredReview } from '../utils/storage.js';
import { broadcastRealtime, REALTIME_EVENTS } from '../utils/realtimeBus.js';

export const DEMO_CUSTOMERS = [
  {
    id: 'CUS-1024',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '+91 98450 11223',
    address: '42, 4th Cross, Indiranagar, Bengaluru, Karnataka 560038',
    avatar: 'PS',
    memberSince: 'March 2023'
  },
  {
    id: 'CUS-1025',
    name: 'Rahul Verma',
    email: 'rahul.verma@example.com',
    phone: '+91 98860 33445',
    address: '108, Palm Grove Apartments, Whitefield, Bengaluru, Karnataka 560066',
    avatar: 'RV',
    memberSince: 'July 2022'
  },
  {
    id: 'CUS-1026',
    name: 'Ananya Patel',
    email: 'ananya.patel@example.com',
    phone: '+91 97410 55667',
    address: '15/B, 7th Main, Koramangala 4th Block, Bengaluru, Karnataka 560034',
    avatar: 'AP',
    memberSince: 'November 2023'
  },
  {
    id: 'CUS-1027',
    name: 'Vikram Malhotra',
    email: 'vikram.m@example.com',
    phone: '+91 99000 77889',
    address: '77, Defense Colony, HAL 2nd Stage, Bengaluru, Karnataka 560008',
    avatar: 'VM',
    memberSince: 'January 2024'
  }
];

// Persistent storage keys for customer portal
const TICKETS_STORAGE_KEY = 'fur_customer_support_tickets';
const NOTIFICATIONS_STORAGE_KEY = 'fur_customer_notifications';

function getStoredTicketsRaw() {
  try {
    const raw = localStorage.getItem(TICKETS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredTicketsRaw(tickets) {
  try {
    localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(tickets));
  } catch (e) {
    console.error('Failed to persist tickets:', e);
  }
}

function getStoredNotificationsRaw() {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredNotificationsRaw(notifs) {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifs));
  } catch (e) {
    console.error('Failed to persist notifications:', e);
  }
}

/**
 * Customer-safe status mapping (Section 36)
 */
export function toCustomerStatus(returnRecord) {
  if (!returnRecord) return { label: 'Submitted', badgeClass: 'badge-status-neutral', stage: 1 };

  const returnId = returnRecord.return_id;
  const review = getStoredReview(returnId);
  const pickup = getStoredPickup(returnId);

  // 1. Check pickup state
  if (pickup?.status === 'PICKED_UP') {
    return {
      label: 'Product Picked Up',
      description: 'Your item has been collected by our delivery team. Refund processing is underway.',
      badgeClass: 'badge-sla-on-track',
      stage: 5,
      nextStep: 'Refund initiated (2–4 business days)'
    };
  }

  if (pickup?.status === 'SCHEDULED') {
    return {
      label: 'Pickup Scheduled',
      description: `Doorstep collection confirmed for ${pickup.scheduled_date || 'upcoming date'} (${pickup.time_slot || 'Morning Window'}).`,
      badgeClass: 'badge-sla-on-track',
      stage: 4,
      nextStep: 'Prepare item at pickup address',
      pickupDetails: pickup
    };
  }

  // 2. Check human review decision
  const decType = review?.decision?.decision_type || returnRecord.review?.decision;

  if (decType === 'APPROVE_PICKUP') {
    return {
      label: 'Return Approved',
      description: 'Your return has been approved by our operations team. We are scheduling a pickup team.',
      badgeClass: 'badge-sla-on-track',
      stage: 4,
      nextStep: 'Awaiting pickup time-slot assignment'
    };
  }

  if (decType === 'REQUEST_MORE_EVIDENCE') {
    return {
      label: 'More Information Needed',
      description: 'Our review team needs clearer photos of the damaged area to complete your claim.',
      badgeClass: 'badge-risk-medium',
      stage: 2,
      nextStep: 'Please upload additional photos of the item'
    };
  }

  if (decType === 'REJECT_RETURN') {
    return {
      label: 'Return Not Approved',
      description: 'Unfortunately, your return request could not be approved based on the information provided.',
      badgeClass: 'badge-risk-critical',
      stage: 4,
      nextStep: 'If you feel this decision was in error, please contact customer support.'
    };
  }

  if (decType === 'ESCALATE') {
    return {
      label: 'Under Specialized Review',
      description: 'Your request is undergoing secondary verification with our specialist team.',
      badgeClass: 'badge-risk-low',
      stage: 3,
      nextStep: 'Review completes within 24 hours'
    };
  }

  // 3. Fallback to Intake / In-Review
  const hasPhotos = Array.isArray(returnRecord.evidence?.photos) && returnRecord.evidence.photos.length > 0;
  if (hasPhotos) {
    return {
      label: 'Under Review',
      description: 'Your photos and claim details are being reviewed by our customer operations team.',
      badgeClass: 'badge-risk-low',
      stage: 3,
      nextStep: 'Review decision expected shortly'
    };
  }

  return {
    label: 'Submitted',
    description: 'Your return claim has been registered in our system.',
    badgeClass: 'badge-status-neutral',
    stage: 1,
    nextStep: 'Provide photographic evidence to proceed'
  };
}

/**
 * Get all returns for a specific authenticated customer (strictly scoped)
 */
export function getCustomerReturns(customerId) {
  if (!customerId) return [];
  const normalizedCustId = customerId.trim().toUpperCase();
  const allReturns = getAllReturns();

  return allReturns
    .filter(r => {
      const cId = r.customer_id || r.customer?.customer_id;
      return cId && cId.toUpperCase() === normalizedCustId;
    })
    .map(r => {
      const statusInfo = toCustomerStatus(r);
      // Customer Safe Presentation Model (Section 37)
      return {
        returnId: r.return_id,
        orderId: r.order_id || r.order?.order_id || 'ORD-UNKNOWN',
        productName: r.product?.name || r.product_name || r.product || 'Furniture Item',
        productCategory: r.product?.category || 'Furniture',
        submittedDate: r.created_at || r.return_date || new Date().toISOString().split('T')[0],
        returnReason: r.reason || r.return_reason || 'Damaged on Delivery',
        condition: r.condition || 'Damaged',
        customerStatus: statusInfo.label,
        statusDescription: statusInfo.description,
        badgeClass: statusInfo.badgeClass,
        stage: statusInfo.stage,
        nextStep: statusInfo.nextStep,
        pickupDetails: statusInfo.pickupDetails || null
        // STRICT: Zero fraud score, zero priority arithmetic, zero reviewer notes!
      };
    });
}

/**
 * Get single return detail with customer-safe presentation model
 */
export function getCustomerReturnDetail(customerId, returnId) {
  if (!customerId || !returnId) return null;
  const userReturns = getCustomerReturns(customerId);
  const found = userReturns.find(r => r.returnId.toUpperCase() === returnId.toUpperCase());
  if (!found) return null;

  // Retrieve raw record to get evidence photos
  const rawReturns = getAllReturns();
  const raw = rawReturns.find(r => r.return_id.toUpperCase() === returnId.toUpperCase());

  return {
    ...found,
    description: raw?.description || raw?.customer_note || 'Customer reported delivery defect.',
    address: raw?.pickup?.address || raw?.customer?.address || 'Registered Delivery Address',
    photos: raw?.evidence?.photos || [],
    preferredDate: raw?.pickup?.pickup_date || raw?.pickup_date || 'Earliest available'
  };
}

/**
 * Create new return from Customer Portal
 */
export function createCustomerReturn(customerId, returnPayload) {
  if (!customerId || !returnPayload) return { success: false, error: 'Customer ID and return details required.' };

  const returnId = `RET-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const now = new Date().toISOString();

  const newReturn = {
    return_id: returnId,
    customer_id: customerId,
    order_id: returnPayload.orderId || `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    product: returnPayload.productName,
    product_name: returnPayload.productName,
    price: Number(returnPayload.price) || 18000,
    created_at: now,
    return_date: now.split('T')[0],
    reason: returnPayload.returnReason,
    return_reason: returnPayload.returnReason,
    condition: returnPayload.productCondition,
    description: returnPayload.description,
    status: 'INTAKE_COMPLETED',
    customer: {
      customer_id: customerId,
      name: returnPayload.customerName || 'Valued Customer',
      address: returnPayload.pickupAddress || 'Customer Address'
    },
    pickup: {
      address: returnPayload.pickupAddress,
      city: 'Bengaluru',
      preferred_date: returnPayload.preferredPickupDate
    },
    evidence: {
      photos: returnPayload.photos || []
    }
  };

  const saved = saveReturn(newReturn);

  // Add notification
  // Add real customer notification to storage
  addCustomerNotification(
    customerId,
    'Return Request Created',
    `Your return claim ${returnId} for ${returnPayload.productName} was submitted successfully.`
  );

  return {
    success: saved,
    returnId,
    data: getCustomerReturnDetail(customerId, returnId)
  };
}

/**
 * Support Tickets (Stored in LocalStorage & Realtime Synced)
 */
export function getCustomerSupportTickets(customerId) {
  if (!customerId) return [];
  const tickets = getStoredTicketsRaw();
  return tickets.filter(t => t.customerId === customerId);
}

export function submitCustomerSupportTicket(ticketPayload) {
  const tickets = getStoredTicketsRaw();
  const newTicket = {
    id: `TKT-${Math.floor(100 + Math.random() * 900)}`,
    customerId: ticketPayload.customerId,
    returnId: ticketPayload.returnId || 'N/A',
    subject: ticketPayload.subject,
    message: ticketPayload.message,
    status: 'OPEN',
    createdAt: new Date().toISOString(),
    reply: null
  };
  tickets.unshift(newTicket);
  saveStoredTicketsRaw(tickets);

  broadcastRealtime(REALTIME_EVENTS.SUPPORT_UPDATED, { ticket: newTicket });
  return { success: true, ticket: newTicket };
}

export function getAllCustomerSupportTickets() {
  return getStoredTicketsRaw();
}

export function answerSupportTicket(ticketId, replyText, staffName = 'Support Operations') {
  if (!ticketId || !replyText) return false;
  const tickets = getStoredTicketsRaw();
  const target = tickets.find(t => t.id === ticketId);
  if (!target) return false;

  target.status = 'RESOLVED';
  target.reply = replyText.trim();
  target.repliedAt = new Date().toISOString();
  target.staffName = staffName;

  saveStoredTicketsRaw(tickets);

  // Automatically generate a customer notification
  if (target.customerId) {
    addCustomerNotification(
      target.customerId,
      'Support Team Replied',
      `Our team responded to your inquiry regarding "${target.subject}".`
    );
  }

  broadcastRealtime(REALTIME_EVENTS.SUPPORT_UPDATED, { ticketId, reply: replyText });
  return true;
}

/**
 * Notifications (Stored in LocalStorage & Realtime Synced)
 */
export function getCustomerNotifications(customerId) {
  if (!customerId) return [];
  const notifs = getStoredNotificationsRaw();
  return notifs.filter(n => n.customerId === customerId);
}

export function addCustomerNotification(customerId, title, message) {
  if (!customerId || !title) return false;
  const notifs = getStoredNotificationsRaw();
  const newNotif = {
    id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    customerId,
    title,
    message,
    timestamp: new Date().toISOString(),
    read: false
  };
  notifs.unshift(newNotif);
  saveStoredNotificationsRaw(notifs);

  broadcastRealtime(REALTIME_EVENTS.NOTIFICATION_UPDATED, { notification: newNotif });
  return true;
}

export function markNotificationAsRead(notifId) {
  const notifs = getStoredNotificationsRaw();
  const n = notifs.find(x => x.id === notifId);
  if (n) {
    n.read = true;
    saveStoredNotificationsRaw(notifs);
    broadcastRealtime(REALTIME_EVENTS.NOTIFICATION_UPDATED, { notifId, read: true });
  }
  return true;
}
