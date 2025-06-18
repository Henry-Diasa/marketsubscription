/*
 * @Author: diasa diasa@gate.me
 * @Date: 2025-04-11 10:29:03
 * @LastEditors: diasa diasa@gate.me
 * @LastEditTime: 2025-04-11 10:35:00
 * @FilePath: /AnniversaryProject/app/hooks/useTranslation.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { useMemo } from 'react';
import zhTranslations from '../i18n/locales/zh.json';
import enTranslations from '../i18n/locales/en.json';

type Translations = {
  [key: string]: string | Translations;
};

const translations: Record<string, Translations> = {
  zh: zhTranslations,
  en: enTranslations,
};

export function useTranslation(lang: string) {
  return useMemo(() => {
    const t = (key: string): string | Translations => {
      const keys = key.split('.');
      let value: Translations | string = translations[lang];
      
      for (const k of keys) {
        if (value && typeof value === 'object') {
          value = value[k];
        } else {
          return key;
        }
      }
      
      return value || key;
    };
    
    return t;
  }, [lang]);
} 