import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import en from './locales/en/translation.json'; 
import si from './locales/sin/translation.json';

const resources = {
  en: { translation: en },
  si: { translation: si },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'si'],
    load: 'languageOnly',
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false,
    },
    ns: ['translation'],
    defaultNS: 'translation',
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

function setDocumentLang(lng: string) {
  document.documentElement.lang = lng.startsWith('si') ? 'si' : 'en';
}

setDocumentLang(i18n.language);
i18n.on('languageChanged', setDocumentLang);

export default i18n;