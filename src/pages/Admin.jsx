import { useState } from 'react';
import { ChevronDown, ChevronUp, LogOut } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext.jsx';
import { UI_LANGUAGES } from '../i18n/ui.js';
import { useCvStore } from '../state/CvStore.jsx';
import { allTemplates } from '../templates/registry.js';
import { ADMIN_PASSWORD, resetAdminConfig, updateAdminConfig, useAdminConfig } from '../lib/adminConfig.js';
import { usePlans, usePremium } from '../lib/premium.js';
import { useToast } from '../components/Toast.jsx';
import Modal from '../components/Modal.jsx';
import TemplateThumb from '../components/TemplateThumb.jsx';

const SESSION_KEY = 'cvb.admin.session';

function readSession() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

function writeSession(on) {
  try {
    if (on) sessionStorage.setItem(SESSION_KEY, '1');
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* private mode: the sign-in simply lasts until the page is reloaded */
  }
}

export default function Admin() {
  const { t } = useI18n();
  const [authed, setAuthed] = useState(readSession);

  if (!ADMIN_PASSWORD) {
    return (
      <div className="container narrow page">
        <h1>{t('admin.title')}</h1>
        <p className="notice">{t('admin.disabled')}</p>
      </div>
    );
  }
  if (!authed) {
    return (
      <SignIn
        onSignIn={() => {
          writeSession(true);
          setAuthed(true);
        }}
      />
    );
  }
  return (
    <AdminPanel
      onSignOut={() => {
        writeSession(false);
        setAuthed(false);
      }}
    />
  );
}

function SignIn({ onSignIn }) {
  const { t } = useI18n();
  const [password, setPassword] = useState('');
  const [wrong, setWrong] = useState(false);

  function submit(e) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) onSignIn();
    else setWrong(true);
  }

  return (
    <div className="container narrow page">
      <h1>{t('admin.title')}</h1>
      <form className="admin-signin" onSubmit={submit}>
        <div className={`field ${wrong ? 'has-error' : ''}`}>
          <label htmlFor="admin-password">{t('admin.password')}</label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setWrong(false);
            }}
            aria-invalid={wrong}
            aria-describedby={wrong ? 'admin-password-error' : undefined}
          />
          {wrong && <span id="admin-password-error" className="error-text" role="alert">{t('admin.wrong')}</span>}
        </div>
        <button type="submit" className="btn btn-primary">{t('admin.login')}</button>
      </form>
      <p className="hint">{t('admin.securityNote')}</p>
    </div>
  );
}

