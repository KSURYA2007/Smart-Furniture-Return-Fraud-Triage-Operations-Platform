import React, { useState, useEffect } from 'react';
import {
  Package, ShieldCheck, Lock, Eye, EyeOff,
  User, ArrowRight, AlertCircle, CheckCircle2,
  Truck, Star, Activity, BarChart3, Users, Sparkles
} from 'lucide-react';
import { DEMO_CUSTOMERS } from '../services/customerPortalService.js';

/**
 * Unified Login – single /login route for both portals.
 * Credentials determine the redirect:
 *   admin  / admin123  → Admin (Operations) portal
 *   demo   / 1234      → Customer portal (Priya Sharma)
 *   rahul  / 1234      → Customer portal (Rahul Verma)
 *   ananya / 1234      → Customer portal (Ananya Patel)
 *   vikram / 1234      → Customer portal (Vikram Malhotra)
 */

const ADMIN_USERS = [
  { username: 'admin', password: 'admin123' },
  { username: 'surya', password: 'surya123' },
];

const CUSTOMER_USERS = [
  { username: 'demo',   password: '1234', customerIndex: 0 },
  { username: 'rahul',  password: '1234', customerIndex: 1 },
  { username: 'ananya', password: '1234', customerIndex: 2 },
  { username: 'vikram', password: '1234', customerIndex: 3 },
];

