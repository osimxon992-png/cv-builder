// Form definitions for repeated-entry sections. `label` is a UI string key.
const dates = [
  { name: 'startDate', label: 'field.startDate', type: 'month' },
  { name: 'endDate', label: 'field.endDate', type: 'month' },
  { name: 'current', label: 'field.current', type: 'checkbox' },
];

export const SECTION_FIELDS = {
  experience: [
    { name: 'position', label: 'field.position', required: true },
    { name: 'company', label: 'field.company', required: true },
    { name: 'location', label: 'field.location' },
    ...dates.map((f) => (f.name === 'startDate' ? { ...f, required: true } : f)),
    { name: 'description', label: 'field.responsibilities', type: 'textarea', hint: 'editor.descriptionHint' },
  ],
  education: [
    { name: 'institution', label: 'field.institution', required: true },
    { name: 'degree', label: 'field.degree', required: true },
    { name: 'field', label: 'field.field' },
    ...dates,
    { name: 'details', label: 'field.details', type: 'textarea' },
  ],
  projects: [
    { name: 'name', label: 'field.projectName', required: true },
    { name: 'technologies', label: 'field.technologies' },
    { name: 'url', label: 'field.url', type: 'url' },
    { name: 'repo', label: 'field.repo', type: 'url' },
    { name: 'description', label: 'field.description', type: 'textarea', hint: 'editor.descriptionHint' },
  ],
  languages: [
    { name: 'name', label: 'field.language', required: true },
    { name: 'level', label: 'field.level', type: 'select', options: ['beginner', 'intermediate', 'advanced', 'fluent', 'native'], optionLabel: 'level.' },
  ],
  certifications: [
    { name: 'title', label: 'field.certTitle', required: true },
    { name: 'issuer', label: 'field.issuer' },
    { name: 'date', label: 'field.date', type: 'month' },
  ],
  courses: [
    { name: 'title', label: 'field.courseTitle', required: true },
    { name: 'provider', label: 'field.provider' },
    { name: 'date', label: 'field.date', type: 'month' },
  ],
  volunteer: [
    { name: 'role', label: 'field.role', required: true },
    { name: 'organization', label: 'field.organization', required: true },
    ...dates,
    { name: 'description', label: 'field.description', type: 'textarea', hint: 'editor.descriptionHint' },
  ],
  awards: [
    { name: 'title', label: 'field.awardTitle', required: true },
    { name: 'issuer', label: 'field.issuer' },
    { name: 'date', label: 'field.date', type: 'month' },
    { name: 'description', label: 'field.description', type: 'textarea' },
  ],
  customSections: [
    { name: 'title', label: 'field.sectionTitle', required: true },
    { name: 'content', label: 'field.content', type: 'textarea', required: true, hint: 'editor.descriptionHint' },
  ],
};
