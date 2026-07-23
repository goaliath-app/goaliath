import { createContext, useContext } from 'react';
import type { Theme } from './Theme';

/**
 * Carries the active theme down the tree. The *provider* lives in
 * `core/providers` with the other global providers (architecture.md, Styling);
 * the context and its reader live here so `shared/theme` stays self-contained
 * and a consumer never has to import from `core/`.
 *
 * `null` is the "no provider above" case, and it throws rather than silently
 * falling back to the light theme: a missing provider is a wiring bug, and a
 * theme that quietly works is one nobody notices is broken until the dark theme
 * ships.
 */
export const ThemeContext = createContext<Theme | null>(null);

/** The active theme. Prefer `useThemedStyles` unless you need a raw value. */
export function useTheme(): Theme {
  const theme = useContext(ThemeContext);
  if (theme === null) {
    throw new Error('Theme hooks must be used within a ThemeProvider');
  }
  return theme;
}
