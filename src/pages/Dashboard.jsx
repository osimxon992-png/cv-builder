import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Copy, Eye, FileDown, FilePlus2, Pencil, PencilLine, Trash2, Upload } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext.jsx';
import InkBasin from '../components/InkBasin.jsx';
import { useCvStore } from '../state/CvStore.jsx';
import { cvDisplayTitle, parseBackupJson, toBackupJson } from '../lib/cvModel.js';
import { getTemplate } from '../templates/registry.js';
import Modal from '../components/Modal.jsx';
import DownloadButton from '../components/DownloadButton.jsx';
import TemplateThumb from '../components/TemplateThumb.jsx';
import { useToast } from '../components/Toast.jsx';

const MAX_IMPORT_BYTES = 10 * 1024 * 1024;

function downloadJson(cv, name) {
  const url = URL.createObjectURL(new Blob([toBackupJson(cv)], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name.replace(/[^\p{L}\p{N}]+/gu, '_') || 'CV'}_backup.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

function CvCard({ cv, onDelete }) {
  const { t, lang } = useI18n();
  const notify = useToast();
  const { duplicateCv, updateCv } = useCvStore();
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState('');
  const title = cvDisplayTitle(cv, t('dash.untitled'));
  const template = getTemplate(cv.templateId);
  const modified = new Intl.DateTimeFormat(lang, { dateStyle: 'medium', timeStyle: 'short' }).format(cv.updatedAt);

  function saveName(e) {
    e.preventDefault();
    updateCv(cv.id, (c) => ({ ...c, title: name.trim() }));
    setRenaming(false);
  }

  return (
    <li className="cv-card">
      <Link to={`/editor/${cv.id}`} className="desk desk-small" aria-label={`${t('dash.edit')}: ${title}`}>
        <TemplateThumb template={template} />
      </Link>
      <div className="cv-card-body">
        {renaming ? (
          <form className="rename-form" onSubmit={saveName}>
            <label className="visually-hidden" htmlFor={`rename-${cv.id}`}>{t('dash.renameLabel')}</label>
            <input id={`rename-${cv.id}`} value={name} onChange={(e) => setName(e.target.value)} autoFocus maxLength={120} />
            <button type="submit" className="btn btn-primary">{t('common.save')}</button>
            <button type="button" className="btn btn-ghost" onClick={() => setRenaming(false)}>{t('common.cancel')}</button>
          </form>
        ) : (
          <h2>{title}</h2>
        )}
        <dl className="cv-meta">
          <div><dt>{t('dash.template')}</dt><dd>{template.name}{template.tier === 'premium' && <span className="badge badge-premium">{t('common.premium')}</span>}</dd></div>
          <div><dt>{t('editor.cvLanguage')}</dt><dd>{t(`lang.${cv.cvLanguage}`)}</dd></div>
          <div><dt>{t('dash.modified')}</dt><dd>{modified}</dd></div>
        </dl>
        <div className="cv-actions">
          <Link to={`/editor/${cv.id}`} className="btn btn-primary"><Pencil size={16} aria-hidden="true" /> {t('dash.edit')}</Link>
          <Link to={`/preview/${cv.id}`} className="btn btn-secondary"><Eye size={16} aria-hidden="true" /> {t('dash.preview')}</Link>
          <DownloadButton cv={cv} className="btn btn-secondary" />
        </div>
        <div className="cv-actions cv-actions-minor">
          <button type="button" className="btn btn-ghost" onClick={() => { duplicateCv(cv.id, t('dash.copySuffix')); notify(t('dash.duplicated'), 'success'); }}>
            <Copy size={16} aria-hidden="true" /> {t('dash.duplicate')}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => { setName(cv.title || cv.personal.fullName); setRenaming(true); }}>
            <PencilLine size={16} aria-hidden="true" /> {t('dash.rename')}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => downloadJson(cv, title)}>
            <FileDown size={16} aria-hidden="true" /> {t('dash.export')}
          </button>
          <button type="button" className="btn btn-ghost danger" onClick={() => onDelete(cv)}>
            <Trash2 size={16} aria-hidden="true" /> {t('dash.delete')}
          </button>
        </div>
      </div>
    </li>
  );
}

export default function Dashboard() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const notify = useToast();
  const { cvs, createCv, importCv, deleteCv } = useCvStore();
  const [deleting, setDeleting] = useState(null);
  const sorted = [...cvs].sort((a, b) => b.updatedAt - a.updatedAt);

  const createNew = () => navigate(`/editor/${createCv({ cvLanguage: lang }).id}`);

  async function onImport(e) {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      if (file.size > MAX_IMPORT_BYTES) throw new Error('importInvalid');
      const cv = importCv(parseBackupJson(await file.text()));
      notify(t('dash.imported', { name: cvDisplayTitle(cv, t('dash.untitled')) }), 'success');
    } catch (err) {
      notify(t(err.message === 'importParse' ? 'error.importParse' : 'error.importInvalid'), 'error');
    }
  }

  return (
    <div className="container page">
      <header className="page-head page-head-row">
        <InkBasin className="head-ink" calm seed="center" />
        <div>
          <h1>{t('dash.title')}</h1>
          <p className="lead">{t('dash.subtitle')}</p>
        </div>
        <div className="head-actions">
          <label className="btn btn-secondary file-btn">
            <Upload size={16} aria-hidden="true" /> {t('dash.import')}
            <input type="file" accept="application/json,.json" onChange={onImport} className="visually-hidden" />
          </label>
          <button type="button" className="btn btn-primary" onClick={createNew}>
            <FilePlus2 size={16} aria-hidden="true" /> {t('dash.new')}
          </button>
        </div>
      </header>

      {sorted.length === 0 ? (
        <div className="empty-state">
          <div className="desk desk-empty"><div className="sheet sheet-blank" aria-hidden="true" /></div>
          <h2>{t('dash.emptyTitle')}</h2>
          <p>{t('dash.emptyText')}</p>
          <button type="button" className="btn btn-primary" onClick={createNew}>
            <FilePlus2 size={16} aria-hidden="true" /> {t('home.ctaCreate')}
          </button>
        </div>
      ) : (
        <ul className="cv-list">
          {sorted.map((cv) => <CvCard key={cv.id} cv={cv} onDelete={setDeleting} />)}
        </ul>
      )}

      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title={t('dash.deleteTitle')}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setDeleting(null)}>{t('common.cancel')}</button>
            <button type="button" className="btn btn-danger" onClick={() => { deleteCv(deleting.id); setDeleting(null); }}>
              {t('common.delete')}
            </button>
          </>
        }
      >
        <p>{t('dash.deleteText', { name: deleting ? cvDisplayTitle(deleting, t('dash.untitled')) : '' })}</p>
      </Modal>
    </div>
  );
}
