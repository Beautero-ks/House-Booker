import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { LANGUAGES } from '../constants/app';
import translations from '../constants/translations';

const LanguageContext = createContext(null);
const DEFAULT_LANGUAGE = LANGUAGES.FR;
const SUPPORTED_LANGUAGES = Object.values(LANGUAGES);
const LANGUAGE_STORAGE_KEY = 'hb_lang';

const getStoredLanguage = () => {
  const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return SUPPORTED_LANGUAGES.includes(storedLanguage) ? storedLanguage : DEFAULT_LANGUAGE;
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(getStoredLanguage);

  const t = useCallback(
    (key, params = {}) => {
      const translation = translations[lang]?.[key] || translations[DEFAULT_LANGUAGE]?.[key] || key;
      return Object.entries(params).reduce(
        (text, [paramKey, paramValue]) => text.replaceAll(`{{${paramKey}}}`, String(paramValue)),
        translation,
      );
    },
    [lang]
  );

  const toggleLanguage = useCallback(() => {
    setLang((prev) => {
      return prev === LANGUAGES.FR ? LANGUAGES.EN : LANGUAGES.FR;
    });
  }, []);

  const setLanguage = useCallback((newLang) => {
    if (!SUPPORTED_LANGUAGES.includes(newLang)) return;
    setLang(newLang);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  }, [lang]);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key !== LANGUAGE_STORAGE_KEY) return;
      if (!SUPPORTED_LANGUAGES.includes(event.newValue)) return;
      setLang(event.newValue);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value = useMemo(
    () => ({ lang, t, toggleLanguage, setLanguage, supportedLanguages: SUPPORTED_LANGUAGES }),
    [lang, setLanguage, t, toggleLanguage],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export default LanguageContext;
