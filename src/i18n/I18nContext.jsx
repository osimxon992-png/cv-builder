import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { UI_STRINGS } from './ui.js';
import { readPref, writePref } from '../lib/storage.js';

const I18nContext = createContext(null);

function initialLang() {
  const saved = readPref('uiLang', '');
  if (UI_STRINGS[saved]) return saved;
  const browser = (navigator.language || 'en').slice(0, 2);
  return UI_STRINGS[browser] ? browser : 'en';
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((code) => {
    setLangState(code);
    writePref('uiLang', code);
  }, []);

  // t('dash.deleteText', { name }) -> replaces {name}
  const t = useCallback(
    (key, vars) => {
      let text = UI_STRINGS[lang][key] ?? UI_STRINGS.en[key] ?? key;
      if (vars) for (const [k, v] of Object.entries(vars)) text = text.replaceAll(`{${k}}`, v);
      return text;
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
