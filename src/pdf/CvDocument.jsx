import { Document } from '@react-pdf/renderer';
import { registerFonts } from './fonts.js';
import { TEMPLATE_PAGES } from './templates.jsx';

registerFonts(import.meta.env?.BASE_URL ?? '/');

export default function CvDocument({ cv }) {
  const TemplatePage = TEMPLATE_PAGES[cv.templateId] ?? TEMPLATE_PAGES.classic;
  return (
    <Document title={cv.personal.fullName ? `${cv.personal.fullName} – CV` : 'CV'} author={cv.personal.fullName} creator="CV Builder" producer="CV Builder" language={cv.cvLanguage}>
      <TemplatePage cv={cv} />
    </Document>
  );
}
