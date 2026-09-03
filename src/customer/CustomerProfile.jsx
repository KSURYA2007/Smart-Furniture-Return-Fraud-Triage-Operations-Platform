import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  Bell,
  Calendar,
  Save,
  Check
} from 'lucide-react';

export default function CustomerProfile({ activeCustomer }) {
  const [emailNotify, setEmailNotify] = useState(true);
  const [smsNotify, setSmsNotify] = useState(true);
  const [savedNotice, setSavedNotice] = useState(null);

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setSavedNotice('Notification preferences successfully updated.');
    setTimeout(() => setSavedNotice(null), 3500);
  };

  return (
    <div className="cprof-root">
      {/* Page Header */}
      <div className="cprof-header">
        <div>
          <h1 className="cprof-title">My Account Profile</h1>
          <p className="cprof-subtitle">
            Manage your personal contact details, verified address, and doorstep pickup notifications.
          </p>
        </div>
      </div>

      {savedNotice && (
        <div className="cprof-notice-banner">
          <CheckCircle2 size={18} className="cprof-notice-icon" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="cprof-card">
        <div className="cprof-user-strip">
          <div className="cprof-avatar">
            {activeCustomer.avatar || 'PS'}
          </div>
          <div className="cprof-user-info">
            <div className="cprof-user-name-row">
              <h2 className="cprof-user-name">{activeCustomer.name}</h2>
              <span className="cprof-verified-badge">
                <ShieldCheck size={13} /> Verified Customer
              </span>
            </div>
            <div className="cprof-user-meta">
              <span className="cprof-meta-item">
                Customer ID: <strong className="cprof-mono">{activeCustomer.id}</strong>
              </span>
              <span className="cprof-meta-dot">&bull;</span>
              <span className="cprof-meta-item">
                Member since {activeCustomer.memberSince || 'March 2023'}
              </span>
            </div>
          </div>
        </div>

        {/* Contact Details Grid */}
        <div className="cprof-details-grid">
          <div className="cprof-detail-item">
            <div className="cprof-icon-wrap">
              <Mail size={16} />
            </div>
            <div className="cprof-detail-text">
              <span className="cprof-detail-label">Email Address</span>
              <strong className="cprof-detail-val">{activeCustomer.email || 'customer@example.com'}</strong>
            </div>
          </div>

          <div className="cprof-detail-item">
            <div className="cprof-icon-wrap">
              <Phone size={16} />
            </div>
            <div className="cprof-detail-text">
              <span className="cprof-detail-label">Phone Number</span>
              <strong className="cprof-detail-val">{activeCustomer.phone || '+91 98450 11223'}</strong>
            </div>
          </div>

          <div className="cprof-detail-item cprof-wide">
            <div className="cprof-icon-wrap">
              <MapPin size={16} />
            </div>
            <div className="cprof-detail-text">
              <span className="cprof-detail-label">Registered Pickup &amp; Delivery Address</span>
              <strong className="cprof-detail-val leading-relaxed">{activeCustomer.address || '42, 4th Cross, Indiranagar, Bengaluru, Karnataka 560038'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Preferences Card */}
      <div className="cprof-card">
        <div className="cprof-card-header">
          <div className="cprof-card-header-left">
            <Bell size={18} className="cprof-bell-icon" />
            <div>
              <h3 className="cprof-card-title">Doorstep Retrieval Notifications</h3>
              <p className="cprof-card-sub">Choose how our operations dispatch team communicates pickup windows</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSavePreferences} className="cprof-notify-form">
          <div className="cprof-options-list">
            <label className="cprof-option-card">
              <input
                type="checkbox"
                checked={emailNotify}
                onChange={(e) => setEmailNotify(e.target.checked)}
                className="cprof-checkbox"
              />
              <div className="cprof-option-text">
                <strong className="cprof-option-title">Email Notifications</strong>
                <span className="cprof-option-desc">Receive instant email alerts when your claim is reviewed and when van slot is assigned</span>
              </div>
            </label>

            <label className="cprof-option-card">
              <input
                type="checkbox"
                checked={smsNotify}
                onChange={(e) => setSmsNotify(e.target.checked)}
                className="cprof-checkbox"
              />
              <div className="cprof-option-text">
                <strong className="cprof-option-title">SMS &amp; WhatsApp Alerts</strong>
                <span className="cprof-option-desc">Get an SMS message and live driver tracking link on the morning of doorstep retrieval</span>
              </div>
            </label>
          </div>

          <div className="cprof-form-footer">
            <button type="submit" className="cprof-btn-save">
              <Save size={15} />
              <span>Save Notification Preferences</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