function AdminPanel({ onSignOut }) {
  const { t } = useI18n();
  const notify = useToast();
  const config = useAdminConfig();
  const templates = allTemplates(config);
  const plans = usePlans();
  const premium = usePremium();
  const { cvs } = useCvStore();
  const [resetOpen, setResetOpen] = useState(false);
  const paid = plans.filter((plan) => plan.price > 0);
  const [prices, setPrices] = useState(() => Object.fromEntries(paid.map((plan) => [plan.id, String(plan.price)])));
  const [priceErrors, setPriceErrors] = useState({});

  const shownCount = templates.filter((tpl) => tpl.enabled).length;
  const usage = (id) => cvs.filter((cv) => cv.templateId === id).length;

  function save(updater) {
    try {
      updateAdminConfig(updater);
      return true;
    } catch {
      notify(t('admin.saveFailed'), 'error');
      return false;
    }
  }

  const setTemplate = (id, patch) => save((c) => ({ ...c, templates: { ...c.templates, [id]: { ...c.templates[id], ...patch } } }));

  function toggleShown(tpl) {
    if (tpl.enabled && shownCount === 1) return notify(t('admin.atLeastOne'), 'error');
    setTemplate(tpl.id, { enabled: !tpl.enabled });
  }

  function move(index, step) {
    const order = templates.map((tpl) => tpl.id);
    [order[index], order[index + step]] = [order[index + step], order[index]];
    save((c) => ({ ...c, order }));
  }

  function savePrices(e) {
    e.preventDefault();
    const errors = {};
    const parsed = {};
    for (const plan of paid) {
      const value = Number(prices[plan.id].replace(',', '.'));
      if (!Number.isFinite(value) || value <= 0) errors[plan.id] = true;
      else parsed[plan.id] = Math.round(value * 100) / 100;
    }
    setPriceErrors(errors);
    if (Object.keys(errors).length) return;
    if (save((c) => ({ ...c, prices: { ...c.prices, ...parsed } }))) notify(t('admin.saved'), 'success');
  }

  function reset() {
    try {
      resetAdminConfig();
      setPrices(Object.fromEntries(paid.map((plan) => [plan.id, String(plan.price)])));
      notify(t('admin.resetDone'), 'success');
    } catch {
      notify(t('admin.saveFailed'), 'error');
    }
    setResetOpen(false);
  }

  return (
    <div className="container page admin">
      <header className="page-head page-head-row">
        <div>
          <h1>{t('admin.title')}</h1>
          <p className="lead">{t('admin.lead')}</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={onSignOut}>
          <LogOut size={16} aria-hidden="true" /> {t('admin.logout')}
        </button>
      </header>
      <p className="notice notice-dev">{t('admin.securityNote')}</p>

      <section className="admin-section" aria-labelledby="admin-stats">
        <h2 id="admin-stats">{t('admin.stats')}</h2>
        <dl className="admin-stats">
          <div>
            <dt>{t('admin.statCvs')}</dt>
            <dd>{cvs.length}</dd>
          </div>
          <div>
            <dt>{t('admin.statTemplates')}</dt>
            <dd>{shownCount} / {templates.length}</dd>
          </div>
          <div>
            <dt>{t('admin.statPremium')}</dt>
            <dd>{premium.active ? t('admin.statOn') : t('admin.statOff')}</dd>
          </div>
          <div>
            <dt>{t('admin.byLanguage')}</dt>
            <dd className="admin-langs">
              {UI_LANGUAGES.map((l) => (
                <span key={l.code}>{l.label} <b>{cvs.filter((cv) => cv.cvLanguage === l.code).length}</b></span>
              ))}
            </dd>
          </div>
        </dl>
      </section>

      <section className="admin-section" aria-labelledby="admin-templates">
        <h2 id="admin-templates">{t('admin.templates')}</h2>
        <p className="hint">{t('admin.templatesHint')}</p>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">{t('admin.colOrder')}</th>
                <th scope="col">{t('admin.colTemplate')}</th>
                <th scope="col">{t('admin.colTier')}</th>
                <th scope="col">{t('admin.colShown')}</th>
                <th scope="col" className="num">{t('admin.colCvs')}</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((tpl, i) => (
                <tr key={tpl.id} className={tpl.enabled ? '' : 'is-hidden'}>
                  <td>
                    <div className="admin-order">
                      <button type="button" className="icon-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label={t('admin.moveUp', { name: tpl.name })}>
                        <ChevronUp size={16} />
                      </button>
                      <button type="button" className="icon-btn" onClick={() => move(i, 1)} disabled={i === templates.length - 1} aria-label={t('admin.moveDown', { name: tpl.name })}>
                        <ChevronDown size={16} />
                      </button>
                    </div>
                  </td>
                  <th scope="row">
                    <span className="admin-template">
                      <span className="admin-thumb"><TemplateThumb template={tpl} /></span>
                      {tpl.name}
                    </span>
                  </th>
                  <td>
                    <select value={tpl.tier} onChange={(e) => setTemplate(tpl.id, { tier: e.target.value })} aria-label={`${t('admin.colTier')}: ${tpl.name}`}>
                      <option value="free">{t('common.free')}</option>
                      <option value="premium">{t('common.premium')}</option>
                    </select>
                  </td>
                  <td>
                    <label className="check">
                      <input type="checkbox" checked={tpl.enabled} onChange={() => toggleShown(tpl)} />
                      <span className="visually-hidden">{`${t('admin.colShown')}: ${tpl.name}`}</span>
                    </label>
                  </td>
                  <td className="num">{usage(tpl.id)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-section" aria-labelledby="admin-prices">
        <h2 id="admin-prices">{t('admin.prices')}</h2>
        <form className="admin-prices" onSubmit={savePrices} noValidate>
          {paid.map((plan) => (
            <div key={plan.id} className={`field ${priceErrors[plan.id] ? 'has-error' : ''}`}>
              <label htmlFor={`price-${plan.id}`}>{t(`pricing.plan.${plan.id}`)}</label>
              <input
                id={`price-${plan.id}`}
                inputMode="decimal"
                value={prices[plan.id]}
                onChange={(e) => setPrices((p) => ({ ...p, [plan.id]: e.target.value }))}
                aria-invalid={Boolean(priceErrors[plan.id])}
              />
              {priceErrors[plan.id] && <span className="error-text">{t('admin.priceInvalid')}</span>}
            </div>
          ))}
          <button type="submit" className="btn btn-primary">{t('admin.savePrices')}</button>
        </form>
      </section>

      <section className="admin-section">
        <button type="button" className="btn btn-ghost danger" onClick={() => setResetOpen(true)}>{t('admin.reset')}</button>
      </section>

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title={t('admin.resetTitle')}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setResetOpen(false)}>{t('common.cancel')}</button>
            <button type="button" className="btn btn-danger" onClick={reset}>{t('admin.reset')}</button>
          </>
        }
      >
        <p>{t('admin.resetText')}</p>
      </Modal>
    </div>
  );
}
