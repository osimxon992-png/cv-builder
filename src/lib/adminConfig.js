// Site settings changed from the /admin page: which templates are shown, their tier and order, and plan prices.
// shortcut: stored in this browser's localStorage, so settings apply only on the device where the admin made them
// and anyone with DevTools can change them. Move to a server API when the site gets a backend.
import { useSyncExternalStore } from 'react';

const KEY = 'cvb.admin.v1';
const EMPTY = { templates: {}, order: [], prices: {} };
const listeners = new Set();
let cached;

function read() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!raw || typeof raw !== 'object') return EMPTY;
    return {
      templates: raw.templates && typeof raw.templates === 'object' ? raw.templates : {},
      order: Array.isArray(raw.order) ? raw.order.filter((id) => typeof id === 'string') : [],
      prices: raw.prices && typeof raw.prices === 'object' ? raw.prices : {},
    };
  } catch {
    return EMPTY;
  }
}

export function getAdminConfig() {
  cached ??= read();
  return cached;
}

/** Throws when storage is unavailable or full, so the admin page can say the change was not saved. */
export function updateAdminConfig(updater) {
  const next = updater(getAdminConfig());
  localStorage.setItem(KEY, JSON.stringify(next));
  cached = next;
  listeners.forEach((fn) => fn());
}

export function resetAdminConfig() {
  localStorage.removeItem(KEY);
  cached = EMPTY;
  listeners.forEach((fn) => fn());
}

const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const useAdminConfig = () => useSyncExternalStore(subscribe, getAdminConfig);

// The password only keeps casual visitors out of the settings screen; it is not real access control
// because it ships inside the JavaScript bundle. Set VITE_ADMIN_PASSWORD at build time; without it the
// page is locked in production builds and uses "admin" only under `npm run dev`.
const env = import.meta.env ?? {};
export const ADMIN_PASSWORD = env.VITE_ADMIN_PASSWORD || (env.DEV ? 'admin' : '');
