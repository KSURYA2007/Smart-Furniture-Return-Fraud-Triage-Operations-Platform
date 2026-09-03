/**
 * Module 8: Central API Client
 * Dispatches requests to either the local mock backend or a real REST API endpoint
 */

import { ERROR_CODES, API_MODES, createSuccessResponse, createErrorResponse } from './contracts.js';
import { handleMockRequest } from './mock/mockBackend.js';

// Configuration
let currentApiMode = API_MODES.MOCK;
let failureSimulation = null; // null | 'NETWORK_ERROR' | 'TIMEOUT' | '401' | '403' | '404' | '409' | '422' | '500'

const API_BASE_URL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL
  : 'http://localhost:4000/api';

/**
 * Configure API mode (MOCK vs API)
 */
export function setApiMode(mode) {
  if (mode === API_MODES.MOCK || mode === API_MODES.API) {
    currentApiMode = mode;
  }
}

export function getApiMode() {
  return currentApiMode;
}

/**
 * Set Failure Simulation (Section 56)
 */
export function setFailureSimulation(sim) {
  failureSimulation = sim;
}

export function getFailureSimulation() {
  return failureSimulation;
}

/**
 * Core Request Dispatcher
 */
async function request(method, path, body = null, options = {}) {
  // Check failure simulation first
  if (failureSimulation) {
    switch (failureSimulation) {
      case 'NETWORK_ERROR':
        return createErrorResponse(ERROR_CODES.NETWORK_ERROR, 'Simulated network connection failure. Backend unreachable.');
      case 'TIMEOUT':
        return createErrorResponse(ERROR_CODES.TIMEOUT, 'Simulated request timeout after 10000ms.');
      case '401':
        return createErrorResponse(ERROR_CODES.UNAUTHORIZED, 'Simulated 401 Unauthorized: Session token expired or missing.');
      case '403':
        return createErrorResponse(ERROR_CODES.FORBIDDEN, 'Simulated 403 Forbidden: Insufficient operator permissions.');
      case '404':
        return createErrorResponse(ERROR_CODES.NOT_FOUND, 'Simulated 404 Not Found: Resource does not exist.');
      case '409':
        return createErrorResponse(ERROR_CODES.CONFLICT, 'Simulated 409 Conflict: Concurrent modification conflict.');
      case '422':
        return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, 'Simulated 422 Validation Error: Invalid payload attributes.');
      case '500':
        return createErrorResponse(ERROR_CODES.SERVER_ERROR, 'Simulated 500 Internal Server Error: Unhandled backend exception.');
      default:
        break;
    }
  }

  // 1. MOCK MODE: Route to internal mock backend adapter
  if (currentApiMode === API_MODES.MOCK) {
    return handleMockRequest(method, path, body, options);
  }

  // 2. API MODE: Real fetch dispatch
  try {
    const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || 10000);

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers || {})
    };

    const fetchConfig = {
      method,
      headers,
      signal: controller.signal
    };

    if (body && method !== 'GET' && method !== 'HEAD') {
      fetchConfig.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchConfig);
    clearTimeout(timeoutId);

    const resJson = await response.json().catch(() => null);

    if (!response.ok) {
      const code = response.status === 404 ? ERROR_CODES.NOT_FOUND
        : response.status === 401 ? ERROR_CODES.UNAUTHORIZED
        : response.status === 403 ? ERROR_CODES.FORBIDDEN
        : response.status === 409 ? ERROR_CODES.CONFLICT
        : response.status === 422 ? ERROR_CODES.VALIDATION_ERROR
        : ERROR_CODES.SERVER_ERROR;

      return createErrorResponse(code, resJson?.message || `HTTP error ${response.status}`, resJson?.details);
    }

    return resJson || createSuccessResponse({});
  } catch (err) {
    if (err.name === 'AbortError') {
      return createErrorResponse(ERROR_CODES.TIMEOUT, 'Request timed out after 10 seconds.');
    }
    return createErrorResponse(ERROR_CODES.NETWORK_ERROR, 'Network error: unable to connect to API backend.', err.message);
  }
}

export const apiClient = {
  get: (path, options) => request('GET', path, null, options),
  post: (path, body, options) => request('POST', path, body, options),
  put: (path, body, options) => request('PUT', path, body, options),
  patch: (path, body, options) => request('PATCH', path, body, options),
  delete: (path, options) => request('DELETE', path, null, options)
};
