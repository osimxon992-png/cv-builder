import test from 'node:test';
import assert from 'node:assert/strict';
import { createCv, duplicateCv, isSectionVisible, newEntry, normalizeCv, parseBackupJson, pdfFileName, toBackupJson } from './cvModel.js';
import { firstInvalidStep, isUrl, validateStep } from './validation.js';

const validCv = () => {
  const cv = createCv();
  cv.personal.fullName = 'John Doe';
  cv.personal.email = 'john@example.com';
  return cv;
};

test('normalizeCv rejects non-CVs and repairs broken fields', () => {
  assert.equal(normalizeCv(null), null);
  assert.equal(normalizeCv([]), null);
  assert.equal(normalizeCv({ title: 'x' }), null);
  const cv = normalizeCv({
    personal: { fullName: 42, photo: 'https://evil.example/track.png' },
    templateId: 'nope',
    cvLanguage: 'de',
    experience: [{ id: 'a', company: 'X' }, { id: 'a', company: 'Y' }, 'junk'],
    skills: [{ name: 'JS', category: 'weird' }],
    hiddenSections: ['awards', 'experience'],
  });
  assert.equal(cv.personal.fullName, '42');
  assert.equal(cv.personal.photo, '');
  assert.equal(cv.templateId, 'classic');
  assert.equal(cv.cvLanguage, 'en');
  assert.equal(cv.experience.length, 2);
  assert.notEqual(cv.experience[0].id, cv.experience[1].id);
  assert.equal(cv.skills[0].category, 'technical');
  assert.deepEqual(cv.hiddenSections, ['awards']);
  assert.deepEqual(cv.education, []);
});

test('backup JSON round-trips and invalid files throw clear codes', () => {
  const cv = validCv();
  cv.skills.push(newEntry('skills', { name: 'React' }));
  assert.deepEqual(parseBackupJson(toBackupJson(cv)), cv);
  assert.throws(() => parseBackupJson('{oops'), /importParse/);
  assert.throws(() => parseBackupJson('{"app":"cv-builder","cv":{}}'), /importInvalid/);
});

test('duplicate gets a new id and keeps content', () => {
  const cv = validCv();
  const copy = duplicateCv(cv, '(copy)');
  assert.notEqual(copy.id, cv.id);
  assert.equal(copy.title, 'John Doe (copy)');
  copy.personal.fullName = 'Changed';
  assert.equal(cv.personal.fullName, 'John Doe');
});

test('pdf filename keeps unicode names', () => {
  const cv = validCv();
  assert.equal(pdfFileName(cv), 'John_Doe_CV.pdf');
  cv.personal.fullName = '  Иван Петров ';
  assert.equal(pdfFileName(cv), 'Иван_Петров_CV.pdf');
  cv.personal.fullName = '';
  assert.equal(pdfFileName(cv), 'CV.pdf');
});

test('empty and hidden sections are not visible', () => {
  const cv = validCv();
  assert.equal(isSectionVisible(cv, 'summary'), false);
  cv.awards.push(newEntry('awards'));
  assert.equal(isSectionVisible(cv, 'awards'), false);
  cv.awards[0].title = 'Best';
  assert.equal(isSectionVisible(cv, 'awards'), true);
  cv.hiddenSections.push('awards');
  assert.equal(isSectionVisible(cv, 'awards'), false);
});

test('validation: personal, entries, dates, urls, duplicates', () => {
  const cv = createCv();
  assert.deepEqual(validateStep('personal', cv), { 'personal.fullName': 'required', 'personal.email': 'required' });
  cv.personal.fullName = 'A';
  cv.personal.email = 'bad@';
  cv.personal.website = 'not a url';
  assert.equal(validateStep('personal', cv)['personal.email'], 'email');
  assert.equal(validateStep('personal', cv)['personal.website'], 'url');
  assert.ok(isUrl('github.com/me') && isUrl('https://x.io') && !isUrl('javascript:alert(1)'));

  const job = newEntry('experience', { company: 'C', position: 'P', startDate: '2022-05', endDate: '2021-01' });
  cv.experience.push(job);
  assert.equal(validateStep('experience', cv)[`${job.id}.endDate`], 'dateOrder');
  job.current = true;
  assert.deepEqual(validateStep('experience', cv), {});

  cv.languages.push(newEntry('languages', { name: 'English' }), newEntry('languages', { name: 'english ' }));
  assert.equal(Object.values(validateStep('languages', cv))[0], 'duplicate');

  const blank = newEntry('projects');
  cv.projects.push(blank);
  assert.equal(validateStep('projects', cv)[`${blank.id}.name`], 'required');
});

test('optional sections can be omitted entirely', () => {
  assert.equal(firstInvalidStep(validCv()), null);
});

test('admin overrides: tier, hidden templates and order', async () => {
  const { allTemplates, TEMPLATE_IDS } = await import('../templates/registry.js');
  const config = { templates: { modern: { tier: 'premium' }, minimal: { enabled: false }, ink: { tier: 'bogus' } }, order: ['ink', 'classic'], prices: {} };
  const list = allTemplates(config);
  assert.equal(list.length, TEMPLATE_IDS.length);
  assert.deepEqual(list.slice(0, 3).map((t) => t.id), ['ink', 'classic', 'modern']);
  assert.equal(list.find((t) => t.id === 'modern').tier, 'premium');
  assert.equal(list.find((t) => t.id === 'minimal').enabled, false);
  assert.equal(list.find((t) => t.id === 'ink').tier, 'premium', 'invalid tier keeps the default');
  const { defaultTemplateId } = await import('../templates/registry.js');
  assert.equal(defaultTemplateId({ templates: { classic: { enabled: false } }, order: [], prices: {} }), 'modern');
  assert.equal(defaultTemplateId({ templates: {}, order: ['ink', 'bold', 'student'], prices: {} }), 'student', 'skips premium templates');
});
