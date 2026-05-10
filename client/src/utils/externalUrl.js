/**
 * Ensure browser opens true external URLs (Cloudinary, etc.).
 * URLs without a scheme are treated as same-origin paths by the browser and get handled by React Router.
 */
export function normalizeExternalUrl(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith('//')) return `https:${s}`;
  // Stored without scheme — browser would treat as an in-app path and React Router would swallow it
  if (!s.startsWith('/') && /^(?:[\w-]+\.)*cloudinary\.com\//i.test(s)) {
    return `https://${s}`;
  }
  return s;
}

export function isLikelyHttpUrl(s) {
  const u = normalizeExternalUrl(s);
  return /^https?:\/\//i.test(u);
}
