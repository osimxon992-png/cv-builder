import { Link } from 'react-router-dom';
import { Camera, Check, Eye, Lock } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext.jsx';
import { useTemplates } from '../templates/registry.js';
import { usePremium } from '../lib/premium.js';
import TemplateThumb from './TemplateThumb.jsx';

/** Template cards. Locked premium templates link to pricing instead of being selectable. */
export default function TemplateGrid({ currentId, onSelect, onPreview, filter = 'all' }) {
  const { t } = useI18n();
  const premium = usePremium();
  const templates = useTemplates().filter((tpl) => filter === 'all' || tpl.tier === filter);

  return (
    <ul className="template-grid">
      {templates.map((tpl) => {
        const locked = tpl.tier === 'premium' && !premium.active;
        const current = tpl.id === currentId;
        return (
          <li key={tpl.id} className={`template-card ${current ? 'is-current' : ''}`}>
            <div className="desk">
              <TemplateThumb template={tpl} />
            </div>
            <div className="template-info">
              <h3>
                {tpl.name}
                <span className={`badge ${tpl.tier === 'premium' ? 'badge-premium' : 'badge-free'}`}>
                  {tpl.tier === 'premium' ? t('common.premium') : t('common.free')}
                </span>
              </h3>
              <p>{t(`templates.desc.${tpl.id}`)}</p>
              <p className="template-meta">
                <Camera size={14} aria-hidden="true" /> {tpl.photo ? t('templates.photo') : t('templates.noPhoto')}
              </p>
              <div className="template-actions">
                {onPreview && (
                  <button type="button" className="btn btn-ghost" onClick={() => onPreview(tpl)}>
                    <Eye size={16} aria-hidden="true" /> {t('templates.preview')}
                  </button>
                )}
                {current ? (
                  <span className="btn btn-ghost is-static"><Check size={16} aria-hidden="true" /> {t('templates.current')}</span>
                ) : locked ? (
                  <Link to="/pricing" className="btn btn-secondary">
                    <Lock size={16} aria-hidden="true" /> {t('templates.unlock')}
                  </Link>
                ) : (
                  <button type="button" className="btn btn-primary" onClick={() => onSelect(tpl)}>
                    {t('templates.use')}
                  </button>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
