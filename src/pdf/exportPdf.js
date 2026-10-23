import { createElement } from 'react';
import { pdf } from '@react-pdf/renderer';
import CvDocument from './CvDocument.jsx';
import { pdfFileName } from '../lib/cvModel.js';
import { canUseTemplate } from '../lib/premium.js';

export const renderCvBlob = (cv) => pdf(createElement(CvDocument, { cv })).toBlob();

/** Generates and downloads the PDF. Throws Error('premiumRequired' | 'pdfFailed'). */
export async function downloadCvPdf(cv) {
  if (!canUseTemplate(cv.templateId)) throw new Error('premiumRequired');
  let blob;
  try {
    blob = await renderCvBlob(cv);
  } catch (err) {
    console.error(err);
    throw new Error('pdfFailed');
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = pdfFileName(cv);
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
