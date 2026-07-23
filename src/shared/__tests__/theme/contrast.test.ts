import { themes, type Theme } from '@/shared/theme';
import { AA_NON_TEXT, AA_TEXT, contrastRatio } from '../support/contrast';

/**
 * Accessibility as a test rather than a review.
 *
 * It runs over the whole registry, so a theme added later is checked without
 * anyone writing a case for it — which is the point: a contrast audit done once
 * by hand rots the first time somebody nudges a tone.
 *
 * Each pairing below is a place the two colours genuinely meet on screen.
 * Checking every role against every other would be louder and less true: it
 * would fail on combinations the design never renders, and the noise is how a
 * suite like this ends up skipped.
 */

const allThemes = Object.values(themes) as Theme[];
const each = (theme: Theme) => [theme.name, theme] as const;

describe.each(allThemes.map(each))('%s theme', (_name, theme) => {
  const { colors } = theme;

  describe('text meets AA (4.5:1)', () => {
    it.each([
      ['primary on background', colors.text.primary, colors.background],
      ['primary on surface', colors.text.primary, colors.surface],
      ['secondary on background', colors.text.secondary, colors.background],
      ['secondary on surface', colors.text.secondary, colors.surface],
      ['onInverse on inverseSurface', colors.text.onInverse, colors.inverseSurface],
      ['onBrand on brand', colors.text.onBrand, colors.brand.base],
      ['onAccent on accent', colors.text.onAccent, colors.accent.base],
    ])('%s', (_pair, foreground, background) => {
      expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(AA_TEXT);
    });

    // The chromatic roles are read as small text in this design — an amber
    // "sin margen", a green elapsed time, a red field error — so they owe the
    // text threshold, not the non-text one.
    it.each([
      ['brand', colors.brand],
      ['accent', colors.accent],
      ['warning', colors.warning],
      ['danger', colors.danger],
    ])('%s as text, on canvas and on its own tint', (_role, role) => {
      expect(contrastRatio(role.base, colors.background)).toBeGreaterThanOrEqual(AA_TEXT);
      expect(contrastRatio(role.base, colors.surface)).toBeGreaterThanOrEqual(AA_TEXT);
      expect(contrastRatio(role.base, role.background)).toBeGreaterThanOrEqual(AA_TEXT);
    });
  });

  describe('shapes meet AA for non-text (3:1)', () => {
    it.each([
      ['muted glyphs on background', colors.text.muted, colors.background],
      ['muted glyphs on surface', colors.text.muted, colors.surface],
      ['strong border on background', colors.border.strong, colors.background],
      ['strong border on surface', colors.border.strong, colors.surface],
    ])('%s', (_pair, foreground, background) => {
      expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(AA_NON_TEXT);
    });

    it('keeps every density step distinguishable from the next', () => {
      // A heat map is read by comparing neighbours, so what matters is the gap
      // between consecutive steps, not each one against the page.
      for (let step = 0; step < colors.density.length - 1; step += 1) {
        const ratio = contrastRatio(
          colors.density[step]!,
          colors.density[step + 1]!,
        );
        expect(ratio).toBeGreaterThanOrEqual(1.3);
      }
    });
  });

  describe('quiet things stay quiet', () => {
    it('keeps row dividers below the threshold that made cards shout', () => {
      // Not an oversight: a divider is decoration. Asserting the ceiling stops
      // a well-meaning "fix" from pushing it up to 3:1 and undoing the whole
      // reason the card borders came out.
      expect(contrastRatio(colors.border.subtle, colors.background)).toBeLessThan(
        AA_NON_TEXT,
      );
    });
  });
});
