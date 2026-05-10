import axios from 'axios';

/** Prefix for developer bypass login; role is appended as `:admin` or `:applicant`. */
export const DEV_BYPASS_PREFIX = 'dev-local-bypass';

export function isDevBypassToken(token) {
  return Boolean(token && token.startsWith(DEV_BYPASS_PREFIX));
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5050/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
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
