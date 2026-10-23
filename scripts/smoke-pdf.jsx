// Renders every template to out/ with sample + stress data. Run: npm run smoke:pdf
import { renderToFile } from '@react-pdf/renderer';
import { mkdirSync } from 'node:fs';
import CvDocument from '../src/pdf/CvDocument.jsx';
import { sampleCv } from '../src/templates/sampleCv.js';
import { TEMPLATE_IDS } from '../src/templates/registry.js';
import { newEntry } from '../src/lib/cvModel.js';

mkdirSync('out', { recursive: true });

function stressCv(templateId) {
  const cv = sampleCv(templateId, 'ru');
  cv.personal.fullName = 'Иван Петров-Ўғлиев';
  cv.summary = 'Oʻzbekcha matn: gʻalaba, oʻquvchi, maʼlumot. Русский текст: съешь же ещё этих мягких французских булок. '.repeat(4);
  cv.experience = Array.from({ length: 9 }, (_, i) => newEntry('experience', {
    company: `Компания №${i + 1}`, position: 'Ведущий разработчик', startDate: '2015-01', endDate: '2016-01',
    description: '- Длинное описание достижений, которое должно переноситься на несколько строк без обрезки текста и наложений\n- https://example.com/a/very/long/url/without/any/spaces/that/must/wrap/somewhere/in/the/pdf\n'.repeat(2),
  }));
  cv.customSections = [newEntry('customSections', { title: 'Публикации', content: 'Статья о React, 2023' })];
  cv.hiddenSections = ['interests'];
  return cv;
}

for (const id of TEMPLATE_IDS) {
  await renderToFile(<CvDocument cv={sampleCv(id)} />, `out/${id}-sample.pdf`);
  await renderToFile(<CvDocument cv={stressCv(id)} />, `out/${id}-stress.pdf`);
  console.log('ok', id);
}
