import i18n from 'i18next';
import { useCallback, useMemo } from 'react';
import { initReactI18next, useTranslation } from 'react-i18next';

import en from './languages/en.json';
import zh from './languages/zh.json';
import { LANGUAGE, LOCAL_LANGUAGE_LIST, DEFAULT_LANGUAGE } from './config';
import moment from 'moment';
// import 'moment/locale/zh-cn';
import 'moment/locale/zh-hk';

const resources = { en, zh };

export function initLanguage(localStorage?: Storage) {
  let lng = DEFAULT_LANGUAGE;

  // Get whether the language has been set locally
  const v = localStorage?.getItem(LANGUAGE);
  if (v && LOCAL_LANGUAGE_LIST.includes(v)) {
    lng = v;
  }

  i18n
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
      resources,
      lng,

      keySeparator: false, // we do not use keys in form messages.welcome

      interpolation: {
        escapeValue: false, // react already safes from xss
      },
    });
  moment.locale(lng.replace('_', '-'));
}
export function useLanguage() {
  const { i18n, t } = useTranslation();
  const changeLanguage = useCallback(
    (value: string) => {
      if (i18n.language !== value && LOCAL_LANGUAGE_LIST.includes(value)) {
        if (value === 'zh') {
          moment.locale('zh-hk');
        } else {
          moment.locale(value);
        }
        i18n.changeLanguage(value);
        localStorage.setItem(LANGUAGE, value);
      }
    },
    [i18n],
  );
  return useMemo(
    () => ({ language: i18n.language, changeLanguage, t }),
    [changeLanguage, i18n.language, t],
  );
}
export default i18n;
