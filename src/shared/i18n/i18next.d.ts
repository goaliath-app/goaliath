import type { defaultNS, resources } from './resources';

/**
 * Makes `t()` **key-checked at compile time**: keys come from the Spanish
 * bundle, so a typo (`t('today.titel')`) fails `tsc --noEmit` instead of
 * silently rendering the raw key at runtime. This is why the repo uses
 * `react-i18next` rather than a plain lookup library.
 */
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: (typeof resources)['es'];
  }
}
