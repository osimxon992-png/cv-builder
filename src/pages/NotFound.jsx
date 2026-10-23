import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext.jsx';

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="container narrow page">
      <h1>{t('notFound.title')}</h1>
      <Link to="/" className="btn btn-primary">{t('notFound.back')}</Link>
    </div>
  );
}
