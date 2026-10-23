import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext.jsx';
import { UI_LANGUAGES } from '../i18n/ui.js';
import { cvLabels } from '../i18n/cvLabels.js';
import { useCvStore } from '../state/CvStore.jsx';
import { useTemplates } from '../templates/registry.js';
import TemplateThumb from '../components/TemplateThumb.jsx';
import InkBasin from '../components/InkBasin.jsx';

const NIGHT_INK = ['#f6f7f9', '#aeb6c2', '#dde2e8', '#606d80'];
const HEADING_KEYS = ['experience', 'education', 'skills', 'languages'];

export default function Home() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { createCv, updateCv, cvs } = useCvStore();
  const basin = useRef(null);
  const [cvLanguage, setCvLanguage] = useState(lang);
  const [name, setName] = useState('');
  const labels = cvLabels(cvLanguage);
  const templates = useTemplates();
  const counts = { free: templates.filter((tpl) => tpl.tier === 'free').length, premium: templates.filter((tpl) => tpl.tier === 'premium').length };

  function start(e) {
    e.preventDefault();
    const cv = createCv({ cvLanguage });
    const fullName = name.trim();
    if (fullName) updateCv(cv.id, (c) => ({ ...c, personal: { ...c.personal, fullName } }));
    navigate(`/editor/${cv.id}`);
  }

  function chooseLanguage(code, i) {
    setCvLanguage(code);
    basin.current?.drop(0.62 + i * 0.1, 0.3 + i * 0.18);
  }

  return (
    <>
      <section className="basin-hero">
        <InkBasin ref={basin} className="basin-canvas" label={t('home.basinLabel')} />
        <div className="container basin-inner">
          <div className="basin-copy">
            <h1>{t('home.heroTitle')}</h1>
            <p className="lead">{t('home.heroText')}</p>
            <form className="start-form" onSubmit={start}>
              <div className="field">
                <label htmlFor="start-name">
                  {t('field.fullName')} <span className="opt">({t('common.optional')})</span>
                </label>
                <input id="start-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={120} />
              </div>
              <fieldset className="ink-langs">
                <legend>{t('editor.cvLanguage')}</legend>
                {UI_LANGUAGES.map((l, i) => (
                  <label key={l.code} className="ink-lang">
                    <input type="radio" name="cv-language" value={l.code} checked={cvLanguage === l.code} onChange={() => chooseLanguage(l.code, i)} />
                    <span className="ink-dot" aria-hidden="true" />
                    {l.label}
                  </label>
                ))}
              </fieldset>
              <button type="submit" className="btn btn-primary btn-lg">
                {t('home.ctaCreate')} <ArrowRight size={18} aria-hidden="true" />
              </button>
            </form>
            <p className="basin-links">
              <Link to="/templates">{t('home.ctaTemplates')}</Link>
              {cvs.length > 0 && <Link to="/dashboard">{t('home.myCvs')}</Link>}
            </p>
          </div>
          <div className="basin-headings" aria-live="polite">
            <p>{t('home.headingsIn')}</p>
            <ul key={cvLanguage} lang={cvLanguage}>
              {HEADING_KEYS.map((k, i) => (
                <li key={k} style={{ '--i': i }}>{labels[k]}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className="basin-hint" aria-hidden="true">{t('home.basinHint')}</p>
      </section>

      <section className="container section">
        <h2>{t('home.howTitle')}</h2>
        <ol className="how-steps">
          {[1, 2, 3].map((n) => (
            <li key={n}>
              <span className="how-num" aria-hidden="true">{n}</span>
              <h3>{t(`home.how${n}Title`)}</h3>
              <p>{t(`home.how${n}Text`)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="section section-mist">
        <div className="container">
          <div className="section-head">
            <div>
              <h2>{t('home.templatesTitle')}</h2>
              <p className="lead">{t('home.templatesText', counts)}</p>
            </div>
            <Link to="/templates" className="btn btn-secondary">{t('home.seeAllTemplates')}</Link>
          </div>
          <ul className="template-strip">
            {templates.map((tpl) => (
              <li key={tpl.id}>
                <Link to="/templates" aria-label={tpl.name}>
                  <TemplateThumb template={tpl} />
                </Link>
                <span>
                  {tpl.name}
                  <span className={`badge badge-${tpl.tier}`}>{t(tpl.tier === 'premium' ? 'common.premium' : 'common.free')}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container section">
        <h2>{t('home.benefitsTitle')}</h2>
        <dl className="benefits">
          {[1, 2, 3, 4].map((n) => (
            <div key={n}>
              <dt>{t(`home.benefit${n}Title`)}</dt>
              <dd>{t(`home.benefit${n}Text`)}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="plans-close">
        <InkBasin className="close-canvas" water="#0a1a33" palette={NIGHT_INK} seed="center" label={t('home.basinLabel')} />
        <div className="container plans-inner">
          <div>
            <h2>{t('home.plansTitle')}</h2>
            <p className="lead">{t('home.plansText')}</p>
          </div>
          <div className="teaser-cols">
            <div>
              <h3>{t('common.free')}</h3>
              <ul>
                {['create', 'freeTemplates', 'pdf', 'local'].map((f) => <li key={f}>{t(`pricing.f.${f}`, { n: counts.free })}</li>)}
              </ul>
            </div>
            <div>
              <h3>{t('common.premium')}</h3>
              <ul>
                {['allFree', 'premiumTemplates', 'premiumPdf'].map((f) => <li key={f}>{t(`pricing.f.${f}`, { n: counts.premium })}</li>)}
              </ul>
            </div>
          </div>
          <Link to="/pricing" className="btn btn-light">{t('home.seePricing')}</Link>
        </div>
      </section>
    </>
  );
}
