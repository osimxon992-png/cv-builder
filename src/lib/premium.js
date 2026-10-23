// The single place that decides premium access. Replace the internals of
// `getPremium` / `startCheckout` when a real payment provider is connected;
// the rest of the app only calls `usePremium`, `hasPremium` and `canUseTemplate`.
import { useSyncExternalStore } from 'react';
import { isPremiumTemplate } from '../templates/registry.js';
import { useAdminConfig } from './adminConfig.js';
import { readPref, writePref } from './storage.js';

const env = import.meta.env ?? {};
export const CHECKOUT_URL = env.VITE_CHECKOUT_URL || '';
export const DEV_CHECKOUT_ENABLED = Boolean(env.DEV) || env.VITE_ENABLE_DEV_CHECKOUT === 'true';

export const PLANS = [
  { id: 'free', price: 0, period: null },
  { id: 'monthly', price: 4.99, period: 'month' },
  { id: 'lifetime', price: 19, period: 'once' },
];

/** Plans with prices set on the admin page; invalid prices fall back to the defaults above. */
export function usePlans() {
  const { prices } = useAdminConfig();
  return PLANS.map((plan) => {
    const price = Number(prices[plan.id]);
    return plan.price > 0 && Number.isFinite(price) && price > 0 ? { ...plan, price } : plan;
  });
}

const listeners = new Set();
let cached;

function readState() {
  try {
    const state = JSON.parse(readPref('premium', 'null'));
    if (!state || typeof state !== 'object') return { active: false };
    // shortcut: access is stored client-side, so a user can grant it to themselves in DevTools.
    // Upgrade to a server-verified entitlement (signed token) when real payments go live.
    const expired = typeof state.expiresAt === 'number' && state.expiresAt < Date.now();
    return { active: state.active === true && !expired, plan: state.plan, source: state.source, expiresAt: state.expiresAt };
  } catch {
    return { active: false };
  }
}

export function getPremium() {
  cached ??= readState();
  return cached;
}

function setPremium(state) {
  writePref('premium', JSON.stringify(state));
  cached = undefined;
  listeners.forEach((fn) => fn());
}

const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const usePremium = () => useSyncExternalStore(subscribe, getPremium);
export const hasPremium = () => getPremium().active;
export const canUseTemplate = (templateId) => !isPremiumTemplate(templateId) || hasPremium();

/**
 * Starts checkout for a plan. Returns 'redirect' | 'activated'.
 * Throws Error('notConfigured') when neither a real provider nor dev mode is available.
 */
export async function startCheckout(planId) {
  if (CHECKOUT_URL) {
    // Your backend creates the provider session and returns { url }. After payment the
    // provider redirects back; the backend must confirm the payment before access is granted.
    const res = await fetch(CHECKOUT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId, returnUrl: window.location.href }),
    });
    if (!res.ok) throw new Error('checkoutFailed');
    const { url } = await res.json();
    window.location.assign(url);
    return 'redirect';
  }
  if (DEV_CHECKOUT_ENABLED) {
    const month = 30 * 24 * 60 * 60 * 1000;
    setPremium({ active: true, plan: planId, source: 'dev', expiresAt: planId === 'monthly' ? Date.now() + month : null });
    return 'activated';
  }
  throw new Error('notConfigured');
}

export const cancelDevPremium = () => setPremium({ active: false });
