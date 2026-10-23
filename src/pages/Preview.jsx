import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext.jsx';
import { useCvStore } from '../state/CvStore.jsx';
import { canUseTemplate, usePremium } from '../lib/premium.js';
import { cvDisplayTitle } from '../lib/cvModel.js';
import PdfPreview from '../components/PdfPreview.jsx';
import DownloadButton from '../components/DownloadButton.jsx';

export default function Preview() {
  const { id } = useParams();
  const { t } = useI18n();
  const cv = useCvStore().getCv(id);
  usePremium();

  if (!cv) {
    return (
      <div className="container narrow page">
        <p className="notice">{t('editor.notFound')}</p>
        <Link to="/dashboard" className="btn btn-primary">{t('nav.dashboard')}</Link>
      </div>
    );
  }

  return (
    <div className="container page preview-page">
      <div className="preview-bar">
        <Link to={`/editor/${cv.id}`} className="btn btn-ghost"><ArrowLeft size={16} aria-hidden="true" /> {t('preview.back')}</Link>
        <h1>{cvDisplayTitle(cv, t('dash.untitled'))}</h1>
        <DownloadButton cv={cv} />
      </div>
      {!canUseTemplate(cv.templateId) && (
        <p className="notice notice-premium">
          {t('editor.premiumTemplateWarning')} <Link to="/pricing">{t('templates.unlock')}</Link>
        </p>
      )}
      <PdfPreview cv={cv} className="pdf-frame-full" />
    </div>
  );
}
