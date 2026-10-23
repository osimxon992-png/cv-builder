import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, Check, Eye, LayoutTemplate } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext.jsx';
import { useCvStore } from '../state/CvStore.jsx';
import { CV_LANGUAGES, OPTIONAL_SECTIONS } from '../lib/cvModel.js';
import { firstInvalidStep, STEPS, validateStep } from '../lib/validation.js';
import { canUseTemplate, usePremium } from '../lib/premium.js';
import { getTemplate } from '../templates/registry.js';
import Field from '../components/Field.jsx';
import Modal from '../components/Modal.jsx';
import TemplateGrid from '../components/TemplateGrid.jsx';
import PdfPreview from '../components/PdfPreview.jsx';
import DownloadButton from '../components/DownloadButton.jsx';
import { useToast } from '../components/Toast.jsx';
import PersonalStep from '../editor/PersonalStep.jsx';
import EntryListEditor from '../editor/EntryListEditor.jsx';
import TagEditor from '../editor/TagEditor.jsx';

function StepContent({ step, cv, update, errors }) {
  const { t } = useI18n();
  const props = { cv, update, errors };
  switch (step) {
    case 'personal':
      return <PersonalStep {...props} />;
    case 'summary':
      return (
        <Field
          as="textarea"
          rows={8}
          label={t('field.summary')}
          optional
          hint={t('editor.summaryHint')}
          value={cv.summary}
          onChange={(e) => update((c) => ({ ...c, summary: e.target.value }))}
        />
      );
    case 'skills':
      return <TagEditor section="skills" withCategory label={t('field.skill')} {...props} />;
    case 'additional':
      return (
        <div className="optional-sections">
          <p className="hint">{t('editor.optionalHint')}</p>
          {OPTIONAL_SECTIONS.map((section) => {
            const visible = !cv.hiddenSections.includes(section);
            const toggle = () =>
              update((c) => ({
                ...c,
                hiddenSections: visible ? [...c.hiddenSections, section] : c.hiddenSections.filter((s) => s !== section),
              }));
            return (
              <section key={section} className={`optional-section ${visible ? '' : 'is-hidden'}`}>
                <div className="optional-head">
                  <h3>{t(`section.${section}`)}</h3>
                  <label className="check">
                    <input type="checkbox" checked={visible} onChange={toggle} /> {t('editor.showInCv')}
                  </label>
                </div>
                {section === 'interests' ? (
                  <TagEditor section="interests" label={t('field.interest')} {...props} />
                ) : (
                  <EntryListEditor section={section} {...props} />
                )}
              </section>
            );
          })}
        </div>
      );
    default:
      return <EntryListEditor section={step} {...props} />;
  }
}

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const notify = useToast();
  const { getCv, updateCv, saveError } = useCvStore();
  usePremium();
  const cv = getCv(id);
  const [stepIndex, setStepIndex] = useState(0);
  const [errors, setErrors] = useState({});
  const [pickerOpen, setPickerOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const step = STEPS[stepIndex];
  const update = useCallback((updater) => updateCv(id, updater), [id, updateCv]);

  // After a failed submit, re-check as the user types so fixed fields clear immediately.
  const hasErrors = Object.keys(errors).length > 0;
  useEffect(() => {
    if (hasErrors && cv) setErrors(validateStep(step, cv));
  }, [cv, step, hasErrors]);

  if (!cv) {
    return (
      <div className="container narrow page">
        <p className="notice">{t('editor.notFound')}</p>
        <Link to="/dashboard" className="btn btn-primary">{t('nav.dashboard')}</Link>
      </div>
    );
  }

  const goTo = (index) => {
    setErrors({});
    setStepIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  function next() {
    const errs = validateStep(step, cv);
    setErrors(errs);
    if (Object.keys(errs).length) return notify(t('editor.fixErrors'), 'error');
    goTo(stepIndex + 1);
  }

  function finish() {
    const bad = firstInvalidStep(cv);
    if (bad) {
      setStepIndex(STEPS.indexOf(bad));
      setErrors(validateStep(bad, cv));
      return notify(t('editor.fixErrors'), 'error');
    }
    navigate(`/preview/${cv.id}`);
  }

  const template = getTemplate(cv.templateId);

  return (
    <div className="editor container wide-container">
      <div className="editor-bar">
        <Field
          className="title-field"
          label={t('editor.cvTitle')}
          placeholder={t('editor.cvTitlePlaceholder')}
          value={cv.title}
          onChange={(e) => update((c) => ({ ...c, title: e.target.value }))}
        />
        <div className="field">
          <span className="label">{t('editor.template')}</span>
          <button type="button" className="btn btn-secondary" onClick={() => setPickerOpen(true)}>
            <LayoutTemplate size={16} aria-hidden="true" /> {template.name}
          </button>
        </div>
        <Field as="select" label={t('editor.cvLanguage')} title={t('editor.cvLanguageHint')} value={cv.cvLanguage} onChange={(e) => update((c) => ({ ...c, cvLanguage: e.target.value }))}>
          {CV_LANGUAGES.map((code) => <option key={code} value={code}>{t(`lang.${code}`)}</option>)}
        </Field>
        <div className="editor-bar-actions">
          <span className={`save-state ${saveError ? 'error-text' : ''}`} role="status">
            {saveError ? <AlertTriangle size={16} aria-hidden="true" /> : <Check size={16} aria-hidden="true" />}
            {saveError ? '' : t('editor.saved')}
          </span>
          <Link to={`/preview/${cv.id}`} className="btn btn-ghost"><Eye size={16} aria-hidden="true" /> {t('editor.openPreview')}</Link>
          <DownloadButton cv={cv} />
        </div>
      </div>
      {saveError && <p className="notice notice-error">{t('editor.storageError')}</p>}
      {!canUseTemplate(cv.templateId) && (
        <p className="notice notice-premium">
          {t('editor.premiumTemplateWarning')} <Link to="/pricing">{t('templates.unlock')}</Link>
        </p>
      )}

      <div className="editor-layout">
        <div className="editor-form">
          <ol className="stepper" aria-label={t('editor.stepOf', { n: stepIndex + 1, total: STEPS.length })}>
            {STEPS.map((s, i) => (
              <li key={s}>
                <button type="button" className={i === stepIndex ? 'is-active' : ''} aria-current={i === stepIndex ? 'step' : undefined} onClick={() => goTo(i)}>
                  <span className="step-num">{i + 1}</span>
                  <span className="step-name">{t(`step.${s}`)}</span>
                </button>
              </li>
            ))}
          </ol>

          <section className="step-panel" aria-labelledby="step-title">
            <h1 id="step-title">{t(`step.${step}`)}</h1>
            {hasErrors && <p className="notice notice-error" role="alert">{t('editor.fixErrors')}</p>}
            <StepContent step={step} cv={cv} update={update} errors={errors} />
          </section>

          <div className="step-nav">
            <button type="button" className="btn btn-ghost" onClick={() => goTo(stepIndex - 1)} disabled={stepIndex === 0}>
              {t('editor.back')}
            </button>
            <button type="button" className="btn btn-secondary preview-toggle" onClick={() => setShowPreview((v) => !v)}>
              <Eye size={16} aria-hidden="true" /> {showPreview ? t('editor.hidePreview') : t('editor.showPreview')}
            </button>
            {stepIndex < STEPS.length - 1 ? (
              <button type="button" className="btn btn-primary" onClick={next}>{t('editor.next')}</button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={finish}>{t('editor.finish')}</button>
            )}
          </div>
        </div>

        <aside className={`editor-preview ${showPreview ? 'is-open' : ''}`} aria-label={t('preview.title')}>
          <PdfPreview cv={cv} />
        </aside>
      </div>

      <Modal open={pickerOpen} onClose={() => setPickerOpen(false)} title={t('editor.changeTemplate')} wide>
        <TemplateGrid
          currentId={cv.templateId}
          onSelect={(tpl) => {
            update((c) => ({ ...c, templateId: tpl.id }));
            setPickerOpen(false);
            notify(`${t('editor.template')}: ${tpl.name}`);
          }}
        />
      </Modal>
    </div>
  );
}
