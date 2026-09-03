import React from 'react';
import {
  Package,
  Clock,
  PlusCircle,
  Bell,
  User,
  HelpCircle,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  Home,
  LayoutDashboard,
  Camera
} from 'lucide-react';

export default function CustomerPortalLayout({
  activeCustomer,
  currentView,
  onNavigate,
  onLogout,
  onSwitchToAdmin,
  unreadCount = 0,
  children
}) {
  const navLinks = [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { key: 'returns', label: 'My Returns', icon: <Package size={16} /> },
    { key: 'new', label: 'Start Return', icon: <PlusCircle size={16} />, highlight: true },
    { key: 'profile', label: 'My Profile', icon: <User size={16} /> },
    { key: 'support', label: 'Help & Support', icon: <HelpCircle size={16} /> },
  ];

  return (
    <div className="cpl-shell">
      {/* ── Top Navbar ── */}
      <header className="cpl-navbar">
        <div className="cpl-navbar-inner">
          {/* Brand */}
          <button
            type="button"
            className="cpl-brand"
            onClick={() => onNavigate('dashboard')}
          >
            <div className="cpl-brand-logo">
              <Package size={18} />
            </div>
            <div className="cpl-brand-text">
              <span className="cpl-brand-name">FurniCraft</span>
              <span className="cpl-brand-tag">Customer Portal</span>
            </div>
          </button>

          {/* Navigation links */}
          <nav className="cpl-nav">
            {navLinks.map(link => (
              <button
                key={link.key}
                type="button"
                className={`cpl-nav-link ${currentView === link.key ? 'cpl-nav-link-active' : ''} ${link.highlight ? 'cpl-nav-link-highlight' : ''}`}
                onClick={() => onNavigate(link.key)}
              >
                {link.icon}
                <span>{link.label}</span>
              </button>
            ))}
          </nav>

          {/* Right actions */}
          <div className="cpl-actions">
            {/* Notifications */}
            <button
              type="button"
              className="cpl-notif-btn"
              onClick={() => onNavigate('notifications')}
              title="Notifications"
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span className="cpl-notif-badge">{unreadCount}</span>
              )}
            </button>

            {/* Customer avatar pill */}
            <div className="cpl-avatar-pill">
              <div className="cpl-avatar">
                {activeCustomer?.avatar || 'C'}
              </div>
              <div className="cpl-avatar-text">
                <span className="cpl-avatar-name">{activeCustomer?.name || 'Customer'}</span>
                <span className="cpl-avatar-id">{activeCustomer?.id}</span>
              </div>
            </div>

            {/* Staff portal switch */}
            <button
              type="button"
              className="cpl-staff-btn"
              onClick={onSwitchToAdmin}
              title="Operations Admin Portal"
            >
              <ShieldCheck size={14} />
              <span className="cpl-staff-label">Staff</span>
            </button>

            {/* Logout */}
            <button
              type="button"
              className="cpl-logout-btn"
              onClick={onLogout}
              title="Sign Out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Nav ── */}
      <div className="cpl-mobile-nav">
        {navLinks.map(link => (
          <button
            key={link.key}
            type="button"
            className={`cpl-mobile-link ${currentView === link.key ? 'cpl-mobile-link-active' : ''}`}
            onClick={() => onNavigate(link.key)}
          >
            {link.icon}
            <span>{link.label}</span>
          </button>
        ))}
      </div>

      {/* ── Main Content ── */}
      <main className="cpl-main">
        <div className="cpl-content">
          {children}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="cpl-footer">
        <div className="cpl-footer-inner">
          <div className="cpl-footer-trust">
            <CheckCircle2 size={13} />
            <span>Secure, Hassle-Free Furniture Returns · 100% Verified Doorstep Retrieval</span>
          </div>
          <div className="cpl-footer-copy">
            © 2026 FurniCraft Living Systems · support@furnicraft.demo
          </div>
        </div>
      </footer>
    </div>
  );
}

