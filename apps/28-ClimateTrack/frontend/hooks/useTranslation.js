import { useEffect, useState } from 'react';
import * as Localization from 'expo-localization';

export const useTranslation = () => {
  const [language, setLanguage] = useState('en');
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    // Get device language
    const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'en';
    setLanguage(deviceLanguage);

    // Load translations
    loadTranslations(deviceLanguage);
  }, [language]);

  const loadTranslations = async (lang) => {
    try {
      const response = await import(`./locales/${lang}.json`);
      setTranslations(response);
    } catch (error) {
      // Fallback to English
      const response = await import('./locales/en.json');
      setTranslations(response);
    }
  };

  const t = (key, variables = {}) => {
    const keys = key.split('.');
    let value = translations;

    for (const k of keys) {
      value = value?.[k];
    }

    if (!value) return key;

    // Replace variables
    let result = value;
    Object.entries(variables).forEach(([key, val]) => {
      result = result.replace(`{${key}}`, val);
    });

    return result;
  };

  return { t, language, setLanguage };
};
