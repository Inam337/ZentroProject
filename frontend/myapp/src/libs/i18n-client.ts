import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

// Initialize i18next for client-side usage
i18next
  .use(HttpBackend) // Load translations via HTTP (default /locales/<lng>/<ns>.json)
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18next to react-i18next
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'ur', 'sd'], // Added Urdu based on your RTL needs
    interpolation: {
      escapeValue: false, // React already safes from XSS
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    react: {
      useSuspense: false,
    },
  });

// Function to set the document direction based on RTL languages
export const setDocumentDirection = (language: string) => {
  const rtlLanguages = ['ur', 'sd'];

  document.dir = rtlLanguages.includes(language) ? 'rtl' : 'ltr';
  document.documentElement.lang = language;
};

// Set initial direction
if (typeof window !== 'undefined') {
  const currentLang = i18next.language || 'en';

  setDocumentDirection(currentLang);

  // Listen for language changes
  i18next.on('languageChanged', setDocumentDirection);
}

export default i18next;
