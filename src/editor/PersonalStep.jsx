import { useState } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext.jsx';
import { readPhoto } from '../lib/photo.js';
import Field from '../components/Field.jsx';

const FIELDS = [
  { name: 'fullName', required: true, autoComplete: 'name' },
  { name: 'title', autoComplete: 'organization-title' },
  { name: 'email', required: true, type: 'email', autoComplete: 'email' },
  { name: 'phone', type: 'tel', autoComplete: 'tel' },
  { name: 'city', autoComplete: 'address-level2' },
  { name: 'country', autoComplete: 'country-name' },
  { name: 'linkedin', type: 'url', optional: true, placeholder: 'linkedin.com/in/…' },
  { name: 'website', type: 'url', optional: true, placeholder: 'github.com/…' },
];

export default function PersonalStep({ cv, update, errors }) {
  const { t } = useI18n();
  const [photoError, setPhotoError] = useState('');
  const p = cv.personal;
  const set = (name, value) => update((c) => ({ ...c, personal: { ...c.personal, [name]: value } }));

  async function onPhoto(e) {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      set('photo', await readPhoto(file));
      setPhotoError('');
    } catch (err) {
      setPhotoError(err.message);
    }
  }

  return (
    <div className="form-grid">
      {FIELDS.map((f) => (
        <Field
          key={f.name}
          label={t(`field.${f.name}`)}
          required={f.required}
          optional={f.optional}
          type={f.type ?? 'text'}
          autoComplete={f.autoComplete}
          placeholder={f.placeholder}
          value={p[f.name]}
          error={errors[`personal.${f.name}`]}
          onChange={(e) => set(f.name, e.target.value)}
        />
      ))}
      <div className={`field wide photo-field ${photoError ? 'has-error' : ''}`}>
        <span className="label">{t('field.photo')} <span className="opt">({t('common.optional')})</span></span>
        <div className="photo-row">
          <div className="photo-box">{p.photo ? <img src={p.photo} alt="" /> : <ImagePlus size={28} aria-hidden="true" />}</div>
          <div>
            <label className="btn btn-secondary file-btn">
              <ImagePlus size={16} aria-hidden="true" /> {t('field.uploadPhoto')}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={onPhoto} className="visually-hidden" />
            </label>
            {p.photo && (
              <button type="button" className="btn btn-ghost" onClick={() => set('photo', '')}>
                <Trash2 size={16} aria-hidden="true" /> {t('field.removePhoto')}
              </button>
            )}
            <small className={photoError ? 'error-text' : 'hint'} role={photoError ? 'alert' : undefined}>
              {photoError ? t(`error.${photoError}`) : t('field.photoHint')}
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
