import type { Theme } from './Theme';
import { useTheme } from './ThemeContext';

/**
 * `StyleSheet.create` runs **once, when the module is imported** — fine for one
 * fixed theme, impossible with a swappable one. So a style file exports a
 * factory taking the theme (architecture.md, "Why styles are a function"), and
 * this resolves it.
 *
 * A style factory takes the theme and returns a `StyleSheet.create` result.
 * Typed loosely on purpose: naming the style keys here would mean every style
 * file re-declared them, and `StyleSheet.create` already returns exactly the
 * shape it was given, so callers keep full inference either way.
 */
export type StyleFactory<T> = (theme: Theme) => T;

/**
 * Factory → theme → styles, memoized on both.
 *
 * Module-level rather than a `useMemo` inside the hook so the cache is shared
 * across *every* component using the same factory: a list of forty rows built
 * from one style file calls `StyleSheet.create` once, not forty times. Both
 * layers are `WeakMap`s, so a theme or a screen that goes away takes its entry
 * with it.
 *
 * Exported for tests — components should use {@link useThemedStyles}.
 */
const styleCache = new WeakMap<StyleFactory<never>, WeakMap<Theme, unknown>>();

export function resolveThemedStyles<T>(
  factory: StyleFactory<T>,
  theme: Theme,
): T {
  const key = factory as StyleFactory<never>;

  let byTheme = styleCache.get(key);
  if (byTheme === undefined) {
    byTheme = new WeakMap<Theme, unknown>();
    styleCache.set(key, byTheme);
  }

  const cached = byTheme.get(theme);
  if (cached !== undefined) return cached as T;

  const created = factory(theme);
  byTheme.set(theme, created);
  return created;
}

/**
 * The hook every component uses:
 *
 * ```ts
 * const styles = useThemedStyles(todayScreenStyles);
 * ```
 */
export function useThemedStyles<T>(factory: StyleFactory<T>): T {
  return resolveThemedStyles(factory, useTheme());
}
