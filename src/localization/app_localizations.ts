import { translations } from './translations';
import { LanguageCode } from '../types';

export function getTranslation(lang: LanguageCode, key: string): string {
  const dictionary = translations[lang] || translations.en;
  return dictionary[key] || translations.en[key] || key;
}

