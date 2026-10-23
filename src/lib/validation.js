import { isEntryFilled } from './cvModel.js';

export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

export function isUrl(v) {
  const value = v.trim();
  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(value) ? value : `https://${value}`);
    return ['http:', 'https:'].includes(url.protocol) && url.hostname.includes('.');
  } catch {
    return false;
  }
}

const REQUIRED = {
  experience: ['company', 'position', 'startDate'],
  education: ['institution', 'degree'],
  skills: ['name'],
  projects: ['name'],
  languages: ['name'],
  certifications: ['title'],
  courses: ['title'],
  volunteer: ['organization', 'role'],
  awards: ['title'],
  interests: ['name'],
  customSections: ['title', 'content'],
};
const URL_FIELDS = { projects: ['url', 'repo'] };
const UNIQUE_NAME = new Set(['skills', 'languages', 'interests']);

// Which data sections each wizard step edits.
export const STEP_SECTIONS = {
  personal: [],
  summary: [],
  experience: ['experience'],
  education: ['education'],
  skills: ['skills'],
  projects: ['projects'],
  languages: ['languages'],
  additional: ['certifications', 'courses', 'volunteer', 'awards', 'interests', 'customSections'],
};
export const STEPS = Object.keys(STEP_SECTIONS);

function validateEntries(section, entries, errors) {
  const seenNames = new Set();
  for (const entry of entries) {
    // A completely blank card is allowed while editing, but it may not be submitted.
    if (!isEntryFilled(entry)) {
      errors[`${entry.id}.${REQUIRED[section][0]}`] = 'required';
      continue;
    }
    for (const field of REQUIRED[section]) {
      if (!String(entry[field]).trim()) errors[`${entry.id}.${field}`] = 'required';
    }
    for (const field of URL_FIELDS[section] ?? []) {
      if (entry[field].trim() && !isUrl(entry[field])) errors[`${entry.id}.${field}`] = 'url';
    }
    if ('startDate' in entry && entry.startDate && !entry.current && entry.endDate && entry.endDate < entry.startDate) {
      errors[`${entry.id}.endDate`] = 'dateOrder';
    }
    if (UNIQUE_NAME.has(section)) {
      const key = entry.name.trim().toLowerCase();
      if (key && seenNames.has(key)) errors[`${entry.id}.name`] = 'duplicate';
      seenNames.add(key);
    }
  }
}

/** Returns { fieldKey: errorCode }. Personal keys look like "personal.email", entry keys "<entryId>.<field>". */
export function validateStep(step, cv) {
  const errors = {};
  if (step === 'personal') {
    const p = cv.personal;
    if (!p.fullName.trim()) errors['personal.fullName'] = 'required';
    if (!p.email.trim()) errors['personal.email'] = 'required';
    else if (!isEmail(p.email)) errors['personal.email'] = 'email';
    for (const field of ['linkedin', 'website']) {
      if (p[field].trim() && !isUrl(p[field])) errors[`personal.${field}`] = 'url';
    }
  }
  for (const section of STEP_SECTIONS[step] ?? []) validateEntries(section, cv[section], errors);
  return errors;
}

/** First step that has errors, or null when the whole CV is valid. */
export function firstInvalidStep(cv) {
  return STEPS.find((step) => Object.keys(validateStep(step, cv)).length > 0) ?? null;
}
