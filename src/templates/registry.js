// Template metadata only (no PDF code) so it can be imported anywhere cheaply.
// `layout` drives the thumbnail; the actual document structure lives in src/pdf/templates.jsx.
// The admin page can hide templates, change their tier and reorder them (src/lib/adminConfig.js).
import { getAdminConfig, useAdminConfig } from '../lib/adminConfig.js';

export const TEMPLATES = [
  { id: 'classic', name: 'Classic', tier: 'free', layout: 'single', accent: '#1f2937', photo: false },
  { id: 'modern', name: 'Modern', tier: 'free', layout: 'banner', accent: '#1f4e79', photo: true },
  { id: 'minimal', name: 'Minimal', tier: 'free', layout: 'labels', accent: '#0f766e', photo: false },
  { id: 'compact', name: 'Compact', tier: 'free', layout: 'compact', accent: '#334155', photo: false },
  { id: 'student', name: 'Student', tier: 'free', layout: 'student', accent: '#2563eb', photo: true },
  { id: 'timeline', name: 'Timeline', tier: 'free', layout: 'timeline', accent: '#b45309', photo: false },
  { id: 'twocolumn', name: 'Two Column', tier: 'free', layout: 'two-col', accent: '#0f172a', photo: false },
  { id: 'developer', name: 'Developer', tier: 'free', layout: 'developer', accent: '#15803d', photo: false },
  { id: 'official', name: 'Official', tier: 'free', layout: 'table', accent: '#374151', photo: true },
  { id: 'executive', name: 'Executive', tier: 'premium', layout: 'sidebar-left', accent: '#1e293b', photo: true },
  { id: 'elegant', name: 'Elegant', tier: 'premium', layout: 'centered', accent: '#9a6b2f', photo: true },
  { id: 'creative', name: 'Creative', tier: 'premium', layout: 'sidebar-right', accent: '#0e7490', photo: true },
  { id: 'bold', name: 'Bold', tier: 'premium', layout: 'bold', accent: '#e11d48', photo: false },
  { id: 'corporate', name: 'Corporate', tier: 'premium', layout: 'topbar-side', accent: '#0c4a6e', photo: true },
  { id: 'academic', name: 'Academic', tier: 'premium', layout: 'academic', accent: '#7f1d1d', photo: false },
  { id: 'split', name: 'Split', tier: 'premium', layout: 'split', accent: '#6d28d9', photo: true },
  { id: 'infographic', name: 'Infographic', tier: 'premium', layout: 'bars', accent: '#ea580c', photo: true },
  { id: 'ink', name: 'Ink', tier: 'premium', layout: 'ink', accent: '#0a1a33', photo: false },
];

export const DEFAULT_TEMPLATE_ID = 'classic';
export const TEMPLATE_IDS = TEMPLATES.map((t) => t.id);

const withOverrides = (tpl, config) => {
  const o = config.templates[tpl.id] ?? {};
  return { ...tpl, tier: o.tier === 'free' || o.tier === 'premium' ? o.tier : tpl.tier, enabled: o.enabled !== false };
};

/** Every template with admin overrides applied, in admin order (unknown ids keep their default place). */
export function allTemplates(config = getAdminConfig()) {
  const rank = (id) => {
    const i = config.order.indexOf(id);
    return i === -1 ? config.order.length + TEMPLATE_IDS.indexOf(id) : i;
  };
  return TEMPLATES.map((tpl) => withOverrides(tpl, config)).sort((a, b) => rank(a.id) - rank(b.id));
}

/** Templates visitors can pick. Hidden ones still render for CVs that already use them. */
export const useTemplates = () => allTemplates(useAdminConfig()).filter((tpl) => tpl.enabled);

/** Template for a new CV: the first visible free one, so hidden or paid designs are never the silent default. */
export function defaultTemplateId(config = getAdminConfig()) {
  const shown = allTemplates(config).filter((tpl) => tpl.enabled);
  return (shown.find((tpl) => tpl.tier === 'free') ?? shown[0])?.id ?? DEFAULT_TEMPLATE_ID;
}

export const getTemplate = (id) => withOverrides(TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0], getAdminConfig());
export const isPremiumTemplate = (id) => getTemplate(id).tier === 'premium';
