import React from 'react';
import {
  Package,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Truck,
  Activity,
  Lock,
  Zap,
  Globe,
  BarChart3,
  Camera
} from 'lucide-react';

export default function PortalLanding({ onEnterCustomerPortal, onEnterAdminPortal }) {
  return (
    <div className="pl-root">
      {/* ── Decorative blobs ── */}
      <div className="pl-blob pl-blob-1" aria-hidden="true" />
      <div className="pl-blob pl-blob-2" aria-hidden="true" />

      {/* ── Top Nav ── */}
      <header className="pl-nav">
        <div className="pl-nav-inner">
          <div className="pl-brand">
            <div className="pl-brand-logo">
              <Package size={20} strokeWidth={2} />
            </div>
            <div className="pl-brand-text">
              <span className="pl-brand-name">FurniCraft</span>
              <span className="pl-brand-sub">Return &amp; Triage Platform</span>
            </div>
          </div>
          <div className="pl-nav-badges">
            <span className="pl-ver-badge">v1.11&#8209;PRO</span>
            <span className="pl-arch-badge">
              <span className="pl-arch-dot" />
              Live
            </span>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="pl-hero">
        <div className="pl-hero-inner">
          <div className="pl-hero-tag">
            <Zap size={12} />
            Enterprise Dual-Portal Architecture
          </div>
          <h1 className="pl-hero-title">
            Furniture Returns &amp;<br />
            <span className="pl-hero-gradient">Operations Hub</span>
          </h1>
          <p className="pl-hero-desc">
            Choose your experience. Customers manage returns with complete privacy —
            operations teams run evidence-backed fraud triage, human review, and pickup dispatch.
          </p>

          {/* ── Stats Row ── */}
          <div className="pl-stats-row">
            <div className="pl-stat">
              <span className="pl-stat-num">11</span>
              <span className="pl-stat-label">Modules</span>
            </div>
            <div className="pl-stat-sep" />
            <div className="pl-stat">
              <span className="pl-stat-num">53</span>
              <span className="pl-stat-label">Tests Passing</span>
            </div>
            <div className="pl-stat-sep" />
            <div className="pl-stat">
              <span className="pl-stat-num">100%</span>
              <span className="pl-stat-label">Secure</span>
            </div>
            <div className="pl-stat-sep" />
            <div className="pl-stat">
              <span className="pl-stat-num">6</span>
              <span className="pl-stat-label">RBAC Roles</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Portal Cards ── */}
      <section className="pl-cards-section">
        <div className="pl-cards-inner">
          {/* Customer Card */}
          <div className="pl-card pl-card-customer">
            <div className="pl-card-glow pl-card-glow-emerald" aria-hidden="true" />
            <div className="pl-card-header">
              <div className="pl-icon-wrap pl-icon-emerald">
                <Package size={24} />
              </div>
              <div>
                <h2 className="pl-card-title">Customer Portal</h2>
                <p className="pl-card-subtitle">For furniture buyers</p>
              </div>
            </div>
            <p className="pl-card-desc">
              A safe, trustworthy experience for shoppers to submit returns, upload
              defect photos, track your request status, and coordinate doorstep pickup.
            </p>
            <ul className="pl-features">
              <li className="pl-feature">
                <CheckCircle2 size={15} className="pl-feat-icon pl-feat-emerald" />
                Interactive 6-Stage Return Timeline
              </li>
              <li className="pl-feature">
                <Camera size={15} className="pl-feat-icon pl-feat-emerald" />
                Photo Proof Upload &amp; Verification
              </li>
              <li className="pl-feature">
                <Lock size={15} className="pl-feat-icon pl-feat-emerald" />
                Zero exposure to fraud scores or internal notes
              </li>
              <li className="pl-feature">
                <Truck size={15} className="pl-feat-icon pl-feat-emerald" />
                Doorstep Pickup Scheduling
              </li>
            </ul>
            <button className="pl-btn pl-btn-emerald" onClick={onEnterCustomerPortal} type="button">
              Enter Customer Portal
              <ArrowRight size={17} />
            </button>
          </div>

          {/* Admin Card */}
          <div className="pl-card pl-card-admin">
            <div className="pl-card-glow pl-card-glow-indigo" aria-hidden="true" />
            <div className="pl-card-header">
              <div className="pl-icon-wrap pl-icon-indigo">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h2 className="pl-card-title">Admin &amp; Operations</h2>
                <p className="pl-card-subtitle">For reviewers &amp; managers</p>
              </div>
            </div>
            <p className="pl-card-desc">
              Full enterprise suite: 6-factor fraud triage, human review queues, pickup
              logistics, baseline metrics, security controls, and comprehensive audit trails.
            </p>
            <ul className="pl-features">
              <li className="pl-feature">
                <Activity size={15} className="pl-feat-icon pl-feat-indigo" />
                Modules 1–10 Fully Integrated
              </li>
              <li className="pl-feature">
                <Lock size={15} className="pl-feat-icon pl-feat-indigo" />
                Role-Based Access Control (6 Roles)
              </li>
              <li className="pl-feature">
                <BarChart3 size={15} className="pl-feat-icon pl-feat-indigo" />
                Executive Metrics &amp; Experiment Console
              </li>
              <li className="pl-feature">
                <Globe size={15} className="pl-feat-icon pl-feat-indigo" />
                API Integration Layer &amp; Testing Dashboard
              </li>
            </ul>
            <button className="pl-btn pl-btn-indigo" onClick={onEnterAdminPortal} type="button">
              Enter Operations Portal
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="pl-footer">
        <div className="pl-footer-inner">
          <span>© 2026 FurniCraft Living Systems</span>
          <span className="pl-footer-dot">•</span>
          <span>Enterprise Dual-Portal Reverse Logistics</span>
          <span className="pl-footer-dot">•</span>
          <span>Bengaluru, India</span>
        </div>
      </footer>
    </div>
  );
}
