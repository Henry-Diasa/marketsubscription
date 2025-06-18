'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LanguageContextType {
  currentLang: string;
  setCurrentLang: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  currentLang: 'zh',
  setCurrentLang: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLang, setCurrentLang] = useState<string>('zh');

  useEffect(() => {
    const savedLang = localStorage.getItem('language');
    if (savedLang) {
      setCurrentLang(savedLang);
    } else {
      // Get browser language preference
      const browserLang = navigator.language || (navigator as any).userLanguage;
      // Check if browser language starts with 'zh' for Chinese or use 'en' as fallback
      const detectedLang = browserLang && browserLang.startsWith('zh') ? 'zh' : 'en';
      setCurrentLang(detectedLang);
      localStorage.setItem('language', detectedLang);
    }
  }, []);

  const handleLanguageChange = (lang: string) => {
    setCurrentLang(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <LanguageContext.Provider value={{ currentLang, setCurrentLang: handleLanguageChange }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext); 