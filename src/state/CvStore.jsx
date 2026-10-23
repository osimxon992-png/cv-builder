import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createCv, duplicateCv, newId } from '../lib/cvModel.js';
import { defaultTemplateId } from '../templates/registry.js';
import { loadCvs, saveCvs } from '../lib/storage.js';

const CvStoreContext = createContext(null);

export function CvStoreProvider({ children }) {
  const [cvs, setCvs] = useState(loadCvs);
  const [saveError, setSaveError] = useState(false);
  const latest = useRef(cvs);
  latest.current = cvs;

  // Debounced autosave; on failure the in-memory copy stays and the UI shows a warning.
  useEffect(() => {
    const persist = () => {
      try {
        saveCvs(latest.current);
        setSaveError(false);
      } catch {
        setSaveError(true);
      }
    };
    const timer = setTimeout(persist, 300);
    window.addEventListener('pagehide', persist);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('pagehide', persist);
    };
  }, [cvs]);

  const api = useMemo(() => {
    const add = (cv) => {
      setCvs((list) => [cv, ...list]);
      return cv;
    };
    return {
      cvs,
      saveError,
      getCv: (id) => cvs.find((cv) => cv.id === id),
      createCv: (opts) => add(createCv({ templateId: defaultTemplateId(), ...opts })),
      duplicateCv: (id, suffix) => {
        const source = latest.current.find((cv) => cv.id === id);
        return source ? add(duplicateCv(source, suffix)) : null;
      },
      // Imported CVs never replace an existing one, even with the same id.
      importCv: (cv) => add(latest.current.some((c) => c.id === cv.id) ? { ...cv, id: newId() } : cv),
      updateCv: (id, updater) =>
        setCvs((list) => list.map((cv) => (cv.id === id ? { ...updater(cv), id, updatedAt: Date.now() } : cv))),
      deleteCv: (id) => setCvs((list) => list.filter((cv) => cv.id !== id)),
    };
  }, [cvs, saveError]);

  return <CvStoreContext.Provider value={api}>{children}</CvStoreContext.Provider>;
}

export const useCvStore = () => useContext(CvStoreContext);
