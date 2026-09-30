import React, { useState, useEffect } from "react";
import {
  Package, ShieldCheck, ArrowRight, Lock, Eye, EyeOff,
  User, AlertCircle, Sparkles
} from "lucide-react";
import { DEMO_CUSTOMERS } from "../services/customerPortalService.js";

const ADMIN_USERS = [
  { username: "admin", password: "admin123" },
  { username: "surya", password: "surya123" },
];

const CUSTOMER_USERS = [
  { username: "demo",   password: "1234", customerIndex: 0 },
  { username: "rahul",  password: "1234", customerIndex: 1 },
  { username: "ananya", password: "1234", customerIndex: 2 },
  { username: "vikram", password: "1234", customerIndex: 3 },
];

export default function PortalLanding({ onEnterCustomerPortal, onEnterAdminPortal }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [animIn, setAnimIn]     = useState(false);

  useEffect(() => { requestAnimationFrame(() => setAnimIn(true)); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const u = username.trim().toLowerCase();
    const p = password;
    if (!u || !p) { setError("Please enter your username and password."); return; }

    const adminMatch = ADMIN_USERS.find(a => a.username === u && a.password === p);
    if (adminMatch) { setLoading(true); setTimeout(() => onEnterAdminPortal(), 700); return; }

    const custMatch = CUSTOMER_USERS.find(c => c.username === u && c.password === p);
    if (custMatch) {
      setLoading(true);
      setTimeout(() => onEnterCustomerPortal(DEMO_CUSTOMERS[custMatch.customerIndex]), 700);
      return;
    }

    setError("Invalid credentials. Check your username and password.");
  };

  return (
    <div className={`pl2-root ${animIn ? "pl2-in" : ""}`}>
      <div className="pl2-orb pl2-orb1" aria-hidden />
      <div className="pl2-orb pl2-orb2" aria-hidden />
      <div className="pl2-orb pl2-orb3" aria-hidden />

      {/* ── Left brand panel ── */}
      <div className="pl2-left">
        <div className="pl2-left-inner">
          <div className="pl2-brand">
            <div className="pl2-brand-icon"><Package size={26} /></div>
            <div>
              <div className="pl2-brand-name">FurniLogistics</div>
              <div className="pl2-brand-tag">Return &amp; Triage Platform</div>
            </div>
          </div>

          <div className="pl2-hero">
            <div className="pl2-hero-chip"><Sparkles size={12} /><span>Unified Access &middot; v1.11-PRO</span></div>
            <h1 className="pl2-hero-title">
              Smart returns,<br />
              <span className="pl2-hero-grad">zero friction.</span>
            </h1>
            <p className="pl2-hero-sub">
              One login routes you to the right place &mdash; customers track returns,
              operations teams run fraud triage and dispatch.
            </p>
          </div>

          <div className="pl2-hints">
            <div className="pl2-hint-row">
              <div className="pl2-hint-badge pl2-hint-green"><Package size={12} />Customer</div>
              <code className="pl2-hint-code">demo / 1234</code>
            </div>
            <div className="pl2-hint-row">
              <div className="pl2-hint-badge pl2-hint-violet"><ShieldCheck size={12} />Admin</div>
              <code className="pl2-hint-code">admin / admin123</code>
            </div>
          </div>

          <div className="pl2-stats">
            {[["11","Modules"],["6","RBAC Roles"],["100%","Secure"],["53","Tests"]].map(([n,l],i) => (
              <div key={i} className="pl2-stat">
                <span className="pl2-stat-num">{n}</span>
                <span className="pl2-stat-lbl">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right sign-in box ── */}
      <div className="pl2-right">
        <div className="pl2-card">
          <div className="pl2-card-hd">
            <div className="pl2-card-icon"><Lock size={22} /></div>
            <h2 className="pl2-card-title">Sign in</h2>
            <p className="pl2-card-sub">Enter your credentials &mdash; we&apos;ll route you automatically</p>
          </div>

          <form onSubmit={handleSubmit} className="pl2-form" noValidate>
            <div className="pl2-field">
              <label className="pl2-label" htmlFor="pl2-user">Username</label>
              <div className="pl2-input-wrap">
                <User size={15} className="pl2-iicon" />
                <input
                  id="pl2-user"
                  type="text"
                  className="pl2-input"
                  placeholder="demo  or  admin"
                  value={username}
                  autoComplete="username"
                  onChange={e => { setUsername(e.target.value); setError(""); }}
                />
              </div>
            </div>

            <div className="pl2-field">
              <label className="pl2-label" htmlFor="pl2-pass">Password</label>
              <div className="pl2-input-wrap">
                <Lock size={15} className="pl2-iicon" />
                <input
                  id="pl2-pass"
                  type={showPass ? "text" : "password"}
                  className="pl2-input pl2-input-pass"
                  placeholder="Enter your password"
                  value={password}
                  autoComplete="current-password"
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                />
                <button type="button" className="pl2-eye" onClick={() => setShowPass(p => !p)} tabIndex={-1}>
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="pl2-error" role="alert">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            <button id="pl2-submit" type="submit" className="pl2-btn" disabled={loading}>
              {loading
                ? <span className="pl2-spinner" />
                : <><span>Continue</span><ArrowRight size={17} /></>}
            </button>
          </form>

          <div className="pl2-routes">
            <div className="pl2-route pl2-route-green">
              <Package size={13} />
              <span><strong>demo / rahul / ananya / vikram</strong> &rarr; Customer Portal</span>
            </div>
            <div className="pl2-route pl2-route-violet">
              <ShieldCheck size={13} />
              <span><strong>admin / surya</strong> &rarr; Operations Portal</span>
            </div>
          </div>

          <p className="pl2-note"><Lock size={10} /> Demo mode &middot; No real data &middot; Role-based access</p>
        </div>
      </div>
    </div>
  );
}
