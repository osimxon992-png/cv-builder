import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { I18nProvider, useI18n } from './i18n/I18nContext.jsx';
import { CvStoreProvider } from './state/CvStore.jsx';
import { ToastProvider } from './components/Toast.jsx';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Pricing from './pages/Pricing.jsx';
import NotFound from './pages/NotFound.jsx';

// Pages that render PDFs pull in @react-pdf (large), so they load on demand.
const Templates = lazy(() => import('./pages/Templates.jsx'));
const Editor = lazy(() => import('./pages/Editor.jsx'));
const Preview = lazy(() => import('./pages/Preview.jsx'));
const Admin = lazy(() => import('./pages/Admin.jsx'));

function Loading() {
  const { t } = useI18n();
  return <p className="page-loading">{t('common.loading')}</p>;
}

export default function App() {
  return (
    <I18nProvider>
      <CvStoreProvider>
        <ToastProvider>
          <BrowserRouter>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="templates" element={<Templates />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="editor/:id" element={<Editor />} />
                  <Route path="preview/:id" element={<Preview />} />
                  <Route path="pricing" element={<Pricing />} />
                  <Route path="admin" element={<Admin />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ToastProvider>
      </CvStoreProvider>
    </I18nProvider>
  );
}
