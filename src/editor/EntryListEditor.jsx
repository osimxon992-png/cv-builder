import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext.jsx';
import { newEntry } from '../lib/cvModel.js';
import Field from '../components/Field.jsx';
import { SECTION_FIELDS } from './sectionFields.js';

export default function EntryListEditor({ section, cv, update, errors }) {
  const { t } = useI18n();
  const entries = cv[section];
  const fields = SECTION_FIELDS[section];
  const setEntries = (fn) => update((c) => ({ ...c, [section]: fn(c[section]) }));
  const change = (id, name, value) => setEntries((list) => list.map((e) => (e.id === id ? { ...e, [name]: value } : e)));
  const move = (index, delta) =>
    setEntries((list) => {
      const next = [...list];
      [next[index], next[index + delta]] = [next[index + delta], next[index]];
      return next;
    });

  return (
    <div className="entry-list">
      {entries.length === 0 && <p className="empty-note">{t('editor.noEntries')}</p>}
      {entries.map((entry, index) => (
        <fieldset key={entry.id} className="entry-card">
          <legend>{entry[fields[0].name]?.trim() || `${t(fields[0].label)} ${index + 1}`}</legend>
          <div className="entry-tools">
            <button type="button" className="icon-btn" onClick={() => move(index, -1)} disabled={index === 0} aria-label={t('editor.moveUp')} title={t('editor.moveUp')}>
              <ArrowUp size={16} />
            </button>
            <button type="button" className="icon-btn" onClick={() => move(index, 1)} disabled={index === entries.length - 1} aria-label={t('editor.moveDown')} title={t('editor.moveDown')}>
              <ArrowDown size={16} />
            </button>
            <button type="button" className="icon-btn danger" onClick={() => setEntries((list) => list.filter((e) => e.id !== entry.id))} aria-label={t('editor.remove')} title={t('editor.remove')}>
              <Trash2 size={16} />
            </button>
          </div>
          <div className="form-grid">
            {fields.map((f) => {
              const error = errors[`${entry.id}.${f.name}`];
              if (f.type === 'checkbox') {
                return (
                  <label key={f.name} className="check wide">
                    <input type="checkbox" checked={entry[f.name]} onChange={(e) => change(entry.id, f.name, e.target.checked)} />
                    {t(f.label)}
                  </label>
                );
              }
              const common = {
                label: t(f.label),
                required: f.required,
                error,
                hint: f.hint && t(f.hint),
                value: entry[f.name],
                onChange: (e) => change(entry.id, f.name, e.target.value),
              };
              if (f.type === 'textarea') return <Field {...common} key={f.name} as="textarea" rows={4} className="wide" />;
              if (f.type === 'select') {
                return (
                  <Field {...common} key={f.name} as="select">
                    {f.options.map((o) => <option key={o} value={o}>{t(f.optionLabel + o)}</option>)}
                  </Field>
                );
              }
              const disabled = f.name === 'endDate' && entry.current;
              return (
                <Field
                  {...common}
                  key={f.name}
                  type={f.type === 'month' ? 'month' : f.type === 'url' ? 'url' : 'text'}
                  placeholder={f.type === 'month' ? 'YYYY-MM' : f.type === 'url' ? 'https://' : undefined}
                  disabled={disabled}
                  value={disabled ? '' : entry[f.name]}
                />
              );
            })}
          </div>
        </fieldset>
      ))}
      <button type="button" className="btn btn-secondary" onClick={() => setEntries((list) => [...list, newEntry(section)])}>
        <Plus size={16} aria-hidden="true" /> {t('editor.addEntry')}
      </button>
    </div>
  );
}
