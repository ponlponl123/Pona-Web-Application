"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import lang, { Language, languageKeys } from '@/utils/i18n';
import { getCookie, setCookie } from 'cookies-next';

const LanguageContext = createContext<{
  language: Language;
  setLanguage: (languageKey: languageKeys) => void;
}>({
  language: lang('en-US'),
  setLanguage: () => {},
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(lang('en-US'));

  useEffect(() => {
    const currentLangKey = getCookie('lang') as languageKeys || 'en-US';
    setLanguageState(lang(currentLangKey));
  }, []);

  const setLanguage = (languageKey: languageKeys) => {
    setCookie('lang', languageKey);
    setLanguageState(lang(languageKey));
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguageContext = () => useContext(LanguageContext);

export default LanguageContext;
