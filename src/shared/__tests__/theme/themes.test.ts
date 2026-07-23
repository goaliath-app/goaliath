import { darkTheme, lightTheme, themes, type Theme } from '@/shared/theme';

/**
 * `tsc` already refuses a theme missing a role, so these cover what a type
 * cannot: that the two themes were actually *resolved* rather than copied, and
 * that no role was filled with something empty.
 */

/** Every leaf path in an object, sorted — arrays contribute their indices. */
function leafPaths(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix];
  return Object.entries(value)
    .flatMap(([key, child]) =>
      leafPaths(child, prefix === '' ? key : `${prefix}.${key}`),
    )
    .sort();
}

/** Every leaf value in an object. */
function leafValues(value: unknown): unknown[] {
  if (typeof value !== 'object' || value === null) return [value];
  return Object.values(value).flatMap(leafValues);
}

const registered = Object.entries(themes).map(
  ([key, theme]) => [key, theme] as const,
);

describe('themes', () => {
  it.each(registered)('registers %s under a key matching its name', (key, theme) => {
    expect(theme.name).toBe(key);
  });

  it.each(registered)('fills exactly the same set of roles in %s', (_key, theme) => {
    expect(leafPaths(theme.colors)).toEqual(leafPaths(lightTheme.colors));
  });

  it.each(registered)('resolve every %s colour to a hex value', (_scheme, theme: Theme) => {
    for (const colour of leafValues(theme.colors)) {
      expect(colour).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  it('resolve the roles differently in each theme', () => {
    // Guards against a dark theme copy-pasted and left unedited: canvas and ink
    // must swap, and the chromatic roles must move up their ramp rather than
    // reuse the light tone.
    expect(darkTheme.colors.background).not.toBe(lightTheme.colors.background);
    expect(darkTheme.colors.text.primary).not.toBe(lightTheme.colors.text.primary);
    expect(darkTheme.colors.brand.base).not.toBe(lightTheme.colors.brand.base);
    expect(darkTheme.colors.accent.base).not.toBe(lightTheme.colors.accent.base);
  });

  it('invert the inverse surface against their own canvas', () => {
    // The running-timer bar is the one surface meant to contrast with the page,
    // so it has to be a slab in both themes rather than dissolving into it.
    expect(lightTheme.colors.inverseSurface).not.toBe(lightTheme.colors.background);
    expect(darkTheme.colors.inverseSurface).not.toBe(darkTheme.colors.background);
    expect(darkTheme.colors.inverseSurface).not.toBe(lightTheme.colors.inverseSurface);
  });

  it.each(registered)(
    'give %s a density scale of four distinct steps',
    (_scheme, theme: Theme) => {
      expect(theme.colors.density).toHaveLength(4);
      expect(new Set(theme.colors.density).size).toBe(4);
    },
  );

  it('drains every hue from the grayscale theme', () => {
    // The one theme whose whole point is that no role carries a hue. Checking
    // it here rather than trusting the file means a later edit that reaches for
    // the accent ramp "just for the running timer" fails loudly.
    for (const colour of leafValues(themes.grayscale.colors)) {
      const [, r, g, b] = /^#(..)(..)(..)$/.exec(String(colour)) ?? [];
      expect(r).toBe(g);
      expect(g).toBe(b);
    }
  });

  it.each(registered)('share the same non-colour scales in %s', (_scheme, theme: Theme) => {
    // Spacing and typography live in the theme so an accessibility theme needs
    // no consumer changes, but they are not meant to differ between light and
    // dark — a divergence here would be a mistake, not a feature.
    expect(theme.spacing).toEqual(lightTheme.spacing);
    expect(theme.radius).toEqual(lightTheme.radius);
    expect(theme.typography).toEqual(lightTheme.typography);
  });
});
