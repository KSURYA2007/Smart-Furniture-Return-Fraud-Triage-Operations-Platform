import React, { useState } from 'react';
import {
  Package, ArrowRight, ShieldCheck, Lock,
  User, Eye, EyeOff, AlertCircle, CheckCircle2, Truck, Star
} from 'lucide-react';
import { DEMO_CUSTOMERS } from '../services/customerPortalService.js';

const CREDS = { username: 'demo', password: '1234' };

export default function CustomerLogin({ onLogin, onSwitchToAdmin }) {
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
    setTimeout(() => onLogin(DEMO_CUSTOMERS[0]), 600);
  };

  const features = [
    { icon: <CheckCircle2 size={16} />, text: '6-Stage Return Timeline' },
    { icon: <Truck size={16} />,        text: 'Doorstep Pickup Scheduling' },
    { icon: <Lock size={16} />,         text: 'Zero Internal Data Exposure' },
    { icon: <Star size={16} />,         text: '30-Day Return Window' },
  ];

  return (
    <div className="login-root">
      {/* ── Left brand panel ── */}
      <div className="login-left">
        <div className="login-left-inner">
          <div className="login-brand">
            <div className="login-brand-icon"><Package size={22} /></div>
            <div>
              <div className="login-brand-name">FurniCraft</div>
              <div className="login-brand-tagline">Customer Care Portal</div>
            </div>
          </div>

          <div className="login-hero-text">
            <h1 className="login-hero-title">
              Hassle-free<br />
              <span className="login-hero-accent">furniture returns</span>
            </h1>
            <p className="login-hero-desc">
              Submit return requests, upload defect photos, track your pickup,
              and get your refund — all in one place.
            </p>
          </div>

          <div className="login-features">
            {features.map((f, i) => (
              <div key={i} className="login-feat-item">
                <div className="login-feat-icon">{f.icon}</div>
                <span>{f.text}</span>
              </div>
            ))}
          </div>

          <button type="button" className="login-admin-switch" onClick={onSwitchToAdmin}>
            <ShieldCheck size={14} />
            <span>Operations Staff? Open Admin Portal</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="login-right">
        <div className="login-form-box">
          <div className="login-form-header">
            <div className="login-form-icon-wrap"><Package size={22} /></div>
            <h2 className="login-form-title">Welcome back</h2>
            <p className="login-form-subtitle">Sign in to manage your furniture returns</p>
          </div>

          {/* Demo credentials hint */}
          <div className="login-hint-box">
            <CheckCircle2 size={14} className="login-hint-icon" />
            <div>
              <div className="login-hint-label">Demo Credentials</div>
              <div className="login-hint-creds">
                Username: <strong>demo</strong>&nbsp;&middot;&nbsp;Password: <strong>1234</strong>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="login-cred-form">
            <div className="login-field">
              <label className="login-field-label">Username</label>
              <div className="login-input-wrap">
                <User size={16} className="login-input-icon" />
                <input
                  type="text"
                  className="login-cred-input"
                  placeholder="Enter username"
                  value={username}
                  autoComplete="username"
                  onChange={e => { setUsername(e.target.value); setError(''); }}
                />
              </div>
            </div>

            <div className="login-field">
              <label className="login-field-label">Password</label>
              <div className="login-input-wrap">
                <Lock size={16} className="login-input-icon" />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="login-cred-input login-cred-input-pass"
                  placeholder="Enter password"
                  value={password}
                  autoComplete="current-password"
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setShowPass(p => !p)}
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error-msg">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading
                ? <span className="login-spinner" />
                : <><span>Sign In</span><ArrowRight size={16} /></>
              }
            </button>
          </form>

          <div className="login-security-note">
            <Lock size={12} />
            <span>Demo mode &middot; No real data or payments involved</span>
          </div>
        </div>
      </div>
    </div>
  );
}
