/**
 * The public surface of the theme layer: the `Theme` type, the registry, the
 * context and the hooks.
 *
 * **`palette.ts` is deliberately absent.** Themes read it; nothing else can, so
 * "no hardcoded colours" (architecture.md, Styling) has no back door — a
 * component cannot reach a raw hex even by accident. `tokens.ts` is absent for
 * the same reason: spacing and typography arrive through the theme, never
 * imported directly, so a future large-text theme needs no consumer changes.
 */
export type { Theme, ThemeColors } from './Theme';
export type { TypographyToken } from './tokens';
export { ThemeContext, useTheme } from './ThemeContext';
export { resolveThemedStyles, useThemedStyles } from './useThemedStyles';
export type { StyleFactory } from './useThemedStyles';
export { darkTheme } from './themes/dark';
export { grayscaleTheme } from './themes/grayscale';
export { lightTheme } from './themes/light';

import type { Theme } from './Theme';
import { darkTheme } from './themes/dark';
import { grayscaleTheme } from './themes/grayscale';
import { lightTheme } from './themes/light';

/**
 * Every built-in theme, keyed by its own name.
 *
 * Keyed by name rather than by `scheme` because the two stopped being the same
 * question the moment a third theme existed: `grayscale` paints a light canvas,
 * so it *has* the light scheme, but it is not *the* light theme. `scheme` says
 * what native chrome should match; the key says which theme a stored preference
 * selected.
 *
 * Adding one is: a ramp in `palette.ts` if it needs tones nothing else has, a
 * file in `themes/`, and an entry here. `Theme` makes `tsc` reject it until
 * every role is filled, and the contrast suite runs over this registry — so a
 * new theme is checked for accessibility by existing tests, without writing any.
 */
export const themes = {
  light: lightTheme,
  dark: darkTheme,
  grayscale: grayscaleTheme,
} as const satisfies Record<string, Theme>;

export type ThemeName = keyof typeof themes;
