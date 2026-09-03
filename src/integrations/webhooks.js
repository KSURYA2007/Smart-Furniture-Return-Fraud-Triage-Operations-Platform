/**
 * Module 8: Webhook & Event Dispatch Stub
 */

const EVENT_LISTENERS = [];

export function addEventListener(listener) {
  EVENT_LISTENERS.push(listener);
}

export function emitEvent(event) {
  const payload = {
    eventId: `EVT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...event
  };

  // Dispatch to in-memory listeners
  EVENT_LISTENERS.forEach(fn => {
    try { fn(payload); } catch (e) { /* ignore listener error */ }
  });

  return payload;
}

export const webhooks = {
  emitReturnCreated: (returnId, meta) => emitEvent({ type: 'RETURN_CREATED', returnId, meta }),
  emitReviewDecided: (returnId, decision) => emitEvent({ type: 'REVIEW_DECISION_SUBMITTED', returnId, decision }),
  emitPickupScheduled: (returnId, schedule) => emitEvent({ type: 'PICKUP_SCHEDULED', returnId, schedule }),
  emitPickupCompleted: (returnId, notes) => emitEvent({ type: 'PICKUP_COMPLETED', returnId, notes })
};
