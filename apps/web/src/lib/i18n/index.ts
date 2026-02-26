import { useAuthStore } from '../stores/auth-store';
import { es } from './translations/es';
import { en } from './translations/en';
import { pt } from './translations/pt';
import { fr } from './translations/fr';

export type TranslationKey = keyof typeof es;
export type Translations = Record<TranslationKey, string>;

const translations: Record<string, Translations> = { es: es as Translations, en, pt, fr };

export function useTranslation() {
  const { user } = useAuthStore();
  const lang = user?.language || 'es';
  const t = translations[lang] || translations.es;
  return { t, lang };
}

export function getLocale(lang: string): string {
  const localeMap: Record<string, string> = {
    es: 'es-ES',
    en: 'en-US',
    pt: 'pt-BR',
    fr: 'fr-FR',
  };
  return localeMap[lang] || 'es-ES';
}
