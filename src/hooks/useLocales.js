
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
// '@mui
import { enUS, deDE, frFR, zhCN } from '@mui/material/locale';
import { capitalCase } from 'change-case';
import iconZhCN from '../assets/images/icon/zhCN.png';

// ----------------------------------------------------------------------

const LANGS = [
  // {
  //   label: 'English',
  //   value: 'en',
  //   systemValue: enUS,
  //   icon: 'https://minimal-assets-api.vercel.app/assets/icons/ic_flag_en.svg',
  // },
  // {
  //   label: 'German',
  //   value: 'de',
  //   systemValue: deDE,
  //   icon: 'https://minimal-assets-api.vercel.app/assets/icons/ic_flag_de.svg',
  // },
  // {
  //   label: 'French',
  //   value: 'fr',
  //   systemValue: frFR,
  //   icon: 'https://minimal-assets-api.vercel.app/assets/icons/ic_flag_fr.svg',
  // },
  {
    label: '中文简体',
    value: 'zhCN',
    systemValue: zhCN,
      icon: iconZhCN,
  },
];

export default function useLocales(moduleKey) {
  const { i18n, t } = useTranslation();
  const langStorage = localStorage.getItem('i18nextLng');
  const currentLang = LANGS.find((_lang) => _lang.value === langStorage) || LANGS[0];

  const handleChangeLanguage = (newlang) => {
    i18n.changeLanguage(newlang);
  };

  const translate = useCallback((key, prefix = '') => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const result = t(fullKey);
    return result === fullKey ? '' : result;
  }, [t]);

  // 外面处理重复扔进来 
  // key-文案对应的键值 subModule-模块内的次层级 
  // value-没找到文案时默认的文案
  // mKey-用于覆盖调用useLocales时传入的模块key
  const getI18nText = useCallback((key, subModule = '', value = '', mKey = moduleKey) => {
    const prefixKey = (mKey && `${mKey}${subModule ? `.${subModule}` : ''}`) || subModule;
    return translate(key, prefixKey) || value || capitalCase(key);
  }, [translate, moduleKey]);

  return {
    onChangeLang: handleChangeLanguage,
    translate,
    getI18nText,
    currentLang,
    allLang: LANGS,
  };
}
