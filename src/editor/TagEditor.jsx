import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext.jsx';
import { newEntry, SKILL_CATEGORIES } from '../lib/cvModel.js';

/** Free-form tags (skills, interests). Skills also get a technical/professional category. */
export default function TagEditor({ section, cv, update, errors, withCategory = false, label }) {
  const { t } = useI18n();
  const [text, setText] = useState('');
  const [category, setCategory] = useState('technical');
  const [error, setError] = useState('');
  const entries = cv[section];

  function add() {
    const name = text.trim();
    if (!name) return setError('required');
    if (entries.some((e) => e.name.trim().toLowerCase() === name.toLowerCase())) return setError('duplicate');
    update((c) => ({ ...c, [section]: [...c[section], newEntry(section, withCategory ? { name, category } : { name })] }));
    setText('');
    setError('');
  }

  const remove = (id) => update((c) => ({ ...c, [section]: c[section].filter((e) => e.id !== id) }));
  const groups = withCategory ? SKILL_CATEGORIES.map((cat) => [cat, entries.filter((e) => e.category === cat)]) : [[null, entries]];
  const listErrors = entries.map((e) => errors[`${e.id}.name`]).filter(Boolean);

  return (
    <div className="tag-editor">
      <div className="tag-input">
        <div className={`field ${error ? 'has-error' : ''}`}>
          <label htmlFor={`${section}-input`}>{label}</label>
          <input
            id={`${section}-input`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                add();
              }
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={`${section}-hint`}
          />
          <small id={`${section}-hint`} className={error ? 'error-text' : 'hint'}>
            {error ? t(`error.${error}`) : t('editor.skillsHint')}
          </small>
        </div>
        {withCategory && (
          <div className="field">
            <label htmlFor={`${section}-cat`}>{t('field.category')}</label>
            <select id={`${section}-cat`} value={category} onChange={(e) => setCategory(e.target.value)}>
              {SKILL_CATEGORIES.map((c) => <option key={c} value={c}>{t(`skill.${c}`)}</option>)}
            </select>
          </div>
        )}
        <button type="button" className="btn btn-secondary" onClick={add}>
          <Plus size={16} aria-hidden="true" /> {t('editor.add')}
        </button>
      </div>
      {groups.map(([cat, items]) =>
        items.length ? (
          <div key={cat ?? 'all'} className="tag-group">
            {cat && <h4>{t(`skill.${cat}`)}</h4>}
            <ul className="tags">
              {items.map((e) => (
                <li key={e.id} className={errors[`${e.id}.name`] ? 'has-error' : ''}>
                  {e.name || '—'}
                  <button type="button" onClick={() => remove(e.id)} aria-label={`${t('editor.remove')}: ${e.name}`}>
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null,
      )}
      {listErrors.length > 0 && <p className="error-text">{t(`error.${listErrors[0]}`)}</p>}
    </div>
  );
}
