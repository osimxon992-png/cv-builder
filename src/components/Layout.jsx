import { useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext.jsx';
import { UI_LANGUAGES } from '../i18n/ui.js';
import { usePremium } from '../lib/premium.js';

export default function Layout() {
  const { t, lang, setLang } = useI18n();
  const premium = usePremium();
  const { pathname } = useLocation();
  // New pages open at the top; otherwise the old scroll position hides their header bar under the sticky nav.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <div className="app">
      <header className="site-header">
        <div className="container header-inner">
          <NavLink to="/" className="brand" aria-label="CV Builder">
            {/* suminagashi rings: ink and clear water alternating around one drop */}
            <svg className="brand-mark" viewBox="0 0 32 32" aria-hidden="true">
              <circle cx="16" cy="16" r="15" fill="#0a1a33" />
              <ellipse cx="17" cy="15.5" rx="11" ry="10" fill="#f6f7f9" />
              <ellipse cx="17.5" cy="15" rx="8" ry="7" fill="#0a1a33" />
              <ellipse cx="18" cy="14.5" rx="4.6" ry="4" fill="#f6f7f9" />
              <circle cx="18.4" cy="14.2" r="2.2" fill="#0a1a33" />
            </svg>
            <span>CV Builder</span>
          </NavLink>
          <nav className="main-nav" aria-label={t('nav.menu')}>
            <NavLink to="/" end>{t('nav.home')}</NavLink>
            <NavLink to="/templates">{t('nav.templates')}</NavLink>
            <NavLink to="/dashboard">{t('nav.dashboard')}</NavLink>
            <NavLink to="/pricing">
              {t('nav.pricing')}
              {premium.active && <span className="badge badge-premium">{t('common.premium')}</span>}
            </NavLink>
          </nav>
          <label className="lang-select">
            <span className="visually-hidden">{t('nav.interfaceLanguage')}</span>
            <select value={lang} onChange={(e) => setLang(e.target.value)} title={t('nav.interfaceLanguage')}>
              {UI_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </label>
        </div>
      </header>
      <main className="site-main">
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container footer-inner">
          <span>{t('footer.text')}</span>
          <NavLink to="/admin">{t('nav.admin')}</NavLink>
        </div>
      </footer>
    </div>
  );
}
