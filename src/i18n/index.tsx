import { createContext, useContext, useEffect, ReactNode } from 'react';
import { ar } from './ar';
import type { TranslationKeys } from './ar';

type Language = 'ar';

interface I18nContextType {
  language: Language;
  t: TranslationKeys;
  dir: 'rtl';
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.lang = 'ar';
    document.documentElement.dir = 'rtl';
  }, []);

  const value: I18nContextType = {
    language: 'ar',
    t: ar,
    dir: 'rtl',
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
