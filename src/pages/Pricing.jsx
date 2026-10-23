import { useState } from 'react';
import { Check, FlaskConical } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext.jsx';
import { useTemplates } from '../templates/registry.js';
import InkBasin from '../components/InkBasin.jsx';
import { cancelDevPremium, CHECKOUT_URL, DEV_CHECKOUT_ENABLED, startCheckout, usePlans, usePremium } from '../lib/premium.js';
import { useToast } from '../components/Toast.jsx';

const FEATURES = {
  free: ['create', 'freeTemplates', 'pdf', 'local'],
  monthly: ['allFree', 'premiumTemplates', 'premiumPdf'],
  lifetime: ['allFree', 'premiumTemplates', 'premiumPdf', 'forever'],
};

export default function Pricing() {
  const { t, lang } = useI18n();
  const notify = useToast();
  const premium = usePremium();
  const plans = usePlans();
  const templates = useTemplates();
  const [busy, setBusy] = useState(null);
  const devMode = !CHECKOUT_URL && DEV_CHECKOUT_ENABLED;
  const money = new Intl.NumberFormat(lang, { style: 'currency', currency: 'USD' });

  async function choose(planId) {
    setBusy(planId);
    try {
      if ((await startCheckout(planId)) === 'activated') notify(t('pricing.activated'), 'success');
    } catch (err) {
      notify(t(err.message === 'notConfigured' ? 'pricing.notConfigured' : 'pricing.checkoutFailed'), 'error');
    } finally {
      setBusy(null);
    }
  }

  const isCurrent = (planId) => (planId === 'free' ? !premium.active : premium.active && premium.plan === planId);

  return (
    <div className="container page">
      <header className="page-head">
        <InkBasin className="head-ink" calm seed="center" />
        <h1>{t('pricing.title')}</h1>
        <p className="lead">{t('pricing.subtitle')}</p>
      </header>

      {devMode && (
        <div className="notice notice-dev" role="note">
          <FlaskConical size={18} aria-hidden="true" />
          <div>
            <strong>{t('pricing.devTitle')}</strong>
            <p>{t('pricing.devText')}</p>
          </div>
        </div>
      )}
      {premium.active && (
        <p className="notice notice-premium">
          {t('pricing.active')}
          {premium.source === 'dev' && (
            <button type="button" className="btn btn-ghost" onClick={cancelDevPremium}>{t('pricing.disableDev')}</button>
          )}
        </p>
      )}

      <ul className="plans">
        {plans.map((plan) => (
          <li key={plan.id} className={`plan ${plan.id !== 'free' ? 'plan-premium' : ''}`}>
            <h2>{t(`pricing.plan.${plan.id}`)}</h2>
            <p className="price">
              {money.format(plan.price)}
              {plan.period && <small> {plan.period === 'month' ? t('pricing.perMonth') : t('pricing.once')}</small>}
            </p>
            <ul className="features">
              {FEATURES[plan.id].map((f) => (
                <li key={f}><Check size={16} aria-hidden="true" /> {t(`pricing.f.${f}`, { n: templates.filter((tpl) => tpl.tier === (f === 'freeTemplates' ? 'free' : 'premium')).length })}</li>
              ))}
            </ul>
            {isCurrent(plan.id) ? (
              <span className="btn btn-ghost is-static">{t('pricing.currentPlan')}</span>
            ) : plan.id !== 'free' ? (
              <button type="button" className="btn btn-primary" onClick={() => choose(plan.id)} disabled={busy !== null}>
                {busy === plan.id ? t('pricing.processing') : t('pricing.choose')}
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
