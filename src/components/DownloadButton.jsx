import { useState } from 'react';
import { Download, Lock } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext.jsx';
import { canUseTemplate, usePremium } from '../lib/premium.js';
import { useToast } from './Toast.jsx';

export default function DownloadButton({ cv, className = 'btn btn-primary' }) {
  const { t } = useI18n();
  const notify = useToast();
  usePremium(); // re-render when premium access changes
  const [busy, setBusy] = useState(false);
  const locked = !canUseTemplate(cv.templateId);

  async function handleClick() {
    if (locked) return notify(t('error.premiumRequired'), 'error');
    setBusy(true);
    try {
      const { downloadCvPdf } = await import('../pdf/exportPdf.js');
      await downloadCvPdf(cv);
    } catch (err) {
      notify(t(err.message === 'premiumRequired' ? 'error.premiumRequired' : 'error.pdfFailed'), 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" className={className} onClick={handleClick} disabled={busy} aria-busy={busy}>
      {locked ? <Lock size={16} aria-hidden="true" /> : <Download size={16} aria-hidden="true" />}
      {busy ? t('common.loading') : t('editor.download')}
    </button>
  );
}
