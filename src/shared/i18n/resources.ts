import enActivityForm from './locales/en/activityForm';
import enCommon from './locales/en/common';
import esActivityForm from './locales/es/activityForm';
import esCommon from './locales/es/common';

/**
 * Every translation bundled per language. Resources are **static imports**, not
 * loaded at runtime: the app ships offline-first, so there is nothing to fetch
 * and the bundler can tree-shake and typecheck them like any other module.
 *
 * Adding a namespace = one import and one line per language. Keep `es` and `en`
 * structurally identical — `es` is the source language and the type that
 * `CustomTypeOptions` derives key checking from (see `i18next.d.ts`), so a key
 * that exists only in `en` is invisible to `t()`.
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
