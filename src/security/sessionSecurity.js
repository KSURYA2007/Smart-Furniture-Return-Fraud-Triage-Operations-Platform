/**
 * Module 10: Prototype Session Security Manager
 * Manages demonstration sessions, timeouts, role switches, and clean expiration
 */

import { secureStorage } from './secureStorage.js';
import { authService, ROLES } from '../auth/authService.js';
import { getApiMode } from '../api/apiClient.js';

const SESSION_KEY = 'active_prototype_session';
const DEFAULT_TIMEOUT_MINUTES = 30;

export const SESSION_STATUS = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  LOGGED_OUT: 'LOGGED_OUT'
};

export class SessionSecurityManager {
  constructor() {
    this.timeoutMinutes = DEFAULT_TIMEOUT_MINUTES;
    this.initSession();
  }

  initSession() {
    const existing = secureStorage.getItem(SESSION_KEY);
    if (existing && existing.startedAt) {
      const elapsedMinutes = (Date.now() - new Date(existing.lastActivity).getTime()) / (1000 * 60);
      if (elapsedMinutes > this.timeoutMinutes) {
        this.expireSession();
        return;
      }
      // Refresh last activity
      existing.lastActivity = new Date().toISOString();
      secureStorage.setItem(SESSION_KEY, existing);
    } else {
      // Start default session with initial auth user
      this.startSession(authService.getCurrentUser());
    }
  }

  startSession(user) {
    if (!user) return null;
    const now = new Date().toISOString();
    const session = {
      sessionId: `SESS-${Date.now()}`,
      userId: user.id,
      name: user.name,
      role: user.role,
      startedAt: now,
      lastActivity: now,
      status: SESSION_STATUS.ACTIVE,
      environment: getApiMode().toUpperCase()
    };
    secureStorage.setItem(SESSION_KEY, session);
    authService.setCurrentUser(user.id);
    return session;
  }

  getSession() {
    const s = secureStorage.getItem(SESSION_KEY);
    if (!s) return null;
    
    // Check timeout
    if (s.status === SESSION_STATUS.ACTIVE) {
      const elapsedMinutes = (Date.now() - new Date(s.lastActivity).getTime()) / (1000 * 60);
      if (elapsedMinutes > this.timeoutMinutes) {
        this.expireSession();
        return { ...s, status: SESSION_STATUS.EXPIRED };
      }
    }
    return s;
  }

  touchActivity() {
    const s = secureStorage.getItem(SESSION_KEY);
    if (s && s.status === SESSION_STATUS.ACTIVE) {
      s.lastActivity = new Date().toISOString();
      secureStorage.setItem(SESSION_KEY, s);
    }
  }

  expireSession() {
    const s = secureStorage.getItem(SESSION_KEY);
    if (s) {
      s.status = SESSION_STATUS.EXPIRED;
      secureStorage.setItem(SESSION_KEY, s);
    }
  }

  logout() {
    const s = secureStorage.getItem(SESSION_KEY);
    if (s) {
      s.status = SESSION_STATUS.LOGGED_OUT;
      secureStorage.setItem(SESSION_KEY, s);
    }
    secureStorage.clearNonEssential();
  }

  loginAs(userId) {
    const users = authService.getAvailableUsers();
    const user = users.find(u => u.id === userId) || users[0];
    return this.startSession(user);
  }

  setTimeoutMinutes(mins) {
    this.timeoutMinutes = Math.max(1, mins);
  }

  getTimeoutMinutes() {
    return this.timeoutMinutes;
  }
}

export const sessionManager = new SessionSecurityManager();
