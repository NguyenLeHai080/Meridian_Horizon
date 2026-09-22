import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import viTranslation from './locales/vi.json';
import enTranslation from './locales/en.json';
import zhTranslation from './locales/zh.json';

const resources = {
  vi: { translation: viTranslation },
  en: { translation: enTranslation },
  zh: { translation: zhTranslation },
};

const savedLanguage = localStorage.getItem('app_language') || 'vi';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false, // React đã tự escape XSS
    },
  });

export const changeLanguage = (lang) => {
  i18n.changeLanguage(lang);
  localStorage.setItem('app_language', lang);
};

export default i18n;
