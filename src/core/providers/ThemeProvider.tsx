import { useMemo, type PropsWithChildren } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeContext, themes } from '@/shared/theme';

/**
 * Resolves the active theme and puts it on the context.
 *
 * It follows the OS setting for now. The in-app override ("light / dark /
 * system") is a settings feature, and the seam for it is this component alone:
 * it would read a stored preference and fall back to `useColorScheme()`, with
 * no consumer aware that anything changed. Deliberately not built yet — there
 * is no settings screen to host it, and a preference nothing can set is dead
 * code.
 *
 * `useColorScheme()` returns `null` while the OS value is unknown; light is the
 * fallback because a flash of light on a dark device is a worse first frame than
 * the reverse only if we guessed, and we would be guessing either way.
 */
export function ThemeProvider({ children }: PropsWithChildren) {
  const scheme = useColorScheme();
  const theme = useMemo(
    () => (scheme === 'dark' ? themes.dark : themes.light),
    [scheme],
  );

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}
