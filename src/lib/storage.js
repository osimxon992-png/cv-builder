import { normalizeCv } from './cvModel.js';

const CVS_KEY = 'cvb.cvs.v1';

/** Loads saved CVs. Never throws: corrupted data is backed up under another key instead of being lost. */
export function loadCvs() {
  let raw;
  try {
    raw = localStorage.getItem(CVS_KEY);
  } catch {
    return [];
  }
  if (!raw) return [];
  try {
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) throw new Error('not an array');
    const seen = new Set();
    return list.map(normalizeCv).filter((cv) => cv && !seen.has(cv.id) && seen.add(cv.id));
  } catch {
    try {
      localStorage.setItem(`${CVS_KEY}.corrupt-${Date.now()}`, raw);
    } catch {
      /* storage full: nothing more we can do */
    }
    return [];
  }
}

/** Throws when storage is full or unavailable; the caller keeps the in-memory copy and reports it. */
export function saveCvs(cvs) {
  localStorage.setItem(CVS_KEY, JSON.stringify(cvs));
}

export function readPref(key, fallback) {
  try {
    return localStorage.getItem(`cvb.${key}`) ?? fallback;
  } catch {
    return fallback;
  }
}

export function writePref(key, value) {
  try {
    localStorage.setItem(`cvb.${key}`, value);
  } catch {
    /* preferences are non-critical */
  }
}
