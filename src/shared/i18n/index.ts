import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import {
  defaultNS,
  isSupportedLanguage,
  resources,
  type SupportedLanguage,
} from './resources';

/**
 * i18n composition root. **Only the app's root layout imports this module** —
 * components reach translations through `useTranslation()` from `react-i18next`
 * instead. That keeps `expo-localization` (a native module, unavailable in the
 * `node` test environment) out of every module a test might transitively pull in.
 */

/**
 * The device's first preferred language, if it is one we ship. `languageCode`
 * is the bare code (`es`), never the region tag (`es-ES`), so a Mexican and a
 * Spanish device both resolve to the same bundle.
 */
export function resolveDeviceLanguage(): SupportedLanguage {
  const languageCode = getLocales()[0]?.languageCode;
  return languageCode != null && isSupportedLanguage(languageCode)
    ? languageCode
    : 'es';
}

export function initI18n(): typeof i18n {
  if (i18n.isInitialized) return i18n;

  // i18next exposes `use` on its default instance; the lint rule mistakes it
  // for a named export because the package exposes both shapes.
  // eslint-disable-next-line import/no-named-as-default-member
  void i18n.use(initReactI18next).init({
    resources,
    defaultNS,
    lng: resolveDeviceLanguage(),
    // Spanish is the source language (`resources.ts`), so it is also what an
    // untranslated key falls back to — never a raw key on screen.
    fallbackLng: 'es',
    // React already escapes everything it renders; escaping again would turn
    // an activity titled "Té & café" into "Té &amp; café".
    interpolation: { escapeValue: false },
    // Resources are bundled and synchronous, so there is nothing to suspend on
    // and no Suspense boundary is needed around the tree.
    react: { useSuspense: false },
  });

  return i18n;
}

export { i18n };
