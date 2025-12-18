import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import ptBR_common from './locales/pt-BR/common.json';
import ptBR_auth from './locales/pt-BR/auth.json';

import enUS_common from './locales/en-US/common.json';
import enUS_auth from './locales/en-US/auth.json';

import frFR_common from './locales/fr-FR/common.json';
import frFR_auth from './locales/fr-FR/auth.json';

const resources = {
    'pt-BR': {
        common: ptBR_common,
        auth: ptBR_auth
    },
    'en-US': {
        common: enUS_common,
        auth: enUS_auth
    },
    'fr-FR': {
        common: frFR_common,
        auth: frFR_auth
    }
};

i18n
    .use(LanguageDetector) // Detect user language
    .use(initReactI18next) // Pass i18n instance to react-i18next
    .init({
        resources,
        fallbackLng: 'pt-BR', // Default language
        debug: import.meta.env.DEV, // Debug in development

        interpolation: {
            escapeValue: false // React already escapes
        },

        detection: {
            // Detection order
            order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
            caches: ['localStorage', 'cookie'],
            lookupQuerystring: 'lng',
            lookupCookie: 'i18next',
            lookupLocalStorage: 'i18nextLng',
            cookieMinutes: 10080 // 7 days
        },

        ns: ['common', 'auth'], // Namespaces
        defaultNS: 'common'
    });

export default i18n;
