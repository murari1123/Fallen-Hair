/* ============================================
   FALLEN HAIR — Navigation & Route Helpers
   ============================================ */

export function normalizeRoute(path) {
  if (!path) return '/';
  const clean = path.split('?')[0].split('#')[0].trim().replace(/\/+$/, '') || '/';
  return clean.toLowerCase();
}

export function navigate(path) {
  const normalized = normalizeRoute(path);
  if (normalizeRoute(window.location.pathname) === normalized) return;
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo({ top: 0, behavior: 'instant' });
}
