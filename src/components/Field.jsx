import { useId } from 'react';
import { useI18n } from '../i18n/I18nContext.jsx';

/** Label + control + hint + error. `as` is 'input' | 'textarea' | 'select'. */
export default function Field({ label, error, hint, required, optional, as = 'input', className = '', children, ...props }) {
  const { t } = useI18n();
  const id = useId();
  const Control = as;
  const describedBy = [hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`field ${error ? 'has-error' : ''} ${className}`}>
      <label htmlFor={id}>
        {label}
        {required && <span className="req" aria-hidden="true"> *</span>}
        {optional && <span className="opt"> ({t('common.optional')})</span>}
      </label>
      <Control id={id} aria-invalid={Boolean(error)} aria-describedby={describedBy} aria-required={required || undefined} {...props}>
        {children}
      </Control>
      {hint && <small id={`${id}-hint`} className="hint">{hint}</small>}
      {error && <small id={`${id}-err`} className="error-text">{t(`error.${error}`)}</small>}
    </div>
  );
}
