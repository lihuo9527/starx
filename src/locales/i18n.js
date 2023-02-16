import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
//
import enLocales from './en.json';
import deLocales from './de.json';
import frLocales from './fr.json';
import zhcnLocales from './zh-cn.json';

// ----------------------------------------------------------------------

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translations: enLocales },
      de: { translations: deLocales },
      fr: { translations: frLocales },
      zhCN: { translations: zhcnLocales }
    },
    lng: localStorage.getItem('i18nextLng') || 'zhCN',
    fallbackLng: 'zhCN',
    debug: false,
    ns: ['translations'],
    defaultNS: 'translations',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
