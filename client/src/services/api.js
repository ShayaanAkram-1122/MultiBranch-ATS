import axios from 'axios';

/** Deployed API (Render). Paths use `/api/*`. */
const PRODUCTION_API_BASE = 'https://multibranch-ats.onrender.com/api';

/**
 * Axios joins `baseURL` + url: `/auth/register` becomes path `auth/register` on the host.
 * So `baseURL` MUST end with `/api` or requests hit `https://host/auth/register` (404).
 */
function withApiPath(base) {
  const trimmed = String(base).trim().replace(/\/+$/, '');
  if (trimmed.endsWith('/api')) return trimmed;
  return `${trimmed}/api`;
}

/**
 * API base URL:
 * - `VITE_API_URL` if set (host or full .../api)
 * - Dev without env: `/api` (Vite proxy)
 * - Production without env: Render `PRODUCTION_API_BASE`
 */
function apiBaseUrl() {
  const fromEnv = import.meta.env.VITE_API_URL;
  const hasEnv = fromEnv !== undefined && fromEnv !== null && String(fromEnv).trim() !== '';

  if (!hasEnv && import.meta.env.DEV) {
    return '/api';
  }

  const raw = hasEnv ? String(fromEnv).trim() : PRODUCTION_API_BASE;
  return withApiPath(raw);
}

/** Prefix for developer bypass login; role is appended as `:admin` or `:applicant`. */
export const DEV_BYPASS_PREFIX = 'dev-local-bypass';

export function isDevBypassToken(token) {
  return Boolean(token && token.startsWith(DEV_BYPASS_PREFIX));
}

const api = axios.create({
  baseURL: apiBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT + enforce `/api` on base (fixes old builds / mis-set env omitting `/api`)
api.interceptors.request.use((config) => {
  const base = config.baseURL || api.defaults.baseURL || '';
  const normalized = base.startsWith('/') ? base : withApiPath(base.replace(/\/+$/, ''));
  if (normalized !== base) {
    config.baseURL = normalized;
    api.defaults.baseURL = normalized;
  }
  const token = localStorage.getItem('ats_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global error handler
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const token = localStorage.getItem('ats_token');
      if (isDevBypassToken(token)) {
        return Promise.reject(err);
      }
      localStorage.removeItem('ats_token');
      localStorage.removeItem('ats_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
