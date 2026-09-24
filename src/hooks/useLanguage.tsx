import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Language, TranslationKey } from '../data/translations';
import { translate } from '../data/translations';
import { storageService } from '../services/storageService';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => storageService.getLanguage());

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    storageService.setLanguage(lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const next = prev === 'en' ? 'ml' : 'en';
      storageService.setLanguage(next);
      return next;
    });
  }, []);

  const t = useCallback((key: TranslationKey) => translate(key, language), [language]);

  const value = useMemo(
    () => ({ language, setLanguage, toggleLanguage, t }),
    [language, setLanguage, toggleLanguage, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
