import React, { useState } from 'react';
import {
  ShieldCheck, ArrowRight, Lock, Eye, EyeOff,
  Package, Activity, BarChart3, Users, Truck, AlertTriangle, AlertCircle
} from 'lucide-react';

const CREDS = { username: 'demo', password: '1234' };

const FEATURES = [
  { icon: <Activity size={16} />,   text: 'Fraud Risk Triage Engine (6 Factors)' },
  { icon: <Users size={16} />,      text: 'Human Review Queue & Case Management' },
  { icon: <Truck size={16} />,      text: 'Pickup Logistics & Route Dispatch' },
  { icon: <BarChart3 size={16} />,  text: 'Metrics, Experiments & Audit Trails' },
  { icon: <ShieldCheck size={16} />, text: 'Security & Access Control (RBAC)' },
];

export default function AdminLogin({ onLogin, onSwitchToCustomer }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }
    if (username.trim().toLowerCase() !== CREDS.username || password !== CREDS.password) {
      setError('Invalid credentials. Use: demo / 1234');
      return;
    }
    setLoading(true);
    setTimeout(() => onLogin(), 600);
  };

  return (
    <div className="admin-login-root">
      {/* ── Left dark panel ── */}
      <div className="admin-login-left">
        <div className="admin-login-left-orb admin-login-orb-1" aria-hidden />
        <div className="admin-login-left-orb admin-login-orb-2" aria-hidden />
        <div className="admin-login-left-inner">
          <div className="admin-login-brand">
            <div className="admin-login-brand-icon"><ShieldCheck size={20} /></div>
            <div>
              <div className="admin-login-brand-name">FurniLogistics</div>
              <div className="admin-login-brand-tag">Operations Portal</div>
            </div>
          </div>

          <div className="admin-login-hero">
            <div className="admin-login-badge">
              <AlertTriangle size={12} />
              Restricted Access — Authorised Staff Only
            </div>
            <h1 className="admin-login-title">
              Operations &amp;<br />
              <span className="admin-login-title-accent">Risk Management</span>
            </h1>
            <p className="admin-login-desc">
              Evidence-backed fraud triage, human review queues, pickup dispatching,
              and enterprise-grade security controls.
            </p>
          </div>

          <div className="admin-login-features">
            {FEATURES.map((feat, i) => (
              <div key={i} className="admin-login-feat">
                <div className="admin-login-feat-icon">{feat.icon}</div>
                <span>{feat.text}</span>
              </div>
            ))}
          </div>

          <button type="button" className="admin-login-customer-switch" onClick={onSwitchToCustomer}>
            <Package size={14} />
            <span>Customer? Open Customer Portal</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="admin-login-right">
        <div className="admin-login-form-box">
          <div className="admin-login-form-header">
            <div className="admin-login-form-icon"><Lock size={20} /></div>
            <h2 className="admin-login-form-title">Staff Sign In</h2>
            <p className="admin-login-form-sub">Enter your credentials to access the operations portal</p>
          </div>

          {/* Demo hint */}
          <div className="admin-login-hint-box">
            <ShieldCheck size={14} className="admin-login-hint-icon" />
            <div>
              <div className="admin-login-hint-label">Demo Credentials</div>
              <div className="admin-login-hint-creds">
                Username: <strong>demo</strong>&nbsp;&middot;&nbsp;Password: <strong>1234</strong>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="admin-login-id-form">
            <div className="admin-login-field">
              <label className="admin-login-label">Username</label>
              <div className="admin-login-input-wrap">
                <ShieldCheck size={15} className="admin-login-input-icon" />
                <input
                  type="text"
                  className="admin-login-input"
                  placeholder="Enter username"
                  value={username}
                  autoComplete="username"
                  onChange={e => { setUsername(e.target.value); setError(''); }}
                />
              </div>
            </div>

            <div className="admin-login-field">
              <label className="admin-login-label">Password</label>
              <div className="admin-login-input-wrap">
                <Lock size={15} className="admin-login-input-icon" />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="admin-login-input admin-login-input-pass"
                  placeholder="Enter password"
                  value={password}
                  autoComplete="current-password"
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                />
                <button
                  type="button"
                  className="admin-login-eye-btn"
                  onClick={() => setShowPass(p => !p)}
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="admin-login-error">
                <AlertCircle size={13} />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="admin-login-submit" disabled={loading}>
              {loading
                ? <span className="login-spinner" />
                : <><Lock size={15} /><span>Sign In to Operations Portal</span><ArrowRight size={15} /></>
              }
            </button>
          </form>

          <div className="admin-login-note">
            <Lock size={11} />
            <span>Demo mode &middot; Role-based access &middot; No real data exposed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