export default function UnifiedLogin({ defaultPortal = 'customer', onLoginAdmin, onLoginCustomer }) {
  const [tab, setTab]           = useState(defaultPortal === 'admin' ? 'admin' : 'customer');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [animIn, setAnimIn]     = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setAnimIn(true));
  }, []);

  const switchTab = (next) => {
    setTab(next);
    setUsername('');
    setPassword('');
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const u = username.trim().toLowerCase();
    const p = password;

    if (!u || !p) {
      setError('Please enter both username and password.');
      return;
    }

    if (tab === 'admin') {
      const match = ADMIN_USERS.find(a => a.username === u && a.password === p);
      if (!match) {
        setError('Invalid admin credentials. Try: admin / admin123');
        return;
      }
      setLoading(true);
      setTimeout(() => onLoginAdmin(), 700);
    } else {
      const match = CUSTOMER_USERS.find(c => c.username === u && c.password === p);
      if (!match) {
        setError('Invalid credentials. Try: demo / 1234');
        return;
      }
      setLoading(true);
      setTimeout(() => onLoginCustomer(DEMO_CUSTOMERS[match.customerIndex]), 700);
    }
  };

  return (
    <div className={`ul-root ${animIn ? 'ul-animate-in' : ''}`}>
      {/* Animated background orbs */}
      <div className="ul-bg-orb ul-orb-1" aria-hidden />
      <div className="ul-bg-orb ul-orb-2" aria-hidden />
      <div className="ul-bg-orb ul-orb-3" aria-hidden />

      {/* Left panel */}
      <div className="ul-left">
        <div className="ul-left-inner">
          <div className="ul-brand">
            <div className="ul-brand-icon"><Package size={24} /></div>
            <div>
              <div className="ul-brand-name">FurniLogistics</div>
              <div className="ul-brand-tagline">Reverse Logistics Platform</div>
            </div>
          </div>

          <div className="ul-hero">
            <div className="ul-hero-badge">
              <Sparkles size={12} />
              <span>Unified Access Portal</span>
            </div>
            <h1 className="ul-hero-title">
              One login.<br />
              <span className="ul-hero-accent">Two portals.</span>
            </h1>
            <p className="ul-hero-desc">
              Your credentials automatically route you to the right portal —
              Customer Care or Operations.
            </p>
          </div>

          <div className="ul-features">
            {tab === 'customer' ? (
              <>
                <div className="ul-feat"><CheckCircle2 size={15} /><span>Track returns in real-time</span></div>
                <div className="ul-feat"><Truck size={15} /><span>Schedule doorstep pickup</span></div>
                <div className="ul-feat"><Lock size={15} /><span>Zero internal data exposure</span></div>
                <div className="ul-feat"><Star size={15} /><span>30-day return window</span></div>
              </>
            ) : (
              <>
                <div className="ul-feat"><Activity size={15} /><span>Fraud Risk Triage Engine</span></div>
                <div className="ul-feat"><Users size={15} /><span>Human Review & Case Management</span></div>
                <div className="ul-feat"><Truck size={15} /><span>Pickup Logistics & Dispatch</span></div>
                <div className="ul-feat"><BarChart3 size={15} /><span>Metrics, Experiments & Audit</span></div>
                <div className="ul-feat"><ShieldCheck size={15} /><span>Security & RBAC Controls</span></div>
              </>
            )}
          </div>

          <div className="ul-portal-dots">
            <button
              type="button"
              className={`ul-portal-dot ${tab === 'customer' ? 'ul-dot-active' : ''}`}
              onClick={() => switchTab('customer')}
            >
              <Package size={12} />
              <span>Customer</span>
            </button>
            <div className="ul-dot-divider" />
            <button
              type="button"
              className={`ul-portal-dot ${tab === 'admin' ? 'ul-dot-active' : ''}`}
              onClick={() => switchTab('admin')}
            >
              <ShieldCheck size={12} />
              <span>Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="ul-right">
        <div className="ul-form-card">
          {/* Tab switcher */}
          <div className="ul-tabs" role="tablist">
            <button
              role="tab"
              type="button"
              aria-selected={tab === 'customer'}
              className={`ul-tab ${tab === 'customer' ? 'ul-tab-active' : ''}`}
              onClick={() => switchTab('customer')}
            >
              <Package size={15} />
              <span>Customer</span>
            </button>
            <button
              role="tab"
              type="button"
              aria-selected={tab === 'admin'}
              className={`ul-tab ${tab === 'admin' ? 'ul-tab-active' : ''}`}
              onClick={() => switchTab('admin')}
            >
              <ShieldCheck size={15} />
              <span>Admin / Staff</span>
            </button>
            <div className={`ul-tab-indicator ${tab === 'admin' ? 'ul-tab-indicator-right' : ''}`} />
          </div>

          {/* Form header */}
          <div className="ul-form-header">
            <div className={`ul-form-icon ${tab === 'admin' ? 'ul-form-icon-admin' : ''}`}>
              {tab === 'admin' ? <ShieldCheck size={20} /> : <Package size={20} />}
            </div>
            <h2 className="ul-form-title">
              {tab === 'admin' ? 'Operations Sign In' : 'Welcome back'}
            </h2>
            <p className="ul-form-sub">
              {tab === 'admin'
                ? 'Restricted access — authorised staff only'
                : 'Sign in to manage your furniture returns'}
            </p>
          </div>

          {/* Hint box */}
          <div className={`ul-hint ${tab === 'admin' ? 'ul-hint-admin' : ''}`}>
            <CheckCircle2 size={13} className="ul-hint-icon" />
            <div>
              <div className="ul-hint-label">Demo Credentials</div>
              {tab === 'admin' ? (
                <div className="ul-hint-creds">
                  Username: <strong>admin</strong> &nbsp;·&nbsp; Password: <strong>admin123</strong>
                </div>
              ) : (
                <div className="ul-hint-creds">
                  Username: <strong>demo</strong> &nbsp;·&nbsp; Password: <strong>1234</strong>
                </div>
              )}
            </div>
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="ul-form" noValidate>
            <div className="ul-field">
              <label className="ul-label" htmlFor="ul-username">Username</label>
              <div className="ul-input-wrap">
                <User size={15} className="ul-input-icon" />
                <input
                  id="ul-username"
                  type="text"
                  className="ul-input"
                  placeholder={tab === 'admin' ? 'admin' : 'demo'}
                  value={username}
                  autoComplete="username"
                  onChange={e => { setUsername(e.target.value); setError(''); }}
                />
              </div>
            </div>

            <div className="ul-field">
              <label className="ul-label" htmlFor="ul-password">Password</label>
              <div className="ul-input-wrap">
                <Lock size={15} className="ul-input-icon" />
                <input
                  id="ul-password"
                  type={showPass ? 'text' : 'password'}
                  className="ul-input ul-input-pass"
                  placeholder={tab === 'admin' ? 'admin123' : '1234'}
                  value={password}
                  autoComplete="current-password"
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                />
                <button
                  type="button"
                  className="ul-eye-btn"
                  onClick={() => setShowPass(p => !p)}
                  tabIndex={-1}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="ul-error" role="alert">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            <button
              id="ul-submit-btn"
              type="submit"
              className={`ul-submit ${tab === 'admin' ? 'ul-submit-admin' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <span className="ul-spinner" aria-label="Signing in…" />
              ) : (
                <>
                  {tab === 'admin' ? <ShieldCheck size={16} /> : <Package size={16} />}
                  <span>
                    {tab === 'admin' ? 'Sign In to Operations Portal' : 'Sign In to Customer Portal'}
                  </span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="ul-footer-note">
            <Lock size={11} />
            <span>Demo mode &middot; Role-based access &middot; No real data exposed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
