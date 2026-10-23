import { DEFAULT_TEMPLATE_ID, TEMPLATE_IDS } from '../templates/registry.js';

export const SCHEMA_VERSION = 1;
export const CV_LANGUAGES = ['uz', 'ru', 'en'];
export const LANGUAGE_LEVELS = ['beginner', 'intermediate', 'advanced', 'fluent', 'native'];
export const SKILL_CATEGORIES = ['technical', 'professional'];
export const OPTIONAL_SECTIONS = ['certifications', 'courses', 'volunteer', 'awards', 'interests', 'customSections'];

// Blank shape of each repeated entry. Adding a new section starts with adding a key here.
export const ENTRY_DEFAULTS = {
  experience: { company: '', position: '', location: '', startDate: '', endDate: '', current: false, description: '' },
  education: { institution: '', degree: '', field: '', startDate: '', endDate: '', current: false, details: '' },
  skills: { name: '', category: 'technical' },
  projects: { name: '', description: '', technologies: '', url: '', repo: '' },
  languages: { name: '', level: 'intermediate' },
  certifications: { title: '', issuer: '', date: '' },
  courses: { title: '', provider: '', date: '' },
  volunteer: { organization: '', role: '', startDate: '', endDate: '', current: false, description: '' },
  awards: { title: '', issuer: '', date: '', description: '' },
  interests: { name: '' },
  customSections: { title: '', content: '' },
};
export const LIST_SECTIONS = Object.keys(ENTRY_DEFAULTS);

const PERSONAL_DEFAULTS = {
  fullName: '', title: '', email: '', phone: '', city: '', country: '', photo: '', linkedin: '', website: '',
};
// Fields that only describe an entry and do not count as "content".
const META_FIELDS = new Set(['id', 'category', 'level', 'current']);

export const newId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export const newEntry = (section, values = {}) => ({ id: newId(), ...ENTRY_DEFAULTS[section], ...values });

export function createCv({ templateId = DEFAULT_TEMPLATE_ID, cvLanguage = 'en', title = '' } = {}) {
  const now = Date.now();
  const cv = {
    version: SCHEMA_VERSION,
    id: newId(),
    title,
    createdAt: now,
    updatedAt: now,
    templateId: TEMPLATE_IDS.includes(templateId) ? templateId : DEFAULT_TEMPLATE_ID,
    cvLanguage: CV_LANGUAGES.includes(cvLanguage) ? cvLanguage : 'en',
    personal: { ...PERSONAL_DEFAULTS },
    summary: '',
    hiddenSections: [],
  };
  for (const section of LIST_SECTIONS) cv[section] = [];
  return cv;
}

const str = (v) => (typeof v === 'string' ? v : typeof v === 'number' ? String(v) : '');
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

function normalizeEntry(section, raw, usedIds) {
  if (!isObj(raw)) return null;
  const entry = { id: typeof raw.id === 'string' && raw.id && !usedIds.has(raw.id) ? raw.id : newId() };
  usedIds.add(entry.id);
  for (const [key, def] of Object.entries(ENTRY_DEFAULTS[section])) {
    entry[key] = typeof def === 'boolean' ? raw[key] === true : str(raw[key]);
  }
  if (section === 'skills' && !SKILL_CATEGORIES.includes(entry.category)) entry.category = 'technical';
  if (section === 'languages' && !LANGUAGE_LEVELS.includes(entry.level)) entry.level = 'intermediate';
  return entry;
}

/**
 * Turns untrusted data (LocalStorage, imported JSON) into a well-formed CV.
 * Unknown keys are dropped, missing ones get defaults. Returns null if it is not a CV at all.
 */
export function normalizeCv(raw) {
  if (!isObj(raw) || !isObj(raw.personal)) return null;
  const cv = createCv({ templateId: raw.templateId, cvLanguage: raw.cvLanguage, title: str(raw.title) });
  if (typeof raw.id === 'string' && raw.id) cv.id = raw.id;
  if (Number.isFinite(raw.createdAt)) cv.createdAt = raw.createdAt;
  if (Number.isFinite(raw.updatedAt)) cv.updatedAt = raw.updatedAt;
  for (const key of Object.keys(PERSONAL_DEFAULTS)) cv.personal[key] = str(raw.personal[key]);
  // Only embedded raster images: no remote URLs (privacy) and nothing react-pdf can't draw.
  if (!/^data:image\/(jpeg|png);base64,/.test(cv.personal.photo)) cv.personal.photo = '';
  cv.summary = str(raw.summary);
  for (const section of LIST_SECTIONS) {
    const usedIds = new Set();
    cv[section] = (Array.isArray(raw[section]) ? raw[section] : [])
      .map((e) => normalizeEntry(section, e, usedIds))
      .filter(Boolean);
  }
  cv.hiddenSections = Array.isArray(raw.hiddenSections)
    ? raw.hiddenSections.filter((s) => OPTIONAL_SECTIONS.includes(s))
    : [];
  return cv;
}

export function duplicateCv(cv, titleSuffix) {
  const now = Date.now();
  const title = `${cv.title || cv.personal.fullName} ${titleSuffix}`.trim();
  return { ...structuredClone(cv), id: newId(), title, createdAt: now, updatedAt: now };
}

export const isEntryFilled = (entry) =>
  Object.entries(entry).some(([k, v]) => !META_FIELDS.has(k) && typeof v === 'string' && v.trim());

export const filledEntries = (cv, section) => (cv[section] ?? []).filter(isEntryFilled);

export function isSectionVisible(cv, section) {
  if (cv.hiddenSections.includes(section)) return false;
  return section === 'summary' ? Boolean(cv.summary.trim()) : filledEntries(cv, section).length > 0;
}

export const cvDisplayTitle = (cv, fallback) => cv.title.trim() || cv.personal.fullName.trim() || fallback;

// Unicode-aware so Cyrillic and Uzbek names survive: "Иван Петров" -> "Иван_Петров_CV.pdf".
export function pdfFileName(cv) {
  const base = cv.personal.fullName.trim().replace(/[^\p{L}\p{N}]+/gu, '_').replace(/^_+|_+$/g, '');
  return base ? `${base}_CV.pdf` : 'CV.pdf';
}

export const toBackupJson = (cv) =>
  JSON.stringify({ app: 'cv-builder', version: SCHEMA_VERSION, exportedAt: new Date().toISOString(), cv }, null, 2);

/** Parses a backup file's text. Throws Error('importParse' | 'importInvalid'). */
export function parseBackupJson(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('importParse');
  }
  const cv = normalizeCv(isObj(data) && data.app === 'cv-builder' ? data.cv : data);
  if (!cv) throw new Error('importInvalid');
  return cv;
}
