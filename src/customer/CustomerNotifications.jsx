import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Camera, 
  ArrowLeft,
  Check
} from 'lucide-react';
import { getCustomerNotifications, markNotificationAsRead } from '../services/customerPortalService.js';
import { subscribeRealtime, REALTIME_EVENTS } from '../utils/realtimeBus.js';

export default function CustomerNotifications({ activeCustomer, onNavigate }) {
  const [notifications, setNotifications] = useState(() => getCustomerNotifications(activeCustomer.id));

  useEffect(() => {
    const refresh = () => setNotifications(getCustomerNotifications(activeCustomer.id));
    refresh();
    return subscribeRealtime('*', refresh);
  }, [activeCustomer.id]);

  const handleMarkRead = (id) => {
    markNotificationAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAll = () => {
    notifications.forEach(n => markNotificationAsRead(n.id));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="cnotif-root">
      {/* Header */}
      <div className="cnotif-header">
        <div>
          <h1 className="cnotif-title">Updates &amp; Notifications</h1>
          <p className="cnotif-subtitle">Real-time alerts regarding your claim review and pickup logistics</p>
        </div>

        {notifications.some(n => !n.read) && (
          <button
            type="button"
            className="cnotif-markall-btn"
            onClick={handleMarkAll}
          >
            <Check size={14} />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="cnotif-list">
        {notifications.length === 0 ? (
          <div className="cnotif-empty">
            <Bell size={36} className="cnotif-empty-icon" />
            <h4 className="cnotif-empty-title">No notifications yet</h4>
            <p className="cnotif-empty-desc">You're all caught up! Status updates on your returns will appear here.</p>
          </div>
        ) : (
          notifications.map(notif => (
            <div
              key={notif.id}
              className={`cnotif-card ${notif.read ? 'cnotif-card-read' : 'cnotif-card-unread'}`}
            >
              <div className="cnotif-card-left">
                <div className="cnotif-icon-wrap">
                  <Bell size={16} />
                </div>
                <div className="cnotif-content">
                  <div className="cnotif-title-row">
                    <strong className="cnotif-item-title">{notif.title}</strong>
                    {!notif.read && <span className="cnotif-unread-dot" />}
                  </div>
                  <p className="cnotif-item-msg">{notif.message}</p>
                  <span className="cnotif-item-time">
                    {new Date(notif.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>

              {!notif.read && (
                <button
                  type="button"
                  className="cnotif-read-btn"
                  onClick={() => handleMarkRead(notif.id)}
                >
                  Mark read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
