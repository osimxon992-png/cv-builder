import { useEffect, useRef, useState } from 'react';
import { renderCvBlob } from '../pdf/exportPdf.js';
import { useI18n } from '../i18n/I18nContext.jsx';

// Renders the exact same document that gets downloaded, so preview and PDF always match.
// (react-pdf's usePDF stopped picking up later updates, so we render blobs ourselves.)
export default function PdfPreview({ cv, className = '' }) {
  const { t } = useI18n();
  const [state, setState] = useState({ url: null, error: false, loading: true });
  const urlRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setState((s) => ({ ...s, loading: true }));
      try {
        const blob = await renderCvBlob(cv);
        if (cancelled) return;
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        urlRef.current = URL.createObjectURL(blob);
        setState({ url: urlRef.current, error: false, loading: false });
      } catch (err) {
        console.error(err);
        if (!cancelled) setState((s) => ({ ...s, error: true, loading: false }));
      }
    }, 450);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [cv]);

  useEffect(() => () => urlRef.current && URL.revokeObjectURL(urlRef.current), []);

  return (
    <div className={`pdf-frame ${className}`}>
      {state.error ? (
        <p className="pdf-message error-text">{t('error.previewFailed')}</p>
      ) : state.url ? (
        <iframe src={`${state.url}#toolbar=0&navpanes=0&view=FitH`} title={t('preview.title')} />
      ) : (
        <p className="pdf-message">{t('common.loading')}</p>
      )}
      {state.loading && state.url && <span className="pdf-busy" aria-hidden="true" />}
    </div>
  );
}
