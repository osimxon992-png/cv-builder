import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext.jsx';

// Native <dialog>: focus trapping, Esc and backdrop handled by the browser.
export default function Modal({ open, onClose, title, children, wide = false, footer }) {
  const ref = useRef(null);
  const { t } = useI18n();

  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={`modal ${wide ? 'modal-wide' : ''}`}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="modal-title"
    >
      {open && (
        <div className="modal-body">
          <div className="modal-head">
            <h2 id="modal-title">{title}</h2>
            <button type="button" className="icon-btn" onClick={onClose} aria-label={t('common.close')}>
              <X size={18} />
            </button>
          </div>
          {children}
          {footer && <div className="modal-footer">{footer}</div>}
        </div>
      )}
    </dialog>
  );
}
