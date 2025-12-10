import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'pt' | 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ru' | 'ja';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isDetecting: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const COUNTRY_TO_LANGUAGE: Record<string, Language> = {
  BR: 'pt', PT: 'pt', AO: 'pt', MZ: 'pt', CV: 'pt',
  US: 'en', GB: 'en', AU: 'en', CA: 'en', NZ: 'en', IE: 'en',
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', PE: 'es', CL: 'es', VE: 'es',
  FR: 'fr', BE: 'fr', CH: 'fr', SN: 'fr', CI: 'fr',
  DE: 'de', AT: 'de',
  CN: 'zh', TW: 'zh', HK: 'zh', SG: 'zh',
  RU: 'ru', BY: 'ru', KZ: 'ru',
  JP: 'ja',
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('pt');
  const [isDetecting, setIsDetecting] = useState(true);

  useEffect(() => {
    const detectLanguage = async () => {
      // Check localStorage first
      const savedLang = localStorage.getItem('siscof-language') as Language | null;
      if (savedLang) {
        setLanguageState(savedLang);
        setIsDetecting(false);
        return;
      }

      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const countryCode = data.country_code;
        const detectedLang = COUNTRY_TO_LANGUAGE[countryCode] || 'pt';
        setLanguageState(detectedLang);
        localStorage.setItem('siscof-language', detectedLang);
      } catch (error) {
        console.error('Failed to detect language:', error);
        setLanguageState('pt');
      } finally {
        setIsDetecting(false);
      }
    };

    detectLanguage();
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('siscof-language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isDetecting }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
