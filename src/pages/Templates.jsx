import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext.jsx';
import InkBasin from '../components/InkBasin.jsx';
import { useCvStore } from '../state/CvStore.jsx';
import { sampleCv } from '../templates/sampleCv.js';
import Modal from '../components/Modal.jsx';
import TemplateGrid from '../components/TemplateGrid.jsx';
import PdfPreview from '../components/PdfPreview.jsx';

export default function Templates() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { createCv } = useCvStore();
  const [filter, setFilter] = useState('all');
  const [previewing, setPreviewing] = useState(null);
  const [confirming, setConfirming] = useState(null);
  const [sample, setSample] = useState(null);

  const openPreview = (tpl) => {
    setSample(sampleCv(tpl.id, lang));
    setPreviewing(tpl);
  };

  function create() {
    const cv = createCv({ templateId: confirming.id, cvLanguage: lang });
    navigate(`/editor/${cv.id}`);
  }

  return (
    <div className="container page">
      <header className="page-head">
        <InkBasin className="head-ink" calm seed="center" />
        <h1>{t('templates.title')}</h1>
        <p className="lead">{t('templates.subtitle')}</p>
      </header>
      <div className="segmented" role="group" aria-label={t('templates.title')}>
        {['all', 'free', 'premium'].map((f) => (
          <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>
            {f === 'all' ? t('templates.all') : t(`common.${f}`)}
          </button>
        ))}
      </div>
      <TemplateGrid filter={filter} onSelect={setConfirming} onPreview={openPreview} />

      <Modal open={Boolean(previewing)} onClose={() => setPreviewing(null)} title={previewing?.name} wide>
        <p className="hint">{t('templates.sampleNote')}</p>
        {sample && <PdfPreview cv={sample} className="pdf-frame-modal" />}
      </Modal>

      <Modal
        open={Boolean(confirming)}
        onClose={() => setConfirming(null)}
        title={t('templates.confirmTitle')}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setConfirming(null)}>{t('common.cancel')}</button>
            <button type="button" className="btn btn-primary" onClick={create}>{t('templates.confirmCreate')}</button>
          </>
        }
      >
        <p>{t('templates.confirmText', { name: confirming?.name ?? '' })}</p>
      </Modal>
    </div>
  );
}
