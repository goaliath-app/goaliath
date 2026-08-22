import enActivityForm from '../../features/tracking/ui/screens/ActivityForm/i18n/en';
import esActivityForm from '../../features/tracking/ui/screens/ActivityForm/i18n/es';
import enCommon from './locales/en/common';
import esCommon from './locales/es/common';

/**
 * `es` is the source language and the type that `CustomTypeOptions` derives key
 * checking from (see `i18next.d.ts`), so a key that exists only in `en` is invisible to `t()`.
 */
export const resources = {
  es: { common: esCommon, activityForm: esActivityForm },
  en: { common: enCommon, activityForm: enActivityForm },
} as const;

/** The namespace `useTranslation()` resolves against when none is given. */
export const defaultNS = 'common';

/** Languages with a bundled translation, in preference order. */
export const supportedLanguages = ['es', 'en'] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];

export function isSupportedLanguage(
  language: string,
): language is SupportedLanguage {
  return (supportedLanguages as readonly string[]).includes(language);
}
