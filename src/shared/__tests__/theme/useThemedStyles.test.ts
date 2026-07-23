import { darkTheme, lightTheme, resolveThemedStyles } from '@/shared/theme';

/**
 * The hook itself is a one-liner over `resolveThemedStyles`; the behaviour worth
 * pinning is the cache, because getting it wrong is invisible — the app looks
 * right and rebuilds every stylesheet on every render.
 */
describe('resolveThemedStyles', () => {
  it('builds the styles from the theme it is given', () => {
    const styles = resolveThemedStyles(
      (theme) => ({ row: { backgroundColor: theme.colors.background } }),
      lightTheme,
    );

    expect(styles.row.backgroundColor).toBe(lightTheme.colors.background);
  });

  it('calls a factory once per theme, however many consumers ask', () => {
    const factory = jest.fn((theme: typeof lightTheme) => ({
      row: { backgroundColor: theme.colors.background },
    }));

    const first = resolveThemedStyles(factory, lightTheme);
    const second = resolveThemedStyles(factory, lightTheme);

    expect(factory).toHaveBeenCalledTimes(1);
    // Same reference, so a memoized child does not re-render on a style prop.
    expect(second).toBe(first);
  });

  it('rebuilds when the theme changes, and keeps both cached', () => {
    const factory = jest.fn((theme: typeof lightTheme) => ({
      row: { backgroundColor: theme.colors.background },
    }));

    const light = resolveThemedStyles(factory, lightTheme);
    const dark = resolveThemedStyles(factory, darkTheme);

    expect(factory).toHaveBeenCalledTimes(2);
    expect(dark).not.toBe(light);
    expect(dark.row.backgroundColor).toBe(darkTheme.colors.background);

    // Switching back is a cache hit, not a third build.
    expect(resolveThemedStyles(factory, lightTheme)).toBe(light);
    expect(factory).toHaveBeenCalledTimes(2);
  });

  it('keeps separate factories apart', () => {
    const one = resolveThemedStyles(
      (theme) => ({ box: { padding: theme.spacing.sm } }),
      lightTheme,
    );
    const other = resolveThemedStyles(
      (theme) => ({ box: { padding: theme.spacing.xl } }),
      lightTheme,
    );

    expect(one.box.padding).toBe(lightTheme.spacing.sm);
    expect(other.box.padding).toBe(lightTheme.spacing.xl);
  });
});
