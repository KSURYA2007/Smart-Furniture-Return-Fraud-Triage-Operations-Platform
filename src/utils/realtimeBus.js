/**
 * Realtime Synchronization Bus
 * Provides instant reactive cross-component & cross-tab real-time event dispatching.
 * Uses:
 * 1. window CustomEvent for same-tab instant component re-renders
 * 2. BroadcastChannel for zero-latency multi-tab synchronization
 * 3. localStorage storage pulse fallback for maximum compatibility
 */

const CHANNEL_NAME = 'furni_realtime_channel';
const SYNC_PULSE_KEY = 'fur_realtime_sync_pulse';

let broadcastChannel = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  }
} catch (e) {
  console.warn('BroadcastChannel not available:', e);
}

/**
 * Supported Realtime Event Types
 */
export const REALTIME_EVENTS = {
  RETURN_CREATED: 'RETURN_CREATED',
  RETURN_UPDATED: 'RETURN_UPDATED',
  REVIEW_UPDATED: 'REVIEW_UPDATED',
  PICKUP_UPDATED: 'PICKUP_UPDATED',
  EVIDENCE_UPLOADED: 'EVIDENCE_UPLOADED',
  SUPPORT_UPDATED: 'SUPPORT_UPDATED',
  NOTIFICATION_UPDATED: 'NOTIFICATION_UPDATED'
};

/**
 * Broadcast an event to all subscribers in the current tab AND other tabs
 * @param {string} eventType - from REALTIME_EVENTS
 * @param {object} payload - data associated with the event
 */
export function broadcastRealtime(eventType, payload = {}) {
  const eventData = {
    type: eventType,
    payload,
    timestamp: Date.now()
  };

  // 1. Same-window immediate CustomEvent
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('furni_realtime', { detail: eventData }));
    } catch (err) {
      console.warn('CustomEvent dispatch error:', err);
    }
  }

  // 2. Cross-tab BroadcastChannel
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(eventData);
    } catch (err) {
      console.warn('BroadcastChannel postMessage error:', err);
    }
  }

  // 3. Fallback localStorage pulse for cross-window sync
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(SYNC_PULSE_KEY, JSON.stringify(eventData));
    } catch {
      // ignore
    }
  }
}

/**
 * Subscribe to realtime events
 * @param {string[]|string} eventTypes - array of event names to listen to (or '*' for all)
 * @param {function} callback - handler receiving eventData
 * @returns {function} unsubscribe cleanup function
 */
export function subscribeRealtime(eventTypes, callback) {
  if (typeof window === 'undefined' || typeof callback !== 'function') {
    return () => {};
  }

  const typesArray = Array.isArray(eventTypes) ? eventTypes : [eventTypes];

  const handleMessage = (eventData) => {
    if (!eventData || !eventData.type) return;
    if (typesArray.includes('*') || typesArray.includes(eventData.type)) {
      callback(eventData);
    }
  };

  // Same-window listener
  const onCustomEvent = (e) => {
    if (e && e.detail) {
      handleMessage(e.detail);
    }
  };
  window.addEventListener('furni_realtime', onCustomEvent);

  // BroadcastChannel listener
  const onChannelMessage = (e) => {
    if (e && e.data) {
      handleMessage(e.data);
    }
  };
  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', onChannelMessage);
  }

  // Storage fallback listener (triggers when another tab changes localStorage)
  const onStorage = (e) => {
    if (e.key === SYNC_PULSE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        handleMessage(parsed);
      } catch {
        // ignore
      }
    }
  };
  window.addEventListener('storage', onStorage);

  // Return unsubscribe
  return () => {
    window.removeEventListener('furni_realtime', onCustomEvent);
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', onChannelMessage);
    }
    window.removeEventListener('storage', onStorage);
  };
}
